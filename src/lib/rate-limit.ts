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

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
