"use client";

export default function BottomBar({
  prob,
  verdictReady,
  sessionEnded,
  released,
}: {
  prob: number;
  verdictReady?: boolean;
  sessionEnded?: boolean;
  released?: boolean;
}) {
  if (sessionEnded) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 flex min-h-9 items-center justify-center gap-2 border-t border-[#c4b8a8] bg-[#e8e2da] px-4 py-2 text-[9px] tracking-[0.16em] text-mid sm:min-h-10 sm:text-[10px] sm:tracking-[0.18em]">
        <span className="font-medium uppercase tracking-[0.14em] text-foreground">
          Session complete
        </span>
        <span className="text-border">·</span>
        <span
          className={
            released ? "font-medium text-[#1a5c30]" : "font-medium text-[#7a4a12]"
          }
        >
          {released ? "Discharge logged" : "Containment active"}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex h-9 items-center justify-center gap-2 border-t border-border bg-surface2 px-7 text-[9px] tracking-[0.15em] sm:h-10 sm:text-[10px]">
      <span className="text-muted">PROBABILITY OF RELEASE:</span>
      <span
        className={`text-[10px] font-bold tracking-[0.12em] transition-colors duration-600 ${prob > 50 ? "text-accent-text" : "text-red"
          }`}
      >
        {prob.toFixed(1)}%
      </span>
      {verdictReady ? (
        <>
          <span className="text-border">·</span>
          <span className="tracking-[0.12em] text-blue">VERDICT READY</span>
        </>
      ) : null}
    </div>
  );
}
