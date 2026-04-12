"use client";

import { useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

interface SuccessBannerProps {
  message: string | null;
  onHide: () => void;
  duration?: number;
}

export function SuccessBanner({ message, onHide, duration = 4000 }: SuccessBannerProps) {
  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onHide]);

  if (!message) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-6 bg-[var(--green-success-light)] text-[var(--green-900)] border border-[var(--green-900)]">
      <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  );
}
