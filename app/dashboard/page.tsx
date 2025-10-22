import { Dashboard } from "./dashboard";
import { DashboardLayout } from "@/components/dashboard-layout";
import { OnboardingWrapper } from "@/components/onboarding/onboarding-wrapper";

export default function DashboardPage() {
  return (
    <OnboardingWrapper>
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    </OnboardingWrapper>
  );
}