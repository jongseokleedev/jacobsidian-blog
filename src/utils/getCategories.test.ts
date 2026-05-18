import { describe, it, expect } from "vitest";
import { parseCategory, getCategoryMeta, getParentMeta, allCategories, PARENTS } from "./getCategories";

describe("parseCategory", () => {
  it("splits category key into parent and sub", () => {
    expect(parseCategory("tech-dev")).toEqual({ parent: "tech", sub: "dev" });
    expect(parseCategory("essay-thought")).toEqual({ parent: "essay", sub: "thought" });
  });
});

describe("getCategoryMeta", () => {
  it("returns correct meta for valid category", () => {
    const meta = getCategoryMeta("tech-dev");
    expect(meta?.label).toBe("Dev");
  });

  it("returns undefined for unknown category", () => {
    expect(getCategoryMeta("unknown-cat")).toBeUndefined();
  });
});

describe("getParentMeta", () => {
  it("returns parent meta", () => {
    expect(getParentMeta("essay-thought")?.label).toBe("Essay");
  });

  it("returns undefined for unknown parent", () => {
    expect(getParentMeta("nope-thing")).toBeUndefined();
  });
});

describe("allCategories", () => {
  it("returns flattened list of all category entries", () => {
    const cats = allCategories();
    const keys = cats.map(([k]) => k);
    expect(keys).toContain("tech-dev");
    expect(keys).toContain("essay-journal");
    expect(cats.length).toBe(
      Object.values(PARENTS).reduce((sum, p) => sum + Object.keys(p.subs).length, 0)
    );
  });
});
