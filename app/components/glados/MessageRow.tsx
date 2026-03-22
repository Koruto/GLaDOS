"use client";

import { Role } from "./types";

function Avatar({ role }: { role: Role }) {
  return (
    <div className="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface2 text-[7px] tracking-[0.04em] text-accent-text">
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
      <div className="text-[8px] tracking-[0.22em] mb-[5px] text-muted">
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
          ? "rounded-bl-[8px] rounded-br-[8px] rounded-tl-[2px] rounded-tr-[8px] border border-border-light bg-background px-[14px] py-[10px] font-mono text-[12px] leading-[1.8] tracking-[0.03em] text-foreground"
          : "rounded-bl-[8px] rounded-br-[8px] rounded-tl-[8px] rounded-tr-[2px] border border-accent-border bg-accent-dim px-[14px] py-[10px] font-mono text-[12px] leading-[1.8] tracking-[0.03em] text-accent-text"
      }
    >
      {children}
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex h-[38px] items-center gap-1 rounded-bl-[8px] rounded-br-[8px] rounded-tl-[2px] rounded-tr-[8px] border border-border-light bg-background px-[14px] py-[10px]">
      <span className="w-1 h-1 rounded-full bg-faint anim-tdot" />
      <span className="w-1 h-1 rounded-full bg-faint anim-tdot-d1" />
      <span className="w-1 h-1 rounded-full bg-faint anim-tdot-d2" />
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
