"use client";

import { Button } from "@/components/ui/button";
import {
  Music,
  TrendingUp,
  FileText,
  Users,
  DollarSign,
  Settings,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";

interface TourStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function TourStep({ onComplete, onBack }: TourStepProps) {
  const features = [
    {
      icon: Music,
      title: "Gestión de Artistas",
      description: "Administra perfiles completos con toda la información de tus artistas",
      path: "/management/artists",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Visualiza métricas de Spotify, Muso.AI y análisis financiero",
      path: "/analytics",
    },
    {
      icon: FileText,
      title: "Contratos",
      description: "Crea y gestiona contratos con firmas digitales",
      path: "/management/contracts",
    },
    {
      icon: Users,
      title: "Participantes",
      description: "Gestiona escritores, productores y colaboradores",
      path: "/management/participants",
    },
    {
      icon: DollarSign,
      title: "Finanzas",
      description: "Control completo de ingresos, gastos y transacciones",
      path: "/finance",
    },
    {
      icon: Settings,
      title: "Configuración",
      description: "Personaliza tu perfil y preferencias de la plataforma",
      path: "/settings",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">¡Todo Listo!</h2>
        <p className="text-muted-foreground">
          Explora las principales funcionalidades de la plataforma
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.path}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/20 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          💡 Consejos Rápidos
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Conecta tu cuenta de Spotify en Analytics para ver métricas en tiempo real
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Usa el sistema de contratos para gestionar splits y derechos de autor
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Invita a tu equipo desde la sección de Team para colaborar
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Configura categorías financieras para un mejor control de gastos
            </span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          onClick={onComplete}
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          <CheckCircle2 className="w-5 h-5" />
          Ir al Dashboard
        </Button>
      </div>
    </div>
  );
}
