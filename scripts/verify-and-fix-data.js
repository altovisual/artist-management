const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
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

// Función para determinar el tipo de transacción
function determineTransactionType(concepto, monto) {
  const conceptoLower = concepto.toLowerCase();
  
  // Adelantos
  if (conceptoLower.includes('adelanto') || conceptoLower.includes('avance')) {
    return 'advance';
  }
  
  // Ingresos
  if (conceptoLower.includes('contrato') || 
      conceptoLower.includes('deposito') || 
      conceptoLower.includes('devolucion de impuestos') ||
      conceptoLower.includes('pago recibido') ||
      conceptoLower.includes('ingreso')) {
    return 'income';
  }
  
  // Por defecto, si es negativo es gasto, si es positivo es ingreso
  return monto < 0 ? 'expense' : 'income';
}

async function verifyAndFixData() {
  console.log('📂 Leyendo archivo Excel original...\n');

  const workbook = XLSX.readFile('Estados_de_Cuenta.xlsx');
  const sheetNames = workbook.SheetNames;

  console.log(`📊 Hojas encontradas: ${sheetNames.length}`);
  console.log(`Hojas: ${sheetNames.join(', ')}\n`);

  const artistsToSkip = ['Alex Nuñez']; // Excluir Alex Nuñez por moneda diferente
  const results = {
    total: 0,
    verified: 0,
    corrected: 0,
    skipped: 0,
    errors: []
  };

  for (const sheetName of sheetNames) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎵 Verificando: ${sheetName}`);
    console.log(`${'='.repeat(70)}`);

    // Verificar si debemos saltar este artista
    if (artistsToSkip.includes(sheetName)) {
      console.log(`⏭️  SALTADO: ${sheetName} (moneda diferente - Pesos Dominicanos)`);
      results.skipped++;
      continue;
    }

    try {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      if (data.length === 0) {
        console.log('⚠️  Hoja vacía, saltando...');
        continue;
      }

      console.log(`📝 Transacciones en Excel: ${data.length}`);

      // Buscar el artista en la BD
      const { data: artists } = await supabase
        .from('artists')
        .select('id, name')
        .ilike('name', sheetName);

      if (!artists || artists.length === 0) {
        console.log(`❌ Artista no encontrado en BD: ${sheetName}`);
        results.errors.push({ artist: sheetName, error: 'No encontrado en BD' });
        continue;
      }

      const artist = artists[0];
      console.log(`✅ Artista encontrado en BD: ${artist.name} (${artist.id})`);

      // Obtener transacciones actuales de la BD
      const { data: dbTransactions } = await supabase
        .from('statement_transactions')
        .select('*')
        .eq('artist_id', artist.id)
        .order('transaction_date', { ascending: true });

      console.log(`💾 Transacciones en BD: ${dbTransactions?.length || 0}`);

      // Verificar si el número de transacciones coincide
      if (dbTransactions?.length !== data.length) {
        console.log(`⚠️  ADVERTENCIA: Número de transacciones no coincide!`);
        console.log(`   Excel: ${data.length} | BD: ${dbTransactions?.length || 0}`);
      }

      // Procesar cada transacción del Excel
      let totalIncome = 0;
      let totalExpense = 0;
      let totalAdvance = 0;
      let correctedCount = 0;

      const excelTransactions = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        // Extraer datos del Excel
        const fecha = parseExcelDate(row['Fecha'] || row['FECHA'] || row['fecha']);
        const concepto = (row['Concepto'] || row['CONCEPTO'] || row['concepto'] || '').toString().trim();
        const monto = parseFloat(row['Monto'] || row['MONTO'] || row['monto'] || 0);

        if (!fecha || !concepto) {
          console.log(`⚠️  Fila ${i + 1}: Datos incompletos, saltando...`);
          continue;
        }

        // Determinar el tipo correcto
        const tipo = determineTransactionType(concepto, monto);
        const montoAbsoluto = Math.abs(monto);

        excelTransactions.push({
          fecha,
          concepto,
          monto: montoAbsoluto,
          tipo,
          montoOriginal: monto
        });

        // Sumar a los totales
        if (tipo === 'income') {
          totalIncome += montoAbsoluto;
        } else if (tipo === 'expense') {
          totalExpense += montoAbsoluto;
        } else if (tipo === 'advance') {
          totalAdvance += montoAbsoluto;
        }
      }

      console.log(`\n📊 DATOS DEL EXCEL:`);
      console.log(`  Ingresos:  +$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log(`  Gastos:    -$${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log(`  Avances:   -$${totalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log(`  ─────────────────────────────`);
      const excelBalance = totalIncome - totalExpense - totalAdvance;
      console.log(`  Balance:    $${excelBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

      // Comparar con la BD
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

        const incomeDiff = Math.abs(totalIncome - statement.total_income);
        const expenseDiff = Math.abs(totalExpense - statement.total_expenses);
        const advanceDiff = Math.abs(totalAdvance - statement.total_advances);
        const balanceDiff = Math.abs(excelBalance - statement.balance);

        if (incomeDiff > 0.01 || expenseDiff > 0.01 || advanceDiff > 0.01 || balanceDiff > 0.01) {
          console.log(`\n⚠️  DIFERENCIAS ENCONTRADAS:`);
          if (incomeDiff > 0.01) console.log(`  Ingresos: $${incomeDiff.toFixed(2)}`);
          if (expenseDiff > 0.01) console.log(`  Gastos: $${expenseDiff.toFixed(2)}`);
          if (advanceDiff > 0.01) console.log(`  Avances: $${advanceDiff.toFixed(2)}`);
          if (balanceDiff > 0.01) console.log(`  Balance: $${balanceDiff.toFixed(2)}`);

          // Actualizar la BD con los datos correctos del Excel
          console.log(`\n🔧 Corrigiendo datos en BD...`);
          
          const { error: updateError } = await supabase
            .from('artist_statements')
            .update({
              total_income: totalIncome,
              total_expenses: totalExpense,
              total_advances: totalAdvance,
              balance: excelBalance,
              updated_at: new Date().toISOString()
            })
            .eq('artist_id', artist.id);

          if (updateError) {
            console.error(`❌ Error actualizando: ${updateError.message}`);
            results.errors.push({ artist: sheetName, error: updateError.message });
          } else {
            console.log(`✅ Estado de cuenta actualizado con datos del Excel`);
            results.corrected++;
          }
        } else {
          console.log(`\n✅ Los datos coinciden perfectamente con el Excel`);
          results.verified++;
        }
      }

      results.total++;

    } catch (error) {
      console.error(`❌ Error procesando ${sheetName}:`, error.message);
      results.errors.push({ artist: sheetName, error: error.message });
    }
  }

  // Resumen final
  console.log(`\n${'='.repeat(70)}`);
  console.log('🎉 RESUMEN FINAL');
  console.log(`${'='.repeat(70)}`);
  console.log(`Total de artistas procesados: ${results.total}`);
  console.log(`Artistas verificados (correctos): ${results.verified}`);
  console.log(`Artistas corregidos: ${results.corrected}`);
  console.log(`Artistas saltados: ${results.skipped}`);
  console.log(`Errores: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errores encontrados:');
    results.errors.forEach(e => {
      console.log(`  - ${e.artist}: ${e.error}`);
    });
  }

  console.log('\n✅ Verificación completada!');
}

verifyAndFixData().catch(console.error);
