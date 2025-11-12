# Mejoras al Perfil de Artistas

## Cambios Implementados

### 1. **Campo de Rol del Artista** 🎤

Se agregó un nuevo campo `role` que permite a los artistas especificar su rol principal en la industria musical.

**Roles disponibles (26 opciones):**
- 🎤 Cantante / Singer
- 🎵 Vocalista / Vocalist
- 🎙️ Rapero / Rapper
- ✍️ Compositor / Songwriter
- 🎛️ Productor / Producer
- 🎧 DJ
- 🎸 Músico / Musician
- 🎸 Guitarrista / Guitarist
- 🎹 Pianista / Pianist
- 🥁 Baterista / Drummer
- 🎸 Bajista / Bassist
- 🎹 Tecladista / Keyboardist
- 🎷 Saxofonista / Saxophonist
- 🎺 Trompetista / Trumpeter
- 🎻 Violinista / Violinist
- 🎼 Compositor Musical / Composer
- 🎵 Arreglista / Arranger
- 🎚️ Ingeniero de Mezcla / Mixing Engineer
- 🎛️ Ingeniero de Masterización / Mastering Engineer
- 🔊 Ingeniero de Sonido / Sound Engineer
- 🥁 Beatmaker
- 🎺 Líder de Banda / Band Leader
- 🎼 Director de Orquesta / Conductor
- 🎭 Intérprete / Performer
- 🎸🎹 Multi-instrumentista / Multi-instrumentalist
- 🎵 Otro / Other

**Ubicación:** Step 1 - Basic Info, después de Genre

---

### 2. **Países Agregados** 🌎

Se expandió la lista de países de 52 a **120+ países**, incluyendo:

**Centroamérica y Caribe:**
- 🇩🇴 **República Dominicana** (solicitado)
- 🇨🇷 Costa Rica
- 🇨🇺 Cuba
- 🇬🇹 Guatemala
- 🇭🇳 Honduras
- 🇯🇲 Jamaica
- 🇳🇮 Nicaragua
- 🇵🇦 Panamá
- 🇵🇷 Puerto Rico
- 🇸🇻 El Salvador
- 🇹🇹 Trinidad and Tobago

**Sudamérica adicionales:**
- 🇧🇴 Bolivia
- 🇪🇨 Ecuador
- 🇬🇾 Guyana
- 🇵🇾 Paraguay
- 🇸🇷 Suriname

**Europa adicionales:**
- 🇧🇬 Bulgaria
- 🇭🇷 Croatia
- 🇨🇾 Cyprus
- 🇪🇪 Estonia
- 🇮🇸 Iceland
- 🇱🇻 Latvia
- 🇱🇹 Lithuania
- 🇱🇺 Luxembourg
- 🇲🇹 Malta
- 🇷🇸 Serbia
- 🇸🇰 Slovakia
- 🇸🇮 Slovenia

**Asia adicionales:**
- 🇭🇰 Hong Kong
- 🇹🇼 Taiwan

**Medio Oriente adicionales:**
- 🇧🇭 Bahrain
- 🇯🇴 Jordan
- 🇰🇼 Kuwait
- 🇱🇧 Lebanon
- 🇴🇲 Oman
- 🇶🇦 Qatar

**África adicionales:**
- 🇩🇿 Algeria
- 🇬🇭 Ghana
- 🇲🇦 Morocco
- 🇹🇿 Tanzania
- 🇺🇬 Uganda

**Oceanía adicionales:**
- 🇫🇯 Fiji

---

### 3. **Lista de PROs (Performance Rights Organizations)** 🎵

El campo "Management Entity" ahora es un **dropdown con 70+ organizaciones de derechos de autor** organizadas por región:

**Estados Unidos:**
- ASCAP (American Society of Composers, Authors and Publishers)
- BMI (Broadcast Music, Inc.)
- SESAC (Society of European Stage Authors and Composers)
- GMR (Global Music Rights)
- AllTrack
- SoundExchange

**Latinoamérica y Caribe:**
- SACM (Mexico)
- SGACEDOM (Dominican Republic)
- SAYCO (Colombia)
- ACINPRO (Colombia)
- SADAIC (Argentina)
- UBC (Brazil)
- ABRAMUS (Brazil)
- SICAM (Brazil)
- SOCINPRO (Brazil)
- ACAM (Costa Rica)
- APDAYC (Peru)
- AEI (Paraguay)
- AGADU (Uruguay)
- SACIM (Chile)
- PROFOMÚSICA (Venezuela)
- SACVEN (Venezuela)

**Europa:**
- PRS for Music (UK)
- GEMA (Germany)
- SACEM (France)
- SIAE (Italy)
- SGAE (Spain)
- BUMA/STEMRA (Netherlands)
- STIM (Sweden)
- TONO (Norway)
- KODA (Denmark)
- TEOSTO (Finland)
- SABAM (Belgium)
- AKM (Austria)
- SUISA (Switzerland)
- Y más...

**Asia y Pacífico:**
- JASRAC (Japan)
- KOMCA (South Korea)
- APRA AMCOS (Australia)
- APRA (New Zealand)
- COMPASS (Singapore)
- CASH (Hong Kong)
- MUST (Taiwan)
- FILSCAP (Philippines)
- MACP (Malaysia)
- MCSC (China)

**Medio Oriente y África:**
- SAMRO (South Africa)
- CAPASSO (South Africa)
- SACERAU (UAE)
- ACUM (Israel)
- MESAM (Turkey)
- COSOMA (Botswana)
- MCSK (Kenya)
- COSOTA (Tanzania)
- UPRS (Uganda)

**Otras opciones:**
- Not Registered
- Other

---

### 4. **Campo de PRO Email** 📧

Se agregó un nuevo campo `management_email` para almacenar el email del artista registrado en la PRO.

**Características:**
- Tipo: Email
- Validación automática de formato
- Placeholder: "artist@ascap.com"
- Ubicación: Step 2 - Contact, después de PRO Organization

---

## Archivos Modificados

### Nuevos Archivos:
1. **`lib/management-companies.ts`**
   - Lista de PROs (Performance Rights Organizations)
   - Lista de roles de artistas
   - 70+ organizaciones de derechos de autor
   - 26 roles musicales

2. **`supabase/migrations/20251112000000_add_artist_role_and_management_email.sql`**
   - Migración para agregar columnas `role` y `management_email`
   - Índice para búsqueda por rol
   - Comentarios de documentación

### Archivos Actualizados:
1. **`components/ui/country-select.tsx`**
   - Expandido de 52 a 120+ países
   - Organizado por regiones
   - Incluye República Dominicana y otros países faltantes

2. **`app/artists/new/page.tsx`**
   - Agregado campo de rol del artista
   - PRO Organization convertido a dropdown con 70+ opciones
   - Agregado campo de PRO Email
   - Estados y handlers actualizados
   - Payload de creación actualizado

---

## Migración de Base de Datos

Para aplicar los cambios en Supabase, ejecuta:

```sql
-- Ejecutar en Supabase SQL Editor
-- O usar el archivo: supabase/migrations/20251112000000_add_artist_role_and_management_email.sql

ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS role TEXT;

ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS management_email TEXT;

COMMENT ON COLUMN public.artists.role IS 'Primary role of the artist (singer, producer, songwriter, etc.)';
COMMENT ON COLUMN public.artists.management_email IS 'Email address associated with the management company';

CREATE INDEX IF NOT EXISTS idx_artists_role ON public.artists(role);
```

---

## Estructura del Formulario Actualizada

### Step 1: Basic Info
- Artist Name * (sin cambios)
- Genre * (sin cambios)
- **Role** ⭐ NUEVO - Dropdown con 26 roles
- First Name (sin cambios)
- Last Name (sin cambios)
- Date of Birth (sin cambios)
- Country * - Ahora con 120+ países incluyendo República Dominicana

### Step 2: Contact
- ID Number (sin cambios)
- Phone (sin cambios)
- Address (sin cambios)
- **PRO / Performing Rights Organization** ⭐ MEJORADO - Dropdown con 70+ PROs (BMI, ASCAP, SGACEDOM, etc.)
- **PRO Email** ⭐ NUEVO - Email del artista en la PRO
- IPI Number (sin cambios)

### Step 3-5: Sin cambios
- Biography
- Social Media
- Distribution

---

## Beneficios

✅ **Mejor categorización** - Los artistas pueden especificar su rol principal
✅ **Cobertura global** - 120+ países incluyendo todos los de Latinoamérica y Caribe
✅ **Gestión de derechos** - Lista completa de PROs de todo el mundo (BMI, ASCAP, SGACEDOM, etc.)
✅ **Mejor contacto** - Email específico del artista en su PRO
✅ **UX mejorada** - Dropdowns en lugar de campos de texto libre
✅ **Datos consistentes** - Valores estandarizados para mejor análisis
✅ **Compliance** - Facilita el registro y seguimiento de derechos de autor

---

## Próximos Pasos

1. ✅ Ejecutar migración en Supabase
2. ✅ Probar formulario de creación de artistas
3. ✅ Verificar que los datos se guarden correctamente
4. 🔄 Actualizar formulario de edición de artistas (si existe)
5. 🔄 Agregar filtros por rol en el dashboard
6. 🔄 Mostrar rol en las tarjetas de artistas
