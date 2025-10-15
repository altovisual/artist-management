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

// Performing Rights Organizations (PROs)
export const PRO_OPTIONS = [
  { value: 'ASCAP', label: '🇺🇸 ASCAP (USA)' },
  { value: 'BMI', label: '🇺🇸 BMI (USA)' },
  { value: 'SESAC', label: '🇺🇸 SESAC (USA)' },
  { value: 'SAYCO', label: '🇨🇴 SAYCO (Colombia)' },
  { value: 'ACINPRO', label: '🇨🇴 ACINPRO (Colombia)' },
  { value: 'SACM', label: '🇲🇽 SACM (México)' },
  { value: 'SGAE', label: '🇪🇸 SGAE (España)' },
  { value: 'SADAIC', label: '🇦🇷 SADAIC (Argentina)' },
  { value: 'SCD', label: '🇨🇱 SCD (Chile)' },
  { value: 'APDAYC', label: '🇵🇪 APDAYC (Perú)' },
  { value: 'SACVEN', label: '🇻🇪 SACVEN (Venezuela)' },
  { value: 'SAYCE', label: '🇪🇨 SAYCE (Ecuador)' },
  { value: 'AGADU', label: '🇺🇾 AGADU (Uruguay)' },
  { value: 'APA', label: '🇵🇾 APA (Paraguay)' },
  { value: 'SOBODAYCOM', label: '🇧🇴 SOBODAYCOM (Bolivia)' },
  { value: 'ACAM', label: '🇨🇷 ACAM (Costa Rica)' },
  { value: 'SPAC', label: '🇵🇦 SPAC (Panamá)' },
  { value: 'SGACEDOM', label: '🇩🇴 SGACEDOM (Rep. Dominicana)' },
  { value: 'ACDAM', label: '🇵🇷 ACDAM (Puerto Rico)' },
  { value: 'UBC', label: '🇧🇷 UBC (Brasil)' },
  { value: 'PRS', label: '🇬🇧 PRS (Reino Unido)' },
  { value: 'SACEM', label: '🇫🇷 SACEM (Francia)' },
  { value: 'GEMA', label: '🇩🇪 GEMA (Alemania)' },
  { value: 'SIAE', label: '🇮🇹 SIAE (Italia)' },
  { value: 'SOCAN', label: '🇨🇦 SOCAN (Canadá)' },
  { value: 'Ninguna', label: '❌ Ninguna' },
  { value: 'Otro', label: '✏️ Otro (especificar)' },
];

// Record Labels (Major and Independent)
export const RECORD_LABELS = [
  { value: 'Universal Music Group', label: '🎵 Universal Music Group' },
  { value: 'Sony Music Entertainment', label: '🎵 Sony Music Entertainment' },
  { value: 'Warner Music Group', label: '🎵 Warner Music Group' },
  { value: 'EMI', label: '🎵 EMI' },
  { value: 'BMG', label: '🎵 BMG' },
  { value: 'Atlantic Records', label: '🎵 Atlantic Records' },
  { value: 'Capitol Records', label: '🎵 Capitol Records' },
  { value: 'Columbia Records', label: '🎵 Columbia Records' },
  { value: 'RCA Records', label: '🎵 RCA Records' },
  { value: 'Interscope Records', label: '🎵 Interscope Records' },
  { value: 'Republic Records', label: '🎵 Republic Records' },
  { value: 'Def Jam', label: '🎵 Def Jam' },
  { value: 'Island Records', label: '🎵 Island Records' },
  { value: 'Epic Records', label: '🎵 Epic Records' },
  { value: 'Elektra Records', label: '🎵 Elektra Records' },
  { value: 'Independent', label: '🏠 Independent' },
  { value: 'Self-Released', label: '👤 Self-Released' },
  { value: 'Otro', label: '✏️ Otro (especificar)' },
];

export function getCitiesForCountry(country: string): string[] {
  return CITIES_BY_COUNTRY[country] || [];
}

export function formatSigningLocation(city: string, country: string): string {
  return `${city}, ${country}`;
}
