"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

// --- DATA & TYPES ---

interface Tool {
  name: string;
  description: string;
  prompt: string;
}

interface ToolCategory {
  category: string;
  tools: Tool[];
}

const allTools: ToolCategory[] = [
  {
    category: "🎤 Gestión de Artistas",
    tools: [
      { name: "Crear Artista", description: "Crear un nuevo artista con nombre, género, email y biografía.", prompt: "Quiero crear un nuevo artista" },
      { name: "Buscar Artista", description: "Buscar artistas existentes por nombre o ID.", prompt: "Busca al artista " },
      { name: "Listar Artistas", description: "Ver todos los artistas en el sistema.", prompt: "Muéstrame todos los artistas" },
      { name: "Actualizar Artista", description: "Actualizar información de un artista.", prompt: "Quiero actualizar la información de un artista" },
      { name: "Eliminar Artista", description: "Eliminar un artista del sistema.", prompt: "Quiero eliminar un artista" },
    ]
  },
  {
    category: "👥 Gestión de Participantes",
    tools: [
      { name: "Crear Participante", description: "Crear un nuevo participante (productor, colaborador, etc.).", prompt: "Quiero crear un nuevo participante" },
      { name: "Buscar Participante", description: "Buscar un participante específico por nombre.", prompt: "Busca al participante " },
      { name: "Listar Participantes", description: "Ver todos los participantes y colaboradores.", prompt: "Lista todos los participantes" },
    ]
  },
  {
    category: "📄 Gestión de Contratos",
    tools: [
      { name: "Crear Contrato", description: "Crear un nuevo contrato desde una plantilla.", prompt: "Quiero crear un contrato" },
      { name: "Buscar Contrato", description: "Buscar un contrato específico por ID.", prompt: "Busca el contrato " },
      { name: "Listar Contratos", description: "Ver todos los contratos existentes.", prompt: "Lista todos mis contratos" },
      { name: "Listar Plantillas", description: "Ver todas las plantillas de contrato disponibles.", prompt: "Muéstrame todas las plantillas de contrato" },
    ]
  },
  {
    category: "✍️ Firmas Digitales",
    tools: [
      { name: "Enviar para Firma", description: "Enviar un contrato para firma digital con Auco.", prompt: "Quiero enviar un contrato para firma" },
      { name: "Ver Firmas", description: "Ver el estado de todas las firmas digitales.", prompt: "Muéstrame todas las firmas" },
    ]
  },
  {
    category: "📊 Analytics y Estadísticas",
    tools: [
      { name: "Ver Analytics", description: "Obtener estadísticas de ingresos, artistas y proyectos.", prompt: "Muéstrame las estadísticas del sistema" },
      { name: "Analytics de Artista", description: "Ver estadísticas específicas de un artista.", prompt: "Muéstrame las estadísticas de un artista" },
    ]
  },
  {
    category: "🔍 Búsqueda Inteligente",
    tools: [
      { name: "Búsqueda Global", description: "Buscar información en toda la aplicación.", prompt: "Busca " },
      { name: "Búsqueda Avanzada", description: "Búsqueda detallada con filtros específicos.", prompt: "Quiero hacer una búsqueda avanzada" },
    ]
  }
];

const quickStartTools: Tool[] = [
  allTools[0].tools[0], // Crear Artista
  allTools[2].tools[0], // Crear Contrato
  allTools[4].tools[0], // Ver Analytics
  allTools[5].tools[0], // Búsqueda Global
];

interface Suggestion {
  name: string;
  prompt: string;
  type: 'tool' | 'action';
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  image?: string;
  file?: { name: string; type: string; };
  suggestions?: Suggestion[];
  actions?: ActionIndicator[];
}

interface ActionIndicator {
  type: 'thinking' | 'searching' | 'creating' | 'updating' | 'deleting' | 'success' | 'error';
  message: string;
  timestamp?: number;
}

const welcomeMessage: Message = {
  id: 'initial-message',
  text: "¡Hola! Soy **MVPX AI**, tu asistente especializado en gestión de artistas musicales y contratos.\n\n**¿Qué puedo hacer por ti?**\n\n✨ Gestionar artistas, participantes y contratos\n✨ Enviar documentos para firma digital\n✨ Analizar datos y estadísticas\n✨ Búsqueda inteligente en toda la aplicación\n\nSelecciona una acción rápida abajo o escribe tu solicitud:",
  isUser: false,
  suggestions: quickStartTools.map(t => ({ ...t, type: 'tool' })),
};

// --- COMPONENT ---

const AIContractChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAllToolsOpen, setIsAllToolsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<{ data: string; mimeType: string; name: string; } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const clearChat = () => {
    setMessages([welcomeMessage]);
    setInput("");
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        setFile({ data: base64, mimeType: selectedFile.type, name: selectedFile.name });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const executeSend = async (promptText: string, filePayload: string | null) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: promptText,
      isUser: true,
      image: file?.mimeType.startsWith('image/') ? file.data : undefined,
      file: file ? { name: file.name, type: file.mimeType } : undefined,
    };
    
    const historyWithoutSuggestions = messages
      .filter(m => m.id !== 'initial-message')
      .map(({ suggestions, ...rest }) => rest);

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setFile(null);

    const payload: any = {
      prompt: promptText,
      history: historyWithoutSuggestions,
    };

    if (filePayload) {
      payload.file = filePayload;
    }

    try {
      const response = await fetch("/api/ai/contract-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "La respuesta de la red no fue correcta");
      }

      const data = await response.json();
      
      // Simular indicadores de acción basados en la respuesta
      const actions: ActionIndicator[] = [];
      const lowerText = promptText.toLowerCase();
      
      if (lowerText.includes('busca') || lowerText.includes('encuentra') || lowerText.includes('muestra')) {
        actions.push({ type: 'searching', message: 'Buscando en la base de datos...' });
        actions.push({ type: 'success', message: 'Búsqueda completada' });
      } else if (lowerText.includes('crea') || lowerText.includes('nuevo') || lowerText.includes('añade')) {
        actions.push({ type: 'creating', message: 'Creando nuevo registro...' });
        actions.push({ type: 'success', message: 'Creado exitosamente' });
      } else if (lowerText.includes('actualiza') || lowerText.includes('modifica') || lowerText.includes('edita')) {
        actions.push({ type: 'updating', message: 'Actualizando información...' });
        actions.push({ type: 'success', message: 'Actualizado correctamente' });
      } else if (lowerText.includes('elimina') || lowerText.includes('borra')) {
        actions.push({ type: 'deleting', message: 'Eliminando registro...' });
        actions.push({ type: 'success', message: 'Eliminado correctamente' });
      } else if (lowerText.includes('lista') || lowerText.includes('todos')) {
        actions.push({ type: 'searching', message: 'Obteniendo lista...' });
        actions.push({ type: 'success', message: 'Lista cargada' });
      }
      
      const aiMessage: Message = { 
        id: Date.now().toString() + '-ai', 
        text: data.text || data.response || 'No response', 
        isUser: false,
        actions: actions.length > 0 ? actions : undefined,
        suggestions: data.suggestions || undefined
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      console.error("Failed to fetch AI response:", error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: `Error: ${error.message}`,
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;
    const currentInput = input;
    const currentFile = file;
    setInput("");
    await executeSend(currentInput, currentFile?.data || null);
  };

  const handleSuggestionClick = async (prompt: string) => {
    if (isLoading) return;
    if (prompt.endsWith(' ')) {
        setInput(prompt);
    } else {
        setInput("");
        await executeSend(prompt, null);
    }
  };

  // --- SUB-COMPONENTS ---

  const ToolIcon = () => (
    <div className="flex-shrink-0 h-6 w-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
    </div>
  );

  const FilePreview = ({ fileData }: { fileData: { data: string; mimeType: string; name: string; }}) => (
    <div className="relative self-start mb-2">
      {fileData.mimeType.startsWith('image/') ? (
        <Image src={fileData.data} alt="Vista previa" width={80} height={80} className="rounded-md"/>
      ) : (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="text-sm text-muted-foreground truncate max-w-[150px]">{fileData.name}</span>
        </div>
      )}
      <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground" onClick={() => setFile(null)}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </Button>
    </div>
  );

  const MessageFile = ({ msg }: { msg: Message }) => {
    if (msg.image) return <Image src={msg.image} alt="Imagen de usuario" width={200} height={200} className="rounded-md mb-2"/>
    if (msg.file) return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-background my-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <span className="text-sm text-foreground truncate">{msg.file.name}</span>
      </div>
    )
    return null;
  }

  const ActionIndicators = ({ actions }: { actions?: ActionIndicator[] }) => {
    if (!actions || actions.length === 0) return null;
    
    const getIcon = (type: ActionIndicator['type']) => {
      switch (type) {
        case 'thinking':
          return (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          );
        case 'searching':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          );
        case 'creating':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          );
        case 'updating':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          );
        case 'deleting':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          );
        case 'success':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          );
        case 'error':
          return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          );
        default:
          return null;
      }
    };

    const getColorClass = (type: ActionIndicator['type']) => {
      switch (type) {
        case 'thinking':
        case 'searching':
          return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'creating':
          return 'text-green-600 bg-green-50 border-green-200';
        case 'updating':
          return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'deleting':
          return 'text-red-600 bg-red-50 border-red-200';
        case 'success':
          return 'text-green-600 bg-green-50 border-green-200';
        case 'error':
          return 'text-red-600 bg-red-50 border-red-200';
        default:
          return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    return (
      <div className="flex flex-col gap-1.5 mt-2 mb-2">
        {actions.map((action, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium ${getColorClass(action.type)}`}
          >
            {getIcon(action.type)}
            <span>{action.message}</span>
          </div>
        ))}
      </div>
    );
  };

  const SuggestionButtons = ({ msg }: { msg: Message }) => {
    if (!msg.suggestions || msg.suggestions.length === 0) return null;
    
    // Determine button style based on suggestion type
    const getButtonStyle = (index: number) => {
      const styles = [
        'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-sm',
        'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-sm',
        'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-sm',
        'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-sm',
      ];
      return styles[index % styles.length];
    };

    return (
      <div className="flex flex-col gap-2 mt-3">
        <div className="flex flex-wrap gap-2">
          {msg.suggestions.map((suggestion, i) => (
            <Button 
              key={i} 
              size="sm" 
              onClick={() => handleSuggestionClick(suggestion.prompt)} 
              disabled={isLoading}
              className={`${getButtonStyle(i)} transition-all duration-200 hover:scale-105 font-medium`}
            >
              {suggestion.name}
            </Button>
          ))}
        </div>
        {msg.id === 'initial-message' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAllToolsOpen(true)} 
            disabled={isLoading}
            className="w-full border-2 hover:bg-accent"
          >
            Ver todas las herramientas
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
    )
  }

  // --- MAIN RENDER ---

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 z-50 p-0" aria-label="Abrir chat de asistente de IA">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707M12 21v-1m0-16a9 9 0 110 18 9 9 0 010-18z" /></svg>
          </Button>
        </DialogTrigger>
        <DialogContent className="flex flex-col h-[90vh] max-w-[90vw] md:max-w-3xl">
          <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <DialogTitle>Asistente de Contratos IA</DialogTitle>
              <DialogDescription>Analiza documentos, imágenes o genera un contrato desde cero.</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={clearChat} aria-label="Limpiar chat">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.181m0-4.991-3.181 3.181m0 0h4.992m-4.993 0 3.181 3.181m0-4.991-3.181 3.181" /></svg>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
          </DialogHeader>

          {/* Quick Actions Panel */}
          <div className="px-4 py-3 border-b bg-gradient-to-r from-muted/30 to-muted/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Acciones Rápidas
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAllToolsOpen(true)}
                className="h-7 text-xs hover:bg-primary/10"
              >
                Ver todas
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickStartTools.map((tool, i) => {
                const colors = [
                  'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950',
                  'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950',
                  'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950',
                  'hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950',
                ];
                return (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(tool.prompt)}
                    disabled={isLoading}
                    className={`justify-start h-auto py-2.5 px-3 text-left transition-all duration-200 hover:scale-[1.02] ${colors[i % colors.length]}`}
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="text-xs font-semibold">{tool.name}</span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">{tool.description}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 py-4 overflow-y-auto">
            <div className="px-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col items-start gap-2 ${msg.isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-end gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'} w-full`}>
                      <div className={`px-4 py-3 rounded-lg max-w-xs md:max-w-md ${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <MessageFile msg={msg} />
                        <ActionIndicators actions={msg.actions} />
                        <div className="prose prose-sm max-w-none text-current" dangerouslySetInnerHTML={{ __html: (msg.text || '').replace(/\n/g, '<br />') }} />
                        <SuggestionButtons msg={msg} />
                      </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="px-4 py-3 rounded-lg bg-muted max-w-xs md:max-w-md">
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-medium">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Pensando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <div className="flex flex-col w-full gap-2">
              {file && <FilePreview fileData={file} />}
              <form onSubmit={handleFormSubmit} className="flex items-center w-full gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe un mensaje o adjunta un archivo..." disabled={isLoading} className="flex-1" />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf,.xlsx,.xls,.csv" className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></Button>
                <Button type="submit" disabled={isLoading || (!input.trim() && !file)}>Enviar</Button>
              </form>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAllToolsOpen} onOpenChange={setIsAllToolsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">🤖 Todas las Herramientas de MVPX AI</DialogTitle>
            <DialogDescription>Selecciona cualquier acción para que el asistente te ayude</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4 overflow-y-auto max-h-[calc(85vh-120px)]">
            {allTools.map((category, index) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.tools.map(tool => (
                    <Button 
                      key={tool.name} 
                      variant="outline" 
                      className="justify-start text-left h-auto p-4 hover:bg-accent hover:text-accent-foreground hover:border-primary transition-all" 
                      onClick={() => { 
                        handleSuggestionClick(tool.prompt); 
                        setIsAllToolsOpen(false); 
                      }}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="mt-0.5">
                          <ToolIcon />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-sm">{tool.name}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">{tool.description}</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                {index < allTools.length - 1 && <Separator className="mt-6" />} 
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIContractChat;
