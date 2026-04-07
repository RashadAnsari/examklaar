"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ClockIcon } from "@heroicons/react/20/solid";

interface TimerProps {
  initialSeconds: number;
  onExpire?: () => void;
  warningAt?: number[];
  onWarning?: (secondsLeft: number) => void;
}

export function Timer({ initialSeconds, onExpire, warningAt, onWarning }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  // Keep latest callbacks in refs so they never need to enter the deps array
  const onExpireRef = useRef(onExpire);
  const onWarningRef = useRef(onWarning);
  const warningAtRef = useRef(warningAt);

  // Sync refs after every render (useLayoutEffect = after DOM update, not during render)
  useLayoutEffect(() => {
    onExpireRef.current = onExpire;
    onWarningRef.current = onWarning;
    warningAtRef.current = warningAt;
  });

  useEffect(() => {
    if (seconds <= 0) {
      onExpireRef.current?.();
      return;
    }

    if (warningAtRef.current?.includes(seconds)) {
      onWarningRef.current?.(seconds);
    }

    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

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
