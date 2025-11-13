/**
 * Script para restaurar Cesar Da Gold automáticamente
 * Ejecuta: node restore-cesar.js
 */

const fs = require('fs');
const path = require('path');

async function restoreCesarDaGold() {
  console.log('🔄 Iniciando restauración de Cesar Da Gold...\n');

  const filePath = path.join(__dirname, 'Estados_de_Cuenta.xlsx');
  
  // Verificar que el archivo existe
  if (!fs.existsSync(filePath)) {
    console.error('❌ Error: No se encontró el archivo Estados_de_Cuenta.xlsx');
    console.log('📍 Ubicación esperada:', filePath);
    process.exit(1);
  }

  console.log('✅ Archivo encontrado:', filePath);
  console.log('📊 Tamaño:', (fs.statSync(filePath).size / 1024).toFixed(2), 'KB\n');

  try {
    // Leer el archivo
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Crear FormData
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: 'Estados_de_Cuenta.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log('📤 Enviando archivo a la API...\n');

    // Hacer la petición
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3000/api/statements/import', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ ¡Restauración exitosa!\n');
      console.log('📊 Resumen:');
      console.log('   - Artistas procesados:', result.artistsProcessed || 'N/A');
      console.log('   - Transacciones importadas:', result.transactionsImported || 'N/A');
      console.log('   - Estados de cuenta creados:', result.statementsCreated || 'N/A');
      
      if (result.artists) {
        console.log('\n👤 Artistas restaurados:');
        result.artists.forEach(artist => {
          console.log(`   - ${artist.name}`);
        });
      }

      console.log('\n🎉 Cesar Da Gold ha sido restaurado con todos sus datos!');
      console.log('📍 Verifica en: http://localhost:3000/dashboard/analytics\n');
    } else {
      console.error('❌ Error en la importación:');
      console.error('   Status:', response.status);
      console.error('   Error:', result.error || result.message);
      
      if (result.details) {
        console.error('   Detalles:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Error al procesar el archivo:');
    console.error('   ', error.message);
    console.log('\n💡 Sugerencia: Asegúrate de que el servidor esté corriendo (npm run dev)');
  }
}

// Ejecutar
restoreCesarDaGold();
