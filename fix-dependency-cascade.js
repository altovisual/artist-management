const { Client } = require('pg');

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const client = new Client({ connectionString });

async function fixDependencyCascade() {
  try {
    await client.connect();
    console.log('--- Conectado a la base de datos ---');

    // This command drops the function and any objects that depend on it (like the trigger).
    const query = 'DROP FUNCTION IF EXISTS public.handle_royalty_report_upload() CASCADE;';

    console.log('\nIntentando eliminar la función "handle_royalty_report_upload" y sus dependencias...');
    await client.query(query);
    console.log('=> Función y dependencias eliminadas con éxito.');
    console.log('\n--------------------------------------------------------------------');
    console.log('Conclusión: El bloqueo debería haber sido eliminado.');
    console.log('Ahora puedes volver a ejecutar "supabase db reset".');
    console.log('--------------------------------------------------------------------');

  } catch (err) {
    console.error('Error al conectar o ejecutar la consulta:', err);
  } finally {
    await client.end();
    console.log('\n--- Conexión cerrada ---');
  }
}

fixDependencyCascade();
