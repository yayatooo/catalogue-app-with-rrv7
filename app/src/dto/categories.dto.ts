import { z } from "zod";

const localizedString = z.record(z.string(), z.string().min(1));

export const createCategorySchema = z.object({
  name: localizedString,
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase-kebab-case"),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(z.uuid()).min(1),
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesDTO = z.infer<typeof reorderCategoriesSchema>;
