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
import { MobileBottomNav } from "./MobileBottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => { registerPwa(); }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <OfflineBanner />
      {import.meta.env.DEV && (
        <div className="bg-primary/15 px-3 py-1 text-center font-mono text-[10px] uppercase tracking-widest text-primary">
          ⚡ Dev bypass · Fleet tier + admin role · all gates open
        </div>
      )}
      <Header onLogin={() => setAuthOpen(true)} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <div className="hidden md:block"><Footer /></div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <Toaster theme="light" richColors position="top-right" />
      <InstallBanner />
      <ExitIntentPopup />
      <SocialProofToasts />
      <MobileBottomNav />
    </div>
  );
}
