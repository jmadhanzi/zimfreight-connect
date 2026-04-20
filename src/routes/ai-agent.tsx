import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PLAN_LEVEL, type PlanTier } from "@/types";
import { ChatSidebar } from "@/components/ai/Sidebar";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { GroupChatPanel } from "@/components/ai/GroupChatPanel";
import { UpgradeGate } from "@/components/ai/UpgradeGate";
import { THREADS } from "@/components/ai/groupChatData";

export const Route = createFileRoute("/ai-agent")({
  head: () => ({
    meta: [
      { title: "WhatsApp AI Dispatch Agent — ZimFreight" },
      { name: "description", content: "Your 24/7 AI freight dispatcher for Zimbabwe. Find loads, check rates, ZIMRA help, border updates." },
      { property: "og:title", content: "ZimFreight AI Dispatch — Powered by Claude" },
      { property: "og:description", content: "Chat with the most knowledgeable freight assistant in Zimbabwe." },
    ],
  }),
  component: AiAgentPage,
});

function AiAgentPage() {
  const { subscription, loading, user } = useAuth();
  const [activeId, setActiveId] = useState("ai");

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <UpgradeGate />;

  const plan: PlanTier = (subscription?.plan as PlanTier) ?? "free";
  if (PLAN_LEVEL[plan] < PLAN_LEVEL.pro) return <UpgradeGate />;

  const activeThread = THREADS.find((t) => t.id === activeId) ?? THREADS[0];

  return (
    <div className="flex h-[calc(100vh-4rem-4px)] w-full bg-[#0B141A]">
      <ChatSidebar active={activeId} onSelect={setActiveId} />
      <main className="flex-1 overflow-hidden">
        {activeThread.type === "ai" ? <AiChatPanel /> : <GroupChatPanel thread={activeThread} />}
      </main>
    </div>
  );
}
