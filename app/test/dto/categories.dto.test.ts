import { describe, it, expect } from "vitest";
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
} from "~/src/dto/categories.dto";

describe("createCategorySchema", () => {
  it("accepts valid data", () => {
    const result = createCategorySchema.safeParse({
      name: { en: "Drinks" },
      slug: "drinks",
    });
    expect(result.success).toBe(true);
  });

  it("accepts multiple locales", () => {
    const result = createCategorySchema.safeParse({
      name: { en: "Drinks", km: "ភេសជ្ជៈ", zh: "饮料", id: "Minuman" },
      slug: "drinks",
    });
    expect(result.success).toBe(true);
  });

  it("defaults sortOrder to 0", () => {
    const result = createCategorySchema.safeParse({
      name: { en: "Drinks" },
      slug: "drinks",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sortOrder).toBe(0);
  });

  it("defaults isActive to true", () => {
    const result = createCategorySchema.safeParse({
      name: { en: "Drinks" },
      slug: "drinks",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isActive).toBe(true);
  });

  it("rejects empty name value", () => {
    const result = createCategorySchema.safeParse({
      name: { en: "" },
      slug: "drinks",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with uppercase letters", () => {
    const result = createCategorySchema.safeParse({
      name: { en: "Drinks" },
      slug: "Drinks",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const result = createCategorySchema.safeParse({
      name: { en: "Hot Drinks" },
      slug: "hot drinks",
    });
    expect(result.success).toBe(false);
  });

  it("accepts kebab-case slug", () => {
    const result = createCategorySchema.safeParse({
      name: { en: "Hot Drinks" },
      slug: "hot-drinks",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative sortOrder", () => {
    const result = createCategorySchema.safeParse({
      name: { en: "Drinks" },
      slug: "drinks",
      sortOrder: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCategorySchema", () => {
  it("accepts partial data", () => {
    const result = updateCategorySchema.safeParse({ slug: "new-drinks" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateCategorySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts isActive false", () => {
    const result = updateCategorySchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });
});

describe("reorderCategoriesSchema", () => {
  it("accepts a list of uuids", () => {
    const result = reorderCategoriesSchema.safeParse({
      orderedIds: [
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "550e8400-e29b-41d4-a716-446655440000",
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty list", () => {
    const result = reorderCategoriesSchema.safeParse({ orderedIds: [] });
    expect(result.success).toBe(false);
  });

  it("rejects non-uuid entries", () => {
    const result = reorderCategoriesSchema.safeParse({
      orderedIds: ["not-a-uuid"],
    });
    expect(result.success).toBe(false);
  });
});
