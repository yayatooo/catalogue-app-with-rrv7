import { z } from "zod";

export const createMenuItemDto = z.object({
  name: z.object({
    en: z.string().min(1, "English name is required").max(255),
  }),
  description: z.string().max(2000).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  basePrice: z.coerce.number().nonnegative().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
  attributeValueIds: z.array(z.string().uuid()).default([]),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemDto>;

// For the edit page
export const updateMenuItemDto = createMenuItemDto
  .omit({ attributeValueIds: true })
  .partial();
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemDto>;
