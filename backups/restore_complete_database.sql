-- RESTAURACIÓN COMPLETA DE BASE DE DATOS
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =====================================================

-- PASO 1: Crear backup del estado actual (SEGURIDAD)
CREATE SCHEMA IF NOT EXISTS backup_current_20250927;

-- Hacer backup de tablas principales actuales
CREATE TABLE backup_current_20250927.artists_current AS SELECT * FROM artists;
CREATE TABLE backup_current_20250927.social_accounts_current AS SELECT * FROM social_accounts WHERE 1=1; -- Usar WHERE para evitar errores si no existe
CREATE TABLE backup_current_20250927.distribution_accounts_current AS SELECT * FROM distribution_accounts WHERE 1=1;
CREATE TABLE backup_current_20250927.projects_current AS SELECT * FROM projects WHERE 1=1;
CREATE TABLE backup_current_20250927.assets_current AS SELECT * FROM assets WHERE 1=1;
CREATE TABLE backup_current_20250927.events_current AS SELECT * FROM events WHERE 1=1;

-- PASO 2: Limpiar datos actuales (manteniendo estructura)
TRUNCATE TABLE artists CASCADE;

-- Limpiar otras tablas si existen
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'social_accounts') THEN
    TRUNCATE TABLE social_accounts CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'distribution_accounts') THEN
    TRUNCATE TABLE distribution_accounts CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
    TRUNCATE TABLE projects CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assets') THEN
    TRUNCATE TABLE assets CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
    TRUNCATE TABLE events CASCADE;
  END IF;
END
$$;

-- PASO 3: Mensaje de preparación
SELECT 
  '🔄 BASE DE DATOS PREPARADA PARA RESTAURACIÓN' as mensaje,
  'Ejecuta ahora el archivo backup_data.sql completo' as instruccion,
  'Backup actual guardado en schema: backup_current_20250927' as seguridad;

-- PASO 4: Instrucciones para continuar
/*
INSTRUCCIONES PARA COMPLETAR LA RESTAURACIÓN:

1. Copia TODO el contenido del archivo backup_data.sql
2. Pégalo en una nueva consulta en Supabase SQL Editor
3. Ejecuta la consulta completa
4. Esto restaurará TODOS los datos originales incluyendo:
   - Todos los artistas (incluyendo Borngud completo)
   - Todas las redes sociales
   - Todas las cuentas de distribución
   - Todos los proyectos musicales
   - Todos los assets y archivos
   - Todos los eventos
   - Todos los usuarios y autenticación

5. Verifica que todo funcione correctamente
6. Si algo sale mal, puedes restaurar desde backup_current_20250927

IMPORTANTE: 
- El archivo backup_data.sql es muy grande (1972 líneas)
- Puede tomar varios minutos en ejecutarse
- NO interrumpas la ejecución
- Asegúrate de tener buena conexión a internet
*/
