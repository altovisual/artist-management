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
import Image from "next/image";

interface Message {
  text: string;
  isUser: boolean;
  image?: string; // Base64 string for image preview
  file?: {      // File metadata for display
    name: string;
    type: string;
  }
}

const AIContractChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
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
    setMessages([]);
    setInput("");
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        setFile({
          data: base64,
          mimeType: selectedFile.type,
          name: selectedFile.name,
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    const userMessage: Message = { 
      text: input, 
      isUser: true,
      image: file?.mimeType.startsWith('image/') ? file.data : undefined,
      file: file ? { name: file.name, type: file.mimeType } : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setFile(null); // Clear preview immediately

    const payload: any = {
      prompt: input,
      history: messages.map(m => ({...m, image: undefined, file: undefined})), // Don't send previews in history
    };

    if (file) {
      payload.file = file.data; // Send the full data URL
    }
    
    try {
      const response = await fetch("/api/ai/contract-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) // Catch if JSON parsing fails
        throw new Error(errorData.error || "La respuesta de la red no fue correcta");
      }

      const data = await response.json();
      const aiMessage: Message = { text: data.response, isUser: false };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      console.error("Failed to fetch AI response:", error);
      const errorMessage: Message = {
        text: `Error: ${error.message}`,
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  };

  const FilePreview = ({ fileData }: { fileData: { data: string; mimeType: string; name: string; }}) => {
    if (fileData.mimeType.startsWith('image/')) {
      return <Image src={fileData.data} alt="Vista previa" width={80} height={80} className="rounded-md"/>;
    }
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <span className="text-sm text-muted-foreground truncate max-w-[150px]">{fileData.name}</span>
      </div>
    );
  };

  const MessageFile = ({ msg }: { msg: Message }) => {
    if (msg.image) {
      return <Image src={msg.image} alt="Imagen de usuario" width={200} height={200} className="rounded-md mb-2"/>
    }
    if (msg.file) {
      return (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-background my-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="text-sm text-foreground truncate">{msg.file.name}</span>
        </div>
      )
    }
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 z-50 p-0"
          aria-label="Abrir chat de asistente de IA"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707M12 21v-1m0-16a9 9 0 110 18 9 9 0 010-18z" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col h-[90vh] max-w-[90vw] md:max-w-2xl">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <DialogTitle>Asistente de Contratos IA</DialogTitle>
            <DialogDescription>
              Analiza documentos, imágenes o genera un contrato desde cero.
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={clearChat} aria-label="Limpiar chat">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.181m0-4.991-3.181 3.181m0 0h4.992m-4.993 0 3.181 3.181m0-4.991-3.181 3.181" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col items-start gap-2 ${msg.isUser ? 'items-end' : 'items-start'}`}>
                 <div className={`flex items-end gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'} w-full`}>
                    <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md ${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <MessageFile msg={msg} />
                      {msg.text}
                    </div>
                 </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="px-4 py-2 rounded-lg bg-muted animate-pulse">
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <div className="flex flex-col w-full gap-2">
            {file && (
              <div className="relative self-start mb-2">
                <FilePreview fileData={file} />
                <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground" onClick={() => setFile(null)}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </Button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje o adjunta un archivo..."
                disabled={isLoading}
                className="flex-1"
              />
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf,.xlsx,.xls,.csv" className="hidden" />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </Button>
              <Button type="submit" disabled={isLoading || (!input.trim() && !file)}>Enviar</Button>
            </form>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIContractChat;
