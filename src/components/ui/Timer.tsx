"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/20/solid";

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
      <ClockIcon style={{ width: 20, height: 20 }} />
      <span>{display}</span>
    </div>
  );
}
