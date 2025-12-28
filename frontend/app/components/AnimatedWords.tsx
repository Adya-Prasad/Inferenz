"use client";

import { useEffect, useState } from "react";

export default function AnimatedWords({ words, interval = 2500 }: { words: string[]; interval?: number }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'idle'|'exiting'|'entering'>('entering');
  const duration = 300;

  useEffect(() => {
    let changeTimer: ReturnType<typeof setTimeout> | null = null;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const tick = setInterval(() => {
      setPhase('exiting');
      // clear any pending timers before scheduling new ones
      if (changeTimer) {
        clearTimeout(changeTimer);
        changeTimer = null;
      }
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }

      changeTimer = setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setPhase('entering');
        idleTimer = setTimeout(() => setPhase('idle'), duration);
      }, duration);
    }, interval);

    return () => {
      clearInterval(tick);
      if (changeTimer) clearTimeout(changeTimer);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [words.length, interval]);

  return (
    <span aria-live="polite" className={`word-fade ${phase === 'entering' ? 'entering' : ''} ${phase === 'exiting' ? 'exiting' : ''}`}>
      {words[idx]}
    </span>
  );
}
