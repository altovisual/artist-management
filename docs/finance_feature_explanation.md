## Funcionalidad: Seguimiento de Ingresos y Gastos

### Lógica Central

El objetivo principal de esta funcionalidad es llevar un **registro detallado de todos los movimientos de dinero** (ingresos y gastos) relacionados con la carrera de un artista.

*   **Transacciones (`transactions`):** Son los registros individuales de cada entrada o salida de dinero. Cada transacción incluye:
    *   `id`: Identificador único.
    *   `created_at`: Fecha de creación del registro.
    *   `artist_id`: ID del artista al que pertenece la transacción.
    *   `user_id`: ID del usuario que registró la transacción (para control de acceso).
    *   `category_id`: ID de la categoría a la que pertenece (ej. Streaming, Marketing).
    *   `amount`: Cantidad de dinero.
    *   `description`: Descripción opcional de la transacción.
    *   `transaction_date`: Fecha en que ocurrió la transacción.
    *   `type`: Tipo de transacción (`income` para ingresos o `expense` para gastos).

*   **Categorías (`transaction_categories`):** Son etiquetas predefinidas o personalizadas que clasifican las transacciones. Cada categoría incluye:
    *   `id`: Identificador único.
    *   `name`: Nombre de la categoría (ej. "Streaming", "Conciertos", "Producción").
    *   `type`: Tipo de la categoría (`income` o `expense`).
    *   `user_id`: ID del usuario que creó la categoría (para control de acceso y personalización).

*   **Relación:** Cada `transaction` está vinculada a un `artist` y a una `transaction_category`.

*   **Cálculos Automáticos:** El sistema suma automáticamente los ingresos totales, los gastos totales y calcula el balance neto (Ingresos Totales - Gastos Totales) para el período y filtros seleccionados.

### Caso de Uso para el Artista

**Objetivo:** Entender su situación financiera, saber de dónde viene el dinero y a dónde va, y controlar sus gastos para una gestión más eficiente de su carrera.

**¿Cómo lo usaría?**
1.  **Registrar Ingresos:** Después de recibir un pago (por streaming, shows, venta de merchandising, licencias de sincronización, etc.), el artista (o su asistente) lo registraría como un "Ingreso", seleccionando el artista, la categoría (`Streaming`, `Concierto`, `Merch`), el monto y la fecha.
2.  **Registrar Gastos:** Cada vez que pague por algo relacionado con su carrera (alquiler de estudio, publicidad, viajes, equipo, honorarios de gestión), lo registraría como un "Gasto", con su categoría correspondiente.
3.  **Ver Resumen Rápido:** En la página principal de Finanzas, vería de un vistazo su "Total de Ingresos", "Total de Gastos" y su "Balance Neto" actual.
4.  **Filtrar y Analizar:** Podría filtrar las transacciones por fecha, por tipo (solo ingresos o solo gastos) o por categoría. Esto le permitiría responder preguntas como: "¿Cuánto gané por streaming el último trimestre?" o "¿Cuánto gasté en marketing este año?".
5.  **Gestionar Categorías:** Podría crear sus propias categorías personalizadas si las predefinidas no son suficientes (ej. "Clases de Canto", "Diseño de Portada").

**Beneficios para el Artista:**
*   **Transparencia Financiera:** Saber exactamente cómo se mueve su dinero.
*   **Mejor Toma de Decisiones:** Identificar qué fuentes de ingreso son más rentables o dónde puede reducir gastos.
*   **Facilitar Impuestos:** Tener un registro organizado para la declaración de impuestos.

### Caso de Uso para el Administrador (Manager/Sello Discográfico)

**Objetivo:** Supervisar la salud financiera de múltiples artistas, asegurar una contabilidad precisa y tomar decisiones estratégicas para toda la cartera de artistas.

**¿Cómo lo usaría?**
1.  **Gestión Centralizada:** Podría añadir y editar transacciones para *cualquier* artista que gestione, no solo para uno mismo.
2.  **Visión General:** Vería los resúmenes financieros de todos los artistas combinados, o filtrar por un artista específico para analizar su rendimiento individual.
3.  **Análisis Comparativo:** Filtrar transacciones por categoría o tipo a través de varios artistas para identificar tendencias o comparar rendimientos (ej. "¿Qué artista genera más ingresos por conciertos?" o "¿Cuánto se está invirtiendo en marketing para el roster completo?").
4.  **Gestión de Categorías:** Podría definir categorías estándar para todos los artistas o crear categorías específicas para necesidades particulares.
5.  **Auditoría:** Revisar el historial de transacciones para asegurar la precisión y detectar posibles errores.

**Beneficios para el Administrador:**
*   **Control Total:** Visibilidad completa sobre las finanzas de todos los artistas.
*   **Reportes Simplificados:** Generar informes financieros para los artistas o para la contabilidad del sello.
*   **Planificación Estratégica:** Tomar decisiones informadas sobre inversiones, presupuestos y dirección de carrera para cada artista y para la empresa en general.

### Impacto de la Seguridad (RLS - Row Level Security)

*   **Artista:** Solo puede ver y gestionar las transacciones y categorías que están vinculadas a los artistas que él posee. Esto se asegura mediante políticas de RLS que filtran los datos basándose en el `user_id` del usuario autenticado y la relación con el `artist_id`.
*   **Administrador:** Gracias a la función `public.is_admin()` y las políticas de RLS, un administrador tiene acceso completo (ver, crear, editar, eliminar) a todas las transacciones y categorías de *todos* los artistas en la plataforma. Esto es crucial para su rol de supervisión y gestión centralizada.
