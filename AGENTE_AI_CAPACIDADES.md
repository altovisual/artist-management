# 🤖 MVPX AI - Capacidades del Agente Inteligente

## 📋 Resumen

MVPX AI es un asistente inteligente especializado en la gestión de artistas musicales y contratos. Utiliza GPT-4 para procesar lenguaje natural y ejecutar acciones en el sistema.

---

## ✨ Capacidades Principales

### 1. 🎤 **Gestión Completa de Artistas**

#### Crear Artista
- **Comando**: "Quiero crear un nuevo artista"
- **Información requerida**: Nombre, género musical, email, biografía
- **API**: `POST /api/artists`

#### Buscar Artista
- **Comando**: "Busca al artista [nombre]"
- **Retorna**: Información completa del artista
- **API**: `GET /api/artists?search=[query]`

#### Listar Artistas
- **Comando**: "Muéstrame todos los artistas"
- **Retorna**: Lista completa de artistas con conteo
- **API**: `GET /api/artists`

#### Actualizar Artista
- **Comando**: "Quiero actualizar la información de [artista]"
- **Puede modificar**: Nombre, género, email, biografía, etc.
- **API**: `PATCH /api/artists/[id]`

#### Eliminar Artista
- **Comando**: "Quiero eliminar al artista [nombre]"
- **Confirmación**: Requiere confirmación del usuario
- **API**: `DELETE /api/artists/[id]`

---

### 2. 👥 **Gestión de Participantes y Colaboradores**

#### Crear Participante
- **Comando**: "Quiero crear un nuevo participante"
- **Tipos**: Productor, colaborador, ingeniero, etc.
- **Información**: Nombre completo, email, tipo
- **API**: `POST /api/participants`

#### Buscar Participante
- **Comando**: "Busca al participante [nombre]"
- **Búsqueda**: Por nombre en la base de datos
- **API**: `GET /api/participants?search=[name]`

#### Listar Participantes
- **Comando**: "Lista todos los participantes"
- **Retorna**: Todos los participantes con roles
- **API**: `GET /api/participants`

---

### 3. 📄 **Creación y Gestión de Contratos**

#### Crear Contrato
- **Comando**: "Quiero crear un contrato"
- **Proceso**:
  1. Seleccionar plantilla
  2. Asignar participante
  3. Vincular obra (opcional)
- **API**: `POST /api/contracts`

#### Buscar Contrato
- **Comando**: "Busca el contrato [ID]"
- **Retorna**: Detalles completos del contrato
- **API**: `GET /api/contracts/[id]`

#### Listar Contratos
- **Comando**: "Lista todos mis contratos"
- **Retorna**: Todos los contratos con estado
- **API**: `GET /api/contracts`

#### Listar Plantillas
- **Comando**: "Muéstrame todas las plantillas de contrato"
- **Retorna**: Plantillas disponibles
- **API**: `GET /api/contract-templates`

---

### 4. ✍️ **Envío de Documentos para Firma Digital**

#### Enviar para Firma
- **Comando**: "Quiero enviar un contrato para firma"
- **Proceso**:
  1. Seleccionar contrato
  2. Ingresar email del firmante
  3. Envío automático a Auco
- **API**: `POST /api/signatures/send`

#### Ver Estado de Firmas
- **Comando**: "Muéstrame todas las firmas"
- **Retorna**: Estado de firmas (pendiente, completado, rechazado)
- **API**: `GET /api/signatures`

---

### 5. 📊 **Análisis de Datos y Estadísticas**

#### Ver Analytics General
- **Comando**: "Muéstrame las estadísticas del sistema"
- **Retorna**:
  - Total de ingresos
  - Artistas activos
  - Proyectos totales
  - Balance neto
- **API**: `GET /api/analytics?type=general`

#### Analytics de Artista
- **Comando**: "Muéstrame las estadísticas de [artista]"
- **Retorna**:
  - Ingresos del artista
  - Proyectos completados
  - Rendimiento
- **API**: `GET /api/analytics?type=artist&id=[id]`

---

### 6. 🔍 **Búsqueda Inteligente**

#### Búsqueda Global
- **Comando**: "Busca [término]"
- **Busca en**: Artistas, participantes, contratos, obras
- **Retorna**: Resultados relevantes de todas las categorías

#### Búsqueda Avanzada
- **Comando**: "Quiero hacer una búsqueda avanzada"
- **Permite**: Filtros específicos por categoría
- **Retorna**: Resultados filtrados y ordenados

---

## 🎯 Acciones Rápidas Disponibles

El agente incluye un panel de **Acciones Rápidas** con los comandos más usados:

1. **Crear Artista** - Agregar nuevo artista al sistema
2. **Crear Contrato** - Generar contrato desde plantilla
3. **Ver Analytics** - Estadísticas del sistema
4. **Búsqueda Global** - Buscar en toda la aplicación

---

## 💡 Características Especiales

### Indicadores Visuales
El agente muestra indicadores en tiempo real:
- 🔵 **Pensando** - Procesando solicitud
- 🔍 **Buscando** - Consultando base de datos
- ➕ **Creando** - Creando nuevo registro
- 🔄 **Actualizando** - Modificando información
- 🗑️ **Eliminando** - Eliminando registro
- ✅ **Éxito** - Operación completada
- ❌ **Error** - Error en la operación

### Confirmaciones Inteligentes
- **Acciones destructivas**: Requieren confirmación explícita
- **Datos faltantes**: Solicita información adicional
- **Validaciones**: Verifica datos antes de ejecutar

### Sugerencias Contextuales
- Después de cada acción, sugiere pasos siguientes
- Botones de acción rápida relevantes
- Flujos guiados para tareas complejas

---

## 🚀 Ejemplos de Uso

### Ejemplo 1: Crear un Artista Completo
```
Usuario: "Quiero crear un nuevo artista"
AI: "¡Perfecto! Necesito algunos datos..."
Usuario: "Nombre: Juan Pérez, Género: Pop, Email: juan@example.com"
AI: ✅ "Artista creado exitosamente. ¿Quieres crear un contrato para él?"
```

### Ejemplo 2: Enviar Contrato para Firma
```
Usuario: "Quiero enviar un contrato para firma"
AI: "¿Cuál es el ID del contrato?"
Usuario: "El contrato 123"
AI: "¿Cuál es el email del firmante?"
Usuario: "artista@example.com"
AI: ✅ "Documento enviado para firma digital con Auco"
```

### Ejemplo 3: Ver Estadísticas
```
Usuario: "Muéstrame las estadísticas del sistema"
AI: 📊 "Aquí están tus analytics:
- Total Revenue: $50,000
- Active Artists: 15
- Total Projects: 32
- Net Profit: $35,000"
```

---

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas
```env
OPENAI_API_KEY=sk-...
```

### APIs Integradas
- OpenAI GPT-4 Turbo
- Supabase (Base de datos)
- Auco (Firmas digitales)

### Endpoints del Agente
- **Chat**: `POST /api/ai/contract-assistant`
- **Funciones**: 18 funciones disponibles
- **Modelo**: `gpt-4-turbo-preview`

---

## 📱 Interfaz de Usuario

### Componente Principal
- **Ubicación**: `components/ai/AIContractChat.tsx`
- **Botón flotante**: Esquina inferior derecha
- **Modal**: Tamaño 90vh x 90vw (responsive)

### Características UI
- ✅ Panel de acciones rápidas siempre visible
- ✅ Diálogo de todas las herramientas (6 categorías)
- ✅ Indicadores visuales estilo OpenAI
- ✅ Sugerencias contextuales
- ✅ Loading states elegantes
- ✅ Dark mode compatible

---

## 🎨 Sistema de Diseño

### Colores de Indicadores
- **Azul**: Búsqueda, pensando
- **Verde**: Crear, éxito
- **Naranja**: Actualizar
- **Rojo**: Eliminar, error
- **Gris**: Neutral

### Iconos Minimalistas
- SVG planos sin relleno
- Animaciones sutiles
- Consistencia visual

---

## 🔐 Seguridad

### Validaciones
- ✅ Autenticación de usuario requerida
- ✅ Validación de permisos por rol
- ✅ Confirmación de acciones destructivas
- ✅ Sanitización de inputs

### RLS (Row Level Security)
- Usuarios solo ven sus propios datos
- Admins tienen acceso completo
- Políticas de Supabase aplicadas

---

## 📚 Recursos Adicionales

- **Guía de Implementación**: `AGENTE_AI_GUIA.md`
- **System Prompt**: `app/api/ai/contract-assistant/system-prompt.ts`
- **Route Handler**: `app/api/ai/contract-assistant/route.ts`
- **Componente UI**: `components/ai/AIContractChat.tsx`

---

## 🎯 Próximas Mejoras

- [ ] Soporte para múltiples idiomas
- [ ] Análisis de documentos con OCR
- [ ] Generación de reportes PDF
- [ ] Integración con calendario
- [ ] Notificaciones push
- [ ] Voice commands
- [ ] Análisis predictivo con ML

---

**¡El agente está listo para usar!** 🚀

Simplemente abre el chat y comienza a interactuar con MVPX AI.
