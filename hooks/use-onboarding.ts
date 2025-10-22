"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "welcome",
      title: "Bienvenido",
      description: "Conoce la plataforma",
      completed: false,
    },
    {
      id: "profile",
      title: "Tu Perfil",
      description: "Configura tu información",
      completed: false,
    },
    {
      id: "first-artist",
      title: "Primer Artista",
      description: "Agrega tu primer artista",
      completed: false,
    },
  ]);
  const router = useRouter();

  // Load saved progress from localStorage
  useEffect(() => {
    const savedStep = localStorage.getItem("onboarding_current_step");
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, []);

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem("onboarding_current_step", currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Verificar si el usuario es admin
      const { data: isAdminData, error: adminError } = await supabase.rpc(
        "is_admin"
      );

      // Si es admin, no mostrar onboarding
      if (isAdminData === true) {
        console.log("User is admin, skipping onboarding");
        setIsLoading(false);
        return;
      }

      // Verificar si existe el perfil del usuario
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // No existe el perfil, crear uno
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            onboarding_completed: false,
          });

        if (!insertError) {
          setNeedsOnboarding(true);
        }
      } else if (profile && !profile.onboarding_completed) {
        setNeedsOnboarding(true);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setIsLoading(false);
    }
  };

  const completeStep = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const skipOnboarding = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from("user_profiles")
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      setNeedsOnboarding(false);
      router.refresh();
    } catch (error) {
      console.error("Error skipping onboarding:", error);
    }
  };

  const completeOnboarding = async () => {
    console.log("🎉 Completando onboarding...");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("❌ No user found en completeOnboarding");
        return;
      }

      console.log("👤 Actualizando user_profiles para usuario:", user.id);

      const { error } = await supabase
        .from("user_profiles")
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("❌ Error actualizando user_profiles:", error);
      } else {
        console.log("✅ user_profiles actualizado");
      }

      // Clear localStorage data
      console.log("🧹 Limpiando localStorage...");
      localStorage.removeItem("onboarding_current_step");
      localStorage.removeItem("onboarding_profile_data");

      setNeedsOnboarding(false);
      
      // Navegar al dashboard y marcar que debe iniciar el tour
      console.log("🚀 Configurando flag para tour guiado");
      localStorage.setItem("start_guided_tour", "true");
      
      console.log("🏠 Navegando a /dashboard");
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Error completing onboarding:", error);
    }
  };

  return {
    isLoading,
    needsOnboarding,
    currentStep,
    steps,
    completeStep,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  };
}
