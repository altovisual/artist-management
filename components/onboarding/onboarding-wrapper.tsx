"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingFlow } from "./onboarding-flow";
import { LogoLoader } from "@/components/logo-loader";

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const { isLoading, needsOnboarding } = useOnboarding();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LogoLoader text="Cargando..." size="md" />
      </div>
    );
  }

  if (needsOnboarding) {
    return <OnboardingFlow />;
  }

  return <>{children}</>;
}
