const XLSX = require('xlsx');

function inspectExcel() {
  console.log('📂 Inspeccionando archivo Excel...\n');

  const workbook = XLSX.readFile('Estados_de_Cuenta.xlsx');
  const sheetNames = workbook.SheetNames;

  console.log(`📊 Total de hojas: ${sheetNames.length}\n`);

  // Inspeccionar las primeras 3 hojas para ver la estructura
  for (let i = 0; i < Math.min(3, sheetNames.length); i++) {
    const sheetName = sheetNames[i];
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📄 Hoja: ${sheetName}`);
    console.log(`${'='.repeat(70)}`);

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`\nPrimeras 10 filas:`);
    for (let j = 0; j < Math.min(10, data.length); j++) {
      console.log(`Fila ${j}:`, data[j]);
    }

    // También ver con headers
    const dataWithHeaders = XLSX.utils.sheet_to_json(sheet);
    console.log(`\nPrimeras 3 filas con headers:`);
    for (let j = 0; j < Math.min(3, dataWithHeaders.length); j++) {
      console.log(`Registro ${j}:`, dataWithHeaders[j]);
    }

    // Ver las columnas disponibles
    if (dataWithHeaders.length > 0) {
      console.log(`\nColumnas disponibles:`, Object.keys(dataWithHeaders[0]));
    }
  }
}

inspectExcel();
