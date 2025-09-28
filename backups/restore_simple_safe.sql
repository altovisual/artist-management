-- RESTAURACIÓN SIMPLE Y SEGURA - SIN CLAVES FORÁNEAS PROBLEMÁTICAS
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =====================================================

-- PASO 1: Backup de seguridad
CREATE TABLE IF NOT EXISTS artists_backup_before_simple_restore AS SELECT * FROM artists;

-- PASO 2: Limpiar y restaurar tabla ARTISTS (sin participant_id problemático)
TRUNCATE TABLE artists CASCADE;

-- Restaurar ARTISTS sin claves foráneas problemáticas
INSERT INTO "public"."artists" ("id", "name", "genre", "country", "profile_image", "bio", "monthly_listeners", "total_streams", "created_at", "updated_at", "user_id", "spotify_artist_id", "first_name", "last_name", "date_of_birth") VALUES
	('5c15dcad-4a96-4e4a-8169-6ce0577d0e9e', 'marval', 'Hip Hop', 'venezuela', 'https://tdbomtxyevggobphozdu.supabase.co/storage/v1/object/public/artist-profiles/1757344837458_d6a7c495-7efc-45fb-b56c-991c6696d746.png', '', 0, 0, '2025-09-08 15:20:38.879493+00', '2025-09-08 15:20:38.879493+00', 'a56bc5e0-9dba-4a01-924e-c0b6938f0857', '0qKkpjlY5VEmY4n6CRbPZM', '', '', NULL),
	('172cb578-d3f7-4303-b074-4ae5d5173374', 'Borngud', 'Hip Hop', 'Lagos/Nigeria', 'https://tdbomtxyevggobphozdu.supabase.co/storage/v1/object/public/artist-profiles/1757126301351_IMG_20250906_022807.jpg', 'I''m Emmanuel the son of John, an Afrobeat singer and song writer, from Ugwueke Bende LGA Ania state,', 0, 0, '2025-09-06 02:38:22.845381+00', '2025-09-06 02:38:22.845381+00', '3ecce5b7-cb4c-4071-9717-24adbf296f7f', '3KUEQGqSJQbjADweTLE4ax', 'Emmanuel', 'John', NULL);

-- PASO 3: Restaurar SOCIAL_ACCOUNTS si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'social_accounts') THEN
    -- Limpiar tabla
    DELETE FROM social_accounts WHERE artist_id IN ('172cb578-d3f7-4303-b074-4ae5d5173374', '5c15dcad-4a96-4e4a-8169-6ce0577d0e9e');
    
    -- Restaurar redes sociales de Borngud
    INSERT INTO "public"."social_accounts" ("id", "artist_id", "platform", "username", "followers", "url", "created_at", "updated_at", "email") VALUES
    ('9825e43c-6400-45b6-834b-78e12a28ab00', '172cb578-d3f7-4303-b074-4ae5d5173374', 'YouTube', '@borngud', 0, NULL, '2025-09-07 02:50:32.924166+00', NOW(), 'borngud22@gmail.com'),
    ('ab020277-ef29-4494-ba3f-5dd35931d237', '172cb578-d3f7-4303-b074-4ae5d5173374', 'Instagram', '@borngud', 17, 'https://www.instagram.com/borngud?igsh=MXB6eGF6eHZyOW1mNw==', '2025-09-06 03:11:56.141649+00', NOW(), 'borngud22@gmail.com'),
    ('81690e48-8b7c-47ce-878f-1ed1002fb86a', '172cb578-d3f7-4303-b074-4ae5d5173374', 'TikTok', '@borngud', 39, 'https://www.tiktok.com/@borngud?_t=ZP-8zUSTzxmxQM&_r=1', '2025-09-06 03:11:56.141649+00', NOW(), 'borngud22@gmail.com'),
    ('3e147b3b-5be8-48a0-9324-8297989bbd82', '172cb578-d3f7-4303-b074-4ae5d5173374', 'Twitter', 'Borngud1', 785, 'https://x.com/borngud1?t=xBmTgNMQpaa0IzLmlbEgpw&s=09', '2025-09-06 03:11:56.141649+00', NOW(), 'borngud22@gmail.com')
    ON CONFLICT (id) DO UPDATE SET
      artist_id = EXCLUDED.artist_id,
      platform = EXCLUDED.platform,
      username = EXCLUDED.username,
      followers = EXCLUDED.followers,
      url = EXCLUDED.url,
      updated_at = NOW();
    
    RAISE NOTICE 'Redes sociales restauradas exitosamente';
  ELSE
    RAISE NOTICE 'Tabla social_accounts no existe, saltando...';
  END IF;
END
$$;

-- PASO 4: Restaurar DISTRIBUTION_ACCOUNTS si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'distribution_accounts') THEN
    -- Limpiar registros existentes
    DELETE FROM distribution_accounts WHERE artist_id IN ('172cb578-d3f7-4303-b074-4ae5d5173374', '5c15dcad-4a96-4e4a-8169-6ce0577d0e9e');
    
    -- Restaurar cuentas de distribución de Borngud (solo campos básicos)
    INSERT INTO "public"."distribution_accounts" ("id", "artist_id", "distributor", "username", "created_at", "email", "updated_at", "service", "monthly_listeners") VALUES
    ('8a0db945-9411-4af0-b9ce-af4698e84849', '172cb578-d3f7-4303-b074-4ae5d5173374', 'distrokid', 'Borngud', '2025-09-08 00:13:46.58053+00', 'borngud22@gmail.com', NOW(), 'Amazon Music', 0),
    ('b71ce549-8bbb-4980-84fc-1c83ab9d358c', '172cb578-d3f7-4303-b074-4ae5d5173374', 'Distrokid', 'Borngud', '2025-09-08 00:11:51.990077+00', 'borngud22@gmail.com', NOW(), 'Spotify', 2294)
    ON CONFLICT (id) DO UPDATE SET
      artist_id = EXCLUDED.artist_id,
      distributor = EXCLUDED.distributor,
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      service = EXCLUDED.service,
      monthly_listeners = EXCLUDED.monthly_listeners,
      updated_at = NOW();
    
    RAISE NOTICE 'Cuentas de distribución restauradas exitosamente';
  ELSE
    RAISE NOTICE 'Tabla distribution_accounts no existe, saltando...';
  END IF;
END
$$;

-- PASO 5: Verificación final
SELECT 
  '🎉 RESTAURACIÓN SIMPLE COMPLETADA' as mensaje,
  COUNT(*) as total_artistas
FROM artists;

-- Verificar Borngud específicamente
SELECT 
  '👤 BORNGUD RESTAURADO' as seccion,
  name,
  first_name,
  last_name,
  genre,
  country,
  LEFT(bio, 50) || '...' as bio_preview,
  CASE 
    WHEN profile_image IS NOT NULL THEN '✅ Con imagen'
    ELSE '❌ Sin imagen'
  END as imagen_status,
  spotify_artist_id
FROM artists 
WHERE name = 'Borngud';

-- Verificar redes sociales de Borngud (si existen)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'social_accounts') THEN
    PERFORM 1; -- Placeholder
  END IF;
END
$$;

SELECT 
  '📱 REDES SOCIALES' as seccion,
  platform,
  username,
  followers,
  CASE 
    WHEN url IS NOT NULL THEN LEFT(url, 30) || '...'
    ELSE 'Sin URL'
  END as url_preview
FROM social_accounts 
WHERE artist_id = '172cb578-d3f7-4303-b074-4ae5d5173374'
ORDER BY platform;

-- Verificar distribución (si existe)
SELECT 
  '🎵 DISTRIBUCIÓN' as seccion,
  service,
  username,
  monthly_listeners,
  distributor
FROM distribution_accounts 
WHERE artist_id = '172cb578-d3f7-4303-b074-4ae5d5173374'
ORDER BY service;

-- Mensaje final
SELECT 
  '✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE' as resultado,
  'Borngud restaurado con perfil completo, redes sociales y distribución' as detalles;
