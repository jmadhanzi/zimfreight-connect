import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./MessageBubble";
import type { ChatThread } from "./groupChatData";

export function GroupChatPanel({ thread }: { thread: ChatThread }) {
  return (
    <div className="flex h-full flex-col bg-[#0B141A]">
      <div className="flex items-center justify-between border-b border-[#222D34] bg-[#202C33] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A3942] text-lg">{thread.emoji}</div>
          <div>
            <div className="text-sm font-medium text-[#E9EDEF]">{thread.name}</div>
            <div className="text-[11px] text-[#8696A0]">
              {thread.type === "group" ? "Group chat" : thread.type === "border" ? "Border updates" : thread.type === "rate" ? "Rate alerts" : "Notifications"}
            </div>
          </div>
        </div>
        {thread.joinUrl && (
          <Button asChild size="sm" className="bg-[#06CF9C] text-[#0B141A] hover:bg-[#06CF9C]/90">
            <a href={thread.joinUrl} target="_blank" rel="noreferrer">
              Join on WhatsApp <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
        <div className="mx-auto flex max-w-3xl flex-col gap-2.5">
          {thread.messages.map((m) => (
            <ChatMessage
              key={m.id}
              role="assistant"
              sender={m.sender}
              senderColor={m.color}
              content={m.content}
              time={m.time}
            />
          ))}
          <div className="mt-4 rounded-md border border-[#2A3942] bg-[#202C33] p-3 text-center text-xs text-[#8696A0]">
            🔒 This is a read-only preview. Tap "Join on WhatsApp" above to participate.
          </div>
        </div>
      </div>
    </div>
  );
}