const XLSX = require('xlsx');

// Leer el archivo
const workbook = XLSX.readFile('Estados_de_Cuenta.xlsx');

console.log('🔍 ANÁLISIS COMPLETO DE TODOS LOS ARTISTAS');
console.log('='.repeat(100));
console.log('');

const artistsToSkip = ['Base de datos', 'MODELO'];
const results = [];

for (const sheetName of workbook.SheetNames) {
  if (artistsToSkip.includes(sheetName)) {
    continue;
  }

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Buscar encabezados
  let headerRow = -1;
  for (let i = 0; i < data.length; i++) {
    const rowStr = data[i].join(' ').toLowerCase();
    if (rowStr.includes('fecha') && (rowStr.includes('concepto') || rowStr.includes('balance'))) {
      headerRow = i;
      break;
    }
  }

  if (headerRow === -1) {
    console.log(`⚠️  ${sheetName}: No se encontraron encabezados`);
    continue;
  }

  // Encontrar columna de balance
  let balanceCol = -1;
  const headers = data[headerRow];
  for (let col = 0; col < headers.length; col++) {
    const header = String(headers[col] || '').toLowerCase().trim();
    if (header.includes('balance') || header.includes('saldo')) {
      balanceCol = col;
      break;
    }
  }

  if (balanceCol === -1) {
    console.log(`⚠️  ${sheetName}: No se encontró columna de balance`);
    continue;
  }

  // Buscar última transacción real (no fila de totales)
  let lastRealTransaction = null;
  let lastRealRow = -1;
  let totalRow = null;
  let totalRowIndex = -1;

  for (let i = data.length - 1; i >= headerRow + 1; i--) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const rowStr = row.join(' ').toLowerCase();
    
    // Detectar fila de totales
    if (rowStr.includes('total') || rowStr.includes('resumen') || rowStr.includes('suma')) {
      totalRow = row;
      totalRowIndex = i;
      continue;
    }

    // Esta es una transacción real
    if (row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
      lastRealTransaction = row;
      lastRealRow = i;
      break;
    }
  }

  const balanceReal = lastRealTransaction ? lastRealTransaction[balanceCol] : null;
  const balanceTotal = totalRow ? totalRow[balanceCol] : null;

  const result = {
    artista: sheetName,
    transacciones: lastRealRow - headerRow,
    balanceReal: balanceReal !== null && balanceReal !== undefined ? balanceReal : 'N/A',
    balanceTotal: balanceTotal !== null && balanceTotal !== undefined ? balanceTotal : 'N/A',
    filaReal: lastRealRow,
    filaTotal: totalRowIndex,
    problema: false
  };

  // Detectar si hay diferencia significativa
  if (balanceReal !== null && balanceTotal !== null && 
      typeof balanceReal === 'number' && typeof balanceTotal === 'number') {
    const diff = Math.abs(balanceReal - balanceTotal);
    if (diff > 0.01) {
      result.problema = true;
      result.diferencia = diff;
    }
  }

  results.push(result);
}

// Ordenar por problemas primero
results.sort((a, b) => {
  if (a.problema && !b.problema) return -1;
  if (!a.problema && b.problema) return 1;
  return 0;
});

// Mostrar resultados
console.log('📊 RESULTADOS DEL ANÁLISIS:');
console.log('='.repeat(100));
console.log('');

let problemCount = 0;

for (const result of results) {
  const icon = result.problema ? '❌' : '✅';
  const balanceRealStr = typeof result.balanceReal === 'number' 
    ? `$${result.balanceReal.toFixed(2)}` 
    : result.balanceReal;
  const balanceTotalStr = typeof result.balanceTotal === 'number' 
    ? `$${result.balanceTotal.toFixed(2)}` 
    : result.balanceTotal;

  console.log(`${icon} ${result.artista}`);
  console.log(`   Transacciones: ${result.transacciones}`);
  console.log(`   Balance Real (fila ${result.filaReal}): ${balanceRealStr}`);
  console.log(`   Balance Total (fila ${result.filaTotal}): ${balanceTotalStr}`);
  
  if (result.problema) {
    console.log(`   ⚠️  DIFERENCIA: $${result.diferencia.toFixed(2)}`);
    problemCount++;
  }
  
  console.log('');
}

console.log('='.repeat(100));
console.log(`📈 Total artistas analizados: ${results.length}`);
console.log(`❌ Artistas con problemas: ${problemCount}`);
console.log(`✅ Artistas correctos: ${results.length - problemCount}`);
console.log('');

if (problemCount > 0) {
  console.log('⚠️  ARTISTAS CON PROBLEMAS DETECTADOS:');
  console.log('='.repeat(100));
  results.filter(r => r.problema).forEach(r => {
    console.log(`   - ${r.artista}: Diferencia de $${r.diferencia.toFixed(2)}`);
  });
}
