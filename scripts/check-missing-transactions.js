const XLSX = require('xlsx');

const workbook = XLSX.readFile('Estados_de_Cuenta.xlsx');
const sheet = workbook.Sheets['JayRozz'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('📊 ANÁLISIS DE JAY ROZZ');
console.log('='.repeat(80));
console.log('');

// Encabezados en fila 7
const headers = data[7];
console.log('Columnas del Excel:');
headers.forEach((h, i) => {
  console.log(`  ${i}: ${h}`);
});
console.log('');

// Contar transacciones reales (sin encabezados ni totales)
let transactionCount = 0;
let totalRow = -1;

for (let i = 8; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  
  const rowStr = row.join(' ').toLowerCase();
  if (rowStr.includes('total')) {
    totalRow = i;
    break;
  }
  
  transactionCount++;
}

console.log(`Total de filas en Excel: ${data.length}`);
console.log(`Fila de encabezados: 7`);
console.log(`Primera transacción: 8`);
console.log(`Fila de totales: ${totalRow}`);
console.log(`Transacciones reales: ${transactionCount}`);
console.log('');

// Mostrar algunas transacciones para verificar estructura
console.log('Primeras 5 transacciones:');
console.log('='.repeat(80));
for (let i = 8; i < Math.min(13, data.length); i++) {
  console.log(`Fila ${i}:`, data[i]);
}
