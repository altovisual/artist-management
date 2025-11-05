const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Función para parsear fechas del Excel
function parseExcelDate(value) {
  if (!value) return null;
  
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  if (typeof value === 'string') {
    // Intentar parsear diferentes formatos
    const parts = value.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  
  return null;
}

async function verifyExcelData() {
  console.log('📂 Leyendo archivo Excel original...\n');

  const workbook = XLSX.readFile('Estados_de_Cuenta.xlsx');
  const sheetNames = workbook.SheetNames;

  console.log(`📊 Total de hojas: ${sheetNames.length}\n`);

  const artistsToSkip = ['Base de datos', 'MODELO', 'Alex Nuñez'];
  const results = {
    total: 0,
    verified: 0,
    needsCorrection: 0,
    skipped: 0,
    notFound: 0,
    details: []
  };

  for (const sheetName of sheetNames) {
    // Saltar hojas especiales
    if (artistsToSkip.includes(sheetName)) {
      console.log(`⏭️  SALTADO: ${sheetName}`);
      results.skipped++;
      continue;
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎵 Verificando: ${sheetName}`);
    console.log(`${'='.repeat(70)}`);

    try {
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Encontrar la fila de headers (debe contener "Fecha", "Concepto", etc.)
      let headerRow = -1;
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (row && row.includes('Fecha') && row.includes('Concepto')) {
          headerRow = i;
          break;
        }
      }

      if (headerRow === -1) {
        console.log('⚠️  No se encontró la fila de headers, saltando...');
        continue;
      }

      console.log(`📍 Headers encontrados en fila ${headerRow}`);

      const headers = rawData[headerRow];
      const fechaCol = headers.indexOf('Fecha');
      const conceptoCol = headers.indexOf('Concepto');
      const avanceCol = headers.indexOf('Avance');
      const balanceCol = headers.indexOf('Balance');

      console.log(`Columnas: Fecha=${fechaCol}, Concepto=${conceptoCol}, Avance=${avanceCol}, Balance=${balanceCol}`);

      // Procesar las transacciones
      const transactions = [];
      let totalIncome = 0;
      let totalExpense = 0;
      let totalAdvance = 0;

      for (let i = headerRow + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;

        const fecha = row[fechaCol];
        const concepto = row[conceptoCol];
        const avance = parseFloat(row[avanceCol]) || 0;
        const balance = parseFloat(row[balanceCol]) || 0;

        // Si no hay fecha ni concepto, es una fila vacía
        if (!fecha && !concepto) continue;

        // Parsear fecha
        const fechaParsed = parseExcelDate(fecha);
        if (!fechaParsed) continue;

        // Calcular el monto de la transacción
        // El monto es el cambio en el balance
        let monto = 0;
        if (i === headerRow + 1) {
          // Primera transacción
          monto = balance;
        } else {
          const prevBalance = parseFloat(rawData[i - 1][balanceCol]) || 0;
          monto = balance - prevBalance;
        }

        // Determinar el tipo
        let tipo = 'income';
        const conceptoLower = (concepto || '').toLowerCase();
        
        if (avance !== 0) {
          tipo = 'advance';
          monto = Math.abs(avance);
          totalAdvance += monto;
        } else if (monto < 0) {
          tipo = 'expense';
          monto = Math.abs(monto);
          totalExpense += monto;
        } else {
          tipo = 'income';
          totalIncome += monto;
        }

        transactions.push({
          fecha: fechaParsed,
          concepto: concepto || 'Sin concepto',
          monto,
          tipo
        });
      }

      console.log(`\n📝 Transacciones encontradas: ${transactions.length}`);
      
      if (transactions.length === 0) {
        console.log('⚠️  No hay transacciones válidas');
        continue;
      }

      const excelBalance = totalIncome - totalExpense - totalAdvance;

      console.log(`\n📊 DATOS DEL EXCEL:`);
      console.log(`  Ingresos:  +$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log(`  Gastos:    -$${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log(`  Avances:   -$${totalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log(`  ─────────────────────────────`);
      console.log(`  Balance:    $${excelBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

      // Buscar en la BD
      const { data: artists } = await supabase
        .from('artists')
        .select('id, name')
        .ilike('name', sheetName);

      if (!artists || artists.length === 0) {
        console.log(`❌ Artista NO encontrado en BD`);
        results.notFound++;
        results.details.push({
          artist: sheetName,
          status: 'not_found',
          excelBalance
        });
        continue;
      }

      const artist = artists[0];
      console.log(`✅ Artista encontrado en BD: ${artist.name}`);

      // Obtener el statement
      const { data: statement } = await supabase
        .from('artist_statements')
        .select('*')
        .eq('artist_id', artist.id)
        .single();

      if (statement) {
        console.log(`\n💾 DATOS EN BD:`);
        console.log(`  Ingresos:  +$${statement.total_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        console.log(`  Gastos:    -$${statement.total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        console.log(`  Avances:   -$${statement.total_advances.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        console.log(`  ─────────────────────────────`);
        console.log(`  Balance:    $${statement.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

        const balanceDiff = Math.abs(excelBalance - statement.balance);

        if (balanceDiff > 0.01) {
          console.log(`\n⚠️  DIFERENCIA EN BALANCE: $${balanceDiff.toFixed(2)}`);
          results.needsCorrection++;
          results.details.push({
            artist: sheetName,
            status: 'needs_correction',
            excelBalance,
            dbBalance: statement.balance,
            difference: balanceDiff
          });
        } else {
          console.log(`\n✅ Balance correcto`);
          results.verified++;
          results.details.push({
            artist: sheetName,
            status: 'verified',
            balance: excelBalance
          });
        }
      }

      results.total++;

    } catch (error) {
      console.error(`❌ Error procesando ${sheetName}:`, error.message);
    }
  }

  // Resumen final
  console.log(`\n${'='.repeat(70)}`);
  console.log('🎉 RESUMEN FINAL');
  console.log(`${'='.repeat(70)}`);
  console.log(`Total de artistas procesados: ${results.total}`);
  console.log(`✅ Artistas verificados (correctos): ${results.verified}`);
  console.log(`⚠️  Artistas que necesitan corrección: ${results.needsCorrection}`);
  console.log(`❌ Artistas no encontrados en BD: ${results.notFound}`);
  console.log(`⏭️  Artistas saltados: ${results.skipped}`);

  if (results.needsCorrection > 0) {
    console.log(`\n⚠️  ARTISTAS QUE NECESITAN CORRECCIÓN:`);
    results.details
      .filter(d => d.status === 'needs_correction')
      .forEach(d => {
        console.log(`  - ${d.artist}: Excel=$${d.excelBalance.toFixed(2)} | BD=$${d.dbBalance.toFixed(2)} | Diff=$${d.difference.toFixed(2)}`);
      });
  }

  if (results.notFound > 0) {
    console.log(`\n❌ ARTISTAS NO ENCONTRADOS EN BD:`);
    results.details
      .filter(d => d.status === 'not_found')
      .forEach(d => {
        console.log(`  - ${d.artist}`);
      });
  }

  console.log('\n✅ Verificación completada!');
}

verifyExcelData().catch(console.error);
