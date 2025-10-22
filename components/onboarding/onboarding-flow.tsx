"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  User,
  Music,
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { WelcomeStep } from "./steps/welcome-step";
import { ProfileStep } from "./steps/profile-step";
import { FirstArtistStep } from "./steps/first-artist-step";

const stepIcons = {
  welcome: Sparkles,
  profile: User,
  "first-artist": Music,
};

export function OnboardingFlow() {
  const {
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = stepIcons[currentStepData.id as keyof typeof stepIcons];

  const renderStep = () => {
    switch (currentStepData.id) {
      case "welcome":
        return <WelcomeStep onNext={nextStep} />;
      case "profile":
        return <ProfileStep onNext={nextStep} onBack={previousStep} />;
      case "first-artist":
        return <FirstArtistStep onNext={nextStep} onBack={previousStep} onComplete={completeOnboarding} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {currentStepData.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentStepData.description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipOnboarding}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => {
            const StepIcon = stepIcons[step.id as keyof typeof stepIcons];
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : index < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <StepIcon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <Card className="p-8 backdrop-blur-sm bg-card/95 border-primary/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={skipOnboarding}
            className="text-muted-foreground"
          >
            Saltar por ahora
          </Button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={previousStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
