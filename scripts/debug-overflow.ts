/**
 * Script para diagnosticar qué valores causan numeric overflow
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'Estados_de_Cuenta.xlsx');
const workbook = XLSX.readFile(filePath);

const artistasConProblemas = ['JayRozz', 'Divino', 'MozartMuzik', 'HACHE', 'ErickAnt', 'V1FRO', 'Cesar Da Gold'];

console.log('🔍 Buscando valores grandes en artistas con problemas...\n');

for (const sheetName of workbook.SheetNames) {
  if (!artistasConProblemas.includes(sheetName)) continue;
  
  console.log(`\n📊 Analizando: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  let maxValue = 0;
  let maxRow = -1;
  let maxCol = -1;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (let j = 0; j < row.length; j++) {
      if (typeof row[j] === 'number') {
        const absValue = Math.abs(row[j]);
        if (absValue > maxValue) {
          maxValue = absValue;
          maxRow = i;
          maxCol = j;
        }
        
        // Reportar si es mayor a DECIMAL(12,2) max
        if (absValue > 9999999999.99) {
          console.log(`   ⚠️  Valor muy grande en fila ${i}, col ${j}: ${row[j]}`);
        }
        
        // Reportar si es mayor a DECIMAL(18,2) max
        if (absValue > 9999999999999999.99) {
          console.log(`   🚨 Valor EXTREMADAMENTE grande en fila ${i}, col ${j}: ${row[j]}`);
        }
      }
    }
  }
  
  console.log(`   📈 Valor máximo encontrado: ${maxValue} (fila ${maxRow}, col ${maxCol})`);
  console.log(`   📏 Dígitos: ${maxValue.toString().replace('.', '').length}`);
}

console.log('\n✅ Análisis completado');
