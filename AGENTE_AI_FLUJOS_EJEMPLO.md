# 🤖 MVPX AI - Flujos de Conversación con Botones

## 📋 Filosofía del Agente

**El agente SIEMPRE busca primero y muestra opciones con botones. NUNCA pide que el usuario escriba IDs o nombres.**

---

## ✨ Ejemplos de Flujos Completos

### 1. 📄 **Enviar Contrato para Firma Digital**

#### ❌ Flujo Antiguo (MAL):
```
Usuario: "Quiero enviar un contrato para firma"
AI: "¿Cuál es el ID del contrato?"
Usuario: "No sé el ID..."
AI: "Puedes verlo en la lista de contratos"
```

#### ✅ Flujo Nuevo (BIEN):
```
Usuario: "Quiero enviar un contrato para firma"

AI: 🔍 Buscando contratos disponibles...
    ✅ Búsqueda completada
    
    Encontré **3 contratos** disponibles. ¿Cuál quieres enviar para firma?
    
    📄 **Contrato de Management** - Creado: 2024-01-15
    📄 **Contrato de Producción** - Creado: 2024-01-10  
    📄 **Contrato de Distribución** - Creado: 2024-01-05
    
    [Botón: Contrato de Management]
    [Botón: Contrato de Producción]
    [Botón: Contrato de Distribución]

Usuario: *Click en "Contrato de Management"*

AI: Perfecto! Seleccionaste el **Contrato de Management**.
    
    ¿A qué email quieres enviar el contrato para firma?
    
    [Botón: artista@example.com]
    [Botón: manager@example.com]
    [Botón: Escribir otro email]

Usuario: *Click en "artista@example.com"*

AI: ✍️ Enviando para firma...
    ✅ Enviado exitosamente
    
    El contrato ha sido enviado a **artista@example.com** para firma digital con Auco.
    
    ¿Qué quieres hacer ahora?
    
    [Botón: Ver estado de firmas]
    [Botón: Enviar otro contrato]
    [Botón: Ver todos los contratos]
```

---

### 2. 🎤 **Crear Nuevo Artista**

```
Usuario: "Quiero crear un nuevo artista"

AI: ¡Perfecto! Vamos a crear un nuevo artista. 
    
    **Paso 1 de 4**: ¿Cuál es el nombre del artista?
    
    [Botón: Escribir nombre]

Usuario: "Juan Pérez"

AI: Excelente! **Juan Pérez** 
    
    **Paso 2 de 4**: ¿Qué género musical?
    
    [Botón: Pop]
    [Botón: Rock]
    [Botón: Hip Hop]
    [Botón: Reggaeton]
    [Botón: Otro género]

Usuario: *Click en "Pop"*

AI: **Paso 3 de 4**: ¿Cuál es el email del artista?
    
    [Botón: Escribir email]

Usuario: "juan@example.com"

AI: **Paso 4 de 4**: ¿Quieres agregar una biografía?
    
    [Botón: Sí, escribir biografía]
    [Botón: No, crear sin biografía]

Usuario: *Click en "No, crear sin biografía"*

AI: ➕ Creando artista...
    ✅ Creado exitosamente
    
    ¡Artista **Juan Pérez** creado con éxito!
    
    📊 **Resumen:**
    - Nombre: Juan Pérez
    - Género: Pop
    - Email: juan@example.com
    
    ¿Qué quieres hacer ahora?
    
    [Botón: Crear contrato para Juan]
    [Botón: Ver perfil completo]
    [Botón: Crear otro artista]
    [Botón: Ver todos los artistas]
```

---

### 3. 🔍 **Buscar y Actualizar Artista**

```
Usuario: "Busca al artista Juan"

AI: 🔍 Buscando artistas...
    ✅ Búsqueda completada
    
    Encontré **2 artistas** con ese nombre:
    
    🎤 **Juan Pérez** - Pop (juan@example.com)
    🎤 **Juan García** - Rock (juangarcia@example.com)
    
    ¿Cuál quieres ver?
    
    [Botón: Juan Pérez - Pop]
    [Botón: Juan García - Rock]
    [Botón: Buscar otro artista]

Usuario: *Click en "Juan Pérez - Pop"*

AI: 📊 **Perfil de Juan Pérez**
    
    - **Género**: Pop
    - **Email**: juan@example.com
    - **Proyectos**: 5
    - **Contratos**: 2
    
    ¿Qué quieres hacer?
    
    [Botón: Editar información]
    [Botón: Ver contratos]
    [Botón: Ver analytics]
    [Botón: Crear nuevo contrato]

Usuario: *Click en "Editar información"*

AI: ¿Qué quieres actualizar de **Juan Pérez**?
    
    [Botón: Cambiar nombre]
    [Botón: Cambiar género]
    [Botón: Cambiar email]
    [Botón: Actualizar biografía]
    [Botón: Cancelar]

Usuario: *Click en "Cambiar género"*

AI: ¿A qué género quieres cambiar?
    
    [Botón: Pop]
    [Botón: Rock]
    [Botón: Hip Hop]
    [Botón: Reggaeton]
    [Botón: Otro]

Usuario: *Click en "Rock"*

AI: 🔄 Actualizando información...
    ✅ Actualizado correctamente
    
    El género de **Juan Pérez** ha sido actualizado a **Rock**.
    
    [Botón: Ver perfil actualizado]
    [Botón: Hacer otro cambio]
    [Botón: Volver a lista de artistas]
```

---

### 4. 📊 **Ver Analytics**

```
Usuario: "Muéstrame las estadísticas"

AI: 🔍 Obteniendo analytics...
    ✅ Lista cargada
    
    📊 **Analytics del Sistema**
    
    💰 **Financiero:**
    - Total Revenue: $50,000
    - Total Expenses: $15,000
    - Net Profit: $35,000
    
    🎤 **Artistas:**
    - Active Artists: 15
    - Total Projects: 32
    - Avg Revenue/Artist: $3,333
    
    📄 **Contratos:**
    - Total Contracts: 28
    - Pending Signatures: 5
    - Completed: 23
    
    ¿Qué quieres ver en detalle?
    
    [Botón: Ver top artistas]
    [Botón: Ver transacciones recientes]
    [Botón: Ver contratos pendientes]
    [Botón: Exportar reporte]
```

---

### 5. 📄 **Crear Contrato Completo**

```
Usuario: "Quiero crear un contrato"

AI: 🔍 Buscando plantillas...
    ✅ Lista cargada
    
    ¿Qué tipo de contrato necesitas?
    
    📄 **Contrato de Management**
    Gestión y representación del artista
    
    📄 **Contrato de Producción**
    Producción de obras musicales
    
    📄 **Contrato de Distribución**
    Distribución digital y física
    
    [Botón: Management]
    [Botón: Producción]
    [Botón: Distribución]

Usuario: *Click en "Management"*

AI: 🔍 Buscando participantes...
    ✅ Lista cargada
    
    Perfecto! Contrato de **Management** seleccionado.
    
    ¿Para quién es este contrato?
    
    🎤 **Juan Pérez** - Artista Pop
    🎤 **María López** - Artista Rock
    👥 **Pedro Gómez** - Manager
    
    [Botón: Juan Pérez]
    [Botón: María López]
    [Botón: Pedro Gómez]
    [Botón: Crear nuevo participante]

Usuario: *Click en "Juan Pérez"*

AI: ¿Quieres vincular este contrato a alguna obra específica?
    
    [Botón: Sí, seleccionar obra]
    [Botón: No, crear sin obra]

Usuario: *Click en "No, crear sin obra"*

AI: ➕ Creando contrato...
    ✅ Creado exitosamente
    
    ¡Contrato de **Management** creado para **Juan Pérez**!
    
    📄 **Detalles:**
    - Tipo: Management
    - Participante: Juan Pérez
    - Estado: Borrador
    - Creado: Hoy
    
    ¿Qué quieres hacer ahora?
    
    [Botón: Enviar para firma]
    [Botón: Ver contrato]
    [Botón: Editar contrato]
    [Botón: Crear otro contrato]
```

---

### 6. 👥 **Gestión de Participantes**

```
Usuario: "Lista todos los participantes"

AI: 🔍 Obteniendo lista...
    ✅ Lista cargada
    
    Encontré **8 participantes** en el sistema:
    
    🎤 **Artistas (3):**
    - Juan Pérez - Pop
    - María López - Rock
    - Carlos Ruiz - Hip Hop
    
    🎵 **Productores (2):**
    - Pedro Gómez
    - Ana Martínez
    
    🎸 **Colaboradores (3):**
    - Luis Torres - Guitarrista
    - Sofia Díaz - Vocalista
    - Diego Ramírez - DJ
    
    ¿Qué quieres hacer?
    
    [Botón: Ver detalles de Juan Pérez]
    [Botón: Ver detalles de Pedro Gómez]
    [Botón: Crear nuevo participante]
    [Botón: Buscar participante específico]
```

---

## 🎯 Principios Clave

### ✅ SIEMPRE:
1. **Buscar primero** antes de pedir información
2. **Mostrar opciones** con botones claros
3. **Guiar el flujo** anticipando necesidades
4. **Confirmar acciones** con resúmenes visuales
5. **Ofrecer siguiente paso** con botones de acción

### ❌ NUNCA:
1. Pedir IDs o códigos al usuario
2. Hacer preguntas abiertas sin opciones
3. Dejar al usuario sin siguiente paso claro
4. Asumir información sin buscar

---

## 💡 Ventajas del Sistema

### Para el Usuario:
- ✅ **Más rápido**: Click en lugar de escribir
- ✅ **Sin errores**: No hay typos en IDs
- ✅ **Guiado**: Siempre sabe qué hacer después
- ✅ **Visual**: Ve todas las opciones disponibles

### Para el Sistema:
- ✅ **Menos errores**: Datos validados automáticamente
- ✅ **Mejor UX**: Flujos más intuitivos
- ✅ **Más eficiente**: Menos idas y vueltas
- ✅ **Escalable**: Fácil agregar nuevas opciones

---

## 🚀 Resultado Final

**Cada interacción es una solución completa con botones, no una pregunta abierta.**

El usuario puede completar tareas complejas con solo hacer clicks, sin necesidad de escribir IDs, nombres o datos que el sistema puede buscar automáticamente.
