import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuthBootstrap } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { registerPwa } from "@/lib/pwa";

export function AppShell({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => { registerPwa(); }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header onLogin={() => setAuthOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <Toaster theme="dark" richColors position="top-right" />
      <InstallBanner />
    </div>
  );
}
