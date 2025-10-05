import { NextResponse } from 'next/server';
import { systemPrompt } from './system-prompt';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

// Type for client-side message history
interface ClientMessage {
  text: string;
  isUser: boolean;
  image?: string;
  file?: { name: string; type: string; };
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// ===== MCP-STYLE DATABASE ACCESS =====
// Direct Supabase access for complete control

async function getSupabaseData(table: string, filters?: any, select?: string) {
  try {
    const supabase = await createClient();
    let query = supabase.from(table).select(select || '*');
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return { success: false, error: error.message, data: [] };
    }
    
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error(`Error in getSupabaseData:`, error);
    return { success: false, error: error.message, data: [] };
  }
}

async function createSupabaseRecord(table: string, record: any) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(table).insert(record).select();
    
    if (error) {
      console.error(`Error creating ${table}:`, error);
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data: data?.[0] || null };
  } catch (error: any) {
    console.error(`Error in createSupabaseRecord:`, error);
    return { success: false, error: error.message, data: null };
  }
}

async function updateSupabaseRecord(table: string, id: string, updates: any) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      return { success: false, error: error.message, data: null };
    }
    
    return { success: true, data: data?.[0] || null };
  } catch (error: any) {
    console.error(`Error in updateSupabaseRecord:`, error);
    return { success: false, error: error.message, data: null };
  }
}

async function deleteSupabaseRecord(table: string, id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from(table).delete().eq('id', id);
    
    if (error) {
      console.error(`Error deleting ${table}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error in deleteSupabaseRecord:`, error);
    return { success: false, error: error.message };
  }
}

async function searchSupabaseData(table: string, searchField: string, searchTerm: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .ilike(searchField, `%${searchTerm}%`);
    
    if (error) {
      console.error(`Error searching ${table}:`, error);
      return { success: false, error: error.message, data: [] };
    }
    
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error(`Error in searchSupabaseData:`, error);
    return { success: false, error: error.message, data: [] };
  }
}

// --- Tool/Function Definitions for OpenAI ---
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  // ===== ARTISTS CRUD =====
  {
    type: "function",
    function: {
      name: "listarArtistas",
      description: "Obtiene la lista completa de artistas en el sistema.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "buscarArtista",
      description: "Busca un artista por nombre o ID.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Nombre o ID del artista" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crearArtista",
      description: "Crea un nuevo artista en el sistema.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nombre del artista" },
          genre: { type: "string", description: "Género musical" },
          email: { type: "string", description: "Email del artista" },
          bio: { type: "string", description: "Biografía" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "actualizarArtista",
      description: "Actualiza la información de un artista existente.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del artista" },
          name: { type: "string", description: "Nuevo nombre" },
          genre: { type: "string", description: "Nuevo género" },
          email: { type: "string", description: "Nuevo email" }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "eliminarArtista",
      description: "Elimina un artista del sistema.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del artista a eliminar" }
        },
        required: ["id"]
      }
    }
  },

  // ===== PARTICIPANTS CRUD =====
  {
    type: "function",
    function: {
      name: "listarParticipantes",
      description: "Obtiene la lista de todos los participantes.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "buscarParticipante",
      description: "Busca un participante por nombre.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nombre del participante" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crearParticipante",
      description: "Crea un nuevo participante.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nombre completo" },
          email: { type: "string", description: "Email" },
          type: { type: "string", description: "Tipo: artist, producer, etc" }
        },
        required: ["name", "email"]
      }
    }
  },

  // ===== CONTRACTS CRUD =====
  {
    type: "function",
    function: {
      name: "listarContratos",
      description: "Obtiene todos los contratos del sistema.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "buscarContrato",
      description: "Busca un contrato específico.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID del contrato" }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crearContrato",
      description: "Crea un nuevo contrato.",
      parameters: {
        type: "object",
        properties: {
          template_id: { type: "string", description: "ID de la plantilla" },
          participant_id: { type: "string", description: "ID del participante" },
          work_id: { type: "string", description: "ID de la obra" }
        },
        required: ["template_id"]
      }
    }
  },

  // ===== SIGNATURES =====
  {
    type: "function",
    function: {
      name: "listarFirmas",
      description: "Obtiene todas las firmas digitales.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "enviarFirma",
      description: "Envía un documento para firma digital.",
      parameters: {
        type: "object",
        properties: {
          contract_id: { type: "string", description: "ID del contrato" },
          signer_email: { type: "string", description: "Email del firmante" }
        },
        required: ["contract_id", "signer_email"]
      }
    }
  },

  // ===== ANALYTICS =====
  {
    type: "function",
    function: {
      name: "obtenerAnalytics",
      description: "Obtiene estadísticas y analytics del sistema.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", description: "Tipo: revenue, artists, projects, etc" }
        },
        required: []
      }
    }
  },

  // ===== TEMPLATES =====
  {
    type: "function",
    function: {
      name: "listarPlantillas",
      description: "Lista todas las plantillas de contrato.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },

  // ===== MCP-STYLE UNIVERSAL ACCESS =====
  {
    type: "function",
    function: {
      name: "consultarTabla",
      description: "Consulta directa a cualquier tabla de Supabase. Acceso MCP completo.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", description: "Nombre de la tabla: artists, participants, contracts, works, transactions, finance_categories, etc" },
          filters: { type: "object", description: "Filtros opcionales como {status: 'active'}" }
        },
        required: ["table"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "crearRegistro",
      description: "Crea un nuevo registro en cualquier tabla.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", description: "Nombre de la tabla" },
          data: { type: "object", description: "Datos del registro a crear" }
        },
        required: ["table", "data"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "actualizarRegistro",
      description: "Actualiza un registro existente en cualquier tabla.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", description: "Nombre de la tabla" },
          id: { type: "string", description: "ID del registro" },
          updates: { type: "object", description: "Campos a actualizar" }
        },
        required: ["table", "id", "updates"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "eliminarRegistro",
      description: "Elimina un registro de cualquier tabla.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", description: "Nombre de la tabla" },
          id: { type: "string", description: "ID del registro a eliminar" }
        },
        required: ["table", "id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "buscarEnTabla",
      description: "Búsqueda avanzada en cualquier tabla.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", description: "Nombre de la tabla" },
          searchField: { type: "string", description: "Campo donde buscar (ej: 'name', 'email')" },
          searchTerm: { type: "string", description: "Término de búsqueda" }
        },
        required: ["table", "searchField", "searchTerm"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "obtenerEstadisticas",
      description: "Obtiene estadísticas agregadas de cualquier tabla.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", description: "Nombre de la tabla" },
          operation: { type: "string", description: "Operación: count, sum, avg, etc" }
        },
        required: ["table", "operation"]
      }
    }
  }
];

// --- API Handler ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, history = [] } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Format history for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: ClientMessage) => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text
      })),
      { role: 'user', content: prompt }
    ];

    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for cheaper option
      messages,
      tools,
      tool_choice: 'auto',
    });

    const responseMessage = response.choices[0].message;

    // Check if the model wants to call functions
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      // Get base URL from request headers
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      
      // Execute all function calls
      const functionResults = await Promise.all(
        responseMessage.tool_calls.map(async (toolCall: any) => {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          console.log(`AI is calling function: ${functionName} with args:`, functionArgs);

          let apiResponse;
          let data;

          switch (functionName) {
            // ===== ARTISTS CRUD =====
            case "listarArtistas":
              const artistsResult = await getSupabaseData('artists');
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ 
                  artists: artistsResult.data, 
                  count: artistsResult.data.length,
                  success: artistsResult.success 
                })
              };

            case "buscarArtista":
              apiResponse = await fetch(`${baseUrl}/api/artists?search=${encodeURIComponent(functionArgs.query)}`);
              data = await apiResponse.json();
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ results: data, found: data?.length || 0 })
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
                content: JSON.stringify({ success: true, artist: data, message: 'Artista creado exitosamente' })
              };

            case "actualizarArtista":
              apiResponse = await fetch(`${baseUrl}/api/artists/${functionArgs.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(functionArgs)
              });
              data = await apiResponse.json();
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ success: true, artist: data, message: 'Artista actualizado' })
              };

            case "eliminarArtista":
              apiResponse = await fetch(`${baseUrl}/api/artists/${functionArgs.id}`, {
                method: 'DELETE'
              });
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ success: true, message: 'Artista eliminado' })
              };

            // ===== PARTICIPANTS CRUD =====
            case "listarParticipantes":
              const participantsResult = await getSupabaseData('participants');
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ 
                  participants: participantsResult.data, 
                  count: participantsResult.data.length,
                  success: participantsResult.success 
                })
              };

            case "buscarParticipante":
              apiResponse = await fetch(`${baseUrl}/api/participants?search=${encodeURIComponent(functionArgs.name)}`);
              data = await apiResponse.json();
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ results: data, found: data?.length || 0 })
              };

            case "crearParticipante":
              apiResponse = await fetch(`${baseUrl}/api/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(functionArgs)
              });
              data = await apiResponse.json();
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ success: true, participant: data, message: 'Participante creado' })
              };

            // ===== CONTRACTS CRUD =====
            case "listarContratos":
              const contractsResult = await getSupabaseData('contracts');
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ 
                  contracts: contractsResult.data, 
                  count: contractsResult.data.length,
                  success: contractsResult.success 
                })
              };

            case "buscarContrato":
              apiResponse = await fetch(`${baseUrl}/api/contracts/${functionArgs.id}`);
              data = await apiResponse.json();
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ contract: data })
              };

            case "crearContrato":
              apiResponse = await fetch(`${baseUrl}/api/contracts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(functionArgs)
              });
              data = await apiResponse.json();
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ success: true, contract: data, message: 'Contrato creado' })
              };

            // ===== SIGNATURES =====
            case "listarFirmas":
              apiResponse = await fetch(`${baseUrl}/api/signatures`);
              data = await apiResponse.json();
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ signatures: data, count: data?.length || 0 })
              };

            case "enviarFirma":
              apiResponse = await fetch(`${baseUrl}/api/signatures/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(functionArgs)
              });
              data = await apiResponse.json();
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ success: true, signature: data, message: 'Documento enviado para firma' })
              };

            // ===== ANALYTICS =====
            case "obtenerAnalytics":
              const analyticsType = functionArgs.type || 'general';
              apiResponse = await fetch(`${baseUrl}/api/analytics?type=${analyticsType}`);
              data = await apiResponse.json();
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ analytics: data, type: analyticsType })
              };

            // ===== TEMPLATES =====
            case "listarPlantillas":
              const templatesResult = await getSupabaseData('contract_templates');
              // If no templates in DB, return mock data
              const templates = templatesResult.data.length > 0 ? templatesResult.data : [
                { id: '1', name: 'Contrato de Management', description: 'Gestión y representación artística', type: 'management' },
                { id: '2', name: 'Contrato de Producción', description: 'Producción musical', type: 'production' },
                { id: '3', name: 'Contrato de Distribución', description: 'Distribución digital y física', type: 'distribution' }
              ];
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ templates, count: templates.length, success: true })
              };

            // ===== MCP-STYLE UNIVERSAL ACCESS =====
            case "consultarTabla":
              const tableResult = await getSupabaseData(functionArgs.table, functionArgs.filters);
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({
                  table: functionArgs.table,
                  data: tableResult.data,
                  count: tableResult.data.length,
                  success: tableResult.success
                })
              };

            case "crearRegistro":
              const createResult = await createSupabaseRecord(functionArgs.table, functionArgs.data);
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({
                  table: functionArgs.table,
                  data: createResult.data,
                  success: createResult.success,
                  message: createResult.success ? 'Registro creado exitosamente' : createResult.error
                })
              };

            case "actualizarRegistro":
              const updateResult = await updateSupabaseRecord(functionArgs.table, functionArgs.id, functionArgs.updates);
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({
                  table: functionArgs.table,
                  data: updateResult.data,
                  success: updateResult.success,
                  message: updateResult.success ? 'Registro actualizado exitosamente' : updateResult.error
                })
              };

            case "eliminarRegistro":
              const deleteResult = await deleteSupabaseRecord(functionArgs.table, functionArgs.id);
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({
                  table: functionArgs.table,
                  success: deleteResult.success,
                  message: deleteResult.success ? 'Registro eliminado exitosamente' : deleteResult.error
                })
              };

            case "buscarEnTabla":
              const searchResult = await searchSupabaseData(functionArgs.table, functionArgs.searchField, functionArgs.searchTerm);
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({
                  table: functionArgs.table,
                  results: searchResult.data,
                  found: searchResult.data.length,
                  success: searchResult.success
                })
              };

            case "obtenerEstadisticas":
              const statsResult = await getSupabaseData(functionArgs.table);
              const count = statsResult.data.length;
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({
                  table: functionArgs.table,
                  operation: functionArgs.operation,
                  count: count,
                  data: statsResult.data,
                  success: statsResult.success
                })
              };

            default:
              return {
                tool_call_id: toolCall.id,
                role: 'tool' as const,
                content: JSON.stringify({ error: 'Función desconocida', function: functionName })
              };
          }
        })
      );

      // Send function results back to get final response
      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          ...messages,
          responseMessage,
          ...functionResults,
          {
            role: 'system',
            content: 'IMPORTANTE: Termina tu respuesta ofreciendo botones de acción específicos. Usa el formato: [BOTONES: texto1|texto2|texto3] al final de tu mensaje.'
          }
        ],
      });

      const responseText = finalResponse.choices[0].message.content || 'No response generated.';
      
      // Extract button suggestions from response
      const buttonMatch = responseText.match(/\[BOTONES:\s*([^\]]+)\]/);
      let suggestions = [];
      let cleanText = responseText;
      
      if (buttonMatch) {
        const buttons = buttonMatch[1].split('|').map(b => b.trim());
        suggestions = buttons.map(button => ({
          name: button,
          prompt: button,
          type: 'action'
        }));
        cleanText = responseText.replace(/\[BOTONES:[^\]]+\]/, '').trim();
      }

      return NextResponse.json({
        text: cleanText,
        isUser: false,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      });
    }

    // No function calls, return direct response
    return NextResponse.json({
      text: responseMessage.content || 'No response generated.',
      isUser: false
    });

  } catch (error: any) {
    console.error('[API Handler Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
