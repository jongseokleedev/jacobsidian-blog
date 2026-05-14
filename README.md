# jacobsidian-blog

Jacob's personal blog — a static site built with Astro and synced with an Obsidian vault.

## Stack

- **Astro** v5 — static site generation
- **Tailwind CSS** v4 — styling
- **Pagefind** — static site search
- **Vitest** — unit tests (sync scripts)
- **pnpm** — package manager

## Getting Started

```bash
pnpm install
pnpm run dev        # http://localhost:4321
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start dev server |
| `pnpm run build` | Production build (`dist/`) |
| `pnpm run preview` | Preview production build |
| `pnpm run lint` | ESLint check |
| `pnpm run format` | Prettier format |
| `pnpm run test` | Run unit tests |
| `pnpm run sync` | Obsidian vault sync (dry-run) |
| `pnpm run sync:apply` | Obsidian vault sync + apply |

## Writing Content

Posts go in `src/data/posts/`, book notes in `src/data/books/`, as Markdown files.

Required frontmatter:

```yaml
---
title: 'Post Title'
category: tech          # thought | writing | tech
pubDatetime: '2026-05-13T00:00:00.000Z'
description: 'Brief summary'
---
```

## Project Structure

```
src/
├── components/     # .astro components
├── data/
│   ├── posts/      # blog posts (.md)
│   └── books/      # book notes (.md)
├── layouts/        # page layouts
├── pages/          # file-based routing
├── scripts/        # Obsidian sync script
├── styles/         # global.css, typography.css
├── utils/          # shared helper functions
├── config.ts       # site config (title, author, etc.)
└── content.config.ts  # content collection schema
```

## Obsidian Sync

Content is imported from an Obsidian vault via `scripts/sync.ts`.

```bash
pnpm run sync        # preview changes (dry-run)
pnpm run sync:apply  # apply changes
pnpm run vault:push  # sync + commit + push
```

## License

MIT
