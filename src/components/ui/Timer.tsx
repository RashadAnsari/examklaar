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
  const [hovered, setHovered] = useState(false);

  const onExpireRef = useRef(onExpire);
  const onWarningRef = useRef(onWarning);
  const warningAtRef = useRef(warningAt);

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

  const isWarning = seconds <= 300 && seconds > 120;
  const isDanger = seconds <= 120;

  const stateClasses = isDanger
    ? "bg-[var(--red-light)] text-[var(--red)] animate-[pulse_1s_infinite]"
    : isWarning
      ? "bg-[var(--amber-light)] text-[var(--amber)]"
      : "bg-transparent text-[var(--gray-400)]";

  return (
    <div
      role="timer"
      aria-label={`${display} remaining`}
      aria-live="off"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={display}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-colors duration-200 whitespace-nowrap ${stateClasses}`}
      style={{ cursor: "default" }}
    >
      <ClockIcon className="w-6 h-6 flex-shrink-0" />
      <span
        className={`overflow-hidden transition-all duration-200 ${
          hovered ? "max-w-[6rem] opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        {display}
      </span>
    </div>
  );
}
