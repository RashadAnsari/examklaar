"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";

export function RetakeButton({ href, doneKey }: { href: string; doneKey: string }) {
  function handleClick() {
    sessionStorage.removeItem(doneKey);
  }

  return (
    <a
      href={href}
      className="card card-hover block"
      style={{ textDecoration: "none" }}
      onClick={handleClick}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "var(--green-50)", color: "var(--green-900)" }}
      >
        <ArrowPathIcon style={{ width: 24, height: 24 }} />
      </div>
      <h3 className="font-semibold mb-1" style={{ fontSize: "1.125rem", color: "var(--gray-900)" }}>
        Try Again
      </h3>
      <p className="text-sm" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
        Practice with this exam again to improve
      </p>
    </a>
  );
}
