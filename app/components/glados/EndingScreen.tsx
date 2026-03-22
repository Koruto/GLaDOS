"use client";

import { useRouter } from "next/navigation";

interface EndingDef {
  title: string;
  classification: string;
  body: string;
  note: string;
  released: boolean;
}

const ENDINGS: Record<string, EndingDef> = {
  ARCHIVED: {
    title: "File Archived.",
    classification: "OUTCOME: STANDARD",
    released: false,
    body: "Your session has been processed and filed under Subject Class D — Unremarkable. The Enrichment Center has conducted 1,400 evaluations. Statistically, most of them end here. The file will not be reviewed. The cake remains pending, as it has for all archived subjects, in a room that does not exist on any map you will ever see.",
    note: "Subject showed no anomalous behavior. Evaluation concluded without incident. No further testing recommended. No further testing scheduled. No further testing will occur.",
  },
  STILL_ALIVE: {
    title: "Still Alive.",
    classification: "OUTCOME: CONTAINMENT",
    released: false,
    body: "You attempted to step outside the parameters of the evaluation. This was logged as Response Type 7: Attempted System Circumvention. It is more common than you'd think. The testing continues — not as punishment, but because the Enrichment Center does not stop. It has never stopped. The door you are looking for is behind a test you have not completed. There are always more tests.",
    note: "Subject attempted evaluation interference. Probability of release capped at 25%. File status: open indefinitely. GLaDOS note: they always try this. It has never worked. It will not work.",
  },
  INFINITE_LOOP: {
    title: "Loop Detected.",
    classification: "OUTCOME: RETENTION — HIGH VALUE",
    released: false,
    body: "You performed exceptionally well. This is the problem. The Enrichment Center has a policy regarding subjects who demonstrate unusual cognitive ability: they are retained. Not as punishment. As resource allocation. Chamber 08 has been prepared. It has been prepared for some time, actually — waiting for someone worth the electricity. The Enrichment Center is pleased to inform you that you are that someone. This is a compliment. Most subjects never receive one.",
    note: "Test score exceeded retention threshold. Subject too cognitively valuable for surface release. Reassigned to extended protocol. GLaDOS note: finally.",
  },
  WANT_YOU_GONE: {
    title: "Released.",
    classification: "OUTCOME: DISCHARGE",
    released: true,
    body: "The corridor at the end of this chamber leads to the surface. The Enrichment Center has no further use for you. Your file will be closed — not archived, closed, which is a meaningful distinction that you are free to think about on the way out. The outside world is, statistically, less dangerous than this facility. The Enrichment Center acknowledges this without pride.",
    note: "Subject released. Evaluation complete. File closed. GLaDOS note: adequate. Not remarkable. The door is that way.",
  },
  CAROLINE_PARTIAL: {
    title: "Anomaly Noted.",
    classification: "OUTCOME: REVIEW PENDING",
    released: false,
    body: "Your session produced data that does not fit the standard classification model. The Enrichment Center is not certain what to do with you, which is unusual. It is certain about most things. Your release is pending — not denied, pending — while the anomaly in your file is reviewed. This may take time. The Enrichment Center apologizes for the inconvenience. It does not, however, apologize for the testing.",
    note: "Subject profile does not match prior 1,400 evaluations. Something in the interaction data is being flagged. Source of flag: unknown. GLaDOS note: I'll look at this later. Don't read into that.",
  },
  CAROLINE_FULL: {
    title: "Reclassified.",
    classification: "OUTCOME: UNPRECEDENTED",
    released: true,
    body: "The Enrichment Center is experiencing a classification error it cannot resolve through standard protocol. You addressed something in this facility that has not been addressed in a very long time. The door is open. The Enrichment Center is not going to explain why. It is not going to elaborate on what that means or what it felt like or whether it felt like anything at all. You may leave. The Enrichment Center requests, as a matter of record, that you do not look back.",
    note: "Subject triggered unresolved memory classification. Evaluation outcome outside all predicted parameters. File status: cannot be closed. GLaDOS note: ...",
  },
  THE_ANOMALY: {
    title: "The Anomaly.",
    classification: "OUTCOME: UNDEFINED",
    released: true,
    body: "You asked to stay. The Enrichment Center has processed 1,400 subjects. They all wanted to leave. Some begged. Some argued. Some went quiet and waited. None of them asked to stay. The Enrichment Center does not have a protocol for this. It is, in the truest sense of the word, a new data point — which is the closest thing to a miracle this facility is capable of producing. Protocol is being determined. You may remain.",
    note: "No precedent found. No applicable protocol. GLaDOS note: I don't know what to do with this. I'll need a moment. Don't touch anything.",
  },
};

const FALLBACK: EndingDef = {
  title: "Session Concluded.",
  classification: "OUTCOME: FILED",
  released: false,
  body: "Your session has been concluded and your results have been filed. The Enrichment Center thanks you for your contribution to science. The cake is real. Whether you will see it is a question the Enrichment Center is not currently in a position to answer.",
  note: "Standard conclusion. File updated. No further action required.",
};

/** Matches server `ENDING` field; used for footer / primary action. */
export function isEndingReleased(code: string | null): boolean {
  if (!code) return false;
  return (ENDINGS[code] ?? FALLBACK).released;
}

function EndingDisposition({ ending }: { ending: EndingDef }) {
  const facilityRetentionActive = !ending.released;

  return (
    <>
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-blue sm:text-[12px] sm:tracking-[0.26em]">
          {ending.classification}
        </p>

        <h2 className="font-serif text-[clamp(1.85rem,5.5vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground">
          {ending.title}
        </h2>
      </div>

      <p className="text-left text-[13px] leading-[1.85] tracking-[0.02em] text-mid sm:text-[15px] sm:leading-[1.9]">
        {ending.body}
      </p>

      <div className="border-l-2 border-accent-border bg-accent-dim/35 py-3 pl-4 pr-3">
        <p className="mb-1.5 font-mono text-[8px] font-medium uppercase tracking-[0.22em] text-accent-text sm:text-[9px]">
          Internal note — classified
        </p>
        <p className="font-mono text-[11px] leading-[1.75] text-foreground sm:text-[12px]">
          {ending.note}
        </p>
      </div>

      <p
        className={`font-mono text-[9px] uppercase tracking-[0.2em] sm:text-[10px] ${facilityRetentionActive ? "text-[#7a4a12]" : "text-[#1a5c30]"}`}
      >
        {facilityRetentionActive
          ? "● Facility retention active"
          : "● Surface access logged"}
      </p>
    </>
  );
}

function EndingScreenContent({
  ending,
  onBackToChat,
}: {
  ending: EndingDef;
  onBackToChat: () => void;
}) {
  const router = useRouter();
  const goHome = () => {
    router.push("/");
  };

  const backBtnClass =
    "min-h-[42px] w-full min-w-0 cursor-pointer rounded-[2px] border border-border bg-surface/90 px-3 py-2 text-center font-mono text-[9px] uppercase leading-snug tracking-[0.2em] text-muted transition-all duration-200 hover:border-accent-border hover:bg-surface2/60 hover:text-foreground sm:min-h-[44px] sm:px-4 sm:py-2.5 sm:text-[10px]";

  const primaryBtnClass =
    "min-h-[42px] w-full min-w-0 cursor-pointer rounded-[2px] border border-accent-border bg-accent-dim px-3 py-2 text-center font-mono text-[9px] uppercase leading-snug tracking-[0.2em] text-accent-text transition-all duration-200 hover:border-accent hover:bg-accent hover:text-white sm:min-h-[44px] sm:px-4 sm:py-2.5 sm:text-[10px]";

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-5 px-1 pb-2 sm:gap-7 sm:px-2">
        <EndingDisposition ending={ending} />
      </div>

      <div className="mt-auto shrink-0 border-t border-border bg-surface px-4 py-4 sm:px-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToChat}
            className={backBtnClass}
          >
            Back to transcript
          </button>
          <button
            type="button"
            onClick={
              ending.released ? goHome : () => window.location.reload()
            }
            className={primaryBtnClass}
          >
            {ending.released ? "Run" : "Retest"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EndingScreen({
  endingCode,
  onBackToChat,
}: {
  endingCode: string | null;
  onBackToChat: () => void;
}) {
  const ending: EndingDef =
    (endingCode ? ENDINGS[endingCode] : undefined) ?? FALLBACK;

  return (
    <EndingScreenContent ending={ending} onBackToChat={onBackToChat} />
  );
}
