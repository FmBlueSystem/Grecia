import { type CountryCode } from "./constants";
import { getSessionId, sapLogin } from "./sap-session";

interface SapRequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
}

export async function sapFetch<T = unknown>(
  countryCode: CountryCode,
  endpoint: string,
  options: SapRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params } = options;
  const baseUrl = process.env.SAP_BASE_URL!;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  let url = `${baseUrl}/b1s/v1/${cleanEndpoint}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    let sessionId = await getSessionId(countryCode);

    let res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // Session expired: re-login and retry once
    if (res.status === 401) {
      sessionId = await sapLogin(countryCode);
      res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Cookie: `B1SESSION=${sessionId}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: { value: res.statusText } } }));
      throw new Error(error?.error?.message?.value || `SAP error ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}
