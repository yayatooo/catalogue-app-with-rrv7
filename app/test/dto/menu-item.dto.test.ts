import { describe, it, expect } from "vitest";
import { createMenuItemDto, updateMenuItemDto } from "~/src/dto/menu-item.dto";

const VALID_UUID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

// ─── createMenuItemDto ────────────────────────────────────────────────────────

describe("createMenuItemDto", () => {
  it("accepts minimal valid data", () => {
    const result = createMenuItemDto.safeParse({ name: { en: "Iced Coffee" } });
    expect(result.success).toBe(true);
  });

  it("accepts full valid data", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      description: "Cold brew over ice",
      categoryId: VALID_UUID,
      basePrice: 3.5,
      sortOrder: 2,
      isActive: false,
      attributeValueIds: [VALID_UUID],
    });
    expect(result.success).toBe(true);
  });

  it("defaults sortOrder to 0", () => {
    const result = createMenuItemDto.safeParse({ name: { en: "Iced Coffee" } });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sortOrder).toBe(0);
  });

  it("defaults isActive to true", () => {
    const result = createMenuItemDto.safeParse({ name: { en: "Iced Coffee" } });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isActive).toBe(true);
  });

  it("defaults attributeValueIds to []", () => {
    const result = createMenuItemDto.safeParse({ name: { en: "Iced Coffee" } });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.attributeValueIds).toEqual([]);
  });

  it("rejects empty English name", () => {
    const result = createMenuItemDto.safeParse({ name: { en: "" } });
    expect(result.success).toBe(false);
  });

  it("rejects name over 255 characters", () => {
    const result = createMenuItemDto.safeParse({ name: { en: "a".repeat(256) } });
    expect(result.success).toBe(false);
  });

  it("rejects description over 2000 characters", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      description: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts null description", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      description: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid categoryId (not uuid)", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      categoryId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null categoryId", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      categoryId: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative basePrice", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      basePrice: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero basePrice", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      basePrice: 0,
    });
    expect(result.success).toBe(true);
  });

  it("coerces string basePrice to number", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      basePrice: "4.50",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.basePrice).toBe(4.5);
  });

  it("rejects non-uuid in attributeValueIds", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      attributeValueIds: ["not-a-uuid"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts multiple valid attributeValueIds", () => {
    const result = createMenuItemDto.safeParse({
      name: { en: "Iced Coffee" },
      attributeValueIds: [VALID_UUID, "550e8400-e29b-41d4-a716-446655440000"],
    });
    expect(result.success).toBe(true);
  });
});

// ─── updateMenuItemDto ────────────────────────────────────────────────────────

describe("updateMenuItemDto", () => {
  it("accepts empty object (all fields optional)", () => {
    const result = updateMenuItemDto.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts partial update with only name", () => {
    const result = updateMenuItemDto.safeParse({ name: { en: "Hot Coffee" } });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with only isActive", () => {
    const result = updateMenuItemDto.safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with only basePrice", () => {
    const result = updateMenuItemDto.safeParse({ basePrice: 5.0 });
    expect(result.success).toBe(true);
  });

  it("does not accept attributeValueIds (omitted from update schema)", () => {
    const result = updateMenuItemDto.safeParse({
      attributeValueIds: [VALID_UUID],
    });
    // Zod strips unknown keys by default — should still succeed but strip the field
    if (result.success) {
      expect((result.data as Record<string, unknown>).attributeValueIds).toBeUndefined();
    }
  });

  it("rejects empty English name", () => {
    const result = updateMenuItemDto.safeParse({ name: { en: "" } });
    expect(result.success).toBe(false);
  });

  it("rejects negative basePrice", () => {
    const result = updateMenuItemDto.safeParse({ basePrice: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid categoryId", () => {
    const result = updateMenuItemDto.safeParse({ categoryId: "bad-id" });
    expect(result.success).toBe(false);
  });
});
