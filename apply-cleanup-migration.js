const { Client } = require('pg');

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const client = new Client({ connectionString });

async function applyCleanup() {
  try {
    await client.connect();
    console.log('--- Conectado a la base de datos ---');

    const query = 'ALTER TABLE public.templates DROP COLUMN IF EXISTS auco_document_id;';

    console.log('\nEjecutando migración para eliminar la columna "auco_document_id"...');
    await client.query(query);
    console.log('=> Columna eliminada con éxito.');
    console.log('\n--------------------------------------------------------------------');
    console.log('Conclusión: La base de datos ahora está completamente limpia.');
    console.log('--------------------------------------------------------------------');

  } catch (err) {
    console.error('Error al conectar o ejecutar la consulta:', err);
  } finally {
    await client.end();
    console.log('\n--- Conexión cerrada ---');
  }
}

applyCleanup();
