import { describe, expect, it } from "vitest";
import { buildLinkMap } from "./linkMap";

describe("buildLinkMap", () => {
  it("indexes posts by basename, title, and slug", () => {
    const map = buildLinkMap(
      [
        {
          basename: "Untitled",
          slug: "20260513-1350",
          title: "AI 시대",
          url: "/it/20260513-1350/",
        },
      ],
      []
    );
    expect(map.get("Untitled")?.url).toBe("/it/20260513-1350/");
    expect(map.get("AI 시대")?.url).toBe("/it/20260513-1350/");
    expect(map.get("20260513-1350")?.url).toBe("/it/20260513-1350/");
  });

  it("indexes books too", () => {
    const map = buildLinkMap(
      [],
      [
        {
          basename: "존재와시간",
          slug: "20260101-0900",
          title: "존재와 시간",
          url: "/books/20260101-0900/",
        },
      ]
    );
    expect(map.get("존재와시간")?.url).toBe("/books/20260101-0900/");
    expect(map.get("존재와 시간")?.url).toBe("/books/20260101-0900/");
  });

  it("returns undefined for unknown targets", () => {
    const map = buildLinkMap([], []);
    expect(map.get("missing")).toBeUndefined();
  });
});
