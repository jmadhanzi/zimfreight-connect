import { cn } from "@/lib/utils";
import { THREADS, type ChatThread } from "./groupChatData";

export function ChatSidebar({
  active, onSelect, unreadOverride,
}: { active: string; onSelect: (id: string) => void; unreadOverride?: Record<string, number> }) {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border-r border-[#222D34] bg-[#111B21] text-white md:flex">
      <div className="flex items-center justify-between border-b border-[#222D34] px-4 py-3">
        <div>
          <div className="font-display text-sm font-bold uppercase tracking-widest">ZimFreight AI</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#8696A0]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#06CF9C] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#06CF9C]" />
            </span>
            Online · Claude
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {THREADS.map((t) => (
          <ThreadRow
            key={t.id} t={t}
            unread={unreadOverride?.[t.id] ?? t.unread}
            active={active === t.id}
            onClick={() => onSelect(t.id)}
          />
        ))}
      </div>
    </aside>
  );
}

function ThreadRow({ t, active, unread, onClick }: { t: ChatThread; active: boolean; unread: number; onClick: () => void }) {
  const initials = t.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["bg-[#06CF9C]", "bg-[#FFB13B]", "bg-[#53BDEB]", "bg-[#FF6B6B]", "bg-[#A78BFA]", "bg-[#F472B6]", "bg-[#FCD34D]"];
  const color = colors[(t.name.charCodeAt(0) + t.name.length) % colors.length];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-[#1a242b] px-3 py-3 text-left transition-colors hover:bg-[#202C33]",
        active && "bg-[#2A3942]"
      )}
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#0B141A]", color)}>
        {t.type === "ai" ? "🤖" : initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate text-sm font-medium text-[#E9EDEF]">{t.emoji} {t.name}</div>
          <div className="shrink-0 text-[10px] text-[#8696A0]">{t.time}</div>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="truncate text-xs text-[#8696A0]">{t.preview}</div>
          {unread > 0 && (
            <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#06CF9C] px-1.5 text-[10px] font-bold text-[#0B141A]">
              {unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}