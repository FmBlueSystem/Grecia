import { SAP_DATABASES, SAP_SESSION_TIMEOUT_MS, type CountryCode } from "./constants";

interface SapSession {
  sessionId: string;
  companyDb: string;
  createdAt: number;
}

const sessionPool = new Map<string, SapSession>();

function getBaseUrl(): string {
  return process.env.SAP_BASE_URL!;
}

export async function sapLogin(countryCode: CountryCode): Promise<string> {
  const existing = sessionPool.get(countryCode);
  if (existing && Date.now() - existing.createdAt < SAP_SESSION_TIMEOUT_MS) {
    return existing.sessionId;
  }

  const db = SAP_DATABASES[countryCode];
  const res = await fetch(`${getBaseUrl()}/b1s/v1/Login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      CompanyDB: db.companyDb,
      UserName: process.env.SAP_USERNAME,
      Password: process.env.SAP_PASSWORD,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`SAP Login failed for ${db.companyDb}: ${error}`);
  }

  const data = await res.json();
  const sessionId = data.SessionId as string;

  sessionPool.set(countryCode, {
    sessionId,
    companyDb: db.companyDb,
    createdAt: Date.now(),
  });

  return sessionId;
}

export async function sapLogout(countryCode: CountryCode): Promise<void> {
  const session = sessionPool.get(countryCode);
  if (!session) return;

  try {
    await fetch(`${getBaseUrl()}/b1s/v1/Logout`, {
      method: "POST",
      headers: { Cookie: `B1SESSION=${session.sessionId}` },
    });
  } finally {
    sessionPool.delete(countryCode);
  }
}

export async function getSessionId(countryCode: CountryCode): Promise<string> {
  return sapLogin(countryCode);
}

export async function validateSapCredentials(
  companyDb: string,
  username: string,
  password: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const res = await fetch(`${getBaseUrl()}/b1s/v1/Login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ CompanyDB: companyDb, UserName: username, Password: password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: body?.error?.message?.value || "Credenciales invalidas" };
    }

    const data = await res.json();
    return { success: true, sessionId: data.SessionId };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Error de conexion con SAP" };
  }
}
