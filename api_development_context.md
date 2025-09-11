# Contexto de Desarrollo de la API Interna

Este documento resume el plan, el progreso y los próximos pasos para el desarrollo de la API interna de la aplicación de gestión de artistas.

## 1. Objetivo

El objetivo es crear una API interna que sirva como fuente única y centralizada de datos para ser consumida por servicios externos como n8n y una IA. La API gestionará la información necesaria para la generación y seguimiento de contratos.

## 2. Estado de los Módulos de la API

*   **`[x]` Participants:** (Artistas, managers, productores, etc.) - **¡COMPLETADO!**
*   **`[x]` Works:** (Obras musicales) - **¡COMPLETADO!**
*   **`[x]` Templates:** (Plantillas de contratos) - **¡COMPLETADO!**
*   **`[x]` Contracts:** (Contratos generados) - **¡COMPLETADO!**
*   **`[x]` Signatures:** (Firmas electrónicas) - **¡COMPLETADO!**
    *   `GET /api/signatures`
    *   `POST /api/signatures`
    *   `GET /api/signatures/:id`
    *   `PATCH /api/signatures/:id`
    *   `DELETE /api/signatures/:id`

## 3. Resumen del Trabajo Realizado

*   **Entorno de Desarrollo:** Se ha depurado y estabilizado un entorno local de Supabase muy problemático.
*   **API de Participantes:** Se ha implementado una API REST completa para la entidad `participants` usando una conexión directa a la base de datos (`pg`).
*   **API de Obras:** Se ha implementado una API REST completa para la entidad `works` (sobre la tabla `projects`), incluyendo la gestión de autores a través de una tabla de unión (`work_participants`).
*   **API de Plantillas:** Se ha implementado una API REST completa para la entidad `templates`.
*   **API de Contratos:** Se ha implementado una API REST completa para la entidad `contracts`, incluyendo la gestión de participantes a través de una tabla de unión (`contract_participants`).
*   **API de Firmas:** Se ha implementado un prototipo de API REST para la entidad `signatures`, simulando la interacción con un servicio de firma electrónica.
*   **Base de Datos:** Se han creado y modificado todas las tablas necesarias (`participants`, `projects`, `work_participants`, `templates`, `contracts`, `contract_participants`, `signatures`) con sus respectivas columnas, permisos y claves foráneas.

## 4. Próximos Pasos

¡Todos los módulos de la API han sido implementados!

1.  **Paso Inmediato:** Realizar pruebas exhaustivas de todos los endpoints de la API para asegurar su correcto funcionamiento.
2.  **Siguientes Pasos:**
    *   Integrar un servicio de firma electrónica real (como Yousign) en la API de `signatures`.
    *   Desplegar la API a un entorno de producción.
    *   Documentar la API para su uso por parte de servicios externos.