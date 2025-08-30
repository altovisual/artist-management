# Hoja de Ruta del Proyecto: Futuras Funcionalidades

Este documento describe las posibles futuras funcionalidades para expandir el Sistema de Gestión de Artistas y convertirlo en una plataforma más completa. Están organizadas por módulos para poder desarrollarlas de forma incremental.

---

## Módulo 1: Gestión Financiera y de Ingresos

**Objetivo:** Proporcionar herramientas para el seguimiento financiero completo de la carrera de un artista.

### 1.1. Seguimiento de Ingresos y Gastos
- **Descripción:** Un libro contable para registrar todas las transacciones financieras.
- **Componentes:**
    - Formulario para añadir nuevos ingresos (con categorías: streaming, shows, merch, etc.).
    - Formulario para añadir nuevos gastos (con categorías: producción, marketing, viajes, etc.).
    - Una tabla/vista que muestre el balance total, filtrable por fecha y por artista.
- **Tecnología Clave (Supabase):** Base de Datos (tablas `transactions`, `categories`).

### 1.2. Gestión de Regalías (Royalties)
- **Descripción:** Herramienta para importar y analizar reportes de regalías de distribuidoras.
- **Componentes:**
    - Interfaz para subir archivos (CSV, TSV) de reportes de regalías.
    - Visualización de datos de regalías con gráficos (ingresos por canción, por plataforma, por país).
    - Historial de reportes subidos.
- **Tecnología Clave (Supabase):** Storage (para los archivos), Edge Functions (para procesar/parsear los archivos), Base de Datos (para guardar los datos procesados).

### 1.3. Facturación
- **Descripción:** Generador de facturas para servicios profesionales.
- **Componentes:**
    - Formulario para crear facturas con detalles (cliente, conceptos, montos).
    - Generación de la factura en formato PDF.
    - Seguimiento del estado de las facturas (pendiente, pagada, vencida).
- **Tecnología Clave (Supabase):** Base de Datos (tabla `invoices`), Edge Functions (para generar el PDF).

---

## Módulo 2: Analítica y Reportes

**Objetivo:** Centralizar y visualizar datos de rendimiento de múltiples plataformas.

### 2.1. Integración con Analíticas de Streaming
- **Descripción:** Conectar con las APIs de plataformas de música para obtener métricas de rendimiento.
- **Componentes:**
    - Dashboard de analíticas con datos de Spotify for Artists y Apple Music for Artists.
    - Gráficos de streams diarios, oyentes mensuales, playlists destacadas, demografía de oyentes.
    - Sincronización automática de datos.
- **Tecnología Clave (Supabase):** Edge Functions (para las llamadas a APIs externas), `pg_cron` (para la sincronización periódica), Base de Datos (para almacenar los datos).

### 2.2. Integración con Redes Sociales
- **Descripción:** Obtener métricas de rendimiento de las principales redes sociales.
- **Componentes:**
    - Dashboard con métricas de Instagram, TikTok, X, etc. (seguidores, engagement, alcance).
    - Gráficos de crecimiento de seguidores y tendencias de engagement.
- **Tecnología Clave (Supabase):** Edge Functions, `pg_cron`, Base de Datos.

### 2.3. Reportes Personalizados
- **Descripción:** Generar informes consolidados en formato PDF.
- **Componentes:**
    - Interfaz para seleccionar el rango de fechas y el tipo de datos a incluir en el reporte.
    - Generación de un reporte profesional en PDF que combine finanzas, streaming y redes sociales.
- **Tecnología Clave (Supabase):** Edge Functions (para generar el PDF), Base de Datos.

---

## Módulo 3: Planificación y Colaboración

**Objetivo:** Mejorar la organización y la colaboración del equipo de trabajo del artista.

### 3.1. Calendario Integral
- **Descripción:** Un calendario unificado para todas las actividades del artista.
- **Componentes:**
    - Vista de calendario (mes/semana/día) que muestre lanzamientos, conciertos, promoción, etc.
    - Formularios para añadir y editar eventos con diferentes categorías.
    - (Opcional) Sincronización bidireccional con Google Calendar/Outlook.
- **Tecnología Clave (Supabase):** Base de Datos (tabla `events`), Realtime (para actualizaciones en vivo), Edge Functions (para integraciones externas).

### 3.2. Gestor de Tareas (Kanban)
- **Descripción:** Un sistema de gestión de proyectos para organizar tareas.
- **Componentes:**
    - Tablero Kanban con columnas (To Do, In Progress, Done).
    - Crear, editar y arrastrar tareas entre columnas.
    - Asignar tareas a miembros del equipo (requiere expandir el sistema de usuarios).
    - Comentarios y adjuntos en las tareas.
- **Tecnología Clave (Supabase):** Base de Datos (tablas `tasks`, `projects`), Realtime.

---

## Módulo 4: Mejoras de Seguridad y Activos

**Objetivo:** Fortalecer la seguridad y la gestión de archivos multimedia.

### 4.1. Kit de Prensa Electrónico (EPK) Dinámico
- **Descripción:** Generar una página de EPK pública y profesional.
- **Componentes:**
    - Selector de activos (fotos, bio, música, videos) para incluir en el EPK.
    - Generación de una URL pública para el EPK.
    - Plantillas de diseño para el EPK.
- **Tecnología Clave (Supabase):** Storage, Edge Functions (para servir la página del EPK).

### 4.2. Autenticación de Dos Factores (2FA)
- **Descripción:** Añadir una capa extra de seguridad al inicio de sesión.
- **Componentes:**
    - Flujo de configuración de 2FA para el usuario (escaneo de código QR).
    - Campo para introducir el código 2FA al iniciar sesión.
- **Tecnología Clave (Supabase):** Auth (soporte nativo para 2FA).

### 4.3. Registro de Auditoría (Audit Log)
- **Descripción:** Rastrear acciones importantes dentro de la aplicación.
- **Componentes:**
    - Una vista (solo para administradores) que muestre un historial de acciones críticas.
    - Ej: "Usuario X vio la contraseña de Y", "Usuario Z eliminó el proyecto W".
- **Tecnología Clave (Supabase):** Base de Datos (tabla `audit_log`), Triggers de PostgreSQL (para automatizar el registro).
