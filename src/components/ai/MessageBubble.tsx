import type { ReactNode } from "react";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function renderMarkdown(text: string) {
  // tiny markdown: **bold**, *italic*, line breaks, bullets
  const parts: ReactNode[] = [];
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const rendered: ReactNode[] = [];
    const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    tokens.forEach((tok, j) => {
      if (tok.startsWith("**") && tok.endsWith("**")) rendered.push(<strong key={`${i}-${j}`}>{tok.slice(2, -2)}</strong>);
      else if (tok.startsWith("*") && tok.endsWith("*") && tok.length > 2) rendered.push(<em key={`${i}-${j}`}>{tok.slice(1, -1)}</em>);
      else rendered.push(tok);
    });
    const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
    parts.push(
      <div key={i} className={cn(isBullet && "pl-3")}>{rendered.length ? rendered : <>&nbsp;</>}</div>
    );
  });
  return parts;
}

export function ChatMessage({
  role, content, time, sender, senderColor, delivered = true, read = true,
}: {
  role: "user" | "assistant";
  content: string;
  time: string;
  sender?: string;
  senderColor?: string;
  delivered?: boolean;
  read?: boolean;
}) {
  const isMe = role === "user";
  return (
    <div className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[80%] rounded-lg px-3 py-2 shadow-sm",
          isMe ? "rounded-tr-none bg-[#005C4B] text-[#E9EDEF]" : "rounded-tl-none bg-[#202C33] text-[#E9EDEF]"
        )}
      >
        {!isMe && sender && (
          <div className="mb-1 text-xs font-semibold" style={{ color: senderColor || "#06CF9C" }}>{sender}</div>
        )}
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{renderMarkdown(content)}</div>
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#8696A0]">
          <span>{time}</span>
          {isMe && (read ? <CheckCheck className="h-3 w-3 text-[#53BDEB]" /> : delivered ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex items-center gap-1 rounded-lg rounded-tl-none bg-[#202C33] px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#8696A0] [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#8696A0] [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#8696A0]" />
      </div>
    </div>
  );
}