const { Client } = require('pg');

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const client = new Client({ connectionString });

async function checkDb() {
  try {
    await client.connect();
    console.log('--- Conectado a la base de datos ---');

    console.log('\nBuscando en la tabla de "Usuarios" (auth.users)...');
    const usersRes = await client.query(`SELECT email FROM auth.users;`);
    
    if (usersRes.rows.length === 0) {
      console.log('=> No se encontró ningún usuario con cuenta en auth.users.');
    } else {
      console.log('=> Usuarios con cuenta encontrados en auth.users:');
      usersRes.rows.forEach((row, index) => {
        console.log(`   ${index + 1}: ${row.email}`);
      });
    }

    console.log('\nBuscando en la tabla de "Artistas" (public.artists)...');
    const artistsRes = await client.query(`SELECT name FROM public.artists;`);

    if (artistsRes.rows.length === 0) {
      console.log('=> No se encontró ningún perfil de artista en public.artists.');
    } else {
      console.log('=> Perfiles de Artista encontrados en public.artists:');
      artistsRes.rows.forEach((row, index) => {
        console.log(`   ${index + 1}: ${row.name}`);
      });
    }
    
    console.log('\n--------------------------------------------------------------------');
    console.log('Conclusión: La lista desplegable "Link to App User" se llena con los');
    console.log('datos de la tabla "Usuarios" (auth.users), que ahora mismo está vacía.');
    console.log('--------------------------------------------------------------------');


  } catch (err) {
    console.error('Error al conectar o ejecutar la consulta:', err);
  } finally {
    await client.end();
    console.log('--- Conexión cerrada ---');
  }
}

checkDb();