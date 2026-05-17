import { describe, it, expect } from "vitest";
import { buildGraphData } from "../src/utils/buildGraph";

describe("buildGraphData", () => {
  it("creates nodes for each post", () => {
    const posts = [{ id: "a", slug: "a", title: "A", tags: ["t1"], links: [], url: "/tech/a", type: "post" as const }];
    const { nodes } = buildGraphData(posts);
    expect(nodes.some(n => n.id === "a")).toBe(true);
  });

  it("creates tag nodes", () => {
    const posts = [{ id: "a", slug: "a", title: "A", tags: ["t1"], links: [], url: "/tech/a", type: "post" as const }];
    const { nodes } = buildGraphData(posts);
    expect(nodes.some(n => n.id === "tag:t1")).toBe(true);
  });

  it("creates wikilink edges", () => {
    const items = [
      { id: "a", slug: "a", title: "A", tags: [], links: ["b"], url: "/tech/a", type: "post" as const },
      { id: "b", slug: "b", title: "B", tags: [], links: [], url: "/tech/b", type: "post" as const },
    ];
    const { edges } = buildGraphData(items);
    expect(edges).toContainEqual({ source: "a", target: "b", type: "wikilink" });
  });

  it("creates tag edges from post to tag node (hub-spoke)", () => {
    const items = [
      { id: "a", slug: "a", title: "A", tags: ["t1"], links: [], url: "/tech/a", type: "post" as const },
      { id: "b", slug: "b", title: "B", tags: ["t1"], links: [], url: "/tech/b", type: "post" as const },
    ];
    const { edges } = buildGraphData(items);
    const tagEdges = edges.filter(e => e.type === "tag");
    expect(tagEdges).toContainEqual({ source: "a", target: "tag:t1", type: "tag" });
    expect(tagEdges).toContainEqual({ source: "b", target: "tag:t1", type: "tag" });
    // no direct post↔post tag edge
    expect(tagEdges.some(e => (e.source === "a" && e.target === "b") || (e.source === "b" && e.target === "a"))).toBe(false);
  });

  it("returns empty for no items", () => {
    const { nodes, edges } = buildGraphData([]);
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });
});
