import { NextResponse } from 'next/server';
import { systemPrompt } from './system-prompt';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, Content, Part } from '@google/generative-ai';

// Argument Interfaces
interface CreateParticipantArgs {
  name: string;
  email: string;
  type: string;
}

interface AssignPercentageArgs {
  participant_id: number;
  contract_id: number;
  split_percentage: number;
}

interface CreateTemplateArgs {
  type: string;
  language: string;
  template_html: string;
  version: string;
  jurisdiction: string;
}

interface DeleteTemplateArgs {
  template_id: number;
}

interface SearchByNameArgs {
  name: string;
}

interface CreateContractFromTemplateArgs {
  work_id: number;
  template_id: number;
  status?: string;
  internal_reference?: string;
  signing_location?: string;
  additional_notes?: string;
  publisher?: string;
  publisher_percentage?: number;
  co_publishers?: string;
  publisher_admin?: string;
  participants: {
    id: number;
    role: string;
    percentage?: number;
  }[];
}

interface EditContractArgs {
  contract_id: number;
  status?: string;
  internal_reference?: string;
  signing_location?: string;
  additional_notes?: string;
  publisher?: string;
  publisher_percentage?: number;
  co_publishers?: string;
  publisher_admin?: string;
  participants?: {
    id: number;
    role: string;
    percentage?: number;
  }[];
}

interface DeleteContractArgs {
  contract_id: number;
}

interface GetContractDetailsArgs {
    contract_id: number;
}

// Type for client-side message history
interface ClientMessage {
  text: string;
  isUser: boolean;
  image?: string; // Base64 data URL
  file?: { name: string; type: string; };
}


// Initialize the client with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- Tool Schemas ---
const buscarParticipantePorNombreTool: FunctionDeclaration = {
    name: "buscarParticipantePorNombre",
    description: "Busca participantes por su nombre para obtener su ID.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            name: { type: SchemaType.STRING, description: "El nombre del participante a buscar." }
        },
        required: ["name"]
    }
};

const buscarObraPorNombreTool: FunctionDeclaration = {
    name: "buscarObraPorNombre",
    description: "Busca obras (proyectos o canciones) por su nombre para obtener su ID.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            name: { type: SchemaType.STRING, description: "El nombre de la obra a buscar." }
        },
        required: ["name"]
    }
};

const createParticipantTool: FunctionDeclaration = {
  name: "crearParticipante",
  description: "Crea un nuevo participante en la base de datos.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING, description: "Nombre completo del participante." },
      email: { type: SchemaType.STRING, description: "Correo electrónico del participante." },
      type: { type: SchemaType.STRING, description: "Tipo de participante (ej: Artista, Productor, Sello)." }
    },
    required: ["name", "email", "type"]
  }
};

const assignPercentageTool: FunctionDeclaration = {
  name: "asignarPorcentaje",
  description: "Asigna un porcentaje de reparto a un participante dentro de un contrato específico.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      participant_id: { type: SchemaType.NUMBER, description: "El ID del participante." },
      contract_id: { type: SchemaType.NUMBER, description: "El ID del contrato." },
      split_percentage: { type: SchemaType.NUMBER, description: "El porcentaje de reparto (ej: 20 para 20%)." }
    },
    required: ["participant_id", "contract_id", "split_percentage"]
  }
};

const createTemplateTool: FunctionDeclaration = {
  name: "crearPlantilla",
  description: "Crea una nueva plantilla de contrato en la base de datos.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      type: { type: SchemaType.STRING, description: "El tipo o nombre de la plantilla (ej: 'Acuerdo de Producción')." },
      language: { type: SchemaType.STRING, description: "El idioma de la plantilla (ej: 'es' para español, 'en' para inglés)." },
      template_html: { type: SchemaType.STRING, description: "El contenido HTML completo de la plantilla." },
      version: { type: SchemaType.STRING, description: "La versión de la plantilla (ej: '1.0')." },
      jurisdiction: { type: SchemaType.STRING, description: "La jurisdicción legal a la que aplica la plantilla (ej: 'España', 'México')." }
    },
    required: ["type", "language", "template_html", "version", "jurisdiction"]
  }
};

const deleteTemplateTool: FunctionDeclaration = {
  name: "eliminarPlantilla",
  description: "Elimina una plantilla de contrato existente de la base de datos.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      template_id: { type: SchemaType.NUMBER, description: "El ID de la plantilla a eliminar." }
    },
    required: ["template_id"]
  }
};

const buscarPlantillaPorNombreTool: FunctionDeclaration = {
  name: "buscarPlantillaPorNombre",
  description: "Busca una plantilla de contrato por su nombre (campo 'type') y devuelve su ID.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING, description: "El nombre o tipo de la plantilla a buscar." }
    },
    required: ["name"]
  }
};

const listTemplatesTool: FunctionDeclaration = {
  name: "listarPlantillas",
  description: "Obtiene una lista de todas las plantillas de contrato existentes en la base de datos.",
  parameters: { type: SchemaType.OBJECT, properties: {}, required: [] }
};

const crearContratoDesdePlantillaTool: FunctionDeclaration = {
  name: "crearContratoDesdePlantilla",
  description: "Crea un nuevo contrato en la base de datos a partir de una plantilla, una obra (work) y una lista de participantes con sus roles y porcentajes.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      work_id: { type: SchemaType.NUMBER, description: "El ID de la obra (work) a la que se asocia el contrato." },
      template_id: { type: SchemaType.NUMBER, description: "El ID de la plantilla a utilizar." },
      participants: {
        type: SchemaType.ARRAY,
        description: "Un array de objetos, donde cada objeto representa un participante con su ID, su rol en el contrato y su porcentaje.",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.NUMBER, description: "El ID del participante." },
            role: { type: SchemaType.STRING, description: "El rol del participante en este contrato (ej: 'Artista Principal', 'Productor')." },
            percentage: { type: SchemaType.NUMBER, description: "(Opcional) El porcentaje de reparto para este participante." }
          },
          required: ["id", "role"]
        }
      },
      status: { type: SchemaType.STRING, description: " (Opcional) El estado inicial del contrato. Por defecto es 'draft'." },
      internal_reference: { type: SchemaType.STRING, description: "(Opcional) Una referencia interna para el contrato." },
      signing_location: { type: SchemaType.STRING, description: "(Opcional) La ubicación donde se firmará el contrato." },
      additional_notes: { type: SchemaType.STRING, description: "(Opcional) Notas adicionales sobre el contrato." },
      publisher: { type: SchemaType.STRING, description: "(Opcional) El editor (publisher) del contrato." },
      publisher_percentage: { type: SchemaType.NUMBER, description: "(Opcional) El porcentaje del editor." },
      co_publishers: { type: SchemaType.STRING, description: "(Opcional) Los co-editores." },
      publisher_admin: { type: SchemaType.STRING, description: "(Opcional) El administrador de la editorial." }
    },
    required: ["work_id", "template_id", "participants"]
  }
};

const listarContratosTool: FunctionDeclaration = {
    name: "listarContratos",
    description: "Obtiene una lista de todos los contratos en la base de datos.",
    parameters: { type: SchemaType.OBJECT, properties: {}, required: [] }
};

const consultarDetallesContratoTool: FunctionDeclaration = {
    name: "consultarDetallesContrato",
    description: "Obtiene los detalles completos de un contrato específico por su ID.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            contract_id: { type: SchemaType.NUMBER, description: "El ID del contrato a consultar." }
        },
        required: ["contract_id"]
    }
};

const editarContratoTool: FunctionDeclaration = {
    name: "editarContrato",
    description: "Edita un contrato existente. Se pueden modificar campos específicos o la lista completa de participantes.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            contract_id: { type: SchemaType.NUMBER, description: "El ID del contrato a editar." },
            status: { type: SchemaType.STRING, description: "(Opcional) El nuevo estado del contrato." },
            internal_reference: { type: SchemaType.STRING, description: "(Opcional) La nueva referencia interna." },
            participants: {
                type: SchemaType.ARRAY,
                description: "(Opcional) Una lista completa y nueva de participantes para reemplazar la existente.",
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.NUMBER, description: "El ID del participante." },
                        role: { type: SchemaType.STRING, description: "El rol del participante." },
                        percentage: { type: SchemaType.NUMBER, description: "El porcentaje del participante." }
                    },
                    required: ["id", "role"]
                }
            }
        },
        required: ["contract_id"]
    }
};

const eliminarContratoTool: FunctionDeclaration = {
    name: "eliminarContrato",
    description: "Elimina un contrato de la base de datos usando su ID.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            contract_id: { type: SchemaType.NUMBER, description: "El ID del contrato a eliminar." }
        },
        required: ["contract_id"]
    }
};


// --- Model Definition ---
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: systemPrompt,
  tools: [{
    functionDeclarations: [
      createParticipantTool,
      assignPercentageTool,
      createTemplateTool,
      deleteTemplateTool,
      buscarPlantillaPorNombreTool,
      listTemplatesTool,
      crearContratoDesdePlantillaTool,
      listarContratosTool,
      consultarDetallesContratoTool,
      editarContratoTool,
      eliminarContratoTool,
      buscarParticipantePorNombreTool,
      buscarObraPorNombreTool
    ]
  }]
});

// --- API Handler ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, history = [], file: fileDataUrl = null } = body;

    if (!prompt && !fileDataUrl) {
      return NextResponse.json({ error: 'Prompt or file is required' }, { status: 400 });
    }

    const formattedHistory: Content[] = history.map((msg: ClientMessage) => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const messageParts: Part[] = [];
    if (prompt) {
      messageParts.push({ text: prompt });
    }

    if (fileDataUrl) {
      const match = fileDataUrl.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        messageParts.push({ inlineData: { mimeType, data: base64Data } });
      } else {
        console.error("Malformed data URL received");
      }
    }

    const result = await chat.sendMessage(messageParts);
    const response = result.response;
    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const toolExecutionPromises = functionCalls.map(async (call) => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        let data;
        let apiResponse;

        switch (call.name) {
          case "buscarParticipantePorNombre":
            const { name: participantName } = call.args as SearchByNameArgs;
            apiResponse = await fetch(`${baseUrl}/api/participants?name=${encodeURIComponent(participantName)}`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.status}`);
            data = await apiResponse.json();
            return { name: call.name, response: { participants: data } };

          case "buscarObraPorNombre":
            const { name: workName } = call.args as SearchByNameArgs;
            apiResponse = await fetch(`${baseUrl}/api/works?name=${encodeURIComponent(workName)}`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.status}`);
            data = await apiResponse.json();
            return { name: call.name, response: { works: data } };

          case "crearParticipante":
            apiResponse = await fetch(`${baseUrl}/api/participants`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(call.args)
            });
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.status}`);
            data = await apiResponse.json();
            return { name: call.name, response: { newParticipant: data } };

          case "crearContratoDesdePlantilla":
            apiResponse = await fetch(`${baseUrl}/api/contracts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(call.args)
            });
            if (!apiResponse.ok) {
                const errorBody = await apiResponse.json();
                throw new Error(`API call failed for ${call.name}: ${apiResponse.status} ${apiResponse.statusText} - ${JSON.stringify(errorBody)}`);
            }
            data = await apiResponse.json();
            return { name: call.name, response: { newContract: data } };

          case "listarContratos":
            apiResponse = await fetch(`${baseUrl}/api/contracts`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.status}`);
            data = await apiResponse.json();
            return { name: call.name, response: { contracts: data } };

          case "consultarDetallesContrato":
            const { contract_id } = call.args as GetContractDetailsArgs;
            apiResponse = await fetch(`${baseUrl}/api/contracts/${contract_id}`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.status}`);
            data = await apiResponse.json();
            return { name: call.name, response: { contract: data } };

          case "editarContrato":
            const { contract_id: editId, ...updateData } = call.args as EditContractArgs;
            apiResponse = await fetch(`${baseUrl}/api/contracts/${editId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (!apiResponse.ok) {
                const errorBody = await apiResponse.json();
                throw new Error(`API call failed for ${call.name}: ${apiResponse.status} ${apiResponse.statusText} - ${JSON.stringify(errorBody)}`);
            }
            data = await apiResponse.json();
            return { name: call.name, response: { updatedContract: data } };

          case "eliminarContrato":
            const { contract_id: deleteId } = call.args as DeleteContractArgs;
            apiResponse = await fetch(`${baseUrl}/api/contracts/${deleteId}`, {
                method: 'DELETE'
            });
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.status}`);
            data = await apiResponse.json();
            return { name: call.name, response: { deletedContract: data } };
            
          // Keep other template-related tools as they are
          case "listarPlantillas":
            apiResponse = await fetch(`${baseUrl}/api/templates`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.status}`);
            data = await apiResponse.json();
            return { name: call.name, response: { templates: data } };

          case "buscarPlantillaPorNombre":
            const { name } = call.args as SearchByNameArgs;
            apiResponse = await fetch(`${baseUrl}/api/templates`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.status}`);
            const allTemplates = await apiResponse.json();
            const foundTemplates = allTemplates.filter((template: any) =>
              template.type.toLowerCase().includes(name.toLowerCase())
            );
            return { name: call.name, response: { templates: foundTemplates.map((t: any) => ({ id: t.id, type: t.type })) } };

          default:
            throw new Error(`Unknown tool call: ${call.name}`);
        }
      });

      const toolResults = await Promise.all(toolExecutionPromises);
      
      const functionResponseParts = toolResults.map(toolResult => ({
        functionResponse: toolResult
      }));

      const result2 = await chat.sendMessage(functionResponseParts);
      const finalResponse = result2.response;
      const text = finalResponse.text();
      return NextResponse.json({ response: text });

    } else {
      const text = response.text();
      return NextResponse.json({ response: text });
    }

  } catch (error: any) {
    console.error('[API Handler Error]', error);
    return NextResponse.json({ error: `Error en el servidor: ${error.message}` }, { status: 500 });
  }
}