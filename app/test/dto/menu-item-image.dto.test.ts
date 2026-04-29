import { describe, it, expect } from "vitest";
import {
  menuItemImageDto,
  reorderImagesDto,
  removeImageDto,
} from "~/src/dto/menu-item-image.dto";

// ─── menuItemImageDto ─────────────────────────────────────────────────────────

describe("menuItemImageDto", () => {
  it("accepts valid image with all fields", () => {
    const result = menuItemImageDto.safeParse({
      key: "products/abc/photo.jpg",
      url: "https://cdn.example.com/products/abc/photo.jpg",
      alt: "A glass of iced coffee",
      sortOrder: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts image without optional alt", () => {
    const result = menuItemImageDto.safeParse({
      key: "products/abc/photo.jpg",
      url: "https://cdn.example.com/products/abc/photo.jpg",
      sortOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it("defaults sortOrder to 0", () => {
    const result = menuItemImageDto.safeParse({
      key: "products/abc/photo.jpg",
      url: "https://cdn.example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sortOrder).toBe(0);
  });

  it("rejects missing key", () => {
    const result = menuItemImageDto.safeParse({
      url: "https://cdn.example.com/photo.jpg",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty key", () => {
    const result = menuItemImageDto.safeParse({
      key: "",
      url: "https://cdn.example.com/photo.jpg",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing url", () => {
    const result = menuItemImageDto.safeParse({
      key: "products/abc/photo.jpg",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid url", () => {
    const result = menuItemImageDto.safeParse({
      key: "products/abc/photo.jpg",
      url: "not-a-url",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ─── reorderImagesDto ─────────────────────────────────────────────────────────

describe("reorderImagesDto", () => {
  it("accepts a list of keys", () => {
    const result = reorderImagesDto.safeParse({
      keys: ["products/abc/a.jpg", "products/abc/b.jpg"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a single key", () => {
    const result = reorderImagesDto.safeParse({
      keys: ["products/abc/a.jpg"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty keys array", () => {
    const result = reorderImagesDto.safeParse({ keys: [] });
    expect(result.success).toBe(false);
  });

  it("rejects empty string inside keys", () => {
    const result = reorderImagesDto.safeParse({ keys: [""] });
    expect(result.success).toBe(false);
  });

  it("rejects missing keys field", () => {
    const result = reorderImagesDto.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── removeImageDto ───────────────────────────────────────────────────────────

describe("removeImageDto", () => {
  it("accepts a valid storage key", () => {
    const result = removeImageDto.safeParse({ key: "products/abc/photo.jpg" });
    expect(result.success).toBe(true);
  });

  it("rejects empty key", () => {
    const result = removeImageDto.safeParse({ key: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing key field", () => {
    const result = removeImageDto.safeParse({});
    expect(result.success).toBe(false);
  });
});
