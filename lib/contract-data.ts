// lib/contract-data.ts

export const COUNTRIES = [
  { value: 'Colombia', label: '🇨🇴 Colombia' },
  { value: 'Estados Unidos', label: '🇺🇸 Estados Unidos' },
  { value: 'México', label: '🇲🇽 México' },
  { value: 'España', label: '🇪🇸 España' },
  { value: 'Argentina', label: '🇦🇷 Argentina' },
  { value: 'Chile', label: '🇨🇱 Chile' },
  { value: 'Perú', label: '🇵🇪 Perú' },
  { value: 'Venezuela', label: '🇻🇪 Venezuela' },
  { value: 'Ecuador', label: '🇪🇨 Ecuador' },
  { value: 'Uruguay', label: '🇺🇾 Uruguay' },
  { value: 'Paraguay', label: '🇵🇾 Paraguay' },
  { value: 'Bolivia', label: '🇧🇴 Bolivia' },
  { value: 'Costa Rica', label: '🇨🇷 Costa Rica' },
  { value: 'Panamá', label: '🇵🇦 Panamá' },
  { value: 'República Dominicana', label: '🇩🇴 República Dominicana' },
  { value: 'Puerto Rico', label: '🇵🇷 Puerto Rico' },
  { value: 'Cuba', label: '🇨🇺 Cuba' },
  { value: 'Brasil', label: '🇧🇷 Brasil' },
  { value: 'Reino Unido', label: '🇬🇧 Reino Unido' },
  { value: 'Francia', label: '🇫🇷 Francia' },
  { value: 'Alemania', label: '🇩🇪 Alemania' },
  { value: 'Italia', label: '🇮🇹 Italia' },
  { value: 'Canadá', label: '🇨🇦 Canadá' },
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales'],
  'Estados Unidos': ['New York', 'Los Angeles', 'Miami', 'Nashville', 'Atlanta', 'Chicago', 'Las Vegas', 'Austin'],
  'México': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Cancún', 'Tijuana', 'Puebla', 'Mérida'],
  'España': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata'],
  'Chile': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Viña del Mar'],
  'Perú': ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Piura'],
  'Brasil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
};

export const MAJOR_PUBLISHERS = [
  { value: 'Sony Music Publishing', label: '🎵 Sony Music Publishing' },
  { value: 'Universal Music Publishing Group', label: '🎵 Universal Music Publishing Group' },
  { value: 'Warner Chappell Music', label: '🎵 Warner Chappell Music' },
  { value: 'BMG Rights Management', label: '🎵 BMG Rights Management' },
  { value: 'Kobalt Music', label: '🎵 Kobalt Music' },
  { value: 'Downtown Music Publishing', label: '🎵 Downtown Music Publishing' },
  { value: 'Concord Music Publishing', label: '🎵 Concord Music Publishing' },
  { value: 'peermusic', label: '🎵 peermusic' },
  { value: 'Spirit Music Group', label: '🎵 Spirit Music Group' },
  { value: 'Reservoir Media', label: '🎵 Reservoir Media' },
  { value: 'Independent', label: '🏠 Independent' },
  { value: 'Self-Published', label: '👤 Self-Published' },
  { value: 'Otro', label: '✏️ Otro (especificar)' },
];

export const PUBLISHER_ADMINS = [
  { value: 'Merlin', label: '🔷 Merlin' },
  { value: 'The Orchard', label: '🍎 The Orchard' },
  { value: 'FUGA', label: '🎯 FUGA' },
  { value: 'Believe Digital', label: '🎵 Believe Digital' },
  { value: 'AWAL', label: '🌟 AWAL' },
  { value: 'TuneCore', label: '🎸 TuneCore' },
  { value: 'CD Baby', label: '👶 CD Baby' },
  { value: 'DistroKid', label: '🎧 DistroKid' },
  { value: 'Ditto Music', label: '🎼 Ditto Music' },
  { value: 'Symphonic Distribution', label: '🎻 Symphonic Distribution' },
  { value: 'IDOL', label: '⭐ IDOL' },
  { value: 'Ninguno', label: '❌ Ninguno' },
  { value: 'Otro', label: '✏️ Otro (especificar)' },
];

export const CONTRACT_STATUS_OPTIONS = [
  { value: 'draft', label: '📝 Borrador', description: 'Contrato en proceso de creación' },
  { value: 'sent', label: '📤 Enviado', description: 'Enviado para firma' },
  { value: 'signed', label: '✅ Firmado', description: 'Completado y firmado' },
  { value: 'expired', label: '⏰ Expirado', description: 'Contrato expirado' },
  { value: 'archived', label: '📦 Archivado', description: 'Contrato archivado' },
];

export const PERCENTAGE_PRESETS = [
  { label: '100%', value: 100 },
  { label: '50%', value: 50 },
  { label: '33.33%', value: 33.33 },
  { label: '25%', value: 25 },
  { label: '20%', value: 20 },
  { label: '10%', value: 10 },
];

export function getCitiesForCountry(country: string): string[] {
  return CITIES_BY_COUNTRY[country] || [];
}

export function formatSigningLocation(city: string, country: string): string {
  return `${city}, ${country}`;
}
