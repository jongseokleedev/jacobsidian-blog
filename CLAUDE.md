# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev          # Dev server at localhost:4321
pnpm run build        # astro check + astro build + pagefind (output: ./dist/)
pnpm run preview      # Preview production build
pnpm run lint         # ESLint
pnpm run format       # Prettier write
pnpm run format:check # Prettier check (CI)
pnpm run test         # Vitest (scripts/**/*.test.ts only)
pnpm run test:watch   # Watch mode
pnpm run sync         # Obsidian vault sync (dry-run)
pnpm run sync:apply   # Obsidian vault sync + apply
```

**Package manager:** pnpm 8.15.1 (pinned). Node ≥ 20.

## Architecture

### Tech Stack

- **Astro** v5 (static site, zero JS by default) + TypeScript strict
- **Tailwind CSS** v4 via `@tailwindcss/vite` (config inline in `astro.config.ts`, not `tailwind.config.*`)
- **Pagefind** for static search (auto-generated during `build`)
- **Vitest** for unit tests (scripts only — no component tests)

### Content Model

Content collections defined in `src/content.config.ts` and loaded from:
- `src/data/posts/` — blog posts
- `src/data/books/` — book notes

Post frontmatter schema (required: `title`, `category`, `pubDatetime`, `description`):
```yaml
---
title: 'Post Title'
category: tech          # enum: "thought" | "writing" | "tech"
pubDatetime: '2026-05-13T00:00:00.000Z'
description: 'Brief summary'
tags:
  - tag1
draft: false            # omit or false to publish
---
```

### Routing

File-based routing under `src/pages/`. Key patterns:
- `/[category]/[slug]` — individual posts/books
- `/thoughts`, `/writing`, `/tech`, `/books` — category list pages
- `/tags/[tag]` — tag filtering
- `og.png.ts`, `rss.xml.ts`, `robots.txt.ts` — generated assets

### Styling

All custom utilities, CSS variables, and animations live in `src/styles/global.css`. Tailwind imports and `@theme`, `@layer`, `@utility` blocks are all in that one file — there is no separate `tailwind.config.*`. Typography overrides are in `src/styles/typography.css`.

CSS custom properties (`--background`, `--foreground`, `--accent`, `--muted`, `--border`) drive both light and dark themes via `data-theme` attribute.

Notable custom effects defined in `global.css`:
- Logo hover: sequential letter color wave (staggered delays)
- Nav links: draw-on underline (`scaleX` transition)
- Header border: shimmer to accent color on scroll > 10px
- Page transitions: Astro view transitions (fade 180ms)

### Component Patterns

- All components are `.astro` files (no React components)
- SVG icons are imported as Astro components from `src/assets/icons/`
- Path alias `@/*` maps to `./src/*`
- `class:list` for conditional Tailwind classes
- Inline `<script>` tags for progressive enhancement (theme toggle, hamburger menu)

### Key Utilities (`src/utils/`)

- `getSortedPosts()` — filters drafts, sorts by pubDate/modDate desc
- `postFilter()` — draft + scheduled post visibility logic
- `getPath()` — resolves post URLs by category/slug
- `generateOgImages()` — Satori-based OG image generation

### Linting Rules

- `no-console: "error"` everywhere except `scripts/**`
- ESLint flat config in `eslint.config.js` (TypeScript + Astro plugins)

### i18n

Site language is Korean (`lang: "ko"`, timezone: `Asia/Seoul`). Date formatting uses `toLocaleDateString("ko-KR", ...)`. UI text is in Korean.

### Obsidian Sync

`scripts/sync.ts` imports content from an external Obsidian vault. Tests for sync logic live in `scripts/**/*.test.ts` and run with Vitest under the `node` environment (`vitest.config.ts`).

```bash
pnpm run sync:en        # English vault sync (dry-run)
pnpm run sync:apply:en  # English vault sync + apply + deploy
```

### KO→EN Translation Rules

When translating posts, **always use the `translator` subagent** (`.claude/agents/translator.md`).

**Style:** Natural English for English readers — liberal translation, idiomatic rewriting allowed.  
**Cultural references:** Reinterpret for English-speaking audience; prioritize comprehension over local color.  
**Technical terms:** Keep already-English terms as-is; convert Korean-written tech terms to English.  
**Frontmatter:** Translate `title`, `description`, and all `tags` to English.  
**Quality:** Publication-level — smooth prose, careful word choice.

**Workflow:**
1. Discuss translation choices in chat first (explain expression choices, offer options with nuance differences for ambiguous parts)
2. User is learning English through translation — teach like a tutor: explain *why* each expression was chosen, show native alternatives
3. After agreement, write the `.en.md` file to the Obsidian vault EN folder:
   - `{VAULT}/020.Area/022.Writing/022-1.Public/Essay-EN/Thought/<slug>.md`
   - `{VAULT}/020.Area/022.Writing/022-1.Public/Essay-EN/Journal/<slug>.md`
   - `{VAULT}/020.Area/022.Writing/022-1.Public/Tech-EN/Dev/<slug>.md`
   - `{VAULT}/020.Area/022.Writing/022-1.Public/Tech-EN/Work/<slug>.md`
   - `{VAULT}/020.Area/022.Writing/022-1.Public/Tech-EN/IT/<slug>.md`
4. User runs `pnpm run sync:apply:en` to deploy
