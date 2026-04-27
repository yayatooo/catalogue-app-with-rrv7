import { db } from "../db/index";
import { users } from "../db/schema/index";
import { eq } from "drizzle-orm";
import { createSession, deleteSessionsByUserId } from "./session-services";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(":");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
}) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing.length > 0) throw new Error("Email already in use");

  const passwordHash = hashPassword(data.password);

  const rows = await db
    .insert(users)
    .values({ email: data.email, passwordHash, name: data.name })
    .returning();

  const user = rows[0];
  const session = await createSession(user.id, SESSION_DURATION_MS);

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, session };
}

export async function login(email: string, password: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  if (!user) throw new Error("Invalid email or password");

  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  const session = await createSession(user.id, SESSION_DURATION_MS);

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, session };
}

export async function logout(userId: string) {
  await deleteSessionsByUserId(userId);
}

export async function getUserById(id: string) {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function updatePassword(userId: string, newPassword: string) {
  const passwordHash = hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function getAllUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users);
}

export async function deleteUser(id: string) {
  await db.delete(users).where(eq(users.id, id));
}
