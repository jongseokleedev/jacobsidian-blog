# Handoff: jacobsidian — Desktop Layout Redesign

## Overview

Goal: convert the blog's desktop view from the current 680px-centered (mobile-like) layout into a 3-column workspace that uses the full screen width, while staying within the existing "Quiet Craft" design identity. The layout is **Obsidian-inspired** — left rail is the primary navigation (with hierarchy), main column holds the content (680px reading width preserved), right rail holds discovery/context widgets (graph, outline, related, backlinks).

Two distinct mode-layouts share the same shell:

- **Discovery mode** (`/`, `/about`, `/[category]`, `/[category]/[topic]`) — wider main column, graph hero (only on `/`), list-focused.
- **Reading mode** (`/[category]/[slug]`) — 680px main, right rail carries outline + mini graph + related + backlinks.

This is a **hi-fi** design: tokens, spacing, typography, and interactions are pinned. The bundled HTML/JSX files are **design references** built in plain React + Babel — they should be ported into the codebase's existing Astro + Tailwind v4 setup, not shipped as-is.

## About the Design Files

`prototype/` contains the working canvas (`Blog Desktop Redesign.html` + `blog/*.jsx`). Open in a browser to compare the 4 variants and inspect the chosen V1 (Quiet Rails) across all five page types. JSX is plain React, no build step, runs through `@babel/standalone`.

`tokens.css` is the canonical token list — drop these CSS vars into `src/styles/global.css` (or merge with the existing ones — they should already be a near-perfect match).

## Fidelity

**High-fidelity (hifi)** — pixel-perfect. Recreate using the existing Astro components and Tailwind utilities. Do not introduce a new framework or component library.

## Tech context (target codebase)

- **Astro v5** static site, content collections at `src/data/posts/` and `src/data/books/`.
- **Tailwind CSS v4** — config inline in `astro.config.ts`, custom vars + `@utility` in `src/styles/global.css`. CSS variables already drive light/dark themes via `data-theme`.
- **No React** in the production codebase — Astro `.astro` components only, with `<script>` blocks for progressive enhancement.
- Graph rendered with **d3 v7 + Canvas** in `src/components/GraphCanvas.astro`.
- Path alias `@/*` → `./src/*`.
- Site language **Korean** (`lang: "ko"`), timezone `Asia/Seoul`, dates formatted `ko-KR` (`2026. 05. 15.`).

## Pages / Views

All page-level routes share the same `BlogShell` (header + 3-column body + footer). The `mode` prop switches between Discovery and Reading geometry.

### 1. Home (`/`)

**Mode**: Discovery.
**Purpose**: Land users in a graph-first overview of the whole vault, then let them filter and scroll through Archives.

**Layout** (1024px+ breakpoint):
- Top sticky header (56px) — logo + search box (utility-only, no nav links)
- Body 3-column grid: `232px | 1px | 1fr | 1px | 260px`, vertical 1px dividers (`var(--border)`)
- Main column padding: `32px 28px`; no max-width cap in Discovery mode
- Bottom footer (border-top + socials + RSS)

**Main column, top to bottom**:
1. **ASCII hero** — pre-rendered `jacobsidian` logotype in JetBrains Mono 7px, gradient text from `var(--foreground)` 0% → `var(--accent)` 100%. Already exists in `src/pages/index.astro` — keep as-is.
2. **Unified category filter row** — horizontally scrollable pill chips. Items: All / Thoughts / Writing / Tech / Books. Single state controls **both** the graph below AND the Archives list further down. Active pill: 1px solid category-colored border, 10% category-tint background, category dot inline.
3. **Graph hero** — bordered card (1px var(--border), border-radius 6px). Embeds `GraphCanvas.astro` at `height: 420` with the graph reading the same filter state (faded non-matching nodes/edges, opacity 0.18). No filter chips inside the graph — moved to the unified row above.
4. **Caption** — single line, `var(--fg-mute)` 13px. When unfiltered: "지금까지 쓴 **25개**의 노트가 **47개**의 링크로 이어져 있어요." When filtered: "{Category} 카테고리에 **{count}**개의 노트가 있어요." Right-aligned mono hint: `drag · zoom · hover`.
5. **Archives section** — `BdSectionHead` (overline "Latest" + h2 "Archives" + right-aligned mono count "{n} records"), then a `<ul>` of post rows (filtered).
6. **Load more** button — outlined pill, centered.

**Right rail (Discovery widgets)**:
- "Now reading" — small book cover (54×~80px placeholder) + title + author + 2px progress bar
- "This week" — 4 recent posts (filtered by current scope), date overline + title
- "Stats" — 2×2 grid (notes / links / tags / +N this week)
- "Footnotes" — `Asia/Seoul · ko-KR` / `Astro + Obsidian` (mono, fg-faint)

### 2. Category index (`/thoughts`, `/writing`, `/tech`, `/books`)

**Mode**: Discovery.
**Purpose**: list-focused. **No graph hero** in main — moved to right rail so the list breathes.

**Main column**:
- **Category header** — small dot + mono overline "CATEGORY" → h1 (28-34px, weight 700, tracking -0.02em) "{Category label}" → 15px description (`var(--fg-mute)`).
- **Subtopic filter row** (only renders if `hierarchy[catKey]` has entries) — same pill style as the home unified filter, but with a top "모두 보기" chip + each subtopic. Border-bottom 1px var(--border) under the row.
- **Generic list overline** — "글 목록" or "{Subtopic label} · 글 목록" + mono count right-aligned. **No "All thoughts" hardcoded title** — everything comes from `data.filters[key].label`.
- **Post rows** — `date | title`, no category badge column (redundant — we're in a category).

**Right rail (Category widgets)**:
- "{Category label} graph" overline + mini graph (focused=false, filtered to this category, 268×210)
- mono caption: "{n} notes · expand →"
- "This week" filtered to this category
- "Other categories" — small nav list to jump sideways

**Critical**: page header copy must be data-driven. Adding a new category = adding a row to `data.filters` + a content collection. No per-page label tweaks.

### 3. Topic page (`/thoughts/work`, etc.)

**Mode**: Discovery.
**Purpose**: deeper level of category, reached from the sidebar tree.

**Main column**:
- **Breadcrumb** — `{Category dot} {Category label}` → `›` → `{Topic label}`. 12.5px, fg-mute.
- **h1** (28px) "{Topic label}" — smaller than category h1, intentionally.
- **Description** with link back to parent category.
- **Post rows** filtered to topic.

**Right rail**: same `V1RightCategory` as Category page.

**Routing decision needed**: Astro doesn't currently have `/[category]/[topic]/` routes. Two options:
- (a) Add static routes `src/pages/thoughts/[topic].astro` etc, where `topic` is matched against tags or a `subtopic` frontmatter field.
- (b) Use `/tags/[tag]` — already exists — and theme it as the topic page. Recommend (b) for now; promote to (a) when topics become a first-class concept.

### 4. About (`/about`)

**Mode**: Discovery (same shell as Home, no graph hero).
**Purpose**: bio + "what I'm doing now" + contact.

**Main column**:
- 72×72 round avatar (gradient placeholder until photo provided) + h1 "Jacob Lee" + 14px subtitle.
- "ABOUT" overline → prose paragraphs (the existing About copy, with `[[wikilinks]]` styled as `wiki` accent-colored, border-bottom dashed accent).
- "WHAT I'M DOING NOW" overline → list with category-colored em dashes (`—`).
- "ELSEWHERE" overline → inline links with dashed underline.

**Right rail**: `V1RightDiscovery` (same as Home — Now reading, This week, Stats, Footnotes). Or simplified.

### 5. Post detail (`/[category]/[slug]`)

**Mode**: Reading.
**Purpose**: focused reading.

**Layout difference from Discovery**:
- Main column has a **680px max-width** cap, centered. Padding `32px 40px`.
- Right rail uses `V1RightReading` (TOC + Local graph + Related + Backlinks) — different from Discovery rail.

**Main column** (mostly preserve existing `PostDetails.astro`):
- Back link `← {Parent category label}` (data-driven, never hardcode "Thoughts")
- h1 (28-30px, weight 700) post title
- 15px description (`var(--fg-mute)`)
- Meta row: date (mono) · reading time · category dot+label · share button (right)
- Horizontal rule, then prose body
- Bottom: hr → tags as pill chips

**Right rail (Reading widgets)**:
- **On this page** overline → TOC. Each item:
  - 12.5px, `var(--fg-mute)`, `padding: 4px 0 4px 14px`
  - Left vertical 1px border (`var(--border)`) becomes `var(--accent)` 2px when active
  - h3 items indent another 10px and shrink to 12px
- **Local graph** overline → mini graph (268×200, focused on current note, label shown). mono caption with connection count + "expand →" link.
- **Related** overline → posts from frontmatter `links:` field. Each row: category dot + title with dashed-accent underline.
- **Backlinks** overline → posts that reference this note. Each row: `← {title}`.

The post detail page **already exists** at `src/layouts/PostDetails.astro`. Reshape it rather than rewrite.

## Layout dimensions (1024px+ breakpoint)

```
─────────────────────────────────────────────────────────────────
HEADER  56px tall, padding 0 24px, border-bottom 1px var(--border)
─────────────────────────────────────────────────────────────────
LEFT │   1px   │   MAIN          │   1px   │  RIGHT
232  │ divider │   1fr           │ divider │  ~260-300
─────────────────────────────────────────────────────────────────
FOOTER  border-top + utilities
─────────────────────────────────────────────────────────────────
```

- Left rail padding: `28px 24px 28px 28px`
- Right rail padding: `28px 24px`
- Discovery main padding: `32px 28px`, no max-width
- Reading main padding: `32px 40px`, **max-width: 680px** (centered)

### Breakpoints

- `< 640px` (mobile): single column. Hide both rails. Hamburger reveals the left rail nav as a drawer. **Match existing mobile behavior — do not touch.**
- `640–1023px` (tablet): single column, header categories as a horizontal scroll. Hide rails. Possibly show right rail widgets inline at bottom of post.
- `≥ 1024px`: 3-column desktop as specified.

## Header (utilities only)

Drop the existing 5-link category nav. New header:

```
[ Logo (jacobsidian wordmark, 15px) ]   [ Search input 240×~30 ] [ Theme btn ] [ RSS btn ]
```

- **No** Thoughts / Writing / Tech / Books / About links. All nav lives in the left rail. About sits at the top of the left rail tree, paired with "Home".
- Search input is a pill (1px var(--border), 6px radius). Placeholder copy: **`Wander Jacob's second brain…`** (English, intentionally playful — Obsidian's "vault" → "second brain" metaphor). `⌘K` shortcut mono indicator right-aligned inside.
- Theme button: cycle light/dark. RSS: link to `/rss.xml`.

## Left rail (the explorer)

Single navigation surface. Hierarchical-ready.

Structure (top to bottom):

1. **`Home`** row — house icon (lucide `Home`), 14px, weight 500. No count.
2. **`About`** row — person icon, 14px, weight 500.
3. **`hr`** divider (1px var(--border), my-2.5).
4. **Category tree** — each category is a row with:
   - 9×9 chevron (`▾` open / `▸` closed) in `var(--fg-faint)`
   - 7×7 category dot
   - Label (14px, weight 400 / 600 if active)
   - **No count** — counts are noisy here, reserved for stats card on right rail
   - On expansion: subtopic children indented to 26px, with a left vertical 1px guide (`var(--border)`), 12.5px text in `var(--fg-mute)` (or `var(--accent)` when active)
5. **`Pinned`** overline → 4 posts, category dot + truncated title.

**Active state**:
- Active category row → `var(--accent)` text + 600 weight, chevron defaults to open
- Active topic row → `var(--accent)` text + 500 weight + 1px accent guide on left
- Active site page (Home/About) → `var(--accent)` text + 600 weight

**Hierarchy data shape** — extend `src/config.ts` or `src/data/categories.ts`:

```ts
export const CATEGORIES = {
  thought: {
    label: "Thoughts",
    desc: "일상 속의 공상과 단상",
    topics: [
      { key: "work",  label: "Work · 일" },
      { key: "life",  label: "Life · 일상" },
      { key: "memo",  label: "Memo · 짧은 단상" },
    ],
  },
  // …
};
```

Topic membership: tag-based (look at the post's frontmatter `tags` array) is the simplest first cut. Or add a `subtopic` field. Tag-based is more flexible — recommend.

## Right rail (3 variants)

### V1RightDiscovery (Home, About)

Widgets, in order, separated by ~26px:

1. `NOW READING` — book cover thumbnail + title + author + 62% progress bar (mock — wire to a real frontmatter field on a `currentlyReading` book later).
2. `THIS WEEK` — 4 recent posts, scoped to current filter if applicable.
3. `STATS` — 2×2 grid of big mono numbers (notes / links / tags / +Δ this week).
4. `FOOTNOTES` — `Asia/Seoul · ko-KR` / `Astro + Obsidian` in mono.

### V1RightCategory (Category index, Topic)

1. `{Category} GRAPH` overline + mini graph (filtered to category) + mono caption + "expand →"
2. `THIS WEEK` filtered to category
3. `OTHER CATEGORIES` — small nav to jump sideways

### V1RightReading (Post detail)

1. `ON THIS PAGE` — TOC, sticky-on-scroll, active heading highlighted
2. `LOCAL GRAPH` — mini graph focused on current note + connection count + expand link
3. `RELATED` — wikilinks from `links:` frontmatter, category-dot + dashed-accent
4. `BACKLINKS` — posts that wikilink TO this note

## Interactions & Behavior

- **Unified filter (Home)**: clicking a pill mutates a single `activeFilter` state. The graph fades non-matching nodes to opacity 0.18 (existing GraphCanvas hover-dim logic — re-use). Archives list filters in place. Click "All" or active pill again to reset.
- **Graph filter dim**: 150ms ease.
- **Post row hover**: title translates 3-4px right, color → `var(--accent)`, 150ms.
- **Pill hover**: border → accent, color → accent, 150ms.
- **TOC scroll spy**: existing pattern from the codebase. Active heading detected via `IntersectionObserver`.
- **Graph expand →** in right rails: opens the existing graph overlay (`#graph-overlay` already in `PostDetails.astro`).
- **Theme toggle**: existing logic in `src/scripts/theme.ts`. No change.
- **View transitions**: existing 180ms fade-out → 180ms fade-in (Astro `ClientRouter`). Do not break.

## State management

Astro is static-first. Hydration boundaries:

- **Left rail**: pure static `.astro` — expanded state derived from current URL path. No client JS.
- **Header search button**: triggers existing `pagefind` modal (already wired). No state.
- **Theme toggle**: existing `localStorage` pattern.
- **Home filter pills + graph + archives**: small inline `<script>` block with vanilla DOM. State is a single `activeFilter` variable; on click → toggle button classes + hide/show `<li>` posts + send `{type: 'graph:filter', category: key}` event to the GraphCanvas (extend GraphCanvas to listen and apply a node-dim).
- **Category page subtopic pills**: same vanilla-JS pattern, filter `<li>` posts by `data-topic`.
- **TOC scroll spy**: `IntersectionObserver` over `h2[id]` in the article, toggle `.active` on matching `.bd-toc-item`.

No React, no client framework needed.

## Design Tokens

These already exist in `src/styles/global.css` and `brand/jacobsidian.css`. Confirmed values:

```css
:root, html[data-theme="light"] {
  --background: #f8f8f7;
  --foreground: #1a1918;
  --accent:     #3d5a99;
  --muted:      #e8e6e3;
  --border:     #d4d0cb;
}
html[data-theme="dark"] {
  --background: #141414;
  --foreground: #e8e6e3;
  --accent:     #7aa2d4;
  --muted:      #242424;
  --border:     #2e2e2e;
}
```

New tokens to add (for the redesign):

```css
:root, html[data-theme="light"] {
  --fg-mute:        rgba(26, 25, 24, 0.6);
  --fg-faint:       rgba(26, 25, 24, 0.4);
  --fg-veryfaint:   rgba(26, 25, 24, 0.25);
  --accent-soft:    rgba(61, 90, 153, 0.14);
  --border-soft:    #e2dfd9;
  --rail-bg:        #f3f1ed;   /* reserved for V4 alt; unused in V1 */
  --cat-thought:    #7c5cf0;
  --cat-tech:       #2563eb;
  --cat-writing:    #059669;
  --cat-book:       #b45309;
}
html[data-theme="dark"] {
  --fg-mute:        rgba(232, 230, 227, 0.6);
  --fg-faint:       rgba(232, 230, 227, 0.4);
  --fg-veryfaint:   rgba(232, 230, 227, 0.25);
  --accent-soft:    rgba(122, 162, 212, 0.18);
  --border-soft:    #232323;
  --rail-bg:        #121212;
  --cat-thought:    #a78bfa;
  --cat-tech:       #60a5fa;
  --cat-writing:    #34d399;
  --cat-book:       #fbbf24;
}
```

**Category colors** must match the existing `CATEGORY_COLORS` constant in `GraphCanvas.astro` — they're already aligned but double-check after merge.

**Typography** — unchanged. Pretendard Variable (already loaded) for UI/body, JetBrains Mono for code and meta. Specific scales from `docs/plans/2026-05-13-design-identity.md` — keep.

**Radii**: 4-6px for chips and cards, 999px for pills.
**Spacing**: 4 / 8 / 12 / 14 / 18 / 22 / 26 / 28 / 32 px — mostly Tailwind defaults.

### Custom utilities to add (Tailwind v4 `@utility`)

```css
@utility bd-overline {
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-faint);
}
@utility cat-dot {
  display: inline-block;
  width: 7px; height: 7px;
  border-radius: 999px;
  flex: none;
}
```

(or use Tailwind arbitrary values inline — your call)

## Components to add / update

| Component | Action |
|---|---|
| `src/components/Header.astro` | Strip category links. Add search pill (placeholder = `Wander Jacob's second brain…`), theme button, RSS button. |
| `src/components/Sidebar.astro` *(new)* | Renders the left rail. Props: `active`, `expandedKey`, `activeTopic`. Pure static. |
| `src/components/RightRail.astro` *(new)* | Switches on `variant` prop: `discovery` / `category` / `reading`. |
| `src/layouts/BlogShell.astro` *(new)* | Wraps `<Header /> <Sidebar /> <slot /> <RightRail /> <Footer />`. Props: `mode`, `active`, `expandedKey`, `activeTopic`. |
| `src/layouts/Layout.astro` | Keep — only style imports and head. |
| `src/layouts/Main.astro` | Either replace with `BlogShell` or wrap. |
| `src/layouts/PostDetails.astro` | Adopt `BlogShell` with `mode="reading"`. Move the existing graph overlay logic out into `RightRail`. |
| `src/pages/index.astro` | Adopt `BlogShell` with `mode="discovery"`. Add unified pill row above graph. Filter logic via inline script. |
| `src/pages/[category]/index.astro` *(new generic)* | Replaces per-category index files. Reads category meta from a central config. |
| `src/pages/[category]/[topic].astro` *(optional)* or repurpose `src/pages/tags/[tag]/` | Topic page. |
| `src/pages/about.astro` | Adopt `BlogShell`. |
| `src/components/GraphCanvas.astro` | Add a `categoryFilter` prop + event listener for `{type: 'graph:filter'}` events. Apply existing dim logic to non-matching nodes/edges. Remove the inline filter chips (filters now live in the page above the graph). |
| `src/utils/getCategories.ts` *(new)* | Single source of truth for category metadata (label, desc, topics). Used by sidebar, headers, breadcrumbs. |

## Assets

- Logo / wordmark — `brand/jacobsidian.css`, `brand/Logo.astro`, `brand/symbol*.svg` (all already present)
- Icons — keep the existing `src/assets/icons/Icon*.svg` set; add a few new ones (Home/House, Person/User, ChevDown, ChevRight, ListTree). Tabler Icons matches the existing visual style — recommend installing `@tabler/icons-react` or pulling specific SVGs.
- Avatar (About page) — TODO: drop a 144×144 jpg/webp at `public/images/jacob-avatar.jpg`. Mock uses gradient placeholder.
- No new fonts.

## Implementation order (suggested)

1. **Tokens** — extend `src/styles/global.css` with the new vars + utilities. Verify nothing else breaks (light/dark sweep).
2. **Header** — strip nav, add search pill, theme, RSS. Land first because every page imports it.
3. **Sidebar** + **getCategories utility** — build static sidebar reading from the new config. Wire `active`, `expandedKey` from current URL path.
4. **BlogShell layout** — 3-column grid + responsive collapse below 1024px. Verify on Home (still using existing main content).
5. **Right rail** — all 3 variants. Land mini graph (`GraphCanvas` with `height={210}`, `focusId` for reading).
6. **Home** — pill filter + filter-aware graph + Archives. Vanilla JS for filter state.
7. **Category page** — generic `[category]/index.astro` reading central config. Per-category routes can be redirects or thin re-exports.
8. **Topic** — decide route shape; build.
9. **About** — adopt shell.
10. **Post detail** — adopt shell with `mode="reading"`. Move graph overlay logic into `RightRail` variant.

## Things deliberately NOT in scope

- Search modal styling (already handled by Pagefind defaults)
- Mobile redesign — keep existing
- New post types or content-collection schema changes
- A new icon library — reuse existing Tabler-style SVGs
- The 3 alternative variants (V2 Soft Panels, V3 Marginalia, V4 Two-Tone). Those are in `prototype/blog/v2.jsx`, `v3.jsx`, `v4.jsx` for reference only.

## Files in this bundle

```
design_handoff_desktop_layout/
├── README.md              ← this file
├── tokens.css             ← canonical CSS variable set to merge into global.css
└── prototype/
    ├── Blog Desktop Redesign.html
    └── blog/
        ├── styles.css     ← prototype-only token + utility classes
        ├── data.js        ← mock data shape (categories, posts, hierarchy, currentPost)
        ├── shared.jsx     ← Logo, Header, Footer, BdMiniGraph, BdBigGraph, BdCategoryFilter
        ├── v1.jsx         ← ★ V1 Quiet Rails — the chosen direction (Home / Category / Topic / About / Post)
        ├── v2.jsx         ← reference variant
        ├── v3.jsx         ← reference variant
        ├── v4.jsx         ← reference variant
        ├── app.jsx        ← canvas mount
        ├── design-canvas.jsx  ← unrelated infrastructure (canvas viewer)
        └── tweaks-panel.jsx   ← unrelated infrastructure (light/dark toggle)
```

The V1 files (`v1.jsx`, `shared.jsx`, `data.js`, `styles.css`) are the canonical source. Read those alongside the section-by-section spec above when porting to Astro.
