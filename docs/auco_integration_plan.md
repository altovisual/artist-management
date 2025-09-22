# Plan de Integración de Auco

Este documento detalla el plan de acción para integrar los servicios de verificación de identidad y firma de Auco en la aplicación de gestión de artistas.

## Fase 1: Verificación de Identidad

- [x] **Crear una Cuenta en Auco:** Registrarse en la plataforma de Auco para obtener acceso al panel de control y las claves de API.
- [x] **Obtener Claves de API:** Localizar las claves de API para los entornos de desarrollo y producción. Almacenarlas de forma segura.
- [x] **Definir el Punto de Integración:** El punto de partida será el formulario de creación de un nuevo participante (`/management/participants/new`).
- [x] **Diseñar el Flujo de Verificación:**
    - [x] **Frontend:** Añadir un botón "Verificar Identidad" que inicie el flujo del SDK de Auco.
    - [x] **Backend:** Crear un endpoint de webhook para recibir notificaciones del estado de la verificación.
- [x] **Configurar Variables de Entorno:** Añadir las claves de API de Auco (`NEXT_PUBLIC_AUCO_API_KEY`, `AUCO_API_SECRET`) al archivo `.env.local`.
- [x] **Modificar la Base de Datos:**
    - [x] Añadir la columna `auco_verification_id` (de tipo `text`) a la tabla `participants`.
    - [x] Añadir la columna `verification_status` (de tipo `text`, con valores como `pending`, `verified`, `rejected`) a la tabla `participants`.
- [x] **Crear el Webhook:** Desarrollar un endpoint en `/api/webhooks/auco` para gestionar las notificaciones de Auco y actualizar la base de datos.
- [x] **Instalar el SDK de Auco:** Añadir el SDK de Auco como dependencia del proyecto (`auco-sdk-integration`).
- [x] **Integrar el Flujo de Verificación (Frontend):** Modificar la página de "Crear Participante" para incluir el botón y la lógica para iniciar el proceso de Auco.
- [x] **Actualizar la Interfaz de Usuario (Verificación):**
    - [x] Deshabilitar el botón de "Guardar" hasta que la verificación sea exitosa.
    - [x] Mostrar el estado de la verificación en la lista de participantes.

## Fase 2: Flujo de Firma de Documentos

- [x] **Modificar la Base de Datos (Plantillas):**
    - [x] Añadir la columna `auco_document_id` (de tipo `text`) a la tabla `templates`.
- [x] **Actualizar UI de Plantillas (Crear):**
    - [x] Añadir campo `auco_document_id` al formulario de creación de plantillas (`/management/templates/new`).
    - [x] Actualizar la API de creación de plantillas (`/api/templates` POST) para guardar `auco_document_id`.
- [x] **Actualizar UI de Plantillas (Editar):**
    - [x] Añadir campo `auco_document_id` al formulario de edición de plantillas (`/management/templates/[id]/edit`).
    - [x] Actualizar la API de edición de plantillas (`/api/templates/[id]` PATCH) para guardar `auco_document_id`.
- [x] **Implementar Endpoint de Firma (Backend):**
    - [x] Crear el endpoint `/api/auco/start-signature` para iniciar el flujo de firma con Auco.
    - [x] Implementar la lógica para obtener datos del contrato, construir el `body` para Auco y llamar a la API de Auco (`/document/save`).
- [x] **Integrar Botón de Firma (Frontend):**
    - [x] Crear el componente `AucoSignatureButton` para iniciar el flujo de firma.
    - [x] Integrar el `AucoSignatureButton` en la página de edición de contratos (`/management/contracts/[id]/edit`).
    - [x] Integrar el `AucoSignatureButton` en la página de lista de contratos (`/management/contracts`).

## Fase 3: Pruebas

- [ ] **Probar el Flujo Completo de Verificación:** Realizar pruebas de extremo a extremo en el entorno de sandbox de Auco para validar todo el proceso.
- [ ] **Probar el Flujo Completo de Firma:** Realizar pruebas de extremo a extremo en el entorno de sandbox de Auco para validar el proceso de firma.

## Recursos

- [Documentación de Auco](https://docs.auco.ai/)
