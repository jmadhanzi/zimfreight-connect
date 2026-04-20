import { Link } from "@tanstack/react-router";
import { Search, Plus, Bot, BarChart3 } from "lucide-react";

const ACTIONS = [
  { to: "/board" as const, label: "Find Loads", icon: Search },
  { to: "/post" as const, label: "Post a Load", icon: Plus },
  { to: "/ai-agent" as const, label: "AI Agent", icon: Bot },
  { to: "/dashboard" as const, label: "Rate Check", icon: BarChart3, hash: "rates" },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((a) => (
        <Link
          key={a.label}
          to={a.to}
          hash={a.hash}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
        >
          <a.icon className="h-4 w-4" />
          {a.label}
        </Link>
      ))}
    </div>
  );
}