import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';

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

// --- Model Definition ---
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: [listParticipantsTool, createParticipantTool, assignPercentageTool, createTemplateTool, deleteTemplateTool, searchTemplateByNameTool, listTemplatesTool]
});

// --- API Handler ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
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
        const { name, email, type } = call.args;
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
        const { participant_id, contract_id, split_percentage } = call.args;
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
        const { type, language, template_html, version, jurisdiction } = call.args;
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
        const { template_id } = call.args;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        const apiResponse = await fetch(`${baseUrl}/api/templates?id=${template_id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!apiResponse.ok) throw new Error(`API call failed: ${apiResponse.status}`);
        const data = await apiResponse.json();
        toolResult = { name: "eliminarPlantilla", response: { status: data } };

      } else if (call.name === "buscarPlantillaPorNombre") {
        const { name } = call.args;
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

  } catch (error) {
    console.error('Error in AI contract assistant endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}