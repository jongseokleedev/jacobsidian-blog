# Graph View Design

## Overview

Obsidian-style interactive graph view for the blog, showing connections between posts and books via wikilinks and tags.

## Data Model

### Sources
- `src/data/posts/` — tech, thought, writing posts
- `src/data/books/` — book notes
- Only deployed (non-draft) content is included in the graph

### Node Types
- **Post node** — each published post/book
- **Tag node** — each unique tag (secondary)

### Edge Types
- **Wikilink edge** (solid line) — explicit `[[노트명]]` references between notes
- **Tag edge** (dashed line) — shared tag between two nodes (secondary/auxiliary)

### Data Extraction
- sync script parses `[[링크]]` before `transformWikilinks` conversion
- Extracted links saved to frontmatter as `links: string[]`
- Build step generates `src/data/graph.json` with nodes + edges

## Visual Style

- Library: **D3.js** force simulation
- Obsidian original aesthetic (dark bg, minimal nodes, clean edges)
- CSS variables (`--background`, `--foreground`, `--accent`, `--border`) for light/dark mode auto-sync
- Responds to `data-theme` attribute changes

## Pages

### `/graph` — Full page
- Full-screen graph of all published posts + books
- Entry point: navigation bar link

### Post/Book detail page — Mini graph
- Embedded below post content
- Shows only current node + 1-hop neighbors
- Same visual style, smaller canvas

## Interactions

- **Drag** — reposition nodes
- **Zoom in/out** — scroll or pinch
- **Hover** — show title tooltip
- **Click** — navigate to that post/book

## Migration Plan

### Existing content (7 notes)
- Manually add `[[노트명]]` wikilinks in Obsidian for existing posts and books
- Use Obsidian's native `[[` autocomplete (no Templater needed)

### New content
- Write `[[노트명]]` naturally in Obsidian while drafting
- sync script automatically extracts links on next sync

## Out of Scope

- Private vault notes (not in `022-1.Public` or `032.Books`)
- Unpublished/draft notes (ghost nodes)
- Search/filter on graph (future upgrade when post count grows)
- Node highlight on click (future upgrade)
