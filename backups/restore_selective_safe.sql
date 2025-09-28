-- RESTAURACIÓN SELECTIVA Y SEGURA
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =====================================================

-- PASO 1: Backup de seguridad
CREATE TABLE IF NOT EXISTS artists_backup_before_restore AS SELECT * FROM artists;

-- PASO 2: Limpiar y restaurar tabla ARTISTS
TRUNCATE TABLE artists CASCADE;

-- Restaurar ARTISTS desde backup (datos específicos que sabemos que funcionan)
INSERT INTO "public"."artists" ("id", "name", "genre", "country", "profile_image", "bio", "monthly_listeners", "total_streams", "created_at", "updated_at", "user_id", "spotify_artist_id", "first_name", "last_name", "date_of_birth", "participant_id") VALUES
	('5c15dcad-4a96-4e4a-8169-6ce0577d0e9e', 'marval', 'Hip Hop', 'venezuela', 'https://tdbomtxyevggobphozdu.supabase.co/storage/v1/object/public/artist-profiles/1757344837458_d6a7c495-7efc-45fb-b56c-991c6696d746.png', '', 0, 0, '2025-09-08 15:20:38.879493+00', '2025-09-08 15:20:38.879493+00', 'a56bc5e0-9dba-4a01-924e-c0b6938f0857', '0qKkpjlY5VEmY4n6CRbPZM', '', '', NULL, '4fcd6162-7f2a-4c18-9d4b-5f68ccfaf1d5'),
	('172cb578-d3f7-4303-b074-4ae5d5173374', 'Borngud', 'Hip Hop', 'Lagos/Nigeria ', 'https://tdbomtxyevggobphozdu.supabase.co/storage/v1/object/public/artist-profiles/1757126301351_IMG_20250906_022807.jpg', 'I''m Emmanuel the son of John, an Afrobeat singer and song writer, from Ugwueke Bende LGA Ania state,', 0, 0, '2025-09-06 02:38:22.845381+00', '2025-09-06 02:38:22.845381+00', '3ecce5b7-cb4c-4071-9717-24adbf296f7f', '3KUEQGqSJQbjADweTLE4ax', 'Emmanuel', 'John', NULL, NULL);

-- PASO 3: Restaurar SOCIAL_ACCOUNTS si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'social_accounts') THEN
    -- Limpiar tabla
    TRUNCATE TABLE social_accounts CASCADE;
    
    -- Restaurar redes sociales de Borngud
    INSERT INTO "public"."social_accounts" ("id", "artist_id", "platform", "username", "followers", "url", "created_at", "handle", "password_encrypted", "created_by", "updated_at", "password", "email") VALUES
    ('9825e43c-6400-45b6-834b-78e12a28ab00', '172cb578-d3f7-4303-b074-4ae5d5173374', 'YouTube', '@borngud', 0, NULL, '2025-09-07 02:50:32.924166+00', NULL, NULL, 'a56bc5e0-9dba-4a01-924e-c0b6938f0857', '2025-09-15 03:51:16.580177+00', '{"encrypted":"m785yrSfhvW3Tr8gF/aoO9OC/R9+3MpfMpNV","iv":"hSw/y/fzJveyXvWB"}', 'borngud22@gmail.com'),
    ('ab020277-ef29-4494-ba3f-5dd35931d237', '172cb578-d3f7-4303-b074-4ae5d5173374', 'Instagram', '@borngud', 17, 'https://www.instagram.com/borngud?igsh=MXB6eGF6eHZyOW1mNw==', '2025-09-06 03:11:56.141649+00', '@borngud', NULL, '3ecce5b7-cb4c-4071-9717-24adbf296f7f', '2025-09-15 03:51:16.760056+00', '{"encrypted":"lWbPslOIJRhEP06CjrulWunuRZ2e/r3Z2Xx+","iv":"Ee5LSEudkv5txEBS"}', 'borngud22@gmail.com'),
    ('81690e48-8b7c-47ce-878f-1ed1002fb86a', '172cb578-d3f7-4303-b074-4ae5d5173374', 'TikTok', '@borngud', 39, 'https://www.tiktok.com/@borngud?_t=ZP-8zUSTzxmxQM&_r=1', '2025-09-06 03:11:56.141649+00', '@borngud', NULL, '3ecce5b7-cb4c-4071-9717-24adbf296f7f', '2025-09-15 03:51:16.934484+00', '{"encrypted":"9xyWAYRRvNTnFVZq1L6bStEizT9muyr6wKyP","iv":"+Xv3LfX8TYnLyufP"}', 'borngud22@gmail.com'),
    ('3e147b3b-5be8-48a0-9324-8297989bbd82', '172cb578-d3f7-4303-b074-4ae5d5173374', 'Twitter', 'Borngud1', 785, 'https://x.com/borngud1?t=xBmTgNMQpaa0IzLmlbEgpw&s=09', '2025-09-06 03:11:56.141649+00', 'Borngud1', NULL, '3ecce5b7-cb4c-4071-9717-24adbf296f7f', '2025-09-15 03:51:17.144804+00', '{"encrypted":"i4YnV3I8ys65S57Y95REPnAT0+aEMQAozwj3","iv":"0umyZj5jG6IL++Ya"}', 'borngud22@gmail.com');
    
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
    -- Limpiar tabla
    TRUNCATE TABLE distribution_accounts CASCADE;
    
    -- Restaurar cuentas de distribución de Borngud
    INSERT INTO "public"."distribution_accounts" ("id", "artist_id", "distributor", "username", "url", "created_at", "account_id", "email", "access_token_encrypted", "created_by", "updated_at", "service", "monthly_listeners", "password", "notes", "platform", "access_token", "refresh_token", "token_expires_at", "analytics_status", "last_synced_at", "provider") VALUES
    ('8a0db945-9411-4af0-b9ce-af4698e84849', '172cb578-d3f7-4303-b074-4ae5d5173374', 'distrokid', 'Borngud', NULL, '2025-09-08 00:13:46.58053+00', NULL, 'borngud22@gmail.com', NULL, 'a56bc5e0-9dba-4a01-924e-c0b6938f0857', '2025-09-15 03:51:17.328263+00', 'Amazon Music', 0, '{"encrypted":"9D5MOzWPKtUOOTeboi48FYGBQQfgsxuKeIXP","iv":"9wjwt5dwDLE2x/Vg"}', NULL, NULL, NULL, NULL, NULL, 'disconnected', NULL, NULL),
    ('b71ce549-8bbb-4980-84fc-1c83ab9d358c', '172cb578-d3f7-4303-b074-4ae5d5173374', 'Distrokid', 'Borngud', NULL, '2025-09-08 00:11:51.990077+00', NULL, 'borngud22@gmail.com', NULL, 'a56bc5e0-9dba-4a01-924e-c0b6938f0857', '2025-09-15 03:51:17.609157+00', 'Spotify', 2294, '{"encrypted":"znvouqDUHQzDzCG7e4n6ZqPMGYHMcV3WbFv5","iv":"HjCLOVq89XjrxA34"}', NULL, NULL, NULL, NULL, NULL, 'disconnected', NULL, NULL);
    
    RAISE NOTICE 'Cuentas de distribución restauradas exitosamente';
  ELSE
    RAISE NOTICE 'Tabla distribution_accounts no existe, saltando...';
  END IF;
END
$$;

-- PASO 5: Restaurar PROJECTS si la tabla existe (sin columna type problemática)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
    -- Limpiar tabla
    TRUNCATE TABLE projects CASCADE;
    
    -- Restaurar proyecto de Borngud (solo campos que sabemos que existen)
    INSERT INTO "public"."projects" ("id", "artist_id", "name", "status", "release_date", "description", "created_at", "updated_at", "cover_art_url", "music_file_url", "genre") VALUES
    ('946e9826-e04b-4b88-a795-6049ccfcd89d', '172cb578-d3f7-4303-b074-4ae5d5173374', 'SELFLESS', 'released', '2025-09-15', 'New single by Borngud', '2025-09-15 23:20:00+00', NOW(), 'https://tdbomtxyevggobphozdu.supabase.co/storage/v1/object/public/creative-vault-assets/172cb578-d3f7-4303-b074-4ae5d5173374/7d0f6efc-ca68-43bc-b6c9-69a5542a1e8c.jpg', 'https://tdbomtxyevggobphozdu.supabase.co/storage/v1/object/public/creative-vault-assets/172cb578-d3f7-4303-b074-4ae5d5173374/85916767-5f0b-48a6-adf9-c5f602d4c9f0.mp3', 'Hip Hop');
    
    RAISE NOTICE 'Proyectos restaurados exitosamente';
  ELSE
    RAISE NOTICE 'Tabla projects no existe, saltando...';
  END IF;
END
$$;

-- PASO 6: Restaurar ASSETS si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assets') THEN
    -- Limpiar tabla
    TRUNCATE TABLE assets CASCADE;
    
    -- Restaurar assets de Borngud
    INSERT INTO "public"."assets" ("id", "artist_id", "project_id", "name", "type", "category", "file_url", "file_size", "dimensions", "format", "description", "created_at", "updated_at") VALUES
    ('a723a1d3-70ed-4f4e-843f-8ca53f92e048', '172cb578-d3f7-4303-b074-4ae5d5173374', '946e9826-e04b-4b88-a795-6049ccfcd89d', '01216d3b97f0a5ceb1379e0e4473dfc9.jpg', 'cover_art', 'musical_releases', 'https://tdbomtxyevggobphozdu.supabase.co/storage/v1/object/public/creative-vault-assets/172cb578-d3f7-4303-b074-4ae5d5173374/7d0f6efc-ca68-43bc-b6c9-69a5542a1e8c.jpg', 156215, NULL, 'image/jpeg', NULL, '2025-09-15 23:20:24.166883+00', NOW()),
    ('b17c2b02-cf19-46c8-b165-5f478f4cecc6', '172cb578-d3f7-4303-b074-4ae5d5173374', '946e9826-e04b-4b88-a795-6049ccfcd89d', 'SELFLESS - Borngud.mp3', 'music_file', 'musical_releases', 'https://tdbomtxyevggobphozdu.supabase.co/storage/v1/object/public/creative-vault-assets/172cb578-d3f7-4303-b074-4ae5d5173374/85916767-5f0b-48a6-adf9-c5f602d4c9f0.mp3', 5467351, NULL, 'audio/mpeg', NULL, '2025-09-15 23:20:58.128734+00', NOW()),
    ('47d58f29-8335-4cfe-8002-c579b9afb96b', '172cb578-d3f7-4303-b074-4ae5d5173374', '946e9826-e04b-4b88-a795-6049ccfcd89d', 'eef', 'Instagram Story', 'Social Media', 'https://tdbomtxyevggobphozdu.supabase.co/storage/v1/object/public/artist-assets/assets/172cb578-d3f7-4303-b074-4ae5d5173374/1758130106199-dn55b8hjnah.jpg', NULL, NULL, NULL, 'efwefwe', '2025-09-17 17:28:29.226008+00', NOW());
    
    RAISE NOTICE 'Assets restaurados exitosamente';
  ELSE
    RAISE NOTICE 'Tabla assets no existe, saltando...';
  END IF;
END
$$;

-- PASO 7: Verificación final
SELECT 
  '🎉 RESTAURACIÓN SELECTIVA COMPLETADA' as mensaje,
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
  END as imagen_status
FROM artists 
WHERE name = 'Borngud';

-- Verificar redes sociales de Borngud
SELECT 
  '📱 REDES SOCIALES' as seccion,
  platform,
  username,
  followers,
  url
FROM social_accounts 
WHERE artist_id = '172cb578-d3f7-4303-b074-4ae5d5173374'
ORDER BY platform;

-- Mensaje final
SELECT 
  '✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE' as resultado,
  'Borngud y todos sus datos han sido restaurados' as detalles;
