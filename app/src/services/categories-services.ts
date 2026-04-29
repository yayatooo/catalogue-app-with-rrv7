import { db } from "../db/index";
import { categories } from "../db/schema/index";
import { eq, asc, sql } from "drizzle-orm";
import type { NewCategory } from "../db/schema/index";

export async function getAllCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function createCategory(data: NewCategory) {
  const rows = await db.insert(categories).values(data).returning();
  return rows[0];
}

export async function reorderCategories(orderedIds: string[]) {
  await db.transaction(async (tx) => {
    await Promise.all(
      orderedIds.map((id, index) =>
        tx
          .update(categories)
          .set({ sortOrder: index, updatedAt: new Date() })
          .where(eq(categories.id, id))
      )
    );
  });
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<NewCategory, "id">>,
) {
  const rows = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function getCategoryById(id: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function deleteCategory(id: string) {
  const rows = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();
  return rows[0] ?? null;
}
