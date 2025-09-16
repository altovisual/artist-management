
# Contexto del Agente de IA para Contratos

## 1. Objetivo

El principal objetivo de este agente de IA es asistir a los usuarios en la creación, gestión y comprensión de contratos dentro de la aplicación. El agente debe ser capaz de generar contratos completos, sugerir y modificar cláusulas, y responder a preguntas sobre los contratos existentes.

## 2. Capacidades Actuales

- **Generación de Cláusulas**: El agente puede crear cláusulas específicas para un contrato a partir de un prompt del usuario.
- **Creación de Contratos**: Puede generar un contrato completo desde cero basado en un tipo de contrato o una descripción.
- **Interfaz de Chat**: La interacción con el agente se realiza a través de un componente de chat (`AIContractChat.tsx`).

## 3. Interacción

La interacción se realiza a través de una interfaz de chat. El usuario escribe un prompt (una instrucción o pregunta) y el agente responde.

- **Componente de Frontend**: `components/ai/AIContractChat.tsx`
- **Endpoint de API**: `/api/ai/contract-assistant` (probablemente gestionado por `app/api/ai/route.ts`)

El frontend envía el `prompt` del usuario al endpoint del backend, que procesa la solicitud y devuelve la respuesta del agente de IA.

## 4. Esquema de la Base de Datos Relevante

El agente tiene acceso (o debería tenerlo) a las siguientes tablas para obtener contexto y realizar acciones:

- **`contracts`**: Almacena la información principal de cada contrato.
  - `id`: UUID, Clave primaria
  - `title`: `varchar`, Título del contrato.
  - `content`: `text`, Contenido HTML/texto del contrato.
  - `status`: `varchar`, (e.g., 'draft', 'signed', 'terminated').
  - `template_id`: UUID, FK a `templates`.
  - `created_at`, `updated_at`: Timestamps.

- **`participants`**: Las partes involucradas en los contratos.
  - `id`: UUID, Clave primaria
  - `name`: `varchar`, Nombre del participante.
  - `email`: `varchar`, Email del participante.
  - `role`: `varchar`, (e.g., 'artist', 'manager', 'label').

- **`contract_participants`**: Tabla de unión para la relación muchos-a-muchos entre `contracts` y `participants`.
  - `contract_id`: UUID, FK a `contracts`.
  - `participant_id`: UUID, FK a `participants`.

- **`templates`**: Plantillas de contratos predefinidas.
  - `id`: UUID, Clave primaria
  - `name`: `varchar`, Nombre de la plantilla.
  - `description`: `text`, Descripción de la plantilla.
  - `content`: `text`, Contenido de la plantilla.

- **`signatures`**: Firmas asociadas a los contratos.
  - `id`: UUID, Clave primaria
  - `contract_id`: UUID, FK a `contracts`.
  - `participant_id`: UUID, FK a `participants`.
  - `signature_data`: `text`, (e.g., data URL de la firma).
  - `signed_at`: Timestamp.

## 5. Flujo de Trabajo Sugerido para Mejoras

Para mejorar la utilidad del agente, se puede seguir el siguiente flujo:

1.  **Dar acceso al contexto**: Permitir que el agente lea la información de las tablas de la base de datos. Por ejemplo, para responder a la pregunta "¿Cuáles son los contratos activos de este artista?".
2.  **Permitir acciones**: Otorgar al agente la capacidad de realizar acciones, como:
    - Crear un nuevo borrador de contrato en la base de datos.
    - Modificar el contenido de un contrato existente.
    - Enviar un contrato para su firma.
3.  **Herramientas (Tools)**: Implementar "herramientas" que el agente pueda usar. Cada herramienta sería una función específica (e.g., `create_contract(title, content)`, `add_participant_to_contract(contract_id, participant_id)`).

## 6. Ideas para Futuras Mejoras

- **Análisis de Contratos**: Implementar una función que permita al agente "leer" un contrato y explicar sus cláusulas en un lenguaje sencillo.
- **Comparación de Contratos**: Comparar dos contratos o un contrato con una plantilla y resaltar las diferencias.
- **Recordatorios y Alertas**: Configurar al agente para que envíe recordatorios sobre fechas de vencimiento o renovación de contratos.
- **Integración con Calendario**: Añadir fechas clave de los contratos (inicio, fin, pagos) al calendario de la aplicación.
- **Búsqueda Semántica**: Permitir a los usuarios buscar contratos o cláusulas utilizando lenguaje natural (e.g., "encuentra todos los contratos que incluyan una cláusula de exclusividad").
