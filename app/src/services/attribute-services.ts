import { db } from "../db/index";
import { attributes, attributeValues } from "../db/schema/index";
import { eq, asc } from "drizzle-orm";
import type { NewAttribute, NewAttributeValue } from "../db/schema/index";

// ─── Attributes ───────────────────────────────────────────────────────────────

export async function getAllAttributes() {
  return db.select().from(attributes).orderBy(asc(attributes.createdAt));
}

export async function getAttributeById(id: string) {
  const rows = await db
    .select()
    .from(attributes)
    .where(eq(attributes.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAttributeBySlug(slug: string) {
  const rows = await db
    .select()
    .from(attributes)
    .where(eq(attributes.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAttributeWithValues(id: string) {
  const rows = await db.query.attributes.findFirst({
    where: eq(attributes.id, id),
    with: { values: { orderBy: asc(attributeValues.sortOrder) } },
  });
  return rows ?? null;
}

export async function getAllAttributesWithValues() {
  return db.query.attributes.findMany({
    orderBy: asc(attributes.createdAt),
    with: { values: { orderBy: asc(attributeValues.sortOrder) } },
  });
}

export async function createAttribute(data: NewAttribute) {
  const rows = await db.insert(attributes).values(data).returning();
  return rows[0];
}

export async function updateAttribute(
  id: string,
  data: Partial<Omit<NewAttribute, "id">>
) {
  const rows = await db
    .update(attributes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(attributes.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteAttribute(id: string) {
  const rows = await db
    .delete(attributes)
    .where(eq(attributes.id, id))
    .returning();
  return rows[0] ?? null;
}

// ─── Attribute Values ─────────────────────────────────────────────────────────

export async function getValuesByAttributeId(attributeId: string) {
  return db
    .select()
    .from(attributeValues)
    .where(eq(attributeValues.attributeId, attributeId))
    .orderBy(asc(attributeValues.sortOrder));
}

export async function getAttributeValueById(id: string) {
  const rows = await db
    .select()
    .from(attributeValues)
    .where(eq(attributeValues.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createAttributeValue(data: NewAttributeValue) {
  const rows = await db.insert(attributeValues).values(data).returning();
  return rows[0];
}

export async function updateAttributeValue(
  id: string,
  data: Partial<Omit<NewAttributeValue, "id">>
) {
  const rows = await db
    .update(attributeValues)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(attributeValues.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteAttributeValue(id: string) {
  const rows = await db
    .delete(attributeValues)
    .where(eq(attributeValues.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function reorderAttributeValues(orderedIds: string[]) {
  await db.transaction(async (tx) => {
    await Promise.all(
      orderedIds.map((id, index) =>
        tx
          .update(attributeValues)
          .set({ sortOrder: index, updatedAt: new Date() })
          .where(eq(attributeValues.id, id))
      )
    );
  });
}
