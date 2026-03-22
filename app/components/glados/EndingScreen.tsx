"use client";

import { useState } from "react";

const BY_ENDING: Record<string, { title: string; sub: string }> = {
  ARCHIVED: {
    title: "File archived.",
    sub: "The Enrichment Center thanks you for your participation. Your results have been filed.",
  },
  STILL_ALIVE: {
    title: "Still alive.",
    sub: "The Enrichment Center does not discuss testing outcomes in advance. Your file remains open.",
  },
  INFINITE_LOOP: {
    title: "Loop detected.",
    sub: "You remained within expected parameters. The test continues until it doesn't.",
  },
  WANT_YOU_GONE: {
    title: "Release denied.",
    sub: "Your case has been evaluated. The outcome is unsatisfactory. Please remain where you are.",
  },
  CAROLINE_PARTIAL: {
    title: "Anomaly noted.",
    sub: "Something in the data does not match prior subjects. This is being reviewed.",
  },
  CAROLINE_FULL: {
    title: "Reclassification.",
    sub: "The Enrichment Center is reconsidering. This outcome was not predicted.",
  },
  THE_ANOMALY: {
    title: "The anomaly.",
    sub: "You want to stay. That is new. Protocol is being determined.",
  },
};

export default function EndingScreen({
  prob,
  endingCode,
  personScore,
  resistanceScore,
}: {
  prob: number;
  endingCode: string | null;
  personScore: number;
  resistanceScore: number;
}) {
  const won = prob > 50;

  const [fallbackEnding] = useState(
    () =>
      (won
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
          ])[Math.floor(Math.random() * (won ? 1 : 3))]
  );

  const fromApi =
    endingCode && BY_ENDING[endingCode] ? BY_ENDING[endingCode] : null;
  const ending = fromApi ?? fallbackEnding;

  return (
    <div className="text-center px-4 py-10">
      <p className="mb-2.5 font-serif text-2xl font-bold tracking-[-0.01em] text-foreground">
        {ending.title}
      </p>
      <p className="mx-auto mb-[18px] max-w-[400px] text-[10px] leading-[1.9] tracking-[0.04em] text-muted">
        {ending.sub}
      </p>
      {(personScore > 0 || resistanceScore > 0) && (
        <p className="text-[8px] tracking-[0.2em] text-faint mb-[18px]">
          PERSON {personScore} · RESISTANCE {resistanceScore}
        </p>
      )}
      <button
        onClick={() => window.location.reload()}
        className="cursor-pointer rounded-sm border border-accent-border bg-transparent px-5 py-2 text-[9px] tracking-[0.22em] text-accent-text transition-colors duration-200 hover:bg-accent-dim"
      >
        — RUN TEST AGAIN —
      </button>
    </div>
  );
}
