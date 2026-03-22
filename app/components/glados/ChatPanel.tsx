"use client";

import { RefObject } from "react";
import { CHIPS, MAX_TURNS } from "./constants";
import { DisplayMsg } from "./types";
import MsgRow, { Bubble, TypingBubble } from "./MessageRow";
import TypewriterText from "./TypewriterText";
import TypingCursor from "./TypingCursor";
import EndingScreen from "./EndingScreen";

type ChatPanelProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
  chatExpanded: boolean;
  showChips: boolean;
  isEnded: boolean;
  prob: number;
  testsCompleted: number;
  verdictReady: boolean;
  endingCode: string | null;
  personScore: number;
  resistanceScore: number;
  openingText: string;
  openingDone: boolean;
  displayMsgs: DisplayMsg[];
  turns: number;
  input: string;
  setInput: (v: string) => void;
  canSend: boolean;
  sendMessage: (text: string) => void;
};

export default function ChatPanel({
  scrollRef,
  chatExpanded,
  showChips,
  isEnded,
  prob,
  testsCompleted,
  verdictReady,
  endingCode,
  personScore,
  resistanceScore,
  openingText,
  openingDone,
  displayMsgs,
  turns,
  input,
  setInput,
  canSend,
  sendMessage,
}: ChatPanelProps) {
  const canSubmit = canSend && input.trim().length > 0;

  return (
    <div className="flex flex-col h-full w-full max-w-[780px]">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-[2px] border border-border bg-surface">

        {/* Inner header */}
        <div className="shrink-0 flex items-center justify-between border-b border-border bg-surface2 px-[14px] py-1.5 text-[9px] tracking-[0.2em] text-mid">
          <div className="flex items-center gap-[7px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-accent anim-blink" />
            SUBJECT INTERFACE — ACTIVE SESSION
          </div>
          <span className="text-[9px] tracking-[0.15em] text-muted">
            {turns > 0
              ? `EXCHANGE ${turns} OF ${MAX_TURNS} · TESTS ${testsCompleted}/5${
                  verdictReady ? " · VERDICT" : ""
                }`
              : ""}
          </span>
        </div>

        {/* Messages area — fills all remaining space */}
        <div
          ref={scrollRef}
          className={`scrollbar-themed overflow-y-auto flex-1 min-h-0 ${
            chatExpanded ? "p-4" : "max-h-0 overflow-hidden p-0"
          }`}
        >
          {isEnded ? (
            <EndingScreen
              prob={prob}
              endingCode={endingCode}
              personScore={personScore}
              resistanceScore={resistanceScore}
            />
          ) : (
            <>
              {openingText && (
                <MsgRow role="bot">
                  <Bubble role="bot">
                    {openingText}
                    {!openingDone && <TypingCursor />}
                  </Bubble>
                </MsgRow>
              )}
              {displayMsgs.map((msg) => (
                <MsgRow key={msg.id} role={msg.role}>
                  {msg.isTyping ? (
                    <TypingBubble />
                  ) : (
                    <Bubble role={msg.role}>
                      {msg.role === "bot" ? (
                        <TypewriterText
                          text={msg.content}
                          scrollRef={scrollRef}
                        />
                      ) : (
                        msg.content
                      )}
                    </Bubble>
                  )}
                </MsgRow>
              ))}
            </>
          )}
        </div>

        {/* Prompt chips */}
        {showChips && (
          <div className="shrink-0 flex flex-wrap gap-[7px] border-t border-border-light bg-surface px-[14px] py-[10px]">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="cursor-pointer rounded-[2px] border border-border bg-background px-[11px] py-[5px] text-[9px] tracking-[0.06em] text-muted transition-all duration-200 hover:border-accent-border hover:bg-accent-dim hover:text-accent-text"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="shrink-0 flex border-t border-border bg-surface">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) sendMessage(input);
            }}
            placeholder="Enter your case for freedom..."
            disabled={!canSend}
            className="flex-1 border-none bg-transparent px-[14px] py-3 text-[11px] tracking-[0.04em] text-foreground caret-accent outline-none disabled:opacity-60"
          />
          <button
            onClick={() => { if (canSubmit) sendMessage(input); }}
            disabled={!canSubmit}
            className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center border-none bg-accent transition-all duration-200 hover:brightness-90 ${
              canSubmit ? "opacity-100 cursor-pointer" : "opacity-25 cursor-default"
            }`}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="white">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
