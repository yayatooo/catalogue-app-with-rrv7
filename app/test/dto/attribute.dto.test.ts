import { describe, it, expect } from "vitest";
import {
  createAttributeSchema,
  updateAttributeSchema,
  createAttributeValueSchema,
  updateAttributeValueSchema,
  reorderAttributeValuesSchema,
} from "~/src/dto/attribute.dto";

describe("createAttributeSchema", () => {
  it("accepts valid data", () => {
    const result = createAttributeSchema.safeParse({
      label: { en: "Color" },
      slug: "color",
    });
    expect(result.success).toBe(true);
  });

  it("accepts multiple locales", () => {
    const result = createAttributeSchema.safeParse({
      label: { en: "Color", km: "ពណ៌", zh: "颜色", id: "Warna" },
      slug: "color",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty label value", () => {
    const result = createAttributeSchema.safeParse({
      label: { en: "" },
      slug: "color",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug (uppercase)", () => {
    const result = createAttributeSchema.safeParse({
      label: { en: "Color" },
      slug: "Color",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const result = createAttributeSchema.safeParse({
      label: { en: "Spice Level" },
      slug: "spice level",
    });
    expect(result.success).toBe(false);
  });

  it("accepts kebab-case slug", () => {
    const result = createAttributeSchema.safeParse({
      label: { en: "Spice Level" },
      slug: "spice-level",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateAttributeSchema", () => {
  it("accepts partial data", () => {
    const result = updateAttributeSchema.safeParse({ slug: "new-slug" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateAttributeSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("createAttributeValueSchema", () => {
  it("accepts valid data", () => {
    const result = createAttributeValueSchema.safeParse({
      attributeId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      label: { en: "Mild" },
      slug: "mild",
    });
    expect(result.success).toBe(true);
  });

  it("defaults sortOrder to 0", () => {
    const result = createAttributeValueSchema.safeParse({
      attributeId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      label: { en: "Mild" },
      slug: "mild",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sortOrder).toBe(0);
  });

  it("rejects non-uuid attributeId", () => {
    const result = createAttributeValueSchema.safeParse({
      attributeId: "not-a-uuid",
      label: { en: "Mild" },
      slug: "mild",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative sortOrder", () => {
    const result = createAttributeValueSchema.safeParse({
      attributeId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      label: { en: "Mild" },
      slug: "mild",
      sortOrder: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateAttributeValueSchema", () => {
  it("accepts partial update without attributeId", () => {
    const result = updateAttributeValueSchema.safeParse({ slug: "hot" });
    expect(result.success).toBe(true);
  });
});

describe("reorderAttributeValuesSchema", () => {
  it("accepts a list of uuids", () => {
    const result = reorderAttributeValuesSchema.safeParse({
      orderedIds: [
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "550e8400-e29b-41d4-a716-446655440000",
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty list", () => {
    const result = reorderAttributeValuesSchema.safeParse({ orderedIds: [] });
    expect(result.success).toBe(false);
  });

  it("rejects non-uuid entries", () => {
    const result = reorderAttributeValuesSchema.safeParse({
      orderedIds: ["not-a-uuid"],
    });
    expect(result.success).toBe(false);
  });
});
