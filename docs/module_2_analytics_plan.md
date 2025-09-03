# Plan de Implementación: Módulo 2 - Analítica y Reportes

Este documento sirve como contexto y plan de acción para el desarrollo del Módulo 2. Resume las decisiones de arquitectura y la estrategia a seguir para asegurar la continuidad entre sesiones de desarrollo.

---

## 1. Objetivo del Módulo

Integrar la plataforma con servicios de streaming externos (empezando por Spotify) para obtener, almacenar y visualizar métricas de rendimiento de los artistas de forma automática, proveyendo valor tanto a los artistas como a los administradores.

---

## 2. Arquitectura y Decisiones Clave

- **Estrategia Incremental:** El desarrollo se centrará primero y únicamente en la **integración con Spotify**. Una vez completada, el patrón se podrá replicar para otras plataformas (Apple Music, etc.).

- **Evolución de Funcionalidad Existente:** En lugar de crear una funcionalidad paralela, se ha decidido **reutilizar y extender** la sección existente de **"Distribution Accounts"**. Esta pasará de ser un simple "almacén de credenciales" a un **"Panel de Control de Conexiones"**.

- **Modelo Multi-Usuario (Multi-Tenant):** El sistema será construido una sola vez y permitirá que **cada artista conecte su propia cuenta** de forma individual y segura.

- **Roles y Permisos (RBAC):**
    - **Artista:** Solo puede ver y gestionar la conexión de sus propias cuentas y visualizar sus propios datos de analíticas.
    - **Administrador:** Tiene una vista de supervisión que le permite seleccionar y visualizar las analíticas de cualquier artista en la plataforma.

- **Flujo de Autorización Seguro (OAuth2):**
    - La conexión se realizará mediante el protocolo estándar OAuth2.
    - El artista autorizará la aplicación desde la página web oficial de Spotify.
    - **En ningún momento se pedirán, manejarán o almacenarán las contraseñas de Spotify de los artistas.** El sistema funcionará con tokens de acceso seguros y revocables.

---

## 3. Plan de Implementación Técnico

### Paso 1: Base de Datos (Supabase)

- **Modificar la tabla `distribution_accounts`:**
    - Añadir columnas para gestionar el estado de la conexión y los tokens de la API. Posibles columnas: `analytics_status` (ej. 'connected', 'disconnected'), `access_token` (cifrado), `refresh_token` (cifrado), `token_expires_at`.
- **Crear nueva tabla `streaming_analytics`:**
    - Almacenará los datos históricos de las métricas.
    - Columnas: `id`, `artist_id`, `platform`, `date`, `daily_streams`, `monthly_listeners`, `followers`, `source_data` (JSONB para datos brutos).
- **Migraciones:** Todos los cambios de esquema se realizarán a través de nuevos archivos de migración SQL.

### Paso 2: Backend (Supabase Edge Functions)

- **Función 1: `spotify-auth`:**
    - Manejará el inicio del flujo OAuth2 y el intercambio del código de autorización por un token de acceso.
- **Función 2: `spotify-sync`:**
    - Se conectará a la API de Spotify usando el token guardado.
    - Obtendrá las métricas clave.
    - Insertará o actualizará los datos en la tabla `streaming_analytics`.

### Paso 3: Frontend (Next.js)

- **Modificar la UI de "Distribution Accounts":**
    - Añadir un indicador de estado de conexión para cada cuenta.
    - Incluir el botón de "Conectar/Desconectar Analíticas".
- **Crear la Ruta `/dashboard/analytics`:**
    - Será la página principal para la visualización de datos.
    - Si el usuario es **admin**, mostrará un selector de artistas.
    - Si el usuario es **artista**, mostrará directamente sus datos.
- **Componentes de Visualización:**
    - Crear nuevos componentes de React (gráficos, tarjetas de métricas) para mostrar los datos de la tabla `streaming_analytics`.
