export type Role = "bot" | "user";

export type DisplayMsg = {
  id: string;
  role: Role;
  content: string;
  /** Dots-only placeholder */
  isTyping?: boolean;
  /** Distinct API loading row (accent strip, not typewriter) */
  isLoading?: boolean;
  /** API/network failure — show Retry for this user message */
  isFailure?: boolean;
  /** Text to resend when Retry is pressed */
  retryUserText?: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** @deprecated use ChatMessage */
export type ApiMsg = ChatMessage;

/** Parses values like "42 %" or "42%" from GLADOS_DATA lines. */
export function parseProbabilityPct(value: string | undefined): number | null {
  if (value == null || value === "") return null;
  const m = String(value).match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

export function parseIntField(
  value: string | undefined,
  fallback = 0
): number {
  if (value == null || value === "") return fallback;
  const m = String(value).match(/-?\d+/);
  if (!m) return fallback;
  const n = parseInt(m[0], 10);
  return Number.isFinite(n) ? n : fallback;
}

export function parseBoolString(value: string | undefined): boolean {
  return String(value ?? "")
    .trim()
    .toLowerCase() === "true";
}

export function parseProb(text: string): number | null {
  const m = text.match(/PROBABILITY_OF_RELEASE:\s*([\d.]+)%/);
  return m ? parseFloat(m[1]) : null;
}

export function cleanReply(text: string): string {
  return text.replace(/PROBABILITY_OF_RELEASE:\s*[\d.]+%/gi, "").trim();
}
