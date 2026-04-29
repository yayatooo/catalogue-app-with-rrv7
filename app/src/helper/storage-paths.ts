import { randomUUID } from "node:crypto";

const SAFE_FILENAME = /[^a-zA-Z0-9._-]/g;

function safeFilename(name: string): string {
  return name.replace(SAFE_FILENAME, "_").slice(-100); // cap length
}

export const storagePaths = {
  menuItemImage(menuItemId: string, originalFilename: string): string {
    return `products/${menuItemId}/${randomUUID()}-${safeFilename(originalFilename)}`;
  },
  promoImage(promoId: string, originalFilename: string): string {
    return `promos/${promoId}/${randomUUID()}-${safeFilename(originalFilename)}`;
  },
};
