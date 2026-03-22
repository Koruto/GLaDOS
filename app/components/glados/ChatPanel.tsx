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
    <div className="w-full max-w-[780px]">
      <div className="border overflow-hidden rounded-[2px] bg-[var(--surface)] border-[var(--border)]">

        {/* Inner header */}
        <div className="flex items-center justify-between border-b px-[14px] py-1.5 text-[9px] tracking-[0.2em] bg-[var(--surface2)] border-[var(--border)] text-[var(--text-muted)]">
          <div className="flex items-center gap-[7px]">
            <span className="w-1 h-1 rounded-full shrink-0 bg-[var(--accent)] anim-blink" />
            SUBJECT INTERFACE — ACTIVE SESSION
          </div>
          <span className="text-[9px] tracking-[0.15em] text-[var(--text-faint)]">
            {turns > 0 ? `EXCHANGE ${turns} OF ${MAX_TURNS}` : ""}
          </span>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className={`scrollbar-themed transition-panel overflow-y-auto ${
            chatExpanded
              ? "min-h-[260px] max-h-[340px] p-4"
              : "min-h-0 max-h-0 p-0"
          }`}
        >
          {isEnded ? (
            <EndingScreen prob={prob} />
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
          <div className="px-[14px] py-[10px] border-t flex gap-[7px] flex-wrap border-[var(--border-light)] bg-[var(--surface)]">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="text-[9px] tracking-[0.06em] border px-[11px] py-[5px] cursor-pointer transition-all duration-200 rounded-[2px] text-[var(--text-muted)] border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] hover:bg-[var(--accent-dim)]"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="flex border-t border-[var(--border)] bg-[var(--surface)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) sendMessage(input);
            }}
            placeholder="Enter your case for freedom..."
            disabled={!canSend}
            className="flex-1 bg-transparent border-none outline-none text-[11px] tracking-[0.04em] px-[14px] py-3 disabled:opacity-60 text-[var(--text)] caret-[var(--accent)]"
          />
          <button
            onClick={() => { if (canSubmit) sendMessage(input); }}
            disabled={!canSubmit}
            className={`w-[42px] h-[42px] shrink-0 flex items-center justify-center border-none transition-all duration-200 hover:brightness-90 bg-[var(--accent)] ${
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
