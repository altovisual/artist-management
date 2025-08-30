## Plan de Implementación: Gestión de Perfiles de Artistas por los Propios Artistas

### Actualizaciones Recientes y Nuevas Funcionalidades

Desde la última actualización, se han implementado las siguientes mejoras y funcionalidades:

-   **Interruptor de Modo Oscuro/Claro:** Se ha añadido un selector de tema en la barra de navegación superior, permitiendo a los usuarios alternar entre el modo claro y oscuro en toda la aplicación. El logo de la aplicación también cambia dinámicamente para adaptarse al tema seleccionado (logo negro para modo claro, logo blanco para modo oscuro).
-   **Posicionamiento del Logo en Páginas de Autenticación:** El logo en las páginas de inicio de sesión, registro y registro de artista ahora se posiciona en la esquina superior izquierda, con un padding adecuado, para un efecto de "logo mosca" más discreto y moderno.
-   **Actualización Detallada del README.md:** El archivo `README.md` ha sido extensamente actualizado para incluir una descripción más detallada del proyecto, una lista exhaustiva de características (incluyendo las nuevas funcionalidades de administrador y el sistema de clave de cifrado global), y una "Guía de Inicio Rápido para Usuarios (Onboarding)" completa para facilitar la comprensión y el uso del sistema.

### I. Conceptos Clave y Arquitectura:

*   **Seguridad a Nivel de Fila (RLS) de Supabase:** Crucial para asegurar que los artistas solo accedan a sus propios datos. Supabase permite definir políticas en las tablas (ej. `artists`, `social_accounts`, `distribution_accounts`, `projects`, `assets`) que restringen el acceso de lectura/escritura basado en el `user.id` autenticado.
*   **Autenticación de Supabase:** Aprovechar la autenticación existente de Supabase para el registro e inicio de sesión de artistas. Cada artista tendrá un `user.id` único.
*   **Página de Perfil/Panel de Control Dedicada para Artistas:** Una interfaz específica donde un artista autenticado puede ver y editar sus propios detalles.

### II. Plan de Implementación Paso a Paso:

**A. Configuración de la Base de Datos (Supabase):**

1.  **Vincular la tabla `artists` a `auth.users`:**
    *   Añadir una columna `user_id` a la tabla `artists` (tipo `uuid`, inicialmente anulable, luego no anulable una vez vinculada).
    *   Establecer una restricción de clave externa de `artists.user_id` a `auth.users.id`.
2.  **Implementar Políticas de Seguridad a Nivel de Fila (RLS):**
    *   **Tabla `artists`:**
        *   `SELECT` policy: `auth.uid() = user_id` (los artistas solo pueden ver su propio perfil).
        *   `INSERT` policy: `auth.uid() = user_id` (los artistas solo pueden crear su propio perfil).
        *   `UPDATE` policy: `auth.uid() = user_id` (los artistas solo pueden actualizar su propio perfil).
        *   `DELETE` policy: `auth.uid() = user_id` (los artistas solo pueden eliminar su propio perfil).
    *   **Tablas relacionadas (`social_accounts`, `distribution_accounts`, `projects`, `assets`):**
        *   Políticas RLS similares, pero vinculando a `artist_id` que a su vez se vincula a `user_id` (ej. `EXISTS(SELECT 1 FROM artists WHERE id = artist_id AND user_id = auth.uid())`). Esto asegura que un artista solo pueda gestionar datos relacionados con *su* perfil de artista.

**B. Flujo de Registro/Incorporación de Artistas:**

1.  **Nueva Página de Registro (`/auth/artist-sign-up`):**
    *   Similar al registro existente, pero después de un registro exitoso, debería:
        *   Solicitar al artista que cree su perfil inicial (nombre, género, etc.).
        *   Vincular automáticamente el perfil de artista recién creado a su `auth.user.id`.
        *   Redirigirlos a su página dedicada de edición de perfil de artista.
2.  **Formulario de Creación de Perfil Inicial del Artista:**
    *   Una versión simplificada del formulario "Add New Artist" (`/artists/new`).
    *   Crucialmente, cuando se envía este formulario, el `artist.user_id` debe establecerse en `auth.uid()`.

**C. Interfaz de Edición de Perfil Específica para Artistas:**

1.  **Página de Perfil de Artista Dedicada (`/artist-profile` o `/artists/my-profile`):**
    *   Esta página sería accesible solo para artistas autenticados.
    *   Obtendría el perfil del artista usando `supabase.from('artists').select('*').eq('user_id', user.id).single()`. RLS asegurará que solo obtengan sus propios datos.
    *   Contendría formularios para editar:
        *   Información Básica del Artista (nombre, género, biografía, imagen de perfil).
        *   Cuentas de Redes Sociales.
        *   Cuentas de Distribución.
        *   Proyectos (si los artistas pueden gestionar sus propios proyectos/lanzamientos).
        *   Activos (si los artistas pueden subir sus propios activos).
    *   Los formularios deben ser intuitivos, quizás usando un asistente paso a paso o secciones claras.
    *   **Importante:** La página existente "Edit Artist" (`/artists/[id]/edit`) podría adaptarse para esto, pero necesitaría asegurar que `id` se derive de `user.id` y no del parámetro de la URL por seguridad. Una página separada es más segura.

**D. Visualización e Integración de Datos:**

1.  **Panel de Control (`/dashboard`):**
    *   El panel de control existente (para usuarios administradores) continuaría mostrando todos los artistas. Las políticas RLS para usuarios administradores deberían ser más permisivas (ej. `true` para `SELECT` en la tabla `artists` para el rol de administrador).
    *   Las tarjetas de artista reflejarían automáticamente los datos enviados por los artistas debido a la base de datos compartida.

### III. Consideraciones para un Diseño Intuitivo y Prevención de Errores:

*   **Instrucciones Claras:** Proporcionar instrucciones claras y concisas en cada campo del formulario.
*   **Validación de Entrada:** Implementar validación robusta tanto en el cliente como en el servidor para prevenir errores (ej. campos obligatorios, formatos de URL correctos, números válidos).
*   **Indicadores de Progreso:** Mostrar estados de carga y mensajes de éxito/error claramente.
*   **Retroalimentación al Usuario:** Proporcionar retroalimentación inmediata sobre los envíos de formularios.
*   **Campos Condicionales:** Mostrar/ocultar campos basados en selecciones previas (ej. si se selecciona "Red Social", mostrar campos para nombre de usuario/URL).
*   **Datos Pre-rellenados:** Si un artista está editando, pre-rellenar los formularios con sus datos existentes.
*   **Cargas de Archivos:** Proporcionar una guía clara sobre los tipos y tamaños de archivo admitidos para imágenes de perfil y activos.

### IV. Pasos de Alto Nivel para Empezar:

1.  **Definir Roles de Usuario:** Decidir cómo diferenciar a los usuarios. Supabase Auth permite `app_metadata` personalizada o se podría usar una tabla `profiles` separada con una columna `role`.
2.  **Implementar RLS:** Este es el paso de seguridad más crítico. Comenzar con la tabla `artists`, luego extender a las tablas relacionadas.
3.  **Crear Registro/Incorporación de Artistas:** Construir el nuevo flujo de registro y el formulario inicial de creación de perfil de artista.
4.  **Desarrollar Página de Edición de Perfil de Artista:** Crear la interfaz para que los artistas gestionen sus propios datos.
