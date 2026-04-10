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

  const color = isDanger ? "var(--red)" : isWarning ? "var(--amber)" : "var(--gray-400)";
  const bg = isDanger ? "var(--red-light)" : isWarning ? "var(--amber-light)" : "transparent";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={display}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0",
        borderRadius: "0.5rem",
        background: bg,
        color,
        fontWeight: 700,
        fontSize: "1rem",
        cursor: "default",
        transition: "background 0.2s ease",
        animation: isDanger ? "pulse-timer 1s infinite" : "none",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      <ClockIcon style={{ width: 24, height: 24, flexShrink: 0 }} />
      <span
        style={{
          maxWidth: hovered ? "6rem" : "0",
          opacity: hovered ? 1 : 0,
          overflow: "hidden",
          transition: "max-width 0.2s ease, opacity 0.2s ease",
        }}
      >
        {display}
      </span>
    </div>
  );
}
