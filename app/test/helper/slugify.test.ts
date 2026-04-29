import { describe, it, expect } from "vitest";
import { slugify } from "~/src/helper/slugify";

describe("slugify", () => {
  it("lowercases input", () => {
    expect(slugify("Iced Coffee")).toBe("iced-coffee");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("hot drinks")).toBe("hot-drinks");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  latte  ")).toBe("latte");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(slugify("iced   coffee")).toBe("iced-coffee");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("iced--coffee")).toBe("iced-coffee");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("-coffee-")).toBe("coffee");
  });

  it("removes accents (NFKD normalisation)", () => {
    expect(slugify("café")).toBe("cafe");
    expect(slugify("crème brûlée")).toBe("creme-brulee");
  });

  it("removes special characters", () => {
    expect(slugify("espresso!")).toBe("espresso");
    expect(slugify("100% arabica")).toBe("100-arabica");
  });

  it("preserves numbers", () => {
    expect(slugify("top 10 drinks")).toBe("top-10-drinks");
  });

  it("handles already valid slug", () => {
    expect(slugify("iced-coffee")).toBe("iced-coffee");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles string of only special characters", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("handles mixed case with numbers and symbols", () => {
    expect(slugify("Latte #2 (large)")).toBe("latte-2-large");
  });
});
