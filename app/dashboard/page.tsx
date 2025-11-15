import { Dashboard } from "./dashboard";
import { DashboardLayout } from "@/components/dashboard-layout";
import { OnboardingWrapper } from "@/components/onboarding/onboarding-wrapper";
import { ArtistRedirectWrapper } from "@/components/artist-redirect-wrapper";

export default function DashboardPage() {
  return (
    <OnboardingWrapper>
      <ArtistRedirectWrapper>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </ArtistRedirectWrapper>
    </OnboardingWrapper>
  );
}