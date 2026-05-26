import { describe, it, expect } from "vitest";
import { bucketViewCount } from "../src/utils/viewCount";

describe("bucketViewCount", () => {
  it("returns null for 0", () => expect(bucketViewCount(0)).toBeNull());
  it("returns null for 99", () => expect(bucketViewCount(99)).toBeNull());
  it("100 → 0.1k+", () => expect(bucketViewCount(100)).toBe("0.1k+"));
  it("199 → 0.1k+", () => expect(bucketViewCount(199)).toBe("0.1k+"));
  it("342 → 0.3k+", () => expect(bucketViewCount(342)).toBe("0.3k+"));
  it("999 → 0.9k+", () => expect(bucketViewCount(999)).toBe("0.9k+"));
  it("1000 → 1k+", () => expect(bucketViewCount(1000)).toBe("1k+"));
  it("1500 → 1k+", () => expect(bucketViewCount(1500)).toBe("1k+"));
  it("9999 → 9k+", () => expect(bucketViewCount(9999)).toBe("9k+"));
  it("10000 → 10k+", () => expect(bucketViewCount(10000)).toBe("10k+"));
  it("50000 → 50k+", () => expect(bucketViewCount(50000)).toBe("50k+"));
});
