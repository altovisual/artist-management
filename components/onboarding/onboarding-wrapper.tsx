"use client";

import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingFlow } from "./onboarding-flow";
import { Loader2 } from "lucide-react";

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { isLoading, needsOnboarding } = useOnboarding();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return <OnboardingFlow />;
  }

  return <>{children}</>;
}
