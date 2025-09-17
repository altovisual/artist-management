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

interface SearchTemplateByNameArgs {
  name: string;
}

interface CreateContractFromTemplateArgs {
  template_id: number;
  title: string;
  participant_ids: number[];
  start_date: string;
  end_date?: string;
  commission_percentage?: number;
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
const listParticipantsTool: FunctionDeclaration = {
  name: "listarParticipantes",
  description: "Obtiene una lista de todos los participantes registrados en la base de datos.",
  parameters: { type: SchemaType.OBJECT, properties: {}, required: [] }
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

const searchTemplateByNameTool: FunctionDeclaration = {
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
  description: "Crea un nuevo contrato en estado de borrador a partir de una plantilla y una lista de participantes.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      template_id: { type: SchemaType.NUMBER, description: "El ID de la plantilla a utilizar." },
      title: { type: SchemaType.STRING, description: "El título del nuevo contrato." },
      participant_ids: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER }, description: "Un array con los IDs de los participantes a vincular en el contrato." },
      start_date: { type: SchemaType.STRING, description: "La fecha de inicio del contrato en formato YYYY-MM-DD." },
      end_date: { type: SchemaType.STRING, description: "(Opcional) La fecha de finalización del contrato en formato YYYY-MM-DD." },
      commission_percentage: { type: SchemaType.NUMBER, description: "(Opcional) El porcentaje de comisión principal del contrato, ej: 20 para un 20%." }
    },
    required: ["template_id", "title", "participant_ids", "start_date"]
  }
};


// --- Model Definition ---
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: systemPrompt,
  tools: [{
    functionDeclarations: [
      listParticipantsTool,
      createParticipantTool,
      assignPercentageTool,
      createTemplateTool,
      deleteTemplateTool,
      searchTemplateByNameTool,
      listTemplatesTool,
      crearContratoDesdePlantillaTool
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
        // Pass the file directly to Gemini
        messageParts.push({ inlineData: { mimeType, data: base64Data } });
      } else {
        // Handle cases where the data URL might be malformed
        console.error("Malformed data URL received");
      }
    }

    const result = await chat.sendMessage(messageParts);
    const response = result.response;
    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      let toolResult;

      // Router for different tools
      if (call.name === "listarParticipantes") {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        const apiResponse = await fetch(`${baseUrl}/api/participants`);
        if (!apiResponse.ok) throw new Error(`API call failed: ${apiResponse.status}`);
        const data = await apiResponse.json();
        toolResult = { name: "listarParticipantes", response: { participants: data } };

      } else if (call.name === "crearParticipante") {
        const { name, email, type } = call.args as CreateParticipantArgs;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        const apiResponse = await fetch(`${baseUrl}/api/participants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, type })
        });
        if (!apiResponse.ok) throw new Error(`API call failed: ${apiResponse.status}`);
        const data = await apiResponse.json();
        toolResult = { name: "crearParticipante", response: { newParticipant: data } };

      } else if (call.name === "asignarPorcentaje") {
        const { participant_id, contract_id, split_percentage } = call.args as AssignPercentageArgs;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        const apiResponse = await fetch(`${baseUrl}/api/contract-participants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participant_id, contract_id, split_percentage })
        });
        if (!apiResponse.ok) throw new Error(`API call failed: ${apiResponse.status}`);
        const data = await apiResponse.json();
        toolResult = { name: "asignarPorcentaje", response: { link: data } };

      } else if (call.name === "crearPlantilla") {
        const { type, language, template_html, version, jurisdiction } = call.args as CreateTemplateArgs;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        const apiResponse = await fetch(`${baseUrl}/api/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, language, template_html, version, jurisdiction })
        });
        if (!apiResponse.ok) throw new Error(`API call failed: ${apiResponse.status}`);
        const data = await apiResponse.json();
        toolResult = { name: "crearPlantilla", response: { newTemplate: data } };

      } else if (call.name === "eliminarPlantilla") {
        const { template_id } = call.args as DeleteTemplateArgs;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        const apiResponse = await fetch(`${baseUrl}/api/templates?id=${template_id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!apiResponse.ok) throw new Error(`API call failed: ${apiResponse.status}`);
        const data = await apiResponse.json();
        toolResult = { name: "eliminarPlantilla", response: { status: data } };

      } else if (call.name === "buscarPlantillaPorNombre") {
        const { name } = call.args as SearchTemplateByNameArgs;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        const apiResponse = await fetch(`${baseUrl}/api/templates`); // Fetch all templates
        if (!apiResponse.ok) throw new Error(`API call failed: ${apiResponse.status}`);
        const allTemplates = await apiResponse.json();

        const foundTemplates = allTemplates.filter((template: any) =>
          template.type.toLowerCase().includes(name.toLowerCase())
        );

        if (foundTemplates.length > 0) {
          toolResult = { name: "buscarPlantillaPorNombre", response: { templates: foundTemplates.map((t: any) => ({ id: t.id, type: t.type })) } };
        } else {
          toolResult = { name: "buscarPlantillaPorNombre", response: { templates: [] } };
        }

      } else if (call.name === "listarPlantillas") {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        const apiResponse = await fetch(`${baseUrl}/api/templates`);
        if (!apiResponse.ok) throw new Error(`API call failed: ${apiResponse.status}`);
        const data = await apiResponse.json();
        toolResult = { name: "listarPlantillas", response: { templates: data } };

      } else if (call.name === "crearContratoDesdePlantilla") {
        const args = call.args as CreateContractFromTemplateArgs;
        console.log("Tool call: crearContratoDesdePlantilla with args:", args);
        // TODO: Implement actual logic here
        // 1. Fetch template from DB
        // 2. Fetch participants from DB
        // 3. Replace placeholders in template content
        // 4. Create new contract in DB
        // 5. Link participants to contract
        toolResult = { name: "crearContratoDesdePlantilla", response: { success: true, message: `Contrato '${args.title}' creado como borrador.`, contract_id: 123 } }; // Mock response

      } else {
        return NextResponse.json({ response: "No sé cómo realizar esa acción." });
      }

      // Send the tool's result back to the model
      const result2 = await chat.sendMessage([{ functionResponse: toolResult }]);
      const finalResponse = result2.response;
      const text = finalResponse.text();
      return NextResponse.json({ response: text });

    } else {
      // The model responded with text directly
      const text = response.text();
      return NextResponse.json({ response: text });
    }

  } catch (error: any) {
    console.error('[API Handler Error]', error);
    return NextResponse.json({ error: `Error en el servidor: ${error.message}` }, { status: 500 });
  }
}