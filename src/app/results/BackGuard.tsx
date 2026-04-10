"use client";

import { useEffect } from "react";

export function BackGuard({ href }: { href: string }) {
  useEffect(() => {
    // Push a dummy entry so the back button has somewhere to go,
    // then replace it immediately with the current URL.
    // When the user presses back, popstate fires and we redirect.
    window.history.pushState(null, "", window.location.href);

    function handlePopState() {
      window.location.replace(href);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [href]);

  return null;
}
