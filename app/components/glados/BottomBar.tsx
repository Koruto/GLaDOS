"use client";

export default function BottomBar({
  prob,
  verdictReady,
}: {
  prob: number;
  verdictReady?: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex h-9 items-center justify-center gap-2 border-t border-border bg-surface2 px-7 text-[9px] tracking-[0.15em]">
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
          <span className="tracking-[0.12em] text-blue">
            VERDICT READY
          </span>
        </>
      ) : null}
    </div>
  );
}
