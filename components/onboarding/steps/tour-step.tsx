"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Music,
  TrendingUp,
  FileText,
  DollarSign,
  Settings,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Play,
} from "lucide-react";
import { GuidedTour } from "../guided-tour";

interface TourStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function TourStep({ onComplete, onBack }: TourStepProps) {
  const router = useRouter();
  const [showGuidedTour, setShowGuidedTour] = useState(false);

  const features = [
    {
      icon: Music,
      title: "Tus Artistas",
      description: "Visualiza perfiles completos con toda la información de tus artistas",
      path: "/dashboard",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Visualiza métricas de Spotify, Muso.AI y análisis de streaming",
      path: "/dashboard/analytics",
    },
    {
      icon: DollarSign,
      title: "Finanzas",
      description: "Visualiza ingresos, gastos y transacciones de tus artistas",
      path: "/dashboard/finance",
    },
    {
      icon: Settings,
      title: "Perfil",
      description: "Personaliza tu perfil y preferencias de la plataforma",
      path: "/artists/my-profile",
    },
  ];

  const handleFeatureClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="space-y-6">
      {showGuidedTour && <GuidedTour onComplete={onComplete} />}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">¡Todo Listo!</h2>
        <p className="text-muted-foreground">
          Explora las principales funcionalidades de la plataforma
        </p>

        {/* Guided Tour Button */}
        <Button
          onClick={() => setShowGuidedTour(true)}
          size="lg"
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Play className="w-5 h-5" />
          Iniciar Tour Guiado Interactivo
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.path}
              onClick={() => handleFeatureClick(feature.path)}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer text-left w-full"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </button>
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
              Explora Analytics para ver métricas de Spotify de tus artistas en tiempo real
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Revisa el dashboard para ver un resumen de todos tus proyectos y lanzamientos
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Mantén un control de tus finanzas y transacciones musicales desde Finanzas
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Personaliza tu perfil para una mejor experiencia en la plataforma
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
