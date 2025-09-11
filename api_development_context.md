# Contexto de Desarrollo de la API Interna

Este documento resume el plan, el progreso y los próximos pasos para el desarrollo de la API interna de la aplicación de gestión de artistas.

## 1. Objetivo

El objetivo es crear una API interna que sirva como fuente única y centralizada de datos para ser consumida por servicios externos como n8n y una IA. La API gestionará la información necesaria para la generación y seguimiento de contratos.

## 2. Estado de los Módulos de la API

*   **`[x]` Participants:** (Artistas, managers, productores, etc.) - **¡COMPLETADO!**
*   **`[x]` Works:** (Obras musicales) - **¡COMPLETADO!**
    *   `GET /api/works`
    *   `POST /api/works`
    *   `GET /api/works/:id`
    *   `PATCH /api/works/:id`
    *   `DELETE /api/works/:id`
*   **`[ ]` Templates:** (Plantillas de contratos) - **EN PROGRESO**
*   **`[ ]` Contracts:** (Contratos generados) - **PENDIENTE**
*   **`[ ]` Signatures:** (Firmas electrónicas) - **PENDIENTE**

## 3. Resumen del Trabajo Realizado

*   **Entorno de Desarrollo:** Se ha depurado y estabilizado un entorno local de Supabase muy problemático.
*   **API de Participantes:** Se ha implementado una API REST completa para la entidad `participants` usando una conexión directa a la base de datos (`pg`).
*   **API de Obras:** Se ha implementado una API REST completa para la entidad `works` (sobre la tabla `projects`), incluyendo la gestión de autores a través de una tabla de unión (`work_participants`).
*   **Base de Datos:** Se han creado y modificado las tablas `participants`, `projects` y `work_participants` con sus respectivas columnas, permisos y claves foráneas.

## 4. Próximos Pasos

El siguiente objetivo es construir la API para **Templates**.

1.  **Paso Inmediato:** Crear una nueva migración de base de datos (`054_...`) para crear la tabla `templates` con las siguientes columnas: `id`, `type`, `language`, `template_html`, `version`, `jurisdiction`.
2.  **Siguientes Pasos:**
    *   Crear los endpoints de la API para `templates` (`GET`, `POST`, etc.) usando nuestro método de conexión directa.
