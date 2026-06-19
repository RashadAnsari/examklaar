const store = new Map<string, number[]>();

// Lazily prune the store so it doesn't grow unbounded in long-running processes.
// Only runs when the store exceeds a reasonable size to keep the hot path fast.
function maybePrune(windowMs: number) {
  if (store.size < 10_000) {
    return;
  }
  const cutoff = Date.now() - windowMs;
  for (const [key, timestamps] of store) {
    if (timestamps[timestamps.length - 1] < cutoff) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const timestamps = (store.get(key) ?? []).filter((ts) => now - ts < windowMs);

  maybePrune(windowMs);

  if (timestamps.length >= maxRequests) {
    const retryAfterMs = windowMs - (now - timestamps[0]);
    store.set(key, timestamps);
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}

// X-Forwarded-For is appended to by every hop, so the left-most value is
// supplied by the (untrusted) client and is trivially spoofable. We read the
// entry written by our own trusted proxy instead: the Nth value counting from
// the right, where N = TRUSTED_PROXY_COUNT (the number of reverse proxies in
// front of the app, default 1). Falls back to X-Real-IP, then "unknown".
export function getClientIp(request: Request): string {
  const trustedHops = Math.max(1, Number(process.env.TRUSTED_PROXY_COUNT ?? "1") || 1);
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const ip = parts[parts.length - trustedHops];
    if (ip) {
      return ip;
    }
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
