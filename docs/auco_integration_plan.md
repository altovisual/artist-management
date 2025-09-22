# Plan de Integración de Auco

Este documento detalla el plan de acción para integrar los servicios de verificación de identidad y firma de Auco en la aplicación de gestión de artistas.

## Fase 1: Verificación de Identidad

- [x] **Crear una Cuenta en Auco:** Registrarse en la plataforma de Auco para obtener acceso al panel de control y las claves de API.
- [x] **Obtener Claves de API:** Localizar las claves de API para los entornos de desarrollo y producción. Almacenarlas de forma segura.
- [x] **Definir el Punto de Integración:** El punto de partida será el formulario de creación de un nuevo participante (`/management/participants/new`).
- [x] **Diseñar el Flujo de Verificación:**
    - [x] **Frontend:** Añadir un botón "Verificar Identidad" que inicie el flujo del SDK de Auco.
    - [x] **Backend:** Crear un endpoint de webhook para recibir notificaciones del estado de la verificación.
- [x] **Configurar Variables de Entorno:** Añadir las claves de API de Auco al archivo `.env.local`.
- [x] **Modificar la Base de Datos:**
    - [x] Añadir la columna `auco_verification_id` (de tipo `text`) a la tabla `participants`.
    - [x] Añadir la columna `verification_status` (de tipo `text`, con valores como `pending`, `verified`, `rejected`) a la tabla `participants`.
- [x] **Crear el Webhook:** Desarrollar un endpoint en `/api/webhooks/auco` para gestionar las notificaciones de Auco y actualizar la base de datos. La lógica base, incluyendo la verificación de la firma del webhook, está implementada.
- [x] **Instalar el SDK de Auco:** Añadir el SDK de Auco como dependencia del proyecto (`auco-sdk-integration`).
- [x] **Integrar el Flujo de Verificación (Frontend):** Modificar la página de "Crear Participante" para incluir el botón y la lógica para iniciar el proceso de Auco.
- [x] **Actualizar la Interfaz de Usuario (Verificación):**
    - [x] Deshabilitar el botón de "Guardar" hasta que la verificación sea exitosa.
    - [x] Mostrar el estado de la verificación en la lista de participantes.

## Fase 2: Flujo de Firma de Documentos

- [x] **Modificar la Base de Datos (Plantillas):** No se modificó la tabla de plantillas, ya que se optó por un flujo de generación de PDF dinámico.
- [x] **Implementar Endpoint de Firma (Backend):**
    - [x] Crear el endpoint `/api/auco/start-signature` para iniciar el flujo de firma.
    - [x] Implementar la lógica para obtener datos del contrato, renderizar un HTML, generar un PDF sobre la marcha y llamar a la API de Auco (`/document/upload`).
- [x] **Integrar Botón de Firma (Frontend):**
    - [x] Crear el componente `AucoSignatureButton` para iniciar el flujo de firma.
    - [x] Integrar el `AucoSignatureButton` en la página de edición y en la lista de contratos.
- [x] **Depuración de API:**
    - [x] Se implementó un helper `aucoFetch` robusto para gestionar la autenticación (claves `prk_` y `puk_`) y los endpoints de Auco.
    - [x] Se corrigieron errores de `UNAUTHORIZED` y `USER_NOTFOUND` mediante el uso de variables de entorno y un owner email correcto.
    - [ ] Se investigó un error `FILE_NOT_VALID`, realizando un ajuste en la librería de generación de PDF (`puppeteer`). El resultado de este ajuste está pendiente de validación.

## Fase 3: Pruebas y Tareas Pendientes

- [ ] **Probar el Flujo Completo de Firma:** Validar que el último ajuste en `lib/pdf.ts` haya solucionado el error `FILE_NOT_VALID`.
- [ ] **Probar el Flujo Completo de Verificación:** Realizar pruebas de extremo a extremo en el entorno de sandbox de Auco para validar el proceso de verificación de identidad.
- [ ] **Configurar y Probar Webhook de Verificación:** Para que la verificación se complete, el webhook de Auco debe apuntar a una URL pública de la aplicación (`/api/webhooks/auco`). Esto requiere un despliegue o el uso de un túnel (como ngrok) para pruebas locales.
- [ ] **Implementar Webhook para Firma de Contratos:** Actualmente, la aplicación inicia el proceso de firma, pero no recibe notificaciones sobre su estado (firmado, rechazado). Se necesita crear un webhook similar al de verificación para actualizar el estado de los contratos en la base de datos.

## Fase 4: Despliegue y Variables de Entorno

Para que la integración funcione en desarrollo y producción, las siguientes variables de entorno deben estar configuradas:

- `AUCO_BASE_URL`: La URL base de la API de Auco (ej. `https://dev.auco.ai/v1.5/ext` para desarrollo).
- `AUCO_PUK`: La clave pública de Auco (`puk_...`).
- `AUCO_PRK`: La clave privada de Auco (`prk_...`).
- `AUCO_OWNER_EMAIL`: El correo electrónico del usuario propietario de la cuenta en Auco.
- `AUCO_WEBHOOK_SECRET`: El secreto para verificar la autenticidad de los webhooks recibidos desde Auco.

## Recursos

- [Documentación de Auco](https://docs.auco.ai/)