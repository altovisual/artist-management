const { Client } = require('pg');

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const client = new Client({ connectionString });

async function applyMigration() {
  try {
    await client.connect();
    console.log('--- Conectado a la base de datos ---');

    // Manually apply the missing migration
    const query = 'ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS auco_document_id TEXT;';

    console.log('\nIntentando aplicar la migración para añadir la columna "auco_document_id"...');
    await client.query(query);
    console.log('=> Migración aplicada con éxito.');
    console.log('\n--------------------------------------------------------------------');
    console.log('Conclusión: La columna "auco_document_id" debería existir ahora.');
    console.log('Por favor, ejecuta "node find-contract-info.js" para verificar.');
    console.log('--------------------------------------------------------------------');

  } catch (err) {
    console.error('Error al conectar o ejecutar la consulta:', err);
  } finally {
    await client.end();
    console.log('\n--- Conexión cerrada ---');
  }
}

applyMigration();
