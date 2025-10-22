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
    {
      id: "tour",
      title: "Tour Guiado",
      description: "Explora las funcionalidades",
      completed: false,
    },
  ]);
  const router = useRouter();

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
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
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
