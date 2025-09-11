# Contexto de Desarrollo de la API Interna

Este documento resume el plan, el progreso y los próximos pasos para el desarrollo de la API interna de la aplicación de gestión de artistas.

## 1. Objetivo

El objetivo es crear una API interna que sirva como fuente única y centralizada de datos para ser consumida por servicios externos como n8n y una IA. La API gestionará la información necesaria para la generación y seguimiento de contratos.

## 2. Estado de los Módulos de la API

*   **`[x]` Participants:** (Artistas, managers, productores, etc.) - **¡COMPLETADO!**
*   **`[x]` Works:** (Obras musicales) - **¡COMPLETADO!**
*   **`[x]` Templates:** (Plantillas de contratos) - **¡COMPLETADO!**
    *   `GET /api/templates`
    *   `POST /api/templates`
    *   `GET /api/templates/:id`
    *   `PATCH /api/templates/:id`
    *   `DELETE /api/templates/:id`
*   **`[ ]` Contracts:** (Contratos generados) - **PENDIENTE**
*   **`[ ]` Signatures:** (Firmas electrónicas) - **PENDIENTE**

## 3. Resumen del Trabajo Realizado

*   **Entorno de Desarrollo:** Se ha depurado y estabilizado un entorno local de Supabase muy problemático.
*   **API de Participantes:** Se ha implementado una API REST completa para la entidad `participants` usando una conexión directa a la base de datos (`pg`).
*   **API de Obras:** Se ha implementado una API REST completa para la entidad `works` (sobre la tabla `projects`), incluyendo la gestión de autores a través de una tabla de unión (`work_participants`).
*   **API de Plantillas:** Se ha implementado una API REST completa para la entidad `templates`.
*   **Base de Datos:** Se han creado y modificado las tablas `participants`, `projects`, `work_participants` y `templates` con sus respectivas columnas, permisos y claves foráneas.

## 4. Próximos Pasos

El siguiente objetivo es construir la API para **Contracts**.

1.  **Paso Inmediato:** Crear una nueva migración de base de datos (`055_...`) para crear la tabla `contracts` y la tabla de unión `contract_participants`.
    *   `contracts` columns: `id`, `work_id`, `template_id`, `status`, `final_contract_pdf_url`, `signed_at`.
    *   `contract_participants` columns: `contract_id`, `participant_id`, `role`.
2.  **Siguientes Pasos:**
    *   Crear los endpoints de la API para `contracts` (`GET`, `POST`, etc.) usando nuestro método de conexión directa.