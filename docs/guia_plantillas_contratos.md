Para que puedas crear plantillas de contratos de forma efectiva, a continuación se detalla la estructura que debe tener el HTML y la lista completa de placeholders que puedes usar.

### 1. Estructura del HTML y Estilos

*   **HTML Básico:** Puedes usar cualquier etiqueta HTML estándar (`<h1>`, `<p>`, `<b>`, `<ul>`, `<li>`, etc.) para estructurar tu contrato.
*   **Estilos:** La forma más segura de aplicar estilos es usando **estilos en línea (inline styles)** directamente en las etiquetas. Por ejemplo: `<p style="color: blue; font-size: 12px;">Texto del párrafo.</p>`. Aunque el sistema intenta aplicar los estilos generales de la página, los estilos en línea garantizan que el PDF se vea exactamente como lo deseas, sin depender de hojas de estilo externas.

### 2. Formato de los Placeholders

Todos los datos dinámicos se insertan usando placeholders con formato de doble llave: `{{nombre_del_placeholder}}`.

### 3. Lista Completa de Placeholders Disponibles

Aquí tienes la lista de todos los placeholders que el sistema reemplazará, agrupados por categoría:

---

#### **A. Datos Generales**
Estos se calculan al momento de generar el contrato.

| Placeholder | Descripción |
| :--- | :--- |
| `{{current_date}}` | La fecha actual (ej. "11/9/2025"). |
| `{{current_year}}` | El año actual (ej. "2025"). |

---

#### **B. Datos del Contrato**
Información específica del registro del contrato.

| Placeholder | Descripción |
| :--- | :--- |
| `{{contract.status}}` | Estado actual del contrato (ej. "Borrador", "Firmado"). |
| `{{contract.internal_reference}}` | Referencia interna del contrato. |
| `{{contract.signing_location}}` | Lugar donde se firma el contrato. |
| `{{contract.additional_notes}}` | Notas adicionales sobre el contrato. |
| `{{contract.publisher}}` | El editor principal. |
| `{{contract.publisher_percentage}}`| El porcentaje del editor. |
| `{{contract.co_publishers}}` | Los co-editores. |
| `{{contract.publisher_admin}}` | El administrador de la editorial. |
| `{{contract.created_at}}` | Fecha de creación del registro del contrato. |

---

#### **C. Datos de la Obra Musical**
Información de la obra asociada al contrato.

| Placeholder | Descripción |
| :--- | :--- |
| `{{work.name}}` | Título de la obra. |
| `{{work.alternative_title}}` | Título alternativo de la obra. |
| `{{work.iswc}}` | Código ISWC de la obra. |
| `{{work.type}}` | Tipo de obra (ej. "Canción", "Instrumental"). |
| `{{work.status}}` | Estado de la obra (ej. "Registrada", "Inédita"). |
| `{{work.release_date}}` | Fecha de lanzamiento de la obra. |
| `{{work.isrc}}` | Código ISRC (si aplica). |
| `{{work.upc}}` | Código UPC (si aplica). |

---

#### **D. Bloques de Participantes (¡Muy importantes!)**
Estos son placeholders especiales que muestran información de todos los participantes.

| Placeholder | Descripción |
| :--- | :--- |
| `{{participants.table}}` | **(Recomendado)** Se reemplazará por una tabla HTML completa con la lista de todos los participantes, sus nombres, roles y porcentajes. Es la forma más fácil de listar a todos. |
| `{{participants.total_percentage}}` | Muestra la suma total de los porcentajes de todos los participantes. |

---

#### **E. Datos de Participantes Individuales (Avanzado)**

Si no quieres usar la tabla automática (`{{participants.table}}`) y necesitas un control total, puedes acceder a los datos de cada participante individualmente. El sistema itera sobre todos los participantes y reemplazará cualquier propiedad que exista en la base de datos.

El formato es `{{participant[INDEX].PROPIEDAD}}`, donde `INDEX` es la posición del participante (empezando en 0).

*   **Ejemplo:** Para obtener el nombre del primer participante: `{{participant[0].name}}`
*   **Ejemplo:** Para obtener el rol del segundo participante: `{{participant[1].role}}`

Las propiedades más comunes que puedes usar por cada participante son:
*   `name`
*   `artistic_name`
*   `role`
*   `percentage`
*   (Cualquier otro campo que tengas en la tabla de `participants`)

---

### Indicaciones Finales

1.  **Fallback:** Si un placeholder no encuentra un dato correspondiente (por ejemplo, la obra no tiene `isrc`), el sistema lo reemplazará con **"N/A"** para evitar que queden llaves vacías en el documento final.
2.  **Prueba tus plantillas:** La mejor manera de asegurar que una plantilla funciona es crearla, asociarla a un contrato con datos de prueba y usar la función de "Generar Contrato" para previsualizar el resultado.

Con esta guía, puedes construir cualquier tipo de plantilla HTML que necesites.
