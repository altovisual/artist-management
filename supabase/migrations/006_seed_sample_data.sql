-- Insert sample artists
INSERT INTO public.artists (id, name, genre, country, profile_image, bio, monthly_listeners, total_streams) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Ana García', 'Pop', 'España', '/ana-garc-a-pop-artist-profile-photo.png', 'Cantante y compositora española especializada en pop contemporáneo con influencias latinas.', 125000, 2500000),
('550e8400-e29b-41d4-a716-446655440002', 'Carlos Mendoza', 'Rock', 'México', '/carlos-mendoza-rock-guitarist-profile-photo.png', 'Guitarrista y vocalista mexicano con más de 10 años de experiencia en la escena rock alternativa.', 89000, 1800000),
('550e8400-e29b-41d4-a716-446655440003', 'María López', 'R&B', 'Colombia', '/mar-a-l-pez-r.png', 'Artista colombiana de R&B y soul, conocida por su voz potente y letras emotivas.', 156000, 3200000),
('550e8400-e29b-41d4-a716-446655440004', 'Diego Ruiz', 'Hip Hop', 'Argentina', '/diego-ruiz-hip-hop-artist-profile-photo.png', 'Rapero y productor argentino, pionero del hip hop en español con mensaje social.', 203000, 4100000);

-- Insert social accounts
INSERT INTO public.social_accounts (artist_id, platform, username, followers, url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Instagram', '@anagarcia_music', 45000, 'https://instagram.com/anagarcia_music'),
('550e8400-e29b-41d4-a716-446655440001', 'TikTok', '@anagarcia_music', 78000, 'https://tiktok.com/@anagarcia_music'),
('550e8400-e29b-41d4-a716-446655440001', 'YouTube', 'Ana García Official', 32000, 'https://youtube.com/@anagarciaofficial'),
('550e8400-e29b-41d4-a716-446655440002', 'Instagram', '@carlosmendoza_rock', 28000, 'https://instagram.com/carlosmendoza_rock'),
('550e8400-e29b-41d4-a716-446655440002', 'Twitter', '@carlosmendoza', 15000, 'https://twitter.com/carlosmendoza'),
('550e8400-e29b-41d4-a716-446655440003', 'Instagram', '@marialopez_rb', 67000, 'https://instagram.com/marialopez_rb'),
('550e8400-e29b-41d4-a716-446655440003', 'TikTok', '@marialopez_rb', 89000, 'https://tiktok.com/@marialopez_rb'),
('550e8400-e29b-41d4-a716-446655440004', 'Instagram', '@diegoruiz_hiphop', 95000, 'https://instagram.com/diegoruiz_hiphop'),
('550e8400-e29b-41d4-a716-446655440004', 'YouTube', 'Diego Ruiz Hip Hop', 54000, 'https://youtube.com/@diegoruizhiphop');

-- Insert distribution accounts
INSERT INTO public.distribution_accounts (artist_id, platform, monthly_listeners, url, distributor, service) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Spotify', 125000, 'https://open.spotify.com/artist/anagarcia', 'Spotify', 'Spotify'),
('550e8400-e29b-41d4-a716-446655440001', 'Apple Music', 89000, 'https://music.apple.com/artist/anagarcia', 'Apple Music', 'Apple Music'),
('550e8400-e29b-41d4-a716-446655440001', 'YouTube Music', 67000, 'https://music.youtube.com/channel/anagarcia', 'YouTube Music', 'YouTube Music'),
('550e8400-e29b-41d4-a716-446655440002', 'Spotify', 89000, 'https://open.spotify.com/artist/carlosmendoza', 'Spotify', 'Spotify'),
('550e8400-e29b-41d4-a716-446655440002', 'Apple Music', 45000, 'https://music.apple.com/artist/carlosmendoza', 'Apple Music', 'Apple Music'),
('550e8400-e29b-41d4-a716-446655440003', 'Spotify', 156000, 'https://open.spotify.com/artist/marialopez', 'Spotify', 'Spotify'),
('550e8400-e29b-41d4-a716-446655440003', 'Apple Music', 123000, 'https://music.apple.com/artist/marialopez', 'Apple Music', 'Apple Music'),
('550e8400-e29b-41d4-a716-446655440004', 'Spotify', 203000, 'https://open.spotify.com/artist/diegoruiz', 'Spotify', 'Spotify'),
('550e8400-e29b-41d4-a716-446655440004', 'Apple Music', 167000, 'https://music.apple.com/artist/diegoruiz', 'Apple Music', 'Apple Music');

-- Insert sample projects
INSERT INTO public.projects (id, artist_id, name, type, status, release_date, description) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Corazón Libre', 'single', 'completed', '2024-01-15', 'Nuevo single pop con influencias latinas'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Revolución Sonora', 'album', 'in_progress', '2024-03-20', 'Álbum conceptual sobre la evolución del rock'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Alma Desnuda', 'ep', 'planning', '2024-05-10', 'EP intimista de R&B y soul');