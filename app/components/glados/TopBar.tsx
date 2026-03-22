"use client";

export default function TopBar({ subjectId }: { subjectId: string }) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-[34px] flex items-center justify-between px-[18px] border-b"
      style={{ background: "var(--surface2)", borderColor: "var(--border)" }}
    >
      <div
        className="flex items-center gap-2 text-[9px] tracking-[0.22em]"
        style={{ color: "var(--text-muted)" }}
      >
        <span
          className="w-[5px] h-[5px] rounded-full shrink-0"
          style={{
            background: "var(--accent)",
            animation: "blink 2.5s ease infinite",
          }}
        />
        GLADOS CORE — CONVERSATION MONITOR
      </div>
      <div
        className="text-[9px] tracking-[0.15em]"
        style={{ color: "var(--text-faint)" }}
      >
        SBJ: {subjectId}
      </div>
    </div>
  );
}
