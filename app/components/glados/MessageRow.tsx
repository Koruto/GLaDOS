"use client";

import { Role } from "./types";

function Avatar({ role }: { role: Role }) {
  return (
    <div className="shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-[7px] tracking-[0.04em] mt-4 bg-[var(--surface2)] border-[var(--border)] text-[var(--accent-text)]">
      {role === "bot" ? "GL" : "SBJ"}
    </div>
  );
}

function BubbleWrap({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col max-w-[84%] ${role === "user" ? "items-end" : ""}`}
    >
      <div className="text-[8px] tracking-[0.22em] mb-[5px] text-[var(--text-faint)]">
        {role === "bot" ? "GLADOS" : "SUBJECT"}
      </div>
      {children}
    </div>
  );
}

export function Bubble({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        role === "bot"
          ? "px-[14px] py-[10px] text-[12px] leading-[1.8] tracking-[0.03em] rounded-tl-[2px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[8px] bg-[var(--bg)] border border-[var(--border-light)] text-[var(--text-mid)] font-mono"
          : "px-[14px] py-[10px] text-[12px] leading-[1.8] tracking-[0.03em] rounded-tl-[8px] rounded-tr-[2px] rounded-br-[8px] rounded-bl-[8px] bg-[var(--accent-dim)] border border-[var(--accent-border)] text-[var(--accent-text)] font-mono"
      }
    >
      {children}
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="px-[14px] py-[10px] flex items-center gap-1 rounded-tl-[2px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[8px] bg-[var(--bg)] border border-[var(--border-light)] h-[38px]">
      <span className="w-1 h-1 rounded-full bg-[var(--text-faint)] anim-tdot" />
      <span className="w-1 h-1 rounded-full bg-[var(--text-faint)] anim-tdot-d1" />
      <span className="w-1 h-1 rounded-full bg-[var(--text-faint)] anim-tdot-d2" />
    </div>
  );
}

export default function MsgRow({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex gap-3 mb-[18px] anim-fadein ${role === "user" ? "flex-row-reverse" : ""}`}
    >
      <Avatar role={role} />
      <BubbleWrap role={role}>{children}</BubbleWrap>
    </div>
  );
}
