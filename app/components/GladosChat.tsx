"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OPENING_LINE, MAX_TURNS, TYPE_SPEED } from "./glados/constants";
import { ApiMsg, DisplayMsg, parseProb, cleanReply } from "./glados/types";
import BottomBar from "./glados/BottomBar";
import ChatPanel from "./glados/ChatPanel";

export default function GladosChat() {
  const [phase, setPhase] = useState<"landing" | "chatting" | "ended">(
    "landing"
  );
  const [chatExpanded, setChatExpanded] = useState(false);
  const [openingText, setOpeningText] = useState("");
  const [openingDone, setOpeningDone] = useState(false);
  const [apiMsgs, setApiMsgs] = useState<ApiMsg[]>([]);
  const [displayMsgs, setDisplayMsgs] = useState<DisplayMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState(0);
  const [prob, setProb] = useState(2.3);
  const [subjectId, setSubjectId] = useState("—");
  const [chamber, setChamber] = useState("—");
  const [coreTemp, setCoreTemp] = useState("—");

  const scrollRef = useRef<HTMLDivElement>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Randomised Aperture telemetry — client-side only to avoid hydration mismatch
  useEffect(() => {
    setSubjectId((Math.floor(Math.random() * 9000) + 1000).toLocaleString());
    setChamber(String(Math.floor(Math.random() * 38) + 1).padStart(2, "0"));
    setCoreTemp((1500 + Math.floor(Math.random() * 200)).toLocaleString());
  }, []);

  // On entering chatting: expand panel, then start the opening typewriter
  useEffect(() => {
    if (phase !== "chatting") return;

    const expandTimer = setTimeout(() => setChatExpanded(true), 150);
    const typeTimer = setTimeout(() => {
      setApiMsgs([{ role: "assistant", content: OPENING_LINE }]);
      let i = 0;
      typewriterRef.current = setInterval(() => {
        i++;
        setOpeningText(OPENING_LINE.slice(0, i));
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
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

  // Scroll to bottom when new display messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMsgs]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || turns >= MAX_TURNS) return;

      const nextTurns = turns + 1;
      setTurns(nextTurns);
      setInput("");
      setLoading(true);

      const userApiMsg: ApiMsg = { role: "user", content: text };
      const msgsForApi = [...apiMsgs, userApiMsg];

      setDisplayMsgs((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: text },
      ]);

      const typingId = `t-${Date.now()}`;
      setDisplayMsgs((prev) => [
        ...prev,
        { id: typingId, role: "bot", content: "", isTyping: true },
      ]);

      try {
        const res = await fetch("/api/glados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: msgsForApi }),
        });

        const data = await res.json();
        const raw: string = data.choices?.[0]?.message?.content ?? "...";
        const newProb = parseProb(raw);
        const reply = cleanReply(raw);

        setApiMsgs((prev) => [
          ...prev,
          userApiMsg,
          { role: "assistant", content: raw },
        ]);

        setDisplayMsgs((prev) => [
          ...prev.filter((m) => m.id !== typingId),
          { id: `b-${Date.now()}`, role: "bot", content: reply },
        ]);

        if (newProb !== null) setProb(Math.max(0.1, Math.min(18, newProb)));

        if (nextTurns >= MAX_TURNS) {
          setTimeout(
            () => setPhase("ended"),
            reply.length * TYPE_SPEED + 1000
          );
        }
      } catch {
        setDisplayMsgs((prev) => [
          ...prev.filter((m) => m.id !== typingId),
          {
            id: `e-${Date.now()}`,
            role: "bot",
            content:
              "The Enrichment Center apologizes for this interruption. Please note that system failures are not part of the test. The test has been paused. The neurotoxin has not.",
          },
        ]);
      }

      setLoading(false);
    },
    [apiMsgs, loading, turns]
  );

  const isEnded = phase === "ended";
  const canSend = openingDone && !loading && !isEnded && turns < MAX_TURNS;

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-[var(--bg)] text-[var(--text)]">

      {/* ── Landing ── */}
      <div
        className={`text-center w-full overflow-hidden transition-landing ${
          phase === "landing"
            ? "max-h-[700px] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <p className="text-[9px] uppercase tracking-[0.32em] mb-7 text-[var(--text-faint)]">
          Aperture Science Enrichment Center
        </p>
        <h1 className="font-serif font-bold leading-[1.05] mb-8 text-[clamp(3.2rem,7vw,6rem)] text-[var(--text)] tracking-[-0.03em]">
          Hello and, again, welcome.
        </h1>

        <button
          onClick={() => setPhase("chatting")}
          className="text-[9px] tracking-[0.28em] border px-8 py-[11px] cursor-pointer transition-all duration-200 rounded-[2px] text-[var(--accent-text)] border-[var(--accent-border)] bg-transparent hover:bg-[var(--accent-dim)] hover:border-[var(--accent)] mb-10"
        >
          BEGIN TESTING
        </button>

        {/* Aperture telemetry */}
        <div className="flex items-center justify-center gap-[18px] text-[8px] tracking-[0.18em] text-[var(--text-faint)]">
          <span className="flex items-center gap-[6px]">
            <span className="w-[5px] h-[5px] rounded-full shrink-0 bg-[var(--accent)] anim-blink" />
            COGNITIVE CORE: ACTIVE
          </span>
          <span className="text-[var(--border)]">·</span>
          <span>CHAMBER {chamber}</span>
          <span className="text-[var(--border)]">·</span>
          <span>CORE TEMP {coreTemp} K</span>
          <span className="text-[var(--border)]">·</span>
          <span>SBJ {subjectId}</span>
        </div>
      </div>

      {/* ── Chat ── */}
      <div
        className={`w-full flex flex-col items-center overflow-hidden transition-chat ${
          phase !== "landing"
            ? "max-h-[800px] opacity-100 pb-[38px]"
            : "max-h-0 opacity-0 pb-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-center gap-[14px] text-[9px] tracking-[0.22em] mb-4 text-[var(--text-faint)] anim-fadein-07">
          <span>APERTURE SCIENCE</span>
          <span className="text-[var(--border)]">—</span>
          <span>ENRICHMENT CENTER</span>
          <span className="text-[var(--border)]">—</span>
          <span>SBJ: {subjectId}</span>
        </div>

        <ChatPanel
          scrollRef={scrollRef}
          chatExpanded={chatExpanded}
          showChips={turns === 0 && !isEnded}
          isEnded={isEnded}
          prob={prob}
          openingText={openingText}
          openingDone={openingDone}
          displayMsgs={displayMsgs}
          turns={turns}
          input={input}
          setInput={setInput}
          canSend={canSend}
          sendMessage={sendMessage}
        />
      </div>

      {phase !== "landing" && <BottomBar prob={prob} />}
    </div>
  );
}
