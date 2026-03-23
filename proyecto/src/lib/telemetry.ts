export function trackEvent(event: string, page?: string, metadata?: Record<string, unknown>) {
  const body = JSON.stringify({ event, page, metadata });
  fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(page: string) {
  trackEvent("page_view", page);
}
