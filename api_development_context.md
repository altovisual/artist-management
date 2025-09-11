# Contexto de Desarrollo de la API Interna

Este documento resume el plan, el progreso y los próximos pasos para el desarrollo de la API interna de la aplicación de gestión de artistas.

## 1. Objetivo

El objetivo es crear una API interna que sirva como fuente única y centralizada de datos para ser consumida por servicios externos como n8n y una IA. La API gestionará la información necesaria para la generación y seguimiento de contratos.

## 2. Estado de los Módulos de la API

*   **`[x]` Participants:** (Artistas, managers, productores, etc.) - **¡COMPLETADO!**
*   **`[x]` Works:** (Obras musicales) - **¡COMPLETADO!**
*   **`[x]` Templates:** (Plantillas de contratos) - **¡COMPLETADO!**
*   **`[x]` Contracts:** (Contratos generados) - **¡COMPLETADO!**
    *   `GET /api/contracts`
    *   `POST /api/contracts`
    *   `GET /api/contracts/:id`
    *   `PATCH /api/contracts/:id`
    *   `DELETE /api/contracts/:id`
*   **`[ ]` Signatures:** (Firmas electrónicas) - **PENDIENTE**

## 3. Resumen del Trabajo Realizado

*   **Entorno de Desarrollo:** Se ha depurado y estabilizado un entorno local de Supabase muy problemático.
*   **API de Participantes:** Se ha implementado una API REST completa para la entidad `participants` usando una conexión directa a la base de datos (`pg`).
*   **API de Obras:** Se ha implementado una API REST completa para la entidad `works` (sobre la tabla `projects`), incluyendo la gestión de autores a través de una tabla de unión (`work_participants`).
*   **API de Plantillas:** Se ha implementado una API REST completa para la entidad `templates`.
*   **API de Contratos:** Se ha implementado una API REST completa para la entidad `contracts`, incluyendo la gestión de participantes a través de una tabla de unión (`contract_participants`).
*   **Base de Datos:** Se han creado y modificado las tablas `participants`, `projects`, `work_participants`, `templates`, `contracts` y `contract_participants` con sus respectivas columnas, permisos y claves foráneas.

## 4. Próximos Pasos

El siguiente objetivo es construir la API para **Signatures**.

1.  **Paso Inmediato:** Investigar e integrar un servicio de firma electrónica (por ejemplo, DocuSign, HelloSign, o similar).
2.  **Siguientes Pasos:**
    *   Crear una nueva migración de base de datos (`056_...`) para crear la tabla `signatures` con las columnas necesarias para rastrear el estado de las firmas.
    *   Crear los endpoints de la API para `signatures` que interactúen con el servicio de firma electrónica.
