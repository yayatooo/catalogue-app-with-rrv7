import { eq, inArray } from "drizzle-orm"
import { db } from "~/src/db"
import {
  menuItems,
  menuItemAttributes,
  categories,
  attributes,
  attributeValues,
} from "~/src/db/schema"
import type { CreateMenuItemInput, UpdateMenuItemInput } from "~/src/dto/menu-item.dto"
import type { MenuItemImage } from "~/src/dto/menu-item-image.dto"
import { slugify } from "~/src/helper/slugify"

export class MenuItemServiceError extends Error {
  constructor(
    public readonly code:
      | "SLUG_TAKEN"
      | "INVALID_CATEGORY"
      | "INVALID_ATTRIBUTE_VALUE"
      | "NOT_FOUND",
    message: string,
  ) {
    super(message)
    this.name = "MenuItemServiceError"
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createMenuItem(input: CreateMenuItemInput) {
  const slug = slugify(input.name.en)

  if (input.categoryId) {
    const exists = await categoryExists(input.categoryId)
    if (!exists) throw new MenuItemServiceError("INVALID_CATEGORY", "Category not found")
  }

  if (input.attributeValueIds.length > 0) {
    const valid = await attributeValuesExist(input.attributeValueIds)
    if (!valid)
      throw new MenuItemServiceError(
        "INVALID_ATTRIBUTE_VALUE",
        "One or more attribute values not found",
      )
  }

  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(menuItems)
        .values({
          categoryId: input.categoryId ?? null,
          name: input.name,
          description: input.description ?? null,
          slug,
          basePrice: input.basePrice != null ? String(input.basePrice) : null,
          isActive: input.isActive,
          sortOrder: input.sortOrder,
        })
        .returning({ id: menuItems.id, slug: menuItems.slug })

      if (input.attributeValueIds.length > 0) {
        await tx.insert(menuItemAttributes).values(
          input.attributeValueIds.map((valueId) => ({
            menuItemId: created.id,
            attributeValueId: valueId,
            priceOverride: null,
          })),
        )
      }

      return created
    })
  } catch (err) {
    if (isUniqueViolation(err))
      throw new MenuItemServiceError("SLUG_TAKEN", `An item with slug "${slug}" already exists`)
    throw err
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function listAllMenuItems() {
  return db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      slug: menuItems.slug,
      basePrice: menuItems.basePrice,
      isActive: menuItems.isActive,
      sortOrder: menuItems.sortOrder,
      categoryName: categories.name,
    })
    .from(menuItems)
    .leftJoin(categories, eq(menuItems.categoryId, categories.id))
    .orderBy(menuItems.sortOrder, menuItems.name)
}

export async function getMenuItemWithVariants(id: string) {
  const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1)
  if (!item) return null

  const variants = await db
    .select({
      attributeValueId: menuItemAttributes.attributeValueId,
      priceOverride: menuItemAttributes.priceOverride,
    })
    .from(menuItemAttributes)
    .where(eq(menuItemAttributes.menuItemId, id))

  return { ...item, variants }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateMenuItem(id: string, input: UpdateMenuItemInput) {
  if (input.categoryId) {
    const exists = await categoryExists(input.categoryId)
    if (!exists) throw new MenuItemServiceError("INVALID_CATEGORY", "Category not found")
  }

  const [updated] = await db
    .update(menuItems)
    .set({
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.basePrice !== undefined && {
        basePrice: input.basePrice != null ? String(input.basePrice) : null,
      }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(menuItems.id, id))
    .returning({ id: menuItems.id })

  if (!updated) throw new MenuItemServiceError("NOT_FOUND", "Menu item not found")
  return updated
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteMenuItem(id: string) {
  await db.delete(menuItems).where(eq(menuItems.id, id))
}

// ─── Image management ─────────────────────────────────────────────────────────

export async function addMenuItemImages(id: string, newImages: MenuItemImage[]) {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ images: menuItems.images })
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1)

    if (!existing) throw new MenuItemServiceError("NOT_FOUND", "Menu item not found")

    const merged = [...existing.images, ...newImages].map((img, i) => ({
      ...img,
      sortOrder: i,
    }))

    await tx.update(menuItems).set({ images: merged, updatedAt: new Date() }).where(eq(menuItems.id, id))
    return merged
  })
}

export async function reorderMenuItemImages(id: string, orderedKeys: string[]) {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ images: menuItems.images })
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1)

    if (!existing) throw new MenuItemServiceError("NOT_FOUND", "Menu item not found")

    // Match by key — stable across R2_PUBLIC_URL changes
    const lookup = new Map(existing.images.map((img) => [img.key, img]))
    const reordered = orderedKeys
      .map((key, i) => {
        const img = lookup.get(key)
        return img ? { ...img, sortOrder: i } : null
      })
      .filter((img): img is MenuItemImage => img !== null)

    await tx.update(menuItems).set({ images: reordered, updatedAt: new Date() }).where(eq(menuItems.id, id))
    return reordered
  })
}

export async function removeMenuItemImage(id: string, key: string): Promise<MenuItemImage[]> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ images: menuItems.images })
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1)

    if (!existing) throw new MenuItemServiceError("NOT_FOUND", "Menu item not found")

    const filtered = existing.images
      .filter((img) => img.key !== key)
      .map((img, i) => ({ ...img, sortOrder: i }))

    await tx.update(menuItems).set({ images: filtered, updatedAt: new Date() }).where(eq(menuItems.id, id))
    return filtered
  })
}

// ─── Lookups ──────────────────────────────────────────────────────────────────

export async function listCategoriesForSelect() {
  return db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(categories.slug)
}

export async function listAttributeValuesForSelect() {
  const rows = await db
    .select({
      attributeId: attributes.id,
      attributeLabel: attributes.label,
      attributeSlug: attributes.slug,
      valueId: attributeValues.id,
      valueLabel: attributeValues.label,
      valueSlug: attributeValues.slug,
    })
    .from(attributeValues)
    .innerJoin(attributes, eq(attributeValues.attributeId, attributes.id))
    .orderBy(attributes.slug, attributeValues.sortOrder)

  const grouped = new Map<
    string,
    {
      attributeId: string
      attributeLabel: Record<string, string>
      attributeSlug: string
      values: Array<{ id: string; label: Record<string, string>; slug: string }>
    }
  >()

  for (const r of rows) {
    let group = grouped.get(r.attributeId)
    if (!group) {
      group = {
        attributeId: r.attributeId,
        attributeLabel: r.attributeLabel as Record<string, string>,
        attributeSlug: r.attributeSlug,
        values: [],
      }
      grouped.set(r.attributeId, group)
    }
    group.values.push({
      id: r.valueId,
      label: r.valueLabel as Record<string, string>,
      slug: r.valueSlug,
    })
  }

  return Array.from(grouped.values())
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function categoryExists(id: string): Promise<boolean> {
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)
  return rows.length > 0
}

async function attributeValuesExist(ids: string[]): Promise<boolean> {
  const rows = await db
    .select({ id: attributeValues.id })
    .from(attributeValues)
    .where(inArray(attributeValues.id, ids))
  return rows.length === ids.length
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "23505"
  )
}
