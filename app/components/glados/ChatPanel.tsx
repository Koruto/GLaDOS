"use client";

import { RefObject } from "react";
import { CHIPS } from "./constants";
import { DisplayMsg } from "./types";
import MsgRow, { Bubble, TypingBubble } from "./MessageRow";
import TypewriterText from "./TypewriterText";
import TypingCursor from "./TypingCursor";
import EndingScreen from "./EndingScreen";

type ChatPanelProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
  bottomSentinelRef: RefObject<HTMLDivElement | null>;
  chatExpanded: boolean;
  showChips: boolean;
  isEnded: boolean;
  endedPane: "verdict" | "transcript";
  setEndedPane: (p: "verdict" | "transcript") => void;
  endingCode: string | null;
  openingText: string;
  openingDone: boolean;
  displayMsgs: DisplayMsg[];
  input: string;
  setInput: (v: string) => void;
  canSend: boolean;
  sendMessage: (text: string) => void;
};

function LoadingStatusRow({ text }: { text: string }) {
  return (
    <div className="mb-[18px] flex gap-3 anim-fadein">
      <div className="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-dim text-[7px] tracking-[0.04em] text-accent-text">
        GL
      </div>
      <div className="flex max-w-[84%] flex-col">
        <div className="mb-[5px] text-[8px] tracking-[0.22em] text-accent-text">
          GLADOS
        </div>
        <div className="rounded-bl-[8px] rounded-br-[8px] rounded-tl-[2px] rounded-tr-[8px] border border-accent-border bg-accent-dim/80 px-[14px] py-[10px] font-mono text-[12px] leading-[1.8] tracking-[0.03em] text-accent-text">
          <span className="inline-flex items-start gap-2.5">
            <span
              className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent anim-blink"
              aria-hidden
            />
            <span>{text}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({
  scrollRef,
  bottomSentinelRef,
  chatExpanded,
  showChips,
  isEnded,
  endedPane,
  setEndedPane,
  endingCode,
  openingText,
  openingDone,
  displayMsgs,
  input,
  setInput,
  canSend,
  sendMessage,
}: ChatPanelProps) {
  const canSubmit = canSend && input.trim().length > 0;
  const showVerdict = isEnded && endedPane === "verdict";
  const showTranscript = isEnded && endedPane === "transcript";
  const transcriptReplay = showTranscript;

  return (
    <div className="flex h-full w-full max-w-[780px] flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2px] border border-border bg-surface">

        {/* Inner header */}
        <div
          className={`flex shrink-0 items-center justify-between border-b px-[14px] py-1.5 text-[9px] tracking-[0.2em] sm:py-2 sm:text-[10px] ${isEnded
            ? "border-[#9a8b7a]/50 bg-[#e4ded4] text-mid"
            : "border-border bg-surface2 text-mid"
            }`}
        >
          <div className="flex items-center gap-[7px]">
            <span
              className={`h-1 w-1 shrink-0 rounded-full ${isEnded ? "bg-[#8b6914] anim-blink" : "bg-accent anim-blink"
                }`}
            />
            {isEnded ? (
              <span className="font-medium uppercase tracking-[0.18em] text-foreground">
                Evaluation complete
              </span>
            ) : (
              "SUBJECT INTERFACE — ACTIVE SESSION"
            )}
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className={`scrollbar-themed min-h-0 flex-1 overflow-y-auto ${chatExpanded ? "px-4 pb-5 pt-3 sm:px-4 sm:pb-6 sm:pt-3" : "max-h-0 overflow-hidden p-0"
            }`}
        >
          {showVerdict ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <EndingScreen
                endingCode={endingCode}
                onBackToChat={() => setEndedPane("transcript")}
              />
            </div>
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
              {displayMsgs.map((msg) =>
                msg.isLoading ? (
                  <LoadingStatusRow key={msg.id} text={msg.content} />
                ) : msg.isFailure ? (
                  <MsgRow key={msg.id} role="bot">
                    <Bubble role="bot">
                      <div className="flex flex-col gap-3">
                        <span>{msg.content}</span>
                        {msg.retryUserText ? (
                          <button
                            type="button"
                            onClick={() => sendMessage(msg.retryUserText!)}
                            className="self-start rounded-[2px] border border-accent-border bg-accent-dim px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-accent-text transition-all duration-200 hover:border-accent hover:bg-accent hover:text-white sm:text-[10px] hover:cursor-pointer"
                          >
                            Retry
                          </button>
                        ) : null}
                      </div>
                    </Bubble>
                  </MsgRow>
                ) : (
                  <MsgRow key={msg.id} role={msg.role}>
                    {msg.isTyping ? (
                      <TypingBubble />
                    ) : (
                      <Bubble role={msg.role}>
                        {msg.role === "bot" ? (
                          <TypewriterText
                            text={msg.content}
                            scrollRef={scrollRef}
                            instant={transcriptReplay}
                          />
                        ) : (
                          msg.content
                        )}
                      </Bubble>
                    )}
                  </MsgRow>
                )
              )}

              {showTranscript && (
                <div className="mt-3 border-t border-border-light bg-surface2/60 px-1 py-3 sm:mt-2 sm:px-0 sm:py-3">
                  <p className="mb-2.5 text-[11px] leading-[1.75] tracking-[0.03em] text-mid sm:mb-3 sm:text-[12px]">
                    Testing has stopped. The log above is yours to reread—statistically,
                    nobody does. If you still require the formal disposition of your
                    file, it remains available. I wouldn&apos;t linger.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEndedPane("verdict")}
                    className="w-full cursor-pointer rounded-[2px] border border-accent-border bg-accent-dim px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-accent-text transition-all duration-200 hover:border-accent hover:bg-accent hover:text-white sm:text-[10px]"
                  >
                    Open disposition
                  </button>
                </div>
              )}
            </>
          )}
          <div
            ref={bottomSentinelRef}
            className="h-1 w-full shrink-0"
            aria-hidden
          />
        </div>

        {/* Prompt chips */}
        {showChips && (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-border-light bg-surface px-[14px] py-2.5 sm:gap-2.5 sm:px-4 sm:py-3 md:gap-3 md:py-3.5">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => sendMessage(chip)}
                className="cursor-pointer rounded-[2px] border border-border bg-background px-3 py-1.5 text-[9px] tracking-[0.06em] text-muted transition-all duration-200 hover:border-accent-border hover:bg-accent-dim hover:text-accent-text sm:px-3.5 sm:py-2 sm:text-[10px] md:px-4 md:py-2.5 md:text-[11px] md:tracking-[0.08em]"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input row — hidden after session ends */}
        {!isEnded && (
          <div className="flex shrink-0 border-t border-border bg-surface">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) sendMessage(input);
              }}
              placeholder="Enter your case for freedom..."
              disabled={!canSend}
              className="flex-1 border-none bg-transparent px-[14px] py-3 text-[11px] tracking-[0.04em] text-foreground caret-accent outline-none disabled:opacity-60 sm:text-[12px]"
            />
            <button
              type="button"
              onClick={() => {
                if (canSubmit) sendMessage(input);
              }}
              disabled={!canSubmit}
              className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center border-none bg-accent transition-all duration-200 hover:brightness-90 sm:h-11 sm:w-11 ${canSubmit ? "cursor-pointer opacity-100" : "cursor-default opacity-25"
                }`}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="white" aria-hidden>
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
