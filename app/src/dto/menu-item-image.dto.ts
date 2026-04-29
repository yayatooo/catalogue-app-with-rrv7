import { z } from "zod";

// Matches your jsonb shape; adjust if MenuItemImage has different fields
export const menuItemImageDto = z.object({
  key: z.string().min(1),   // storage path — stable across URL changes
  url: z.string().url(),
  alt: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export type MenuItemImage = z.infer<typeof menuItemImageDto>;

// For reorder action — ordered array of storage keys
export const reorderImagesDto = z.object({
  keys: z.array(z.string().min(1)).min(1),
});

// For remove action — storage key
export const removeImageDto = z.object({
  key: z.string().min(1),
});
