import { describe, it, expect } from "vitest";
import { generateNickname, SITUATIONS, ANIMALS } from "../src/components/comments/lib";

describe("generateNickname", () => {
  it("returns a string", () => {
    expect(typeof generateNickname()).toBe("string");
  });

  it("contains a known situation and animal", () => {
    const nick = generateNickname();
    const hasSituation = SITUATIONS.some(s => nick.includes(s));
    const hasAnimal = ANIMALS.some(a => nick.includes(a));
    expect(hasSituation).toBe(true);
    expect(hasAnimal).toBe(true);
  });

  it("generates variety across multiple calls", () => {
    const nicks = new Set(Array.from({ length: 20 }, generateNickname));
    expect(nicks.size).toBeGreaterThan(5);
  });
});
