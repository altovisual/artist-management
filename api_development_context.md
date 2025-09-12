# Contexto de Depuración - 12 de septiembre de 2025

## Resumen del Problema Principal (Inicial):
El objetivo era que la lista desplegable "Link to App User" en la página de creación de participantes mostrara los usuarios registrados. Inicialmente, esto fallaba con un error `PGRST205: Could not find the table 'public.users_view'`.

## Diagnóstico y Pasos Realizados (Hasta la última actualización):

1.  **Verificación de la Base de Datos (Local):**
    *   Se confirmó que la vista `public.users_view` existía y que el rol `authenticated` tenía permisos `SELECT` sobre ella, usando un script `db-check.js` de conexión directa.
    *   Esto demostró que el problema no estaba en la base de datos ni en las migraciones, sino en la capa de la API de Supabase (PostgREST) que no reconocía la vista.

2.  **Problemas con la CLI de Supabase:**
    *   Se descubrió que la versión de la CLI de Supabase del usuario era incorrecta (`2.40.7` en lugar de `1.x`) y carecía de comandos esenciales como `supabase sql`.
    *   Se realizó un proceso exhaustivo para actualizar la CLI manualmente, ya que los gestores de paquetes (`npm`, `winget`, `scoop`, `choco`) fallaron o proporcionaron versiones incorrectas.

3.  **Intentos de Solución del Bug de PostgREST:**
    *   Se intentaron múltiples reinicios (`supabase stop/start`), `db reset` y la eliminación completa del estado local de Supabase (`.supabase` y contenedores Docker conflictivos).
    *   El error `PGRST205` persistió, lo que indica un bug fundamental en la versión local de PostgREST que la CLI de Supabase levanta.

4.  **Workaround Implementado (Conexión Directa a DB):**
    *   Para sortear el bug de PostgREST, se modificó la ruta de la API `/api/users` para que se conecte **directamente** a la base de datos PostgreSQL usando la librería `pg`, evitando por completo el cliente de Supabase y PostgREST.
    *   Esto eliminó el error `PGRST205` y el error de `Failed to parse cookie string`.

5.  **Problema Actual (en ese momento): Lista de Usuarios Vacía:**
    *   Después de implementar el workaround, la lista desplegable seguía vacía.
    *   Se usó `db-check.js` para verificar el contenido de la base de datos local. Se confirmó que las tablas `auth.users` y `public.artists` estaban **completamente vacías**.
    *   Esto reveló que la confusión se debía a que el usuario esperaba ver datos de su proyecto de Supabase en la **nube**, mientras que la aplicación estaba conectada a la base de datos **local**.

## Próximos Pasos (para continuar mañana - según el archivo original):

El objetivo era poblar la base de datos local con una copia de los datos de tu proyecto de Supabase en la nube, de forma segura y siguiendo las mejores prácticas.

1.  **Vincular el Proyecto Local con el de la Nube:**
    *   **Acción:** Ejecutar `C:\Herramientas\supabase.exe link --project-ref <project-ref>`
    *   **Instrucciones:** Necesitarás tu `<project-ref>` (el ID de tu proyecto en la URL del panel de Supabase) y la contraseña de tu base de datos de la nube.

2.  **Copiar los Datos de la Nube al Archivo "seed" Local:**
    *   **Acción:** Ejecutar `C:\Herramientas\supabase.exe db dump --data-only -f supabase/seed.sql`
    *   **Explicación:** Esto conectará con tu base de datos en la nube, copiará **solo los datos** (usuarios, artistas, etc.) y los guardará en el archivo `supabase/seed.sql` de tu proyecto.

3.  **Reiniciar la Base de Datos Local con los Nuevos Datos:**
    *   **Acción:** Ejecutar `C:\Herramientas\supabase.exe db reset`
    *   **Explicación:** Este comando reconstruirá tu base de datos local, aplicará todas las migraciones y luego usará el `seed.sql` para poblarla con los datos que acabas de copiar de la nube.

4.  **Verificar la Aplicación:**
    *   **Acción:** Ejecutar `npm run dev` y navegar a la página de "Crear Participante".
    *   **Resultado Esperado:** La lista desplegable "Link to App User" debería ahora mostrar los usuarios de tu proyecto de la nube.

---

## Actualización de Progreso (12 de septiembre de 2025)

Hemos avanzado significativamente en la configuración del entorno y la implementación de nuevas funcionalidades.

### Problemas Resueltos:

1.  **Sincronización de Base de Datos Local:**
    *   Se resolvió el problema de la base de datos local vacía y los errores de `supabase db reset`.
    *   Se identificaron y crearon múltiples migraciones para alinear el esquema local (`distribution_accounts` con `access_token_encrypted`, `created_by`, `updated_at`, `service`, `platform` no nulo, `social_accounts` con `handle`, `password_encrypted`, `created_by`, `updated_at`) con el esquema de producción.
    *   Se solucionó el conflicto de claves duplicadas en `storage.buckets` durante el `seeding`.
    *   **Resultado:** La base de datos local ahora se inicializa y se puebla correctamente con los datos de la nube.

2.  **Error "Failed to update work":**
    *   Se identificó y corrigió un error crítico en la construcción de la consulta SQL (`PATCH /api/works/[id]`) que causaba el error `operator does not exist: uuid = integer`.
    *   **Resultado:** La funcionalidad de actualización de obras ahora debería operar correctamente.

3.  **Funcionalidad "Link to User or Artist" en Participantes:**
    *   Se implementó una nueva ruta de API unificada (`/api/linkable-entities`) que devuelve una lista combinada de usuarios y artistas con información detallada (nombre, email, país, user_id asociado).
    *   Se actualizó el formulario "Crear Participante" (`app/management/participants/new/page.tsx`) para utilizar esta nueva API.
    *   La lista desplegable ahora permite seleccionar tanto usuarios como artistas, mostrando su tipo (`[User]` o `[Artist]`) y nombre.
    *   Al seleccionar una entidad, el formulario autocompleta campos relevantes como `name`, `artistic_name`, `email`, `country` y `user_id` (si aplica).
    *   Se añadió una migración para incluir `artistic_name`, `management_entity` e `ipi` en la tabla `public.participants`.
    *   Se actualizó el `POST /api/participants` para manejar correctamente el `user_id` y los nuevos campos.
    *   **Resultado:** La creación de participantes con enlace a usuarios o artistas funciona correctamente.

### Tareas Pendientes (Próximos Pasos):

1.  **Extender Campos de Artista:**
    *   Añadir los campos detallados del formulario de participante (`id_number`, `address`, `phone`, `bank_info`, `management_entity`, `ipi`) a la tabla `public.artists`.
    *   Modificar el formulario de perfil de artista (`app/artists/[id]/edit/page.tsx` o similar) para incluir estos nuevos campos.
    *   Modificar el formulario de creación de artista (`app/artists/new/page.tsx` o similar) para incluir estos nuevos campos.
    *   Actualizar las APIs (`GET`, `POST`, `PATCH`) de artistas para manejar estos nuevos campos.

---

## Depuración de Despliegue en Vercel (12 de septiembre de 2025 - Tarde)

Después de implementar las funcionalidades de artistas y participantes, se procedió a hacer `commit` y `push` de todos los cambios. El despliegue en Vercel comenzó a fallar.

### Problema 1: Errores de Build por Tipos en Rutas de API

*   **Error:** `Type error: Route "..." has an invalid "GET" export: Type "{ params: { id: string; }; }" is not a valid type for the function's second argument.`
*   **Diagnóstico:** Este error apareció secuencialmente en todas las rutas de API dinámicas (`/api/artists/[id]`, `/api/contracts/[id]`, etc.). Se determinó que era un problema de incompatibilidad entre la firma de tipos de la función y el entorno de build de Vercel (usando Next.js 15.2.4).
*   **Solución (Temporal/Diagnóstico):** Se modificaron todas las rutas de API dinámicas para usar `context: any` como segundo argumento en las funciones `GET`, `PATCH` y `DELETE`. Esto permitió que el build avanzara.

### Problema 2: Error de `Blob` en Generación de PDF

*   **Error:** `Type error: Argument of type 'Uint8Array<ArrayBufferLike>' is not assignable to parameter of type 'BlobPart'.`
*   **Diagnóstico:** En la ruta `/api/export-pdf`, el buffer de PDF devuelto por `puppeteer` no era directamente compatible con el constructor `new Blob()`.
*   **Solución:** Se convirtió el `Uint8Array` a un `Buffer` de Node.js (`Buffer.from(pdfBuffer)`) antes de crear el `Blob`, resolviendo el conflicto de tipos.

### Problema 3: Error de Renderizado en Servidor (`ECONNREFUSED`)

*   **Error:** `Application error: a server-side exception has occurred... Digest: 2027818240` y en los logs: `Error: connect ECONNREFUSED 127.0.0.1:3000`.
*   **Diagnóstico:** Se descubrió que los componentes de servidor en el directorio `/management` estaban llamando a sus propias rutas de API usando `fetch` con URLs `http://localhost:3000`. Esto falla en producción porque el servidor no puede llamarse a sí mismo en `localhost`.
*   **Solución (Arquitectónica):** Se refactorizaron todas las páginas afectadas (`participants`, `contracts`, `signatures`, `templates`, `works`) para que dejen de usar `fetch`. En su lugar, ahora acceden a la base de datos directamente usando la librería `pg`, lo cual es más eficiente y la práctica recomendada en Next.js.

### Problema 4 (Actual): Fallo de Autenticación y Migraciones en Producción

*   **Error:** `Database Error: error: password authentication failed for user "postgres"`, seguido de `relation "..." does not exist`.
*   **Diagnóstico:** Se identificaron múltiples problemas en cadena:
    1.  La contraseña de la base de datos en la variable de entorno `DATABASE_URL` de Vercel era incorrecta.
    2.  Una vez corregida, el `build` seguía fallando porque las tablas no existían en la base de datos de producción.
    3.  Se descubrió que el comando `supabase db push` estaba fallando debido a un historial de migraciones corrupto en la nube y una inconsistencia en los nombres de los archivos de migración (un formato antiguo `001_...` y uno nuevo `2025...`).

*   **Solución en Progreso:** Se está siguiendo un proceso iterativo para reparar el historial de migraciones en la nube y renombrar los archivos locales para que `db push` pueda aplicar la estructura de tablas correcta.

### Estado Actual y Próximos Pasos

Hemos identificado que la cadena de dependencias completa es `signatures` -> `contracts` -> `templates` y `projects`. Para evitar seguir haciéndolo uno por uno, el plan actual es reparar todas las dependencias de una vez.

**Acción Pendiente (donde nos quedamos):**
El usuario debe ejecutar los siguientes 3 comandos en orden para reparar las dependencias de `templates` y `projects` antes de intentar el `push` final.

1.  **Reparar `templates`:**
    ```powershell
    C:\Herramientas\supabase.exe migration repair --status reverted 20250911204256
    ```
2.  **Renombrar `projects`:**
    ```powershell
    ren supabase\migrations\004_create_projects_table.sql 20250825191901_create_projects_table.sql
    ```
3.  **Reparar la referencia antigua de `projects`:**
    ```powershell
    C:\Herramientas\supabase.exe migration repair --status reverted 004
    ```

**Siguiente paso después de la ejecución:**
*   Ejecutar `C:\Herramientas\supabase.exe db push --include-all` y verificar si todas las migraciones se aplican correctamente.