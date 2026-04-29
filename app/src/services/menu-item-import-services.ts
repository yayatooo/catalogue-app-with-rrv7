import { and, eq, inArray } from "drizzle-orm";
import { db } from "~/src/db";
import { menuItems, menuItemAttributes } from "../db/schema";
import { categories } from "../db/schema";
import { attributes, attributeValues } from "../db/schema";
import type { MenuItemImportRow } from "~/src/dto/menu-item-import.dto";
import { slugify } from "~/src/helper/slugify";

export type ImportPrecheckResult = {
  missingCategories: string[];
  missingAttributeValues: Array<{ attributeSlug: string; valueSlug: string }>;
  duplicateSlugsInDb: string[];
  duplicateSlugsInFile: string[];
};

export type ImportResult = {
  itemsCreated: number;
  variantsCreated: number;
};

class MenuItemImportService {
  // ─── Public API ────────────────────────────────────────────────

  async precheck(rows: MenuItemImportRow[]): Promise<ImportPrecheckResult> {
    const categorySlugs = uniq(rows.map((r) => r.categorySlug));
    const attrPairs = rows.flatMap((r) =>
      r.variants.map((v) => ({
        attributeSlug: v.attributeSlug,
        valueSlug: v.valueSlug,
      })),
    );
    const generatedSlugs = rows.map((r) => slugify(r.nameEn));

    const [categoryMap, attrValueMap, existingSlugs] = await Promise.all([
      this.findCategoryIdsBySlug(categorySlugs),
      this.findAttributeValueIds(attrPairs),
      this.findExistingMenuItemSlugs(generatedSlugs),
    ]);

    const missingCategories = categorySlugs.filter((s) => !categoryMap.has(s));
    const missingAttributeValues = dedupePairs(attrPairs).filter(
      (p) => !attrValueMap.has(`${p.attributeSlug}|${p.valueSlug}`),
    );

    const seen = new Set<string>();
    const duplicateSlugsInFile = uniq(
      generatedSlugs.filter((s) => {
        if (seen.has(s)) return true;
        seen.add(s);
        return false;
      }),
    );

    return {
      missingCategories,
      missingAttributeValues,
      duplicateSlugsInDb: existingSlugs,
      duplicateSlugsInFile,
    };
  }

  async import(rows: MenuItemImportRow[]): Promise<ImportResult> {
    const categorySlugs = uniq(rows.map((r) => r.categorySlug));
    const attrPairs = rows.flatMap((r) =>
      r.variants.map((v) => ({
        attributeSlug: v.attributeSlug,
        valueSlug: v.valueSlug,
      })),
    );

    const [categoryMap, attrValueMap] = await Promise.all([
      this.findCategoryIdsBySlug(categorySlugs),
      this.findAttributeValueIds(attrPairs),
    ]);

    return await db.transaction(async (tx) => {
      // 1. Insert menu items
      const itemPayloads = rows.map((r) => ({
        categoryId: categoryMap.get(r.categorySlug) ?? null,
        name: { en: r.nameEn },
        description: r.description ?? null,
        slug: slugify(r.nameEn),
        basePrice: r.basePrice != null ? String(r.basePrice) : null,
        isActive: r.isActive,
        sortOrder: r.sortOrder,
      }));

      const inserted = await tx
        .insert(menuItems)
        .values(itemPayloads)
        .returning({ id: menuItems.id, slug: menuItems.slug });

      const slugToId = new Map(inserted.map((i) => [i.slug, i.id]));

      // 2. Build attribute links
      const links: Array<{
        menuItemId: string;
        attributeValueId: string;
        priceOverride: string | null;
      }> = [];

      for (const row of rows) {
        const itemId = slugToId.get(slugify(row.nameEn));
        if (!itemId) continue;
        for (const variant of row.variants) {
          const valueId = attrValueMap.get(
            `${variant.attributeSlug}|${variant.valueSlug}`,
          );
          if (!valueId) continue;
          links.push({
            menuItemId: itemId,
            attributeValueId: valueId,
            priceOverride:
              variant.priceOverride != null
                ? String(variant.priceOverride)
                : null,
          });
        }
      }

      if (links.length > 0) {
        await tx.insert(menuItemAttributes).values(links);
      }

      return { itemsCreated: inserted.length, variantsCreated: links.length };
    });
  }

  // ─── Private query helpers (future repository candidates) ─────

  private async findCategoryIdsBySlug(
    slugs: string[],
  ): Promise<Map<string, string>> {
    if (slugs.length === 0) return new Map();
    const rows = await db
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(inArray(categories.slug, slugs));
    return new Map(rows.map((r) => [r.slug, r.id]));
  }

  private async findAttributeValueIds(
    pairs: Array<{ attributeSlug: string; valueSlug: string }>,
  ): Promise<Map<string, string>> {
    if (pairs.length === 0) return new Map();
    const attrSlugs = uniq(pairs.map((p) => p.attributeSlug));
    const valueSlugs = uniq(pairs.map((p) => p.valueSlug));

    const rows = await db
      .select({
        attrSlug: attributes.slug,
        valueSlug: attributeValues.slug,
        valueId: attributeValues.id,
      })
      .from(attributeValues)
      .innerJoin(attributes, eq(attributeValues.attributeId, attributes.id))
      .where(
        and(
          inArray(attributes.slug, attrSlugs),
          inArray(attributeValues.slug, valueSlugs),
        ),
      );

    return new Map(
      rows.map((r) => [`${r.attrSlug}|${r.valueSlug}`, r.valueId]),
    );
  }

  private async findExistingMenuItemSlugs(slugs: string[]): Promise<string[]> {
    if (slugs.length === 0) return [];
    const rows = await db
      .select({ slug: menuItems.slug })
      .from(menuItems)
      .where(inArray(menuItems.slug, slugs));
    return rows.map((r) => r.slug);
  }
}

// ─── Utilities ──────────────────────────────────────────────────

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function dedupePairs(
  pairs: Array<{ attributeSlug: string; valueSlug: string }>,
): Array<{ attributeSlug: string; valueSlug: string }> {
  const seen = new Set<string>();
  const out: Array<{ attributeSlug: string; valueSlug: string }> = [];
  for (const p of pairs) {
    const key = `${p.attributeSlug}|${p.valueSlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export const menuItemImportService = new MenuItemImportService();
