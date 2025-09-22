const { Client } = require('pg');

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const client = new Client({ connectionString });

async function fixDependency() {
  try {
    await client.connect();
    console.log('--- Conectado a la base de datos ---');

    const query = 'DROP TRIGGER on_royalty_report_upload ON storage.objects;';

    console.log('\nIntentando eliminar el trigger "on_royalty_report_upload"...');
    await client.query(query);
    console.log('=> Trigger eliminado con éxito.');
    console.log('\n--------------------------------------------------------------------');
    console.log('Conclusión: El bloqueo ha sido eliminado.');
    console.log('Ahora puedes volver a ejecutar "supabase db reset".');
    console.log('--------------------------------------------------------------------');

  } catch (err) {
    console.error('Error al conectar o ejecutar la consulta:', err);
    console.log('\n=> Si el error es "trigger \"on_royalty_report_upload\" does not exist", ignóralo. Significa que ya fue eliminado. Procede con "supabase db reset".');
  } finally {
    await client.end();
    console.log('\n--- Conexión cerrada ---');
  }
}

fixDependency();
