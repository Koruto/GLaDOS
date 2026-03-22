"use client";

import { useEffect, useState } from "react";
import { TYPE_SPEED } from "./constants";
import TypingCursor from "./TypingCursor";

export default function TypewriterText({
  text,
  scrollRef,
}: {
  text: string;
  scrollRef?: { current: HTMLDivElement | null };
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= text.length) return;
    const t = setTimeout(() => {
      setIndex((i) => i + 1);
      if (scrollRef?.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, TYPE_SPEED);
    return () => clearTimeout(t);
  }, [index, text, scrollRef]);

  const done = index >= text.length;

  return (
    <>
      {text.slice(0, index)}
      {!done && <TypingCursor />}
    </>
  );
}
