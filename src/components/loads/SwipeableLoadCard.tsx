import { useRef, useState } from "react";
import { Bookmark, EyeOff } from "lucide-react";
import { LoadCard } from "./LoadCard";
import type { Load } from "@/types";
import { cn } from "@/lib/utils";

/** Mobile load card with horizontal swipe gestures.
 *  Right (>+90px) = save, Left (<-90px) = hide. */
export function SwipeableLoadCard({
  load,
  saved,
  onClick,
  onSave,
  onHide,
}: {
  load: Load;
  saved: boolean;
  onClick: () => void;
  onSave: () => void;
  onHide: () => void;
}) {
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);

  const THRESHOLD = 90;

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = true;
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || startX.current == null || startY.current == null) return;
    const dxNow = e.clientX - startX.current;
    const dyNow = e.clientY - startY.current;
    // ignore vertical scrolls
    if (!moved.current && Math.abs(dyNow) > Math.abs(dxNow)) {
      dragging.current = false;
      return;
    }
    if (Math.abs(dxNow) > 6) moved.current = true;
    setDx(dxNow);
  };
  const finish = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dx > THRESHOLD) onSave();
    else if (dx < -THRESHOLD) onHide();
    setDx(0);
    startX.current = null;
    startY.current = null;
    setTimeout(() => {
      moved.current = false;
    }, 50);
  };

  const handleClick = () => {
    if (moved.current) return;
    onClick();
  };

  const revealRight = dx > 0;
  const revealLeft = dx < 0;
  const intensity = Math.min(1, Math.abs(dx) / THRESHOLD);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Save action (revealed when swiping right) */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 flex w-1/2 items-center justify-start gap-2 px-5 font-mono text-xs font-bold uppercase tracking-[0.16em] transition-opacity",
          "bg-[color:var(--success)]/15 text-[color:var(--success)]",
        )}
        style={{ opacity: revealRight ? intensity : 0 }}
      >
        <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
        <span>{saved ? "Saved" : "Save"}</span>
      </div>
      {/* Hide action (revealed when swiping left) */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 flex w-1/2 items-center justify-end gap-2 bg-destructive/15 px-5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-destructive"
        style={{ opacity: revealLeft ? intensity : 0 }}
      >
        <span>Hide</span>
        <EyeOff className="h-5 w-5" />
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onPointerLeave={finish}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current ? "none" : "transform 200ms ease-out",
          touchAction: "pan-y",
        }}
        className="relative"
      >
        <LoadCard load={load} onClick={handleClick} />
      </div>
    </div>
  );
}
