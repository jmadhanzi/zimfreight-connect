import { Link } from "@tanstack/react-router";
import { Search, Plus, Bot, BarChart3, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    to: "/board" as const,
    label: "Find Loads",
    desc: "Browse 800+ live loads",
    icon: Search,
  },
  {
    to: "/post" as const,
    label: "Post a Load",
    desc: "Reach 850+ carriers",
    icon: Plus,
  },
  {
    to: "/ai-agent" as const,
    label: "AI Agent",
    desc: "WhatsApp dispatch",
    icon: Bot,
  },
  {
    to: "/dashboard" as const,
    label: "Rate Check",
    desc: "Live $/km market data",
    icon: BarChart3,
    hash: "rates",
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.label}
            to={a.to}
            hash={a.hash}
            className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 transition-all duration-200 hover:border-foreground/15 hover:shadow-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">{a.label}</div>
              <div className="truncate text-xs text-muted-foreground">{a.desc}</div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        );
      })}
    </div>
  );
}
