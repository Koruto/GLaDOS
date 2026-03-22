"use client";

import { useState } from "react";

export default function EndingScreen({ prob }: { prob: number }) {
  const won = prob > 9;
  const options = won
    ? [
        {
          title: "Probability threshold exceeded.",
          sub: 'The Enrichment Center is reconsidering. This has never happened before. Your file has been reclassified from "test subject" to "anomaly." GLaDOS will be in touch.',
        },
      ]
    : [
        {
          title: "Test concluded.",
          sub: 'The Enrichment Center thanks you for your valuable contribution to science. Your file has been marked "unsatisfactory." The cake remains pending.',
        },
        {
          title: "Session terminated.",
          sub: "You remained resolute in an atmosphere of extreme pessimism. GLaDOS found this statistically improbable and, frankly, a little irritating.",
        },
        {
          title: "No further testing required.",
          sub: '"No one will blame you for giving up. In fact, quitting at this point is a perfectly reasonable response." — GLaDOS, Chamber 09.',
        },
      ];

  const [ending] = useState(
    () => options[Math.floor(Math.random() * options.length)]
  );

  return (
    <div className="text-center px-4 py-10">
      <p className="text-2xl font-serif font-bold mb-2.5 text-[var(--text)] tracking-[-0.01em]">
        {ending.title}
      </p>
      <p className="text-[10px] leading-[1.9] max-w-[400px] mx-auto mb-[18px] text-[var(--text-muted)] tracking-[0.04em]">
        {ending.sub}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="text-[9px] tracking-[0.22em] border rounded-sm px-5 py-2 cursor-pointer transition-colors duration-200 text-[var(--accent-text)] border-[var(--accent-border)] bg-transparent hover:bg-[var(--accent-dim)]"
      >
        — RUN TEST AGAIN —
      </button>
    </div>
  );
}
