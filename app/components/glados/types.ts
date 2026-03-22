export type Role = "bot" | "user";

export type DisplayMsg = {
  id: string;
  role: Role;
  content: string;
  isTyping?: boolean;
};

export type ApiMsg = {
  role: "user" | "assistant";
  content: string;
};

export function parseProb(text: string): number | null {
  const m = text.match(/PROBABILITY_OF_RELEASE:\s*([\d.]+)%/);
  return m ? parseFloat(m[1]) : null;
}

export function cleanReply(text: string): string {
  return text.replace(/PROBABILITY_OF_RELEASE:\s*[\d.]+%/gi, "").trim();
}
