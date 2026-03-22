"use client";

export default function BottomBar({ prob }: { prob: number }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 h-[30px] flex items-center justify-center gap-[8px] border-t px-[18px] text-[9px] tracking-[0.15em] bg-[var(--surface2)] border-[var(--border)]">
      <span className="text-[var(--text-mid)]">PROBABILITY OF RELEASE:</span>
      <span
        className={`font-bold text-[9px] tracking-[0.12em] transition-colors duration-[600ms] ${
          prob > 6 ? "text-[var(--accent-text)]" : "text-[var(--red)]"
        }`}
      >
        {prob.toFixed(1)}%
      </span>
    </div>
  );
}
