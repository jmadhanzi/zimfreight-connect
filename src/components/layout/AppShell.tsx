import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuthBootstrap } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { registerPwa } from "@/lib/pwa";
import { ExitIntentPopup } from "@/components/conversion/ExitIntentPopup";
import { SocialProofToasts } from "@/components/conversion/SocialProofToasts";
import { OfflineBanner } from "@/components/offline/OfflineBanner";

export function AppShell({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => { registerPwa(); }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <OfflineBanner />
      <Header onLogin={() => setAuthOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <Toaster theme="dark" richColors position="top-right" />
      <InstallBanner />
      <ExitIntentPopup />
      <SocialProofToasts />
    </div>
  );
}
