"use client";

export default function TopBar({ subjectId }: { subjectId: string }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-[34px] items-center justify-between border-b border-border bg-surface2 px-[18px]">
      <div className="flex items-center gap-2 text-[9px] tracking-[0.22em] text-muted">
        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-accent anim-blink" />
        GLADOS CORE — CONVERSATION MONITOR
      </div>
      <div className="text-[9px] tracking-[0.15em] text-faint">
        SBJ: {subjectId}
      </div>
    </div>
  );
}
