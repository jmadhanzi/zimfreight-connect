import { Link } from "@tanstack/react-router";
import { Search, Plus, Bot, BarChart3, ArrowRight } from "lucide-react";

const ACTIONS = [
  {
    to: "/board" as const,
    label: "Find Loads",
    desc: "Browse 800+ live loads",
    icon: Search,
    accent: "primary" as const,
  },
  {
    to: "/post" as const,
    label: "Post a Load",
    desc: "Reach 850+ carriers",
    icon: Plus,
    accent: "secondary" as const,
  },
  {
    to: "/ai-agent" as const,
    label: "AI Agent",
    desc: "WhatsApp dispatch",
    icon: Bot,
    accent: "info" as const,
  },
  {
    to: "/dashboard" as const,
    label: "Rate Check",
    desc: "Live $/km market data",
    icon: BarChart3,
    hash: "rates",
    accent: "success" as const,
  },
];

const ACCENT_CLASSES = {
  primary: { bg: "bg-primary/10", text: "text-primary", ring: "border-primary/20" },
  secondary: { bg: "bg-secondary/15", text: "text-secondary", ring: "border-secondary/25" },
  info: {
    bg: "bg-[color-mix(in_oklab,var(--info)_15%,transparent)]",
    text: "text-[color:var(--info)]",
    ring: "border-[color-mix(in_oklab,var(--info)_25%,transparent)]",
  },
  success: {
    bg: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)]",
    text: "text-[color:var(--success)]",
    ring: "border-[color-mix(in_oklab,var(--success)_25%,transparent)]",
  },
};

export function QuickActions() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {ACTIONS.map((a) => {
        const tone = ACCENT_CLASSES[a.accent];
        const Icon = a.icon;
        return (
          <Link
            key={a.label}
            to={a.to}
            hash={a.hash}
            className="hover-lift group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 transition-colors hover:border-foreground/15"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-bold tracking-tight text-foreground">
                {a.label}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">{a.desc}</div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        );
      })}
    </div>
  );
}
