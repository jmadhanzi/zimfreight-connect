import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, Trash2, MoreVertical, WifiOff } from "lucide-react";
import { ChatMessage, TypingIndicator } from "./MessageBubble";
import { QUICK_ACTIONS, QUICK_PROMPTS } from "./groupChatData";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface Msg { id: string; role: "user" | "assistant"; content: string; created_at: string }

const WELCOME: Msg = {
  id: "welcome",
  role: "assistant",
  created_at: new Date().toISOString(),
  content: `🇿🇼 **Sawubona! Welcome to ZimFreight AI Dispatch**

I'm your personal freight dispatcher powered by Claude AI. I can help you:

• 🔍 Find loads on any Zimbabwe route
• 💰 Real-time rate benchmarks ($/km)
• 🛃 Beit Bridge & border crossing guidance
• 📋 ZIMRA documentation checklist
• 🗺️ Optimal routes and stopovers
• 📱 Load recommendations for your truck type

What do you need today? Type below or tap a quick button 👇`,
};

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function AiChatPanel() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [typing, setTyping] = useState(false);
  const online = useNetworkStatus();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Load history
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await db
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (data && data.length) setMessages([WELCOME, ...data as Msg[]]);
    })();
  }, [user]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const persist = async (m: Pick<Msg, "role" | "content">) => {
    if (!user) return;
    await db.from("ai_conversations").insert({ user_id: user.id, role: m.role, content: m.content });
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setMessages((p) => [...p, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `📵 **Requires internet** — I can't reach the dispatcher while you're offline.\n\n**Tips while offline:**\n• Browse cached loads on the board\n• Save your draft load — it'll post when you reconnect\n• Check the offline ZIMRA checklist (saved on this device)\n\nI'll be back the moment your connection returns.`,
        created_at: new Date().toISOString(),
      }]);
      return;
    }
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed, created_at: new Date().toISOString() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setStreaming(true);
    setTyping(true);
    persist(userMsg);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-dispatch`;
      const apiMessages = messages.filter((m) => m.id !== "welcome").concat(userMsg).map(({ role, content }) => ({ role, content }));
      // Fetch the current session token so the edge function (verify_jwt=true) accepts the request.
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentSession?.access_token
            ? { "Authorization": `Bearer ${currentSession.access_token}` }
            : {}),
        },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${resp.status})`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assembled = "";
      const aId = crypto.randomUUID();
      let appended = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json || json === "[DONE]") continue;
          try {
            const { text } = JSON.parse(json);
            if (!text) continue;
            assembled += text;
            if (typing) setTyping(false);
            if (!appended) {
              appended = true;
              setMessages((p) => [...p, { id: aId, role: "assistant", content: assembled, created_at: new Date().toISOString() }]);
            } else {
              setMessages((p) => p.map((m) => (m.id === aId ? { ...m, content: assembled } : m)));
            }
          } catch { /* partial */ }
        }
      }
      if (assembled) persist({ role: "assistant", content: assembled });
    } catch (e) {
      setMessages((p) => [...p, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ Sorry, I couldn't reach the dispatcher right now.\n\n${e instanceof Error ? e.message : "Please try again."}`,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setStreaming(false);
      setTyping(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const clear = async () => {
    if (!user) return;
    if (!confirm("Clear entire conversation? This cannot be undone.")) return;
    await db.from("ai_conversations").delete().eq("user_id", user.id);
    setMessages([WELCOME]);
    toast.success("Conversation cleared");
  };

  return (
    <div className="flex h-full flex-col bg-[#0B141A]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-[#222D34] bg-[#202C33] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06CF9C] text-[#0B141A]">🤖</div>
          <div>
            <div className="text-sm font-medium text-[#E9EDEF]">ZimFreight Dispatch AI</div>
            <div className="text-[11px] text-[#8696A0]">
              {!online ? <span className="inline-flex items-center gap-1 text-orange-400"><WifiOff className="h-3 w-3" /> offline</span>
                : typing ? "typing..." : "online"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8 text-[#8696A0] hover:bg-[#2A3942] hover:text-white">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8696A0] hover:bg-[#2A3942] hover:text-white">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto bg-[#0B141A] px-4 py-4"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
        <div className="mx-auto flex max-w-3xl flex-col gap-2.5">
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              role={m.role}
              content={m.content}
              time={fmtTime(m.created_at)}
              sender={m.role === "assistant" ? "ZimFreight AI" : undefined}
              senderColor="#06CF9C"
            />
          ))}
          {typing && <TypingIndicator />}
        </div>
      </div>

      {/* quick actions */}
      <div className="border-t border-[#222D34] bg-[#0B141A] px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((q) => (
            <button
              key={q}
              disabled={streaming}
              onClick={() => send(QUICK_PROMPTS[q] || q)}
              className="shrink-0 rounded-full border border-[#2A3942] bg-[#202C33] px-3 py-1.5 text-xs text-[#E9EDEF] transition-colors hover:bg-[#2A3942] disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* input */}
      <div className="flex items-end gap-2 border-t border-[#222D34] bg-[#202C33] px-3 py-3">
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#8696A0] hover:bg-[#2A3942] hover:text-white">
          <Paperclip className="h-5 w-5" />
        </button>
        <textarea
          ref={taRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a message"
          className="max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border-none bg-[#2A3942] px-4 py-2.5 text-sm text-[#E9EDEF] outline-none placeholder:text-[#8696A0] focus:ring-0"
          style={{ height: Math.min(Math.max(40, input.split("\n").length * 20 + 20), 128) }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || streaming}
          className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#06CF9C] text-[#0B141A] transition-opacity",
            (!input.trim() || streaming) && "opacity-40")}
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}