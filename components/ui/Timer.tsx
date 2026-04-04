"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  initialSeconds: number;
  onExpire?: () => void;
}

export function Timer({ initialSeconds, onExpire }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.();
      return;
    }

    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, onExpire]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${minutes}:${String(secs).padStart(2, "0")}`;

  const timerClass =
    seconds <= 120 ? "timer timer-danger" : seconds <= 300 ? "timer timer-warning" : "timer";

  return (
    <div className={timerClass}>
      <ClockIcon />
      <span>{display}</span>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}
