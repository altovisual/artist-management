const XLSX = require('xlsx');

// Leer el archivo
const workbook = XLSX.readFile('Estados_de_Cuenta.xlsx');

console.log('📊 Hojas disponibles:', workbook.SheetNames.join(', '));
console.log('');

// Buscar la hoja de Jay Rozz
const jayRozzSheet = workbook.SheetNames.find(name => 
  name.toLowerCase().includes('jay') || name.toLowerCase().includes('rozz')
);

if (!jayRozzSheet) {
  console.log('❌ No se encontró la hoja de Jay Rozz');
  console.log('Hojas disponibles:', workbook.SheetNames);
  process.exit(1);
}

console.log(`✅ Analizando hoja: "${jayRozzSheet}"`);
console.log('');

const sheet = workbook.Sheets[jayRozzSheet];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Mostrar las primeras filas para ver la estructura
console.log('📋 Primeras 15 filas:');
console.log('='.repeat(100));
for (let i = 0; i < Math.min(15, data.length); i++) {
  console.log(`Fila ${i}:`, data[i]);
}
console.log('');

// Buscar la fila de encabezados
let headerRow = -1;
for (let i = 0; i < data.length; i++) {
  const rowStr = data[i].join(' ').toLowerCase();
  if (rowStr.includes('fecha') && (rowStr.includes('concepto') || rowStr.includes('balance'))) {
    headerRow = i;
    console.log(`✅ Encabezados encontrados en fila ${i}:`, data[i]);
    break;
  }
}

if (headerRow === -1) {
  console.log('❌ No se encontraron encabezados');
  process.exit(1);
}

console.log('');
console.log('📊 Últimas 10 transacciones:');
console.log('='.repeat(100));

const startRow = Math.max(headerRow + 1, data.length - 10);
for (let i = startRow; i < data.length; i++) {
  if (data[i] && data[i].length > 0) {
    console.log(`Fila ${i}:`, data[i]);
  }
}

console.log('');
console.log('🔍 Análisis de la última fila con datos:');
console.log('='.repeat(100));

// Encontrar la última fila con datos
let lastDataRow = -1;
for (let i = data.length - 1; i >= headerRow + 1; i--) {
  if (data[i] && data[i].some(cell => cell !== null && cell !== undefined && cell !== '')) {
    lastDataRow = i;
    break;
  }
}

if (lastDataRow !== -1) {
  console.log(`Última fila con datos (${lastDataRow}):`, data[lastDataRow]);
  console.log('');
  
  // Intentar encontrar el balance
  const lastRow = data[lastDataRow];
  console.log('Buscando balance en la última fila...');
  for (let col = lastRow.length - 1; col >= 0; col--) {
    if (typeof lastRow[col] === 'number') {
      console.log(`  Columna ${col}: ${lastRow[col]}`);
    }
  }
}

console.log('');
console.log('📈 Total de filas:', data.length);
console.log('📈 Filas de datos (después de encabezados):', data.length - headerRow - 1);
