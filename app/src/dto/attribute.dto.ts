import { z } from "zod";

const localizedString = z.record(z.string(), z.string().min(1));

const slugField = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase-kebab-case");

// ─── Attribute ────────────────────────────────────────────────────────────────

export const createAttributeSchema = z.object({
  label: localizedString,
  slug: slugField,
});

export const updateAttributeSchema = createAttributeSchema.partial();

export type CreateAttributeDTO = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeDTO = z.infer<typeof updateAttributeSchema>;

// ─── Attribute Value ──────────────────────────────────────────────────────────

export const createAttributeValueSchema = z.object({
  attributeId: z.uuid(),
  label: localizedString,
  slug: slugField,
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateAttributeValueSchema = createAttributeValueSchema
  .omit({ attributeId: true })
  .partial();

export const reorderAttributeValuesSchema = z.object({
  orderedIds: z.array(z.uuid()).min(1),
});

export type CreateAttributeValueDTO = z.infer<typeof createAttributeValueSchema>;
export type UpdateAttributeValueDTO = z.infer<typeof updateAttributeValueSchema>;
export type ReorderAttributeValuesDTO = z.infer<typeof reorderAttributeValuesSchema>;
