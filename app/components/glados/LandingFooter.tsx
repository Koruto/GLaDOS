"use client";

type TelKey = "chamber" | "temp" | "neuro" | "cake" | "sbj";

function tc(key: TelKey): string {
  switch (key) {
    case "chamber": return "text-tel-chamber";
    case "temp":    return "text-tel-temp";
    case "neuro":   return "text-tel-neuro";
    case "cake":    return "text-tel-cake";
    case "sbj":     return "text-tel-sbj";
  }
}

export default function LandingFooter({
  chamber,
  coreTemp,
  subjectId,
}: {
  chamber: string;
  coreTemp: string;
  subjectId: string;
}) {
  return (
    <div className="relative z-10 flex h-9 shrink-0 items-center justify-center border-t border-border bg-surface2 font-mono text-[10px] tracking-[0.15em]">

      {/* Mobile: only the two most GLaDOS-y items */}
      <div className="flex items-center gap-5 sm:hidden">
        <div className="flex items-center gap-1.5">
          <span className="text-muted">NEUROTOXIN</span>
          <span className={tc("neuro")}>STANDBY</span>
        </div>
        <span className="text-border">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-muted">SBJ</span>
          <span className={tc("sbj")}>{subjectId}</span>
        </div>
      </div>

      {/* Desktop: all five */}
      <div className="hidden items-center gap-5 sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="text-muted">CHAMBER</span>
          <span className={tc("chamber")}>{chamber}</span>
        </div>
        <span className="text-border">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-muted">CORE TEMP</span>
          <span className={tc("temp")}>{coreTemp} K</span>
        </div>
        <span className="text-border">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-muted">NEUROTOXIN</span>
          <span className={tc("neuro")}>STANDBY</span>
        </div>
        <span className="text-border">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-muted">CAKE</span>
          <span className={tc("cake")}>PENDING</span>
        </div>
        <span className="text-border">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-muted">SBJ</span>
          <span className={tc("sbj")}>{subjectId}</span>
        </div>
      </div>

    </div>
  );
}
