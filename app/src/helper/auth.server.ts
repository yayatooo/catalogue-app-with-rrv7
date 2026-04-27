import { redirect } from "react-router";
import { getSession } from "../services/session-services";
import { getUserById } from "../services/auth-services";

const SESSION_COOKIE = "session_id";

export function getSessionId(request: Request): string | null {
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return match ? match.slice(SESSION_COOKIE.length + 1) : null;
}

export function createSessionCookie(sessionId: string, expiresAt: Date): string {
  return [
    `${SESSION_COOKIE}=${sessionId}`,
    `Expires=${expiresAt.toUTCString()}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;
}

export async function requireAuth(request: Request) {
  const sessionId = getSessionId(request);
  if (!sessionId) throw redirect("/login");

  const session = await getSession(sessionId);
  if (!session) throw redirect("/login");

  const user = await getUserById(session.userId);
  if (!user) throw redirect("/login");

  return user;
}

export async function requireGuest(request: Request) {
  const sessionId = getSessionId(request);
  if (!sessionId) return;

  const session = await getSession(sessionId);
  if (session) throw redirect("/admin/categories");
}
