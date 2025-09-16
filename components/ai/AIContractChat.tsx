"use client";

import { useState } from "react";
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

interface Message {
  text: string;
  isUser: boolean;
}

const AIContractChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/contract-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const aiMessage: Message = { text: data.response, isUser: false };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      const errorMessage: Message = {
        text: "Lo siento, no pude obtener una respuesta. Por favor, intenta de nuevo.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
              Pide crear o editar una cláusula, o generar un contrato desde cero.
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
              <div key={index} className={`flex items-end gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md ${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.text}
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
          </div>
        </div>

        <DialogFooter className="pt-4">
          <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Crear un contrato de management al 20%..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>Enviar</Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIContractChat;
