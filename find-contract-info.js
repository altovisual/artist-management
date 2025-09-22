const { Client } = require('pg');

// Using the connection string from db-check.js
const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const client = new Client({ connectionString });

async function findContractInfo() {
  try {
    await client.connect();
    console.log('--- Conectado a la base de datos ---');

    const contractId = 9;
    const query = {
      text: `
        SELECT
          t.id as template_id,
          t.type as template_type,
          t.version as template_version,
          t.auco_document_id
        FROM public.contracts c
        JOIN public.templates t ON c.template_id = t.id
        WHERE c.id = $1;
      `,
      values: [contractId],
    };

    console.log(`\nBuscando la plantilla para el contrato con ID: ${contractId}...`);
    const res = await client.query(query);

    if (res.rows.length === 0) {
      console.log(`=> No se encontró un contrato con ID ${contractId} o no tiene una plantilla asociada.`);
    } else {
      const template = res.rows[0];
      console.log('=> Información de la plantilla encontrada:');
      console.log(`   - ID de la Plantilla (interno): ${template.template_id}`);
      console.log(`   - Tipo de Plantilla: ${template.template_type}`);
      console.log(`   - Versión: ${template.template_version}`);
      console.log(`   - ID de Documento de Auco: ${template.auco_document_id}`);
      console.log('\n--------------------------------------------------------------------');
      if (template.auco_document_id) {
        console.log('Conclusión: La plantilla tiene un ID de Auco. El problema podría ser otro.');
      } else {
        console.log('Conclusión: El campo "auco_document_id" está vacío (null).');
        console.log('Por favor, ve a la sección de plantillas en la aplicación, busca la plantilla con');
        console.log(`ID ${template.template_id} y edítala para añadir el ID de documento de Auco correcto.`);
      }
      console.log('--------------------------------------------------------------------');
    }

  } catch (err) {
    console.error('Error al conectar o ejecutar la consulta:', err);
  } finally {
    await client.end();
    console.log('\n--- Conexión cerrada ---');
  }
}

findContractInfo();
