import { db } from "../db/index";
import { sessions } from "../db/schema/index";
import { eq, lt } from "drizzle-orm";

export async function createSession(userId: string, durationMs: number) {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + durationMs);

  const rows = await db
    .insert(sessions)
    .values({ id, userId, expiresAt })
    .returning();

  return rows[0];
}

export async function getSession(sessionId: string) {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const session = rows[0] ?? null;
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await deleteSession(sessionId);
    return null;
  }

  return session;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteSessionsByUserId(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function deleteExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
