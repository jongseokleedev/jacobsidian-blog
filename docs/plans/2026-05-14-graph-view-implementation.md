# Graph View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an Obsidian-style interactive graph view showing connections between posts and books via wikilinks and tags, accessible from the nav bar and as mini-graphs on each post/book page.

**Architecture:** sync script extracts `[[wikilinks]]` before transforming them and saves them as frontmatter `links: []`; a build-time Astro integration generates `public/graph.json`; a D3.js component renders the graph with force simulation. Full `/graph` page + mini-graph on post/book detail pages.

**Tech Stack:** D3.js v7 (CDN, no bundle), Astro v5, TypeScript strict, Tailwind CSS v4

---

### Task 1: Add `links` field to content schema

**Files:**
- Modify: `src/content.config.ts`

**Step 1: Add `links` to both collection schemas**

In `src/content.config.ts`, add `links: z.array(z.string()).default([])` to both `posts` and `books` schema objects.

```typescript
// posts schema — add after tags line:
links: z.array(z.string()).default([]),

// books schema — add after tags line:
links: z.array(z.string()).default([]),
```

**Step 2: Run type check**

```bash
pnpm run build 2>&1 | head -30
```
Expected: no type errors related to schema

**Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat(schema): add links field to posts and books collections"
```

---

### Task 2: Extract wikilinks in sync script before transformation

**Files:**
- Modify: `scripts/sync.ts`
- Modify: `scripts/lib/normalize.ts` (or wherever frontmatter is written)

**Step 1: Write failing test in `scripts/sync.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { extractWikilinks } from "./lib/transform";

describe("extractWikilinks", () => {
  it("extracts simple wikilinks", () => {
    expect(extractWikilinks("see [[note-a]] and [[note-b]]"))
      .toEqual(["note-a", "note-b"]);
  });

  it("extracts alias wikilinks (target only)", () => {
    expect(extractWikilinks("see [[note-a|alias]]")).toEqual(["note-a"]);
  });

  it("extracts section wikilinks (file only)", () => {
    expect(extractWikilinks("see [[note-a#section]]")).toEqual(["note-a"]);
  });

  it("ignores image embeds ![[img.png]]", () => {
    expect(extractWikilinks("![[image.png]]")).toEqual([]);
  });

  it("returns empty for no wikilinks", () => {
    expect(extractWikilinks("plain text")).toEqual([]);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
pnpm test -- --reporter=verbose 2>&1 | grep -A5 "extractWikilinks"
```
Expected: FAIL with "extractWikilinks is not exported"

**Step 3: Add `extractWikilinks` to `scripts/lib/transform.ts`**

```typescript
export function extractWikilinks(markdown: string): string[] {
  const pattern = /(?<!!)\[\[([^\[\]\n]+)\]\]/g;
  const links: string[] = [];
  for (const match of markdown.matchAll(pattern)) {
    const inner = match[1];
    const target = inner.split("|")[0].split("#")[0].trim();
    links.push(target);
  }
  return [...new Set(links)];
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm test -- --reporter=verbose 2>&1 | grep -A5 "extractWikilinks"
```
Expected: all 5 tests PASS

**Step 5: Use `extractWikilinks` in `scripts/sync.ts` before `transformWikilinks`**

In `sync.ts`, find where post/book content is processed. Before calling `transformWikilinks`, extract links and add to frontmatter:

```typescript
import { extractWikilinks, transformWikilinks, /* ... */ } from "./lib/transform";

// Inside the processing loop, before transformWikilinks:
const links = extractWikilinks(body);
// Then pass links into the frontmatter normalization:
const frontmatter = normalizePostFrontmatter({ ...raw.frontmatter, links }, ...);
```

Ensure `normalizePostFrontmatter` and `normalizeBookFrontmatter` in `scripts/lib/normalize.ts` pass `links` through to the output YAML.

**Step 6: Run sync dry-run to verify**

```bash
pnpm run sync 2>&1 | head -20
```
Expected: no errors

**Step 7: Commit**

```bash
git add scripts/lib/transform.ts scripts/sync.ts scripts/lib/normalize.ts scripts/sync.test.ts
git commit -m "feat(sync): extract wikilinks into frontmatter links field"
```

---

### Task 3: Build-time graph.json generation

**Files:**
- Create: `src/utils/buildGraph.ts`
- Modify: `astro.config.ts`

**Step 1: Write failing test**

```typescript
// scripts/buildGraph.test.ts
import { describe, it, expect } from "vitest";
import { buildGraphData } from "../src/utils/buildGraph";

describe("buildGraphData", () => {
  it("creates nodes for each post", () => {
    const posts = [{ id: "a", slug: "a", title: "A", tags: ["t1"], links: [], url: "/tech/a", type: "post" as const }];
    const { nodes } = buildGraphData(posts, []);
    expect(nodes).toHaveLength(2); // post + tag node
    expect(nodes[0].id).toBe("a");
  });

  it("creates wikilink edges", () => {
    const nodes = [
      { id: "a", slug: "a", title: "A", tags: [], links: ["b"], url: "/tech/a", type: "post" as const },
      { id: "b", slug: "b", title: "B", tags: [], links: [], url: "/tech/b", type: "post" as const },
    ];
    const { edges } = buildGraphData(nodes, []);
    expect(edges).toContainEqual({ source: "a", target: "b", type: "wikilink" });
  });

  it("creates tag edges", () => {
    const nodes = [
      { id: "a", slug: "a", title: "A", tags: ["t1"], links: [], url: "/tech/a", type: "post" as const },
      { id: "b", slug: "b", title: "B", tags: ["t1"], links: [], url: "/tech/b", type: "post" as const },
    ];
    const { edges } = buildGraphData(nodes, []);
    expect(edges.filter(e => e.type === "tag")).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
pnpm test -- --reporter=verbose 2>&1 | grep -A5 "buildGraphData"
```
Expected: FAIL

**Step 3: Create `src/utils/buildGraph.ts`**

```typescript
export interface GraphNode {
  id: string;
  title: string;
  url: string;
  type: "post" | "book" | "tag";
  tags: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "wikilink" | "tag";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface InputNode {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  links: string[];
  url: string;
  type: "post" | "book";
}

export function buildGraphData(items: InputNode[], _unused: unknown[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const tagNodes = new Map<string, GraphNode>();
  const slugToId = new Map<string, string>();

  for (const item of items) {
    nodes.push({ id: item.id, title: item.title, url: item.url, type: item.type, tags: item.tags });
    slugToId.set(item.slug, item.id);
    slugToId.set(item.title, item.id);
    slugToId.set(item.id, item.id);

    for (const tag of item.tags) {
      if (!tagNodes.has(tag)) {
        tagNodes.set(tag, { id: `tag:${tag}`, title: tag, url: `/tags/${tag}`, type: "tag", tags: [] });
      }
    }
  }

  for (const [, tagNode] of tagNodes) nodes.push(tagNode);

  // wikilink edges
  for (const item of items) {
    for (const link of item.links) {
      const targetId = slugToId.get(link);
      if (targetId && targetId !== item.id) {
        edges.push({ source: item.id, target: targetId, type: "wikilink" });
      }
    }
  }

  // tag edges (between posts/books sharing a tag, not via tag node)
  const tagToItems = new Map<string, string[]>();
  for (const item of items) {
    for (const tag of item.tags) {
      if (!tagToItems.has(tag)) tagToItems.set(tag, []);
      tagToItems.get(tag)!.push(item.id);
    }
  }
  for (const [, ids] of tagToItems) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        edges.push({ source: ids[i], target: ids[j], type: "tag" });
      }
    }
  }

  return { nodes, edges };
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm test -- --reporter=verbose 2>&1 | grep -A10 "buildGraphData"
```
Expected: PASS

**Step 5: Add Astro integration to generate `public/graph.json` at build time**

In `astro.config.ts`, add a custom integration:

```typescript
import { getCollection } from "astro:content"; // note: use inside integration hook
import { buildGraphData } from "./src/utils/buildGraph";
import fs from "node:fs";

// Inside defineConfig integrations array:
{
  name: "graph-json",
  hooks: {
    "astro:build:done": async () => {
      const { getCollection } = await import("astro:content");
      // generate via a script instead — see Step 6
    },
  },
},
```

Actually, `getCollection` can't be called outside Astro context. Instead, add a `prebuild` script:

**Create `scripts/generateGraph.ts`:**

```typescript
import { glob } from "fast-glob";
import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { buildGraphData } from "../src/utils/buildGraph";
import { getPath } from "../src/utils/getPath";

async function loadItems(dir: string, type: "post" | "book") {
  const files = await glob("**/*.md", { cwd: dir, absolute: true });
  return Promise.all(files.map(async f => {
    const raw = await fs.readFile(f, "utf8");
    const { data } = matter(raw);
    if (data.draft) return null;
    const id = path.basename(f, ".md");
    const url = type === "post"
      ? getPath(data.category, id)
      : `/books/${id}`;
    return { id, slug: id, title: data.title ?? id, tags: data.tags ?? [], links: data.links ?? [], url, type };
  }));
}

async function main() {
  const posts = (await loadItems("src/data/posts", "post")).filter(Boolean);
  const books = (await loadItems("src/data/books", "book")).filter(Boolean);
  const graph = buildGraphData([...posts, ...books] as any, []);
  await fs.writeFile("public/graph.json", JSON.stringify(graph, null, 2));
  // eslint-disable-next-line no-console
  console.log(`[graph] ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
}

main();
```

**Step 6: Add script to `package.json`**

In `package.json`, add to scripts:
```json
"prebuild": "tsx scripts/generateGraph.ts",
"graph": "tsx scripts/generateGraph.ts"
```

**Step 7: Run to verify**

```bash
pnpm run graph && cat public/graph.json | head -30
```
Expected: valid JSON with nodes and edges arrays

**Step 8: Commit**

```bash
git add src/utils/buildGraph.ts scripts/generateGraph.ts scripts/buildGraph.test.ts package.json
git commit -m "feat(graph): add graph.json build script and data builder"
```

---

### Task 4: GraphCanvas Astro component

**Files:**
- Create: `src/components/GraphCanvas.astro`

**Step 1: Create the component**

This component loads D3 from CDN (no bundling), fetches `/graph.json`, and renders a force-directed graph. It accepts `focusId?: string` (for mini-graph on post pages).

```astro
---
interface Props {
  focusId?: string;
  height?: number;
}
const { focusId, height = 500 } = Astro.props;
const isMini = !!focusId;
---

<div
  id="graph-container"
  data-focus-id={focusId}
  data-is-mini={isMini ? "true" : "false"}
  style={`height: ${height}px; width: 100%;`}
  class="relative overflow-hidden rounded-lg border border-border bg-background"
>
  <canvas id="graph-canvas" style="width: 100%; height: 100%;"></canvas>
  <div id="graph-tooltip" class="pointer-events-none absolute hidden rounded bg-foreground/90 px-2 py-1 text-xs text-background"></div>
</div>

<script>
  // D3 loaded via CDN
  async function initGraph() {
    const container = document.getElementById("graph-container") as HTMLElement;
    if (!container) return;

    const focusId = container.dataset.focusId ?? null;
    const isMini = container.dataset.isMini === "true";

    // Load D3
    const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

    // Fetch graph data
    const res = await fetch("/graph.json");
    let { nodes, edges } = await res.json() as { nodes: any[], edges: any[] };

    // For mini-graph: filter to 1-hop neighborhood
    if (isMini && focusId) {
      const neighborIds = new Set([focusId]);
      for (const e of edges) {
        if (e.source === focusId || e.target === focusId) {
          neighborIds.add(e.source);
          neighborIds.add(e.target);
        }
      }
      nodes = nodes.filter((n: any) => neighborIds.has(n.id));
      edges = edges.filter((e: any) => neighborIds.has(e.source) && neighborIds.has(e.target));
    }

    const canvas = document.getElementById("graph-canvas") as HTMLCanvasElement;
    const tooltip = document.getElementById("graph-tooltip") as HTMLElement;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    const ctx = canvas.getContext("2d")!;

    // CSS variable colors
    const style = getComputedStyle(document.documentElement);
    const getVar = (v: string) => style.getPropertyValue(v).trim();

    const nodesCopy = nodes.map((n: any) => ({ ...n }));
    const edgesCopy = edges.map((e: any) => ({ ...e }));

    const sim = d3.forceSimulation(nodesCopy)
      .force("link", d3.forceLink(edgesCopy).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(rect.width / 2, rect.height / 2))
      .force("collision", d3.forceCollide(18));

    function draw() {
      const dpr = devicePixelRatio;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const fg = getVar("--foreground") || "#888";
      const accent = getVar("--accent") || "#f97316";
      const muted = getVar("--muted") || "#555";

      // Draw edges
      for (const e of edgesCopy as any[]) {
        ctx.beginPath();
        ctx.moveTo(e.source.x, e.source.y);
        ctx.lineTo(e.target.x, e.target.y);
        ctx.strokeStyle = e.type === "wikilink" ? fg + "55" : muted + "33";
        ctx.lineWidth = e.type === "wikilink" ? 1.2 : 0.8;
        if (e.type === "tag") {
          ctx.setLineDash([3, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw nodes
      for (const n of nodesCopy as any[]) {
        const isTag = n.type === "tag";
        const isFocus = n.id === focusId;
        const r = isFocus ? 8 : isTag ? 4 : 6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isFocus ? accent : isTag ? muted + "88" : fg + "cc";
        ctx.fill();
      }

      ctx.restore();
    }

    sim.on("tick", draw);

    // Zoom + pan via transform
    let transform = d3.zoomIdentity;
    d3.select(canvas).call(
      d3.zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([0.3, 4])
        .on("zoom", (event) => {
          transform = event.transform;
          sim.stop();
          // re-draw with transform
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.scale(devicePixelRatio, devicePixelRatio);
          ctx.translate(transform.x, transform.y);
          ctx.scale(transform.k, transform.k);
          // redraw edges + nodes same as draw()
          draw();
          ctx.restore();
        })
    );

    // Drag
    d3.select(canvas).call(
      d3.drag<HTMLCanvasElement, unknown>()
        .subject((event) => {
          const [mx, my] = d3.pointer(event, canvas);
          return sim.find(mx, my, 20) ?? null;
        })
        .on("start", (event) => {
          if (!event.subject) return;
          if (!event.active) sim.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", (event) => {
          if (!event.subject) return;
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", (event) => {
          if (!event.subject) return;
          if (!event.active) sim.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        })
    );

    // Hover tooltip + click navigation
    canvas.addEventListener("mousemove", (event) => {
      const [mx, my] = [event.offsetX, event.offsetY];
      const found = sim.find(mx, my, 20) as any;
      if (found) {
        tooltip.textContent = found.title;
        tooltip.style.left = `${mx + 12}px`;
        tooltip.style.top = `${my - 4}px`;
        tooltip.classList.remove("hidden");
        canvas.style.cursor = "pointer";
      } else {
        tooltip.classList.add("hidden");
        canvas.style.cursor = "default";
      }
    });

    canvas.addEventListener("click", (event) => {
      const [mx, my] = [event.offsetX, event.offsetY];
      const found = sim.find(mx, my, 20) as any;
      if (found?.url) window.location.href = found.url;
    });

    // Re-color on theme change
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  initGraph();
  document.addEventListener("astro:after-swap", initGraph);
</script>
```

**Step 2: Verify no lint errors**

```bash
pnpm run lint 2>&1 | grep -i "GraphCanvas\|graph-canvas" | head -10
```
Expected: no errors

**Step 3: Commit**

```bash
git add src/components/GraphCanvas.astro
git commit -m "feat(graph): add GraphCanvas D3 force-graph component"
```

---

### Task 5: Create `/graph` full-page route

**Files:**
- Create: `src/pages/graph.astro`

**Step 1: Create the page**

```astro
---
import Layout from "@/layouts/Layout.astro";
import GraphCanvas from "@/components/GraphCanvas.astro";
---

<Layout title="Graph — jacobsidian" description="노트 간 연결 그래프">
  <main id="main-content" class="app-layout py-8">
    <h1 class="mb-6 text-2xl font-bold">Graph</h1>
    <GraphCanvas height={600} />
  </main>
</Layout>
```

**Step 2: Start dev server and verify page loads**

```bash
pnpm run dev
```
Open `http://localhost:4321/graph` — expect graph canvas to render with nodes.

**Step 3: Commit**

```bash
git add src/pages/graph.astro
git commit -m "feat(graph): add /graph full-page route"
```

---

### Task 6: Add Graph link to navigation

**Files:**
- Modify: `src/components/Header.astro`

**Step 1: Add Graph link to desktop nav (after Books, before About)**

In the desktop nav section:
```astro
<a href="/graph" class:list={["nav-link text-sm font-medium transition-colors", { "active-nav": isActive("/graph") }]}>Graph</a>
```

**Step 2: Add to mobile dropdown menu (after Books li)**

```astro
<li><a href="/graph" class:list={{ "active-nav": isActive("/graph") }}>Graph</a></li>
```

**Step 3: Verify in browser**

Open `http://localhost:4321` — nav should show Graph link, active when on `/graph`.

**Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(nav): add Graph link to header navigation"
```

---

### Task 7: Add mini graph to post/book detail pages

**Files:**
- Modify: `src/layouts/PostDetails.astro`
- Modify: `src/pages/books/[slug].astro`

**Step 1: Add mini GraphCanvas to PostDetails.astro**

After the `</article>` closing tag, add:

```astro
import GraphCanvas from "@/components/GraphCanvas.astro";

<!-- after </article>: -->
<div class="mt-12">
  <h2 class="mb-4 text-sm font-medium text-muted-foreground">연결된 노트</h2>
  <GraphCanvas focusId={post.id} height={280} />
</div>
```

**Step 2: Find books detail layout and add same mini graph**

Check `src/pages/books/[slug].astro` or its layout — add same mini-graph block with `focusId={book.id}`.

**Step 3: Verify in browser**

Open any post — should show mini graph at bottom showing the post node and its neighbors.

**Step 4: Commit**

```bash
git add src/layouts/PostDetails.astro src/pages/books/[slug].astro
git commit -m "feat(graph): add mini graph to post and book detail pages"
```

---

### Task 8: Wire prebuild into build command and verify full build

**Files:**
- Modify: `package.json` (if not done in Task 3)

**Step 1: Ensure prebuild runs before build**

Verify `package.json` has:
```json
"prebuild": "tsx scripts/generateGraph.ts"
```
pnpm automatically runs `prebuild` before `build`.

**Step 2: Run full build**

```bash
pnpm run build 2>&1 | tail -20
```
Expected: build succeeds, `dist/` contains `/graph/index.html`, `public/graph.json` was generated.

**Step 3: Preview production build**

```bash
pnpm run preview
```
Open `http://localhost:4321/graph` — verify graph renders in production build.

**Step 4: Final commit**

```bash
git add package.json
git commit -m "chore: wire graph generation into prebuild"
```
