import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai-agent")({
  head: () => ({ meta: [{ title: "WhatsApp AI Agent — ZimFreight" }, { name: "description", content: "Match loads via WhatsApp with our AI agent." }] }),
  component: WaAgentPage,
});

function WaAgentPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-display text-5xl font-black uppercase tracking-tight">WhatsApp AI Agent</h1>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
        Coming soon for Pro+ subscribers. Get matched to loads, negotiate rates and send pickup confirmations — all from WhatsApp.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90"><Link to="/pricing">See Pro plan</Link></Button>
        <Button asChild variant="outline"><Link to="/board">Browse loads</Link></Button>
      </div>
      <div className="mx-auto mt-12 max-w-md rounded-lg border border-border bg-card p-5 text-left">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5 text-[color:var(--success)]" /> Sample chat
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-lg rounded-bl-none bg-background/40 p-2.5">Hey ZimFreight, find me a load Bulawayo → Joburg before Friday.</div>
          <div className="rounded-lg rounded-br-none bg-primary/15 p-2.5 text-foreground">
            Found 3 matches. Best: BYO → JNB, 32t containers, $2,400 (avg $/km $1.78), pickup Thursday. Reply <b>BOOK 1</b> to confirm.
          </div>
        </div>
      </div>
    </div>
  );
}
