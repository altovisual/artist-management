"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Music, TrendingUp, Users, ChevronRight, FileText, DollarSign, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 shadow-xl shadow-primary/30"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          ¡Bienvenido a Artist Management!
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Gestiona tu carrera musical de forma profesional. <br className="hidden md:block" />
          <span className="font-semibold text-foreground">Todo lo que necesitas</span> para llevar tu música al siguiente nivel.
        </p>
        
        {/* Stats Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium">🎵 Gestión de Artistas</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <span className="text-sm font-medium">📊 Analytics en Tiempo Real</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20">
            <span className="text-sm font-medium">💼 Contratos Digitales</span>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
      >
        <FeatureCard
          icon={Music}
          title="Gestión de Artistas"
          description="Administra perfiles completos, redes sociales y métricas de streaming en un solo lugar."
          gradient="from-blue-500/10 to-cyan-500/10"
          borderColor="border-blue-500/20"
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
          delay={0.5}
        />
        <FeatureCard
          icon={BarChart3}
          title="Analytics en Tiempo Real"
          description="Visualiza métricas de Spotify, Muso.AI y análisis de rendimiento actualizados."
          gradient="from-purple-500/10 to-pink-500/10"
          borderColor="border-purple-500/20"
          iconBg="bg-purple-500/10"
          iconColor="text-purple-600"
          delay={0.6}
        />
        <FeatureCard
          icon={FileText}
          title="Contratos Digitales"
          description="Crea, firma y gestiona contratos profesionales con firmas digitales integradas."
          gradient="from-green-500/10 to-emerald-500/10"
          borderColor="border-green-500/20"
          iconBg="bg-green-500/10"
          iconColor="text-green-600"
          delay={0.7}
        />
        <FeatureCard
          icon={DollarSign}
          title="Control Financiero"
          description="Mantén un registro completo de ingresos, gastos y transacciones musicales."
          gradient="from-orange-500/10 to-red-500/10"
          borderColor="border-orange-500/20"
          iconBg="bg-orange-500/10"
          iconColor="text-orange-600"
          delay={0.8}
        />
      </motion.div>

      {/* CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="flex flex-col items-center gap-3 pt-4"
      >
        <Button 
          size="lg" 
          onClick={onNext} 
          className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity px-8 shadow-lg shadow-primary/20"
        >
          Comenzar
          <ChevronRight className="w-5 h-5" />
        </Button>
        <p className="text-xs text-muted-foreground">
          Solo tomará <span className="font-semibold text-foreground">2 minutos</span> configurar tu cuenta
        </p>
      </motion.div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  delay: number;
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  borderColor, 
  iconBg, 
  iconColor,
  delay 
}: FeatureCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`group p-5 rounded-xl bg-gradient-to-br ${gradient} border ${borderColor} hover:shadow-lg transition-all duration-300`}
    >
      <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
