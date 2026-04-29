import { z } from "zod";

export const menuItemImportRowDto = z.object({
  nameEn: z.string().min(1, "name_en is required").max(255),
  description: z.string().nullable().optional(),
  categorySlug: z.string().min(1, "category is required"),
  basePrice: z.coerce.number().nonnegative().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
  variants: z
    .array(
      z.object({
        attributeSlug: z.string(),
        valueSlug: z.string(),
        priceOverride: z.coerce.number().nonnegative().nullable().optional(),
      }),
    )
    .default([]),
});

export type MenuItemImportRow = z.infer<typeof menuItemImportRowDto>;

export const menuItemImportBulkDto = z.object({
  rows: z.array(menuItemImportRowDto).min(1),
});
