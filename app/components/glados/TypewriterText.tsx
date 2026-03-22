"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  commitScrollIfWasPinned,
  type ScrollPinSnapshot,
} from "./chatScroll";
import { TYPE_SPEED } from "./constants";
import TypingCursor from "./TypingCursor";

export default function TypewriterText({
  text,
  scrollRef,
  instant = false,
}: {
  text: string;
  scrollRef?: { current: HTMLDivElement | null };
  /** Skip animation (e.g. transcript replay after session ends). */
  instant?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const pinRef = useRef<ScrollPinSnapshot>({ sh: 0, st: 0 });

  useEffect(() => {
    pinRef.current = { sh: 0, st: 0 };
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (instant) return;
    if (index >= text.length) return;
    const t = setTimeout(() => {
      setIndex((i) => i + 1);
    }, TYPE_SPEED);
    return () => clearTimeout(t);
  }, [index, text, instant]);

  useLayoutEffect(() => {
    if (instant) return;
    const el = scrollRef?.current;
    if (!el) return;
    pinRef.current = commitScrollIfWasPinned(el, pinRef.current);
  }, [index, text, scrollRef, instant]);

  if (instant) {
    return <>{text}</>;
  }

  const done = index >= text.length;

  return (
    <>
      {text.slice(0, index)}
      {!done && <TypingCursor />}
    </>
  );
}
