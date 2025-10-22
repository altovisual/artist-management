"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Music, TrendingUp, Users, ChevronRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold">
          ¡Bienvenido a Artist Management!
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          La plataforma completa para gestionar tu carrera musical. Controla tus
          artistas, contratos, finanzas y mucho más en un solo lugar.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <FeatureCard
          icon={Music}
          title="Gestión de Artistas"
          description="Administra perfiles completos con información detallada, redes sociales y métricas de streaming."
        />
        <FeatureCard
          icon={TrendingUp}
          title="Analytics Avanzado"
          description="Visualiza métricas de Spotify, Muso.AI y análisis financiero en tiempo real."
        />
        <FeatureCard
          icon={Users}
          title="Contratos Digitales"
          description="Crea, firma y gestiona contratos con firmas digitales integradas con Auco."
        />
        <FeatureCard
          icon={Sparkles}
          title="Colaboración en Equipo"
          description="Trabaja con tu equipo, asigna roles y gestiona proyectos colaborativamente."
        />
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={onNext} className="gap-2">
          Comenzar
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/20 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
