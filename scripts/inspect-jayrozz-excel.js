const XLSX = require('xlsx');

function inspectJayRozz() {
  console.log('📂 Inspeccionando hoja de JayRozz...\n');

  const workbook = XLSX.readFile('Estados_de_Cuenta.xlsx');
  const sheet = workbook.Sheets['JayRozz'];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log('Primeras 20 filas:\n');
  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    console.log(`Fila ${i}:`, rawData[i]);
  }

  // Encontrar headers
  let headerRow = -1;
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row.includes('Fecha') && row.includes('Concepto')) {
      headerRow = i;
      break;
    }
  }

  if (headerRow !== -1) {
    console.log(`\n📍 Headers en fila ${headerRow}:`, rawData[headerRow]);
    console.log(`\nPrimeras 10 transacciones:\n`);
    
    const headers = rawData[headerRow];
    for (let i = headerRow + 1; i < Math.min(headerRow + 11, rawData.length); i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;
      
      console.log(`\nTransacción ${i - headerRow}:`);
      headers.forEach((header, idx) => {
        if (row[idx] !== undefined && row[idx] !== '') {
          console.log(`  ${header}: ${row[idx]}`);
        }
      });
    }
  }
}

inspectJayRozz();
