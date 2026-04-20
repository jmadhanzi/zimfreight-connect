import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Truck, Loader2, Eye, EyeOff, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import type { UserRole } from "@/types";

type Mode = "signin" | "signup";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});

const signUpSchema = z.object({
  full_name: z.string().min(2, "Enter your full name").max(80),
  email: z.string().email("Enter a valid email"),
  phone_whatsapp: z.string().min(7, "Enter your WhatsApp number").max(20),
  password: z.string().min(6, "Min 6 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export function AuthModal({ open, onOpenChange, defaultMode = "signin" }: { open: boolean; onOpenChange: (b: boolean) => void; defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [role, setRole] = useState<UserRole>("carrier");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { full_name: "", email: "", phone_whatsapp: "+263 ", password: "" },
  });

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (result.redirected) return; // redirecting to Google
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignIn = async (v: SignInValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
      if (error) throw error;
      toast.success("Welcome back");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
    } finally { setLoading(false); }
  };

  const onSignUp = async (v: SignUpValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: v.email,
        password: v.password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: { full_name: v.full_name, phone_whatsapp: v.phone_whatsapp, role },
        },
      });
      if (error) throw error;
      toast.success("Account created — let's set you up");
      onOpenChange(false);
      navigate({ to: "/onboarding" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-up failed");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <DialogTitle className="font-display text-2xl font-black uppercase tracking-tight">
              {mode === "signin" ? "Sign in" : "Join ZimFreight"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === "signin" ? "Welcome back to Zimbabwe's load board." : "Find loads, fill your truck, get paid."}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-md bg-background/50 p-1">
          <button onClick={() => setMode("signup")} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors", mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>Sign up</button>
          <button onClick={() => setMode("signin")} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors", mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>Log in</button>
        </div>

        {mode === "signup" ? (
          <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-3">
            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-2">
              <RoleButton active={role === "carrier"} onClick={() => setRole("carrier")} icon={<Truck className="h-4 w-4" />} label="Carrier / Driver" />
              <RoleButton active={role === "broker"} onClick={() => setRole("broker")} icon={<Package className="h-4 w-4" />} label="Broker / Shipper" />
            </div>

            <Field label="Full name" error={signUpForm.formState.errors.full_name?.message}>
              <Input placeholder="Tendai Moyo" {...signUpForm.register("full_name")} />
            </Field>
            <Field label="WhatsApp number" error={signUpForm.formState.errors.phone_whatsapp?.message}>
              <Input placeholder="+263 77 123 4567" {...signUpForm.register("phone_whatsapp")} />
            </Field>
            <Field label="Email" error={signUpForm.formState.errors.email?.message}>
              <Input type="email" placeholder="you@company.co.zw" {...signUpForm.register("email")} />
            </Field>
            <Field label="Password" error={signUpForm.formState.errors.password?.message}>
              <PasswordInput show={showPwd} onToggle={() => setShowPwd(!showPwd)} {...signUpForm.register("password")} />
            </Field>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account →
            </Button>
          </form>
        ) : (
          <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-3">
            <Field label="Email" error={signInForm.formState.errors.email?.message}>
              <Input type="email" placeholder="you@company.co.zw" {...signInForm.register("email")} />
            </Field>
            <Field label="Password" error={signInForm.formState.errors.password?.message}>
              <PasswordInput show={showPwd} onToggle={() => setShowPwd(!showPwd)} {...signInForm.register("password")} />
            </Field>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in →
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-1 flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          Continue with Google
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          By {mode === "signup" ? "signing up" : "signing in"} you agree to our Terms. Your data is stored securely.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PasswordInput({ show, onToggle, ...rest }: { show: boolean; onToggle: () => void } & React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} placeholder="••••••••" {...rest} />
      <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function RoleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "flex flex-col items-center gap-1 rounded-md border px-3 py-3 text-sm font-medium transition-all",
      active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/40 text-muted-foreground hover:border-primary/40"
    )}>
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", active ? "bg-primary text-primary-foreground" : "bg-secondary")}>{icon}</span>
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}