import { NextResponse } from 'next/server';
import { systemPrompt } from './system-prompt';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, Content, Part } from '@google/generative-ai';

// Argument Interfaces
interface SearchByNameArgs {
  name: string;
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

// --- NEW TOOLS ---
const buscarInformacionCompletaDeArtistaTool: FunctionDeclaration = {
    name: "buscarInformacionCompletaDeArtista",
    description: "Busca un artista por su nombre y devuelve toda su información asociada, incluyendo datos biográficos, contratos, obras, participaciones y cuentas de redes sociales.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            name: { type: SchemaType.STRING, description: "El nombre del artista a buscar." }
        },
        required: ["name"]
    }
};

const listarUsuariosTool: FunctionDeclaration = {
    name: "listarUsuarios",
    description: "Obtiene una lista de todos los usuarios registrados en el sistema (de la tabla auth.users).",
    parameters: { type: SchemaType.OBJECT, properties: {}, required: [] }
};

const listarFirmasTool: FunctionDeclaration = {
    name: "listarFirmas",
    description: "Obtiene una lista de todas las firmas de contratos registradas en la base de datos.",
    parameters: { type: SchemaType.OBJECT, properties: {}, required: [] }
};

const listarObrasTool: FunctionDeclaration = {
    name: "listarObras",
    description: "Obtiene una lista de todas las obras (proyectos, canciones) en la base de datos.",
    parameters: { type: SchemaType.OBJECT, properties: {}, required: [] }
};


// --- Model Definition ---
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: systemPrompt,
  tools: [{
    functionDeclarations: [
      // Existing tools
      buscarParticipantePorNombreTool,
      buscarObraPorNombreTool,
      buscarPlantillaPorNombreTool,
      listTemplatesTool,
      listarContratosTool,
      consultarDetallesContratoTool,
      // New tools
      buscarInformacionCompletaDeArtistaTool,
      listarUsuariosTool,
      listarFirmasTool,
      listarObrasTool
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

        console.log(`AI is calling tool: ${call.name} with args:`, call.args);

        switch (call.name) {
          // --- NEW TOOL IMPLEMENTATIONS ---
          case "buscarInformacionCompletaDeArtista":
            const { name: artistNameForSearch } = call.args as SearchByNameArgs;
            apiResponse = await fetch(`${baseUrl}/api/artists/full-profile?name=${encodeURIComponent(artistNameForSearch)}`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { artist_profile: data } };

          case "listarUsuarios":
            apiResponse = await fetch(`${baseUrl}/api/users`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { users: data } };

          case "listarFirmas":
            apiResponse = await fetch(`${baseUrl}/api/signatures`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { signatures: data } };

          case "listarObras":
            apiResponse = await fetch(`${baseUrl}/api/works`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { works: data } };

          // --- EXISTING TOOL IMPLEMENTATIONS ---
          case "buscarEntidadesVinculables":
            const { name: entityName } = call.args as SearchByNameArgs;
            apiResponse = await fetch(`${baseUrl}/api/linkable-entities?name=${encodeURIComponent(entityName)}`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { entities: data } };

          case "buscarParticipantePorNombre":
            const { name: participantName } = call.args as SearchByNameArgs;
            apiResponse = await fetch(`${baseUrl}/api/participants?name=${encodeURIComponent(participantName)}`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { participants: data } };

          case "buscarObraPorNombre":
            const { name: workName } = call.args as SearchByNameArgs;
            apiResponse = await fetch(`${baseUrl}/api/works?name=${encodeURIComponent(workName)}`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { works: data } };

          case "listarContratos":
            apiResponse = await fetch(`${baseUrl}/api/contracts`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { contracts: data } };

          case "consultarDetallesContrato":
            const { contract_id } = call.args as { contract_id: number };
            apiResponse = await fetch(`${baseUrl}/api/contracts/${contract_id}`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { contract: data } };
            
          case "listarPlantillas":
            apiResponse = await fetch(`${baseUrl}/api/templates`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            data = await apiResponse.json();
            return { name: call.name, response: { templates: data } };

          case "buscarPlantillaPorNombre":
            const { name } = call.args as SearchByNameArgs;
            apiResponse = await fetch(`${baseUrl}/api/templates`);
            if (!apiResponse.ok) throw new Error(`API call failed for ${call.name}: ${apiResponse.statusText}`);
            const allTemplates = await apiResponse.json();
            const foundTemplates = allTemplates.filter((template: any) =>
              template.type.toLowerCase().includes(name.toLowerCase())
            );
            return { name: call.name, response: { templates: foundTemplates.map((t: any) => ({ id: t.id, type: t.type })) } };

          default:
            // Fallback for tools defined in the prompt but not implemented here
            console.warn(`Tool call received for unimplemented tool: ${call.name}`);
            // For now, we can return a generic response or throw an error.
            // Throwing an error might be better for debugging during development.
            throw new Error(`Unknown or unimplemented tool call: ${call.name}`);
        }
      });

      const toolResults = await Promise.all(toolExecutionPromises);
      
      const functionResponseParts = toolResults.map(toolResult => ({
        functionResponse: {
          name: toolResult.name,
          response: toolResult.response
        }
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
