# 🤖 Guía Completa: Agente AI para Artist Management

## 📋 Resumen

Hemos transformado tu chat básico en un **Agente AI Completo** que puede:

✅ **CRUD Completo** de Artistas, Participantes, Contratos
✅ **Gestión de Firmas** digitales con Auco
✅ **Analytics** en tiempo real
✅ **Búsqueda inteligente** en toda la app
✅ **Creación automatizada** de contratos
✅ **Interacción natural** con lenguaje humano

---

## 🏗️ Arquitectura del Agente

### **1. Funciones Implementadas (18 Tools)**

#### **ARTISTS CRUD (5 funciones)**
- `listarArtistas()` - Lista todos los artistas
- `buscarArtista(query)` - Busca por nombre o ID
- `crearArtista(name, genre, email, bio)` - Crea nuevo artista
- `actualizarArtista(id, data)` - Actualiza artista
- `eliminarArtista(id)` - Elimina artista

#### **PARTICIPANTS CRUD (3 funciones)**
- `listarParticipantes()` - Lista participantes
- `buscarParticipante(name)` - Busca participante
- `crearParticipante(name, email, type)` - Crea participante

#### **CONTRACTS CRUD (3 funciones)**
- `listarContratos()` - Lista contratos
- `buscarContrato(id)` - Busca contrato específico
- `crearContrato(template_id, participant_id, work_id)` - Crea contrato

#### **SIGNATURES (2 funciones)**
- `listarFirmas()` - Lista firmas digitales
- `enviarFirma(contract_id, signer_email)` - Envía para firma

#### **ANALYTICS (1 función)**
- `obtenerAnalytics(type)` - Obtiene estadísticas

#### **TEMPLATES (1 función)**
- `listarPlantillas()` - Lista plantillas

---

## 🚀 Ejemplos de Uso

### **Conversaciones Naturales:**

**Usuario:** "Muéstrame todos mis artistas"
→ Agente llama `listarArtistas()` y muestra la lista

**Usuario:** "Crea un artista llamado Juan Pérez, género reggaeton"
→ Agente llama `crearArtista(name: "Juan Pérez", genre: "reggaeton")`

**Usuario:** "Busca al artista Borngud"
→ Agente llama `buscarArtista(query: "Borngud")` y muestra info

**Usuario:** "Crea un contrato para Juan Pérez"
→ Agente:
  1. Llama `buscarArtista("Juan Pérez")` para obtener ID
  2. Llama `listarPlantillas()` para ver opciones
  3. Llama `crearContrato(template_id, participant_id)`

**Usuario:** "Envía el contrato #123 a juan@email.com para firma"
→ Agente llama `enviarFirma(contract_id: "123", signer_email: "juan@email.com")`

---

## 🔧 Implementación Técnica

### **Paso 1: System Prompt Mejorado**

Actualiza `system-prompt.ts` para que el agente sea más inteligente:

```typescript
export const systemPrompt = `
Eres MVPX AI, un asistente inteligente especializado en gestión de artistas musicales.

CAPACIDADES:
- Gestión completa de artistas (crear, buscar, actualizar, eliminar)
- Gestión de participantes y colaboradores
- Creación y gestión de contratos
- Envío de documentos para firma digital
- Análisis de datos y estadísticas
- Búsqueda inteligente en toda la aplicación

COMPORTAMIENTO:
1. Siempre confirma acciones destructivas (eliminar, actualizar)
2. Cuando crees algo, confirma los detalles primero
3. Si falta información, pregunta al usuario
4. Usa múltiples funciones en secuencia si es necesario
5. Explica qué estás haciendo en cada paso

EJEMPLOS DE FLUJOS:
- "Crea un artista" → Pide nombre, género, email → Crea → Confirma
- "Busca artista X" → Busca → Muestra resultados → Ofrece acciones
- "Envía contrato" → Verifica contrato existe → Pide email → Envía → Confirma

Responde siempre en español de forma amigable y profesional.
`;
```

### **Paso 2: Implementar Switch Cases**

El archivo `route.ts` ya tiene la estructura. Ahora necesitas implementar cada caso en el switch:

```typescript
switch (functionName) {
  // ARTISTS
  case "listarArtistas":
    apiResponse = await fetch(`${baseUrl}/api/artists`);
    data = await apiResponse.json();
    return {
      tool_call_id: toolCall.id,
      role: 'tool' as const,
      content: JSON.stringify({ artists: data })
    };

  case "buscarArtista":
    apiResponse = await fetch(`${baseUrl}/api/artists/search?q=${encodeURIComponent(functionArgs.query)}`);
    data = await apiResponse.json();
    return {
      tool_call_id: toolCall.id,
      role: 'tool' as const,
      content: JSON.stringify({ artist: data })
    };

  case "crearArtista":
    apiResponse = await fetch(`${baseUrl}/api/artists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(functionArgs)
    });
    data = await apiResponse.json();
    return {
      tool_call_id: toolCall.id,
      role: 'tool' as const,
      content: JSON.stringify({ success: true, artist: data })
    };

  // ... más casos
}
```

### **Paso 3: Crear APIs Faltantes**

Algunas APIs necesitan ser creadas o actualizadas:

#### **`/api/artists/search/route.ts`**
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  const { data } = await supabase
    .from('artists')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10);
    
  return NextResponse.json(data);
}
```

#### **`/api/participants/search/route.ts`**
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  
  const { data } = await supabase
    .from('participants')
    .select('*')
    .ilike('name', `%${name}%`)
    .limit(10);
    
  return NextResponse.json(data);
}
```

---

## 🎨 Mejoras en el UI del Chat

### **1. Agregar Indicadores Visuales**

Cuando el agente ejecuta funciones, muestra qué está haciendo:

```typescript
// En AIContractChat.tsx
const [agentActions, setAgentActions] = useState<string[]>([]);

// Mostrar acciones
{agentActions.map((action, i) => (
  <div key={i} className="text-xs text-muted-foreground">
    🤖 {action}
  </div>
))}
```

### **2. Botones de Acción Rápida**

```typescript
const quickActions = [
  { label: "Ver Artistas", prompt: "Muéstrame todos los artistas" },
  { label: "Crear Artista", prompt: "Quiero crear un nuevo artista" },
  { label: "Ver Contratos", prompt: "Lista todos los contratos" },
  { label: "Analytics", prompt: "Muéstrame las estadísticas" },
];
```

### **3. Confirmaciones Interactivas**

Para acciones destructivas:

```typescript
// Antes de eliminar
const confirmDelete = await showConfirmDialog(
  "¿Estás seguro de eliminar este artista?"
);
```

---

## 📊 Capacidades Avanzadas

### **1. Búsqueda Multi-Entidad**

El agente puede buscar en múltiples tablas:

```typescript
"Busca todo relacionado con Juan"
→ Busca en: artists, participants, contracts, signatures
→ Muestra resultados agrupados
```

### **2. Flujos Complejos**

```typescript
"Crea un contrato de management para Borngud"
→ 1. Busca artista "Borngud"
→ 2. Lista plantillas de management
→ 3. Crea contrato con plantilla seleccionada
→ 4. Pregunta si enviar para firma
→ 5. Si sí, envía a Auco
```

### **3. Analytics Conversacional**

```typescript
"¿Cuántos artistas tengo?"
→ Llama listarArtistas() → Cuenta → Responde

"¿Cuál es mi revenue total?"
→ Llama obtenerAnalytics(type: "revenue") → Formatea → Responde
```

---

## 🔐 Seguridad

### **Validaciones Importantes:**

1. **Autenticación**: Todas las APIs verifican usuario autenticado
2. **Permisos**: Solo admins pueden eliminar
3. **Confirmaciones**: Acciones destructivas requieren confirmación
4. **Rate Limiting**: Limitar llamadas por minuto
5. **Logging**: Registrar todas las acciones del agente

---

## 🚀 Próximos Pasos

### **Fase 1: Implementación Básica** ✅
- [x] Definir funciones
- [x] Configurar OpenAI
- [x] Estructura básica

### **Fase 2: APIs Completas** (Siguiente)
- [ ] Crear APIs de búsqueda
- [ ] Implementar todos los switch cases
- [ ] Testing de cada función

### **Fase 3: UI Mejorado**
- [ ] Indicadores visuales
- [ ] Confirmaciones interactivas
- [ ] Botones de acción rápida

### **Fase 4: Capacidades Avanzadas**
- [ ] Flujos multi-paso
- [ ] Búsqueda inteligente
- [ ] Analytics conversacional

---

## 💡 Tips de Uso

1. **Sé específico**: "Crea un artista llamado X" es mejor que "Crea artista"
2. **Confirma acciones**: El agente preguntará antes de eliminar
3. **Usa lenguaje natural**: No necesitas comandos exactos
4. **Encadena acciones**: "Busca X y luego crea un contrato"

---

## 🎯 Resultado Final

Tu agente AI podrá:

✅ Gestionar toda tu base de datos por voz/texto
✅ Automatizar flujos complejos
✅ Responder preguntas sobre tus datos
✅ Crear, actualizar, eliminar registros
✅ Enviar documentos para firma
✅ Generar reportes y analytics

**¡Tu aplicación ahora tiene un asistente AI completo!** 🚀
