"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { isEndingReleased } from "./glados/EndingScreen";
import type { ScrollPinSnapshot } from "./glados/chatScroll";
import {
  ERROR_LINE,
  LOADING_EVALUATING,
  LOADING_EVALUATING_MS,
  LOADING_LINE_ROTATE_MS,
  LOADING_LINES,
  MAX_TURNS,
  MIN_LOADING_MS,
  OPENING_LINE,
  TYPE_SPEED,
} from "./glados/constants";
import {
  ChatMessage,
  DisplayMsg,
  parseBoolString,
  parseIntField,
  parseProbabilityPct,
} from "./glados/types";
import BottomBar from "./glados/BottomBar";
import ChatPanel from "./glados/ChatPanel";
import LandingFooter from "./glados/LandingFooter";

export default function GladosChat() {
  const [phase, setPhase] = useState<"landing" | "chatting" | "ended">(
    "landing"
  );
  const [chatExpanded, setChatExpanded] = useState(false);
  const [openingText, setOpeningText] = useState("");
  const [openingDone, setOpeningDone] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [displayMsgs, setDisplayMsgs] = useState<DisplayMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState(0);
  const [prob, setProb] = useState(2.3);
  const [testsCompleted, setTestsCompleted] = useState(0);
  const [verdictReady, setVerdictReady] = useState(false);
  const [ending, setEnding] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState("—");
  const [chamber, setChamber] = useState("—");
  const [coreTemp, setCoreTemp] = useState("—");
  const [endedPane, setEndedPane] = useState<"verdict" | "transcript">(
    "verdict"
  );

  const messagesRef = useRef<ChatMessage[]>([]);
  const phaseRef = useRef(phase);
  /** Last `[GLADOS_DATA]` block from the API — sent back as `lastData` so the model + clamp logic stay consistent. */
  const lastDataRef = useRef<Record<string, string> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const followBottomRef = useRef(true);
  const scrollPinRef = useRef<ScrollPinSnapshot>({ sh: 0, st: 0 });
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingBubbleIdRef = useRef<string | null>(null);
  const loadingTimersRef = useRef<{
    timeouts: ReturnType<typeof setTimeout>[];
    intervals: ReturnType<typeof setInterval>[];
  }>({ timeouts: [], intervals: [] });

  const clearLoadingTimers = useCallback(() => {
    loadingTimersRef.current.timeouts.forEach(clearTimeout);
    loadingTimersRef.current.intervals.forEach(clearInterval);
    loadingTimersRef.current = { timeouts: [], intervals: [] };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (phaseRef.current === "chatting" && phase === "ended") {
      setEndedPane("verdict");
    }
    phaseRef.current = phase;
  }, [phase]);

  // Randomised Aperture telemetry — client-side only to avoid hydration mismatch
  useEffect(() => {
    setSubjectId((Math.floor(Math.random() * 9000) + 1000).toLocaleString());
    setChamber(String(Math.floor(Math.random() * 38) + 1).padStart(2, "0"));
    setCoreTemp((1500 + Math.floor(Math.random() * 200)).toLocaleString());
  }, []);

  // On entering chatting: expand panel, seed API messages + start the opening typewriter
  useEffect(() => {
    if (phase !== "chatting") return;

    setMessages([{ role: "assistant", content: OPENING_LINE }]);

    const expandTimer = setTimeout(() => setChatExpanded(true), 150);
    const typeTimer = setTimeout(() => {
      let i = 0;
      typewriterRef.current = setInterval(() => {
        i++;
        setOpeningText(OPENING_LINE.slice(0, i));
        if (i >= OPENING_LINE.length) {
          setOpeningDone(true);
          if (typewriterRef.current) clearInterval(typewriterRef.current);
        }
      }, TYPE_SPEED);
    }, 500);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(typeTimer);
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, [phase]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (followBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
    scrollPinRef.current = { sh: el.scrollHeight, st: el.scrollTop };
  }, [openingText, displayMsgs]);

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = bottomSentinelRef.current;
    if (!root || !sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        followBottomRef.current = entry.isIntersecting;
        const el = scrollRef.current;
        if (el) {
          scrollPinRef.current = {
            sh: el.scrollHeight,
            st: el.scrollTop,
          };
        }
      },
      { root, rootMargin: "0px 0px 120px 0px", threshold: 0 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [displayMsgs, openingText, endedPane, phase, chatExpanded]);

  /** After "Evaluating..." (500ms), rotate `LOADING_LINES` until the reply arrives. */
  useEffect(() => {
    if (!loading) {
      clearLoadingTimers();
      loadingBubbleIdRef.current = null;
      return;
    }
    const tid = loadingBubbleIdRef.current;
    if (!tid) return;

    clearLoadingTimers();

    const tRotate = setTimeout(() => {
      let i = Math.floor(Math.random() * LOADING_LINES.length);
      setDisplayMsgs((prev) =>
        prev.map((m) =>
          m.id === tid
            ? { ...m, content: LOADING_LINES[i], isLoading: true }
            : m
        )
      );
      const iv = setInterval(() => {
        i = (i + 1) % LOADING_LINES.length;
        setDisplayMsgs((prev) =>
          prev.map((m) =>
            m.id === tid
              ? { ...m, content: LOADING_LINES[i], isLoading: true }
              : m
          )
        );
      }, LOADING_LINE_ROTATE_MS);
      loadingTimersRef.current.intervals.push(iv);
    }, LOADING_EVALUATING_MS);

    loadingTimersRef.current.timeouts.push(tRotate);

    return () => {
      clearLoadingTimers();
    };
  }, [loading, clearLoadingTimers]);

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || loading || turns >= MAX_TURNS || !openingDone) return;

      const priorThread = messagesRef.current;
      const priorTurns = turns;
      const newMessages: ChatMessage[] = [
        ...priorThread,
        { role: "user", content: trimmed },
      ];

      setMessages(newMessages);

      const nextTurns = priorTurns + 1;
      setTurns(nextTurns);
      setInput("");
      setLoading(true);

      const userMsgId = `u-${Date.now()}`;
      setDisplayMsgs((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: trimmed },
      ]);

      const typingId = `t-${Date.now()}`;
      loadingBubbleIdRef.current = typingId;
      setDisplayMsgs((prev) => [
        ...prev,
        {
          id: typingId,
          role: "bot",
          content: LOADING_EVALUATING,
          isLoading: true,
        },
      ]);

      const requestAt = Date.now();

      const showFailure = (message: string) => {
        setMessages(priorThread);
        setTurns(priorTurns);
        setDisplayMsgs((prev) => [
          ...prev.filter((m) => m.id !== typingId),
          {
            id: `e-${Date.now()}`,
            role: "bot",
            content: message,
            isFailure: true,
            retryUserText: trimmed,
          },
        ]);
      };

      try {
        const res = await fetch("/api/glados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            lastData: lastDataRef.current,
          }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
          data?: Record<string, string> | null;
          error?: string;
          code?: string;
        };

        if (!res.ok || data.error) {
          const errMsg =
            res.status === 429 || data.code === "RATE_LIMIT"
              ? "Rate Limit Exceeded. Try after some time."
              : typeof data.error === "string"
                ? data.error
                : ERROR_LINE;
          showFailure(errMsg);
          return;
        }

        const reply =
          typeof data.message === "string" && data.message.length > 0
            ? data.message
            : "…";

        const elapsed = Date.now() - requestAt;
        const waitMore = Math.max(0, MIN_LOADING_MS - elapsed);
        if (waitMore) {
          await new Promise((r) => setTimeout(r, waitMore));
        }

        setMessages([
          ...newMessages,
          { role: "assistant", content: reply },
        ]);

        setDisplayMsgs((prev) => [
          ...prev.filter((m) => m.id !== typingId),
          { id: `b-${Date.now()}`, role: "bot", content: reply },
        ]);

        const block = data.data;
        if (
          block &&
          typeof block === "object" &&
          Object.keys(block).length > 0
        ) {
          lastDataRef.current = block;
          const p = parseProbabilityPct(block.PROBABILITY);
          if (p !== null) setProb(Math.max(0, Math.min(100, p)));

          setTestsCompleted(parseIntField(block.TESTS_COMPLETED, 0));
          setVerdictReady(parseBoolString(block.VERDICT_READY));
          const endRaw = (block.ENDING ?? "").trim();
          setEnding(endRaw === "" || endRaw === "NONE" ? null : endRaw);
        }

        const snapshot = lastDataRef.current;
        const vReady = snapshot
          ? parseBoolString(snapshot.VERDICT_READY)
          : false;
        const endCode = snapshot ? (snapshot.ENDING ?? "").trim() : "";
        const endingLocked = Boolean(endCode) && endCode !== "NONE";

        const shouldEnd =
          vReady || endingLocked || nextTurns >= MAX_TURNS;

        if (shouldEnd) {
          setTimeout(
            () => setPhase("ended"),
            reply.length * TYPE_SPEED + 1000
          );
        }
      } catch {
        showFailure(ERROR_LINE);
      } finally {
        setLoading(false);
      }
    },
    [loading, turns, openingDone]
  );

  const isEnded = phase === "ended";
  const canSend =
    openingDone && !loading && !isEnded && turns < MAX_TURNS;

  return (
    <div className="relative z-5 flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* ── Landing (design2.html) ── */}
        <div
          className={`overflow-hidden transition-landing ${phase === "landing"
            ? "flex-1 max-h-[1200px] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
            }`}
        >
          <div className="flex min-h-[calc(100dvh-36px)] flex-col items-center justify-center gap-5 px-5 py-8 text-center sm:gap-7 sm:px-8 sm:py-14">
            <p className="whitespace-nowrap text-[8px] uppercase tracking-[0.18em] text-blue sm:text-[11px] sm:tracking-[0.26em]">
              Aperture Science Enrichment Center
            </p>

            <h1 className="-mt-1 font-serif text-[clamp(2.4rem,8.5vw,7rem)] font-normal leading-none tracking-[-0.02em] text-foreground">
              Hello and again,
              <br />
              <em>welcome.</em>
            </h1>

            <div className="flex flex-col items-center gap-4">
              <div className="w-10 border-t border-blue/30" />
              <p className="max-w-[420px] font-sans text-[13px] font-light leading-[1.9] text-muted sm:text-[14px]">
                I am{" "}
                <span className="font-normal text-foreground">GLaDOS</span>. I
                will be conducting today&rsquo;s tests. Your cooperation is
                mandatory. The{" "}
                <span className="font-normal text-foreground">
                  neurotoxin dispersal system
                </span>{" "}
                is, however, optional. How optional depends entirely on you. You
                may begin.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setPhase("chatting")}
                className="inline-flex items-center gap-2.5 rounded-[2px] border border-mid bg-transparent px-7 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-foreground transition-all duration-200 hover:cursor-pointer hover:bg-foreground hover:text-background sm:px-[34px] sm:py-[13px]"
              >
                Begin Testing
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <p className="text-[10px] tracking-[0.06em] text-muted sm:text-[11px]">
                <span className="font-medium text-blue">1,400</span> subjects
                before you. None of them left.
              </p>
            </div>
          </div>
        </div>

        {/* ── Chat ── */}
        <div
          className={`flex w-full min-h-0 flex-1 flex-col items-center overflow-hidden transition-chat px-4 sm:px-6 ${phase !== "landing"
            ? "max-h-screen opacity-100 pt-5 sm:pt-8 pb-14 sm:pb-16"
            : "max-h-0 opacity-0 pb-0 pointer-events-none"
            }`}
        >
          {/* Desktop header — single inline row */}
          <div
            className={`hidden sm:flex w-full max-w-[780px] items-center justify-center gap-[14px] text-[9px] tracking-[0.22em] mb-4 anim-fadein-07 ${isEnded ? "text-[#8b6914]" : "text-blue"
              }`}
          >
            <span>APERTURE SCIENCE</span>
            <span className="text-border">—</span>
            <span>ENRICHMENT CENTER</span>
            <span className="text-border">—</span>
            {isEnded ? (
              <span className="font-medium uppercase tracking-[0.2em]">
                Status: concluded
              </span>
            ) : (
              <span>SBJ: {subjectId}</span>
            )}
          </div>

          {/* Mobile header — two-line stacked */}
          <div className="sm:hidden w-full mb-3 anim-fadein-07">
            <p className="font-mono text-[8px] tracking-[0.22em] text-blue uppercase">
              APERTURE SCIENCE ENRICHMENT CENTER
            </p>
            <p
              className={`mt-1 font-mono text-[12px] tracking-[0.06em] ${isEnded ? "text-[#8b6914]" : "text-foreground"
                }`}
            >
              {isEnded
                ? "EVALUATION CONCLUDED"
                : `SUBJECT #${subjectId}`}
            </p>
          </div>

          {/* ChatPanel — fills all remaining height */}
          <div className="flex-1 min-h-0 w-full max-w-[780px] flex flex-col">
            <ChatPanel
              scrollRef={scrollRef}
              bottomSentinelRef={bottomSentinelRef}
              chatExpanded={chatExpanded}
              showChips={turns === 0 && !isEnded}
              showTipStrip={turns === 1 && !isEnded}
              isEnded={isEnded}
              endedPane={endedPane}
              setEndedPane={setEndedPane}
              endingCode={ending}
              openingText={openingText}
              openingDone={openingDone}
              displayMsgs={displayMsgs}
              input={input}
              setInput={setInput}
              canSend={canSend}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      </div>

      {phase === "landing" ? (
        <LandingFooter
          chamber={chamber}
          coreTemp={coreTemp}
          subjectId={subjectId}
        />
      ) : (
        <BottomBar
          prob={prob}
          verdictReady={verdictReady}
          sessionEnded={isEnded}
          released={isEndingReleased(ending)}
        />
      )}
    </div>
  );
}
