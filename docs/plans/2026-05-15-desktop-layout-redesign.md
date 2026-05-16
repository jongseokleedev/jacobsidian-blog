# Desktop Layout Redesign (3-Column) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 현재 680px 중앙 단일 컬럼 레이아웃을 데스크탑(≥1024px)에서 Left Rail(232px) + Main(1fr) + Right Rail(260px) 3-컬럼 구조로 전환하고, 모바일 경험은 유지한다.

**Architecture:** `BlogShell.astro` 공통 레이아웃 껍데기를 만들고, `Sidebar.astro`(좌측 네비), `RightRail.astro`(우측 위젯 3종)를 분리 컴포넌트로 구현한다. 기존 `Layout.astro`는 `<head>` 전담으로 유지하고, 각 페이지가 `BlogShell`로 전환한다.

**Tech Stack:** Astro v5, Tailwind CSS v4 (`@utility` in global.css), vanilla JS `<script>` blocks, d3 v7 Canvas (GraphCanvas.astro 기존 사용)

---

## Task 1: CSS 토큰 + 유틸리티 추가

**Files:**
- Modify: `src/styles/global.css`

**Step 1: `--fg-mute`, `--fg-faint` 등 신규 토큰과 `bd-overline`, `cat-dot` 유틸리티를 `global.css`에 추가**

`:root` 블록 바로 아래에 다음을 추가:
```css
/* ── 데스크탑 리디자인 토큰 ─────────────────────── */
:root,
html[data-theme="light"] {
  --fg-mute:        rgba(26, 25, 24, 0.6);
  --fg-faint:       rgba(26, 25, 24, 0.4);
  --fg-veryfaint:   rgba(26, 25, 24, 0.25);
  --accent-soft:    rgba(61, 90, 153, 0.14);
  --border-soft:    #e2dfd9;
  --rail-bg:        #f3f1ed;
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

@utility bd-overline {
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-faint);
}
@utility cat-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  flex: none;
}
```

**Step 2: dev 서버 구동해 기존 페이지 스타일 깨짐 없는지 확인**
```bash
pnpm run dev
```
브라우저에서 `/`, `/thoughts`, `/tech` 페이지 라이트/다크 모드 순차 확인.

**Step 3: Commit**
```bash
git add src/styles/global.css
git commit -m "style: add desktop redesign tokens and bd-overline/cat-dot utilities"
```

---

## Task 2: 카테고리 메타데이터 유틸 생성

**Files:**
- Create: `src/utils/getCategories.ts`

**Step 1: 파일 생성**

```typescript
export type TopicMeta = { key: string; label: string };

export type CategoryMeta = {
  label: string;
  desc: string;
  color: string;    // CSS var name, e.g. "var(--cat-thought)"
  topics: TopicMeta[];
};

export const CATEGORIES: Record<string, CategoryMeta> = {
  thought: {
    label: "Thoughts",
    desc: "일상 속의 공상과 단상",
    color: "var(--cat-thought)",
    topics: [
      { key: "work",  label: "Work · 일" },
      { key: "life",  label: "Life · 일상" },
      { key: "memo",  label: "Memo · 짧은 단상" },
    ],
  },
  writing: {
    label: "Writing",
    desc: "글쓰기와 독서 노트",
    color: "var(--cat-writing)",
    topics: [],
  },
  tech: {
    label: "Tech",
    desc: "개발 기록과 기술 탐구",
    color: "var(--cat-tech)",
    topics: [],
  },
  book: {
    label: "Books",
    desc: "읽은 책 노트",
    color: "var(--cat-book)",
    topics: [],
  },
};

export const getCategoryMeta = (key: string): CategoryMeta | undefined =>
  CATEGORIES[key];

export const allCategories = () => Object.entries(CATEGORIES);
```

> **주의**: `desc` 텍스트는 기존 코드에 정의된 것을 우선합니다. 현재 `src/config.ts`나 기존 페이지에 카테고리별 description이 하드코딩되어 있다면 그 값으로 대체하세요. 기존 `src/pages/thoughts/index.astro` 등을 열어 description 확인 후 맞춰주세요.

**Step 2: 기존 카테고리 페이지에서 description 확인**
```bash
head -30 src/pages/thoughts/index.astro
head -30 src/pages/tech/index.astro
head -30 src/pages/writing/index.astro
head -30 src/pages/books/index.astro
```
각 페이지에서 `pageDesc` 또는 description prop에 넣은 문자열을 확인하고, `getCategories.ts`의 `desc` 필드를 그 값으로 업데이트한다.

**Step 3: Commit**
```bash
git add src/utils/getCategories.ts
git commit -m "feat: add getCategories utility with category metadata"
```

---

## Task 3: Header 리디자인 (데스크탑 카테고리 링크 제거, 검색 pill 추가)

**Files:**
- Modify: `src/components/Header.astro`

**Step 1: 데스크탑 `<nav>` 블록을 아래 구조로 교체**

기존 `<!-- 데스크탑 nav -->` 블록 전체를 아래로 교체:
```astro
<!-- 데스크탑: 검색 pill + 테마 + RSS -->
<div class="hidden sm:flex items-center gap-3">
  <!-- 검색 pill -->
  <a
    href="/search"
    class="flex items-center gap-2 rounded-[6px] border border-border px-3 py-1.5 text-[13px] text-[color:var(--fg-faint)] hover:border-accent hover:text-accent transition-colors"
    style="min-width:200px;"
    title="Search"
  >
    <IconSearch class="size-3.5 shrink-0" />
    <span class="flex-1">Wander Jacob's second brain…</span>
    <kbd class="font-mono text-[11px] opacity-50">⌘K</kbd>
  </a>
  {SITE.lightAndDarkMode && (
    <button
      id="theme-btn"
      class="focus-outline relative size-8 p-1 hover:[&>svg]:stroke-accent"
      title="Toggles light & dark"
      aria-label="auto"
      aria-live="polite"
    >
      <IconMoon class="absolute top-[50%] left-[50%] -translate-[50%] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <IconSunHigh class="absolute top-[50%] left-[50%] -translate-[50%] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </button>
  )}
  <a href="/rss.xml" title="RSS" class="focus-outline p-1 hover:text-accent text-[color:var(--fg-faint)]">
    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
    <span class="sr-only">RSS</span>
  </a>
</div>
```

> 모바일 드롭다운 메뉴 `<ul>` 안에는 About/카테고리 링크가 여전히 있어도 됩니다. 모바일은 기존 그대로.

**Step 2: 검색 pill 클릭 시 Pagefind 모달 열기 위한 스크립트 추가** (기존 `/search` 링크 방식 유지 — 별도 변경 불필요)

**Step 3: 브라우저에서 데스크탑 헤더 확인**
```bash
pnpm run dev
```
1024px 이상 너비에서 검색 pill, 테마 버튼, RSS 버튼 표시 확인.

**Step 4: Commit**
```bash
git add src/components/Header.astro
git commit -m "feat: redesign desktop header - remove nav links, add search pill and RSS"
```

---

## Task 4: Sidebar 컴포넌트 생성 (Left Rail)

**Files:**
- Create: `src/components/Sidebar.astro`

**Step 1: 파일 생성**

```astro
---
import { CATEGORIES, allCategories } from "@/utils/getCategories";
import Logo from "./Logo.astro";

interface Props {
  activeCategory?: string;   // e.g. "thought"
  activeTopic?: string;      // e.g. "work"
  activePage?: string;       // "home" | "about"
}

const { activeCategory, activeTopic, activePage } = Astro.props;
const { pathname } = Astro.url;
---

<aside
  id="left-rail"
  class="hidden lg:flex flex-col border-r border-border"
  style="width:232px; min-height:0; padding: 28px 24px 28px 28px; overflow-y:auto;"
>
  <!-- Home -->
  <a
    href="/"
    class:list={[
      "flex items-center gap-2 text-sm font-medium py-1.5 rounded hover:text-accent transition-colors",
      activePage === "home" ? "text-accent font-semibold" : "text-[color:var(--fg-mute)]",
    ]}
  >
    <!-- House icon (inline SVG) -->
    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
    Home
  </a>

  <!-- About -->
  <a
    href="/about"
    class:list={[
      "flex items-center gap-2 text-sm font-medium py-1.5 rounded hover:text-accent transition-colors",
      activePage === "about" ? "text-accent font-semibold" : "text-[color:var(--fg-mute)]",
    ]}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
    About
  </a>

  <hr class="my-2.5 border-border" />

  <!-- Category tree -->
  {allCategories().map(([key, meta]) => {
    const isActive = activeCategory === key;
    const hasTopics = meta.topics.length > 0;
    return (
      <div class="sidebar-category" data-key={key}>
        <!-- Category row -->
        <a
          href={`/${key === "thought" ? "thoughts" : key === "book" ? "books" : key}`}
          class:list={[
            "flex items-center gap-2 py-1.5 text-sm rounded hover:text-accent transition-colors w-full",
            isActive ? "text-accent font-semibold" : "text-foreground",
          ]}
        >
          {hasTopics && (
            <svg class:list={["size-[9px] shrink-0 text-[color:var(--fg-faint)] transition-transform", isActive ? "rotate-90" : ""]}
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          )}
          {!hasTopics && <span class="w-[9px]" />}
          <!-- Category dot -->
          <span class="cat-dot shrink-0" style={`background:${meta.color}`} />
          {meta.label}
        </a>

        <!-- Subtopics (visible when active) -->
        {isActive && hasTopics && (
          <ul class="mt-0.5 ml-[18px] pl-2 border-l border-border flex flex-col gap-0.5">
            {meta.topics.map(topic => (
              <li>
                <a
                  href={`/tags/${topic.key}`}
                  class:list={[
                    "block text-[12.5px] py-1 pl-3 rounded hover:text-accent transition-colors",
                    activeTopic === topic.key
                      ? "text-accent font-medium border-l-2 border-accent -ml-px"
                      : "text-[color:var(--fg-mute)]",
                  ]}
                >
                  {topic.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  })}
</aside>
```

**Step 2: Commit**
```bash
git add src/components/Sidebar.astro
git commit -m "feat: add Sidebar left rail component with category tree"
```

---

## Task 5: RightRail 컴포넌트 생성 (3종 variant)

**Files:**
- Create: `src/components/RightRail.astro`

**Step 1: 파일 생성 — variant 스위칭 구조**

```astro
---
import { getSortedPosts } from "@/utils/getSortedPosts";
import { getCollection } from "astro:content";
import { getCategoryMeta } from "@/utils/getCategories";

type Variant = "discovery" | "category" | "reading";

interface Props {
  variant: Variant;
  /** reading 모드: 현재 포스트 ID */
  postId?: string;
  /** category 모드: 카테고리 키 */
  categoryKey?: string;
  /** reading 모드: TOC headings (h2/h3 제목 배열) */
  headings?: { depth: number; slug: string; text: string }[];
}

const { variant, postId, categoryKey, headings = [] } = Astro.props;

const allPosts = await getSortedPosts();
const recentPosts = allPosts.slice(0, 4);
const catMeta = categoryKey ? getCategoryMeta(categoryKey) : undefined;
const catPosts = categoryKey
  ? allPosts.filter(p => p.data.category === categoryKey).slice(0, 4)
  : recentPosts;

// Backlinks: posts that have postId in their links frontmatter
const currentPost = postId ? allPosts.find(p => p.id === postId) : undefined;
const links: string[] = (currentPost?.data as any)?.links ?? [];
const relatedPosts = links
  .map(id => allPosts.find(p => p.id === id || p.slug === id))
  .filter(Boolean);
const backlinks = postId
  ? allPosts.filter(p => ((p.data as any)?.links ?? []).includes(postId)).slice(0, 5)
  : [];
---

<aside
  id="right-rail"
  class="hidden lg:flex flex-col border-l border-border"
  style="width:260px; min-height:0; padding:28px 24px; overflow-y:auto; gap:26px;"
>
  {variant === "discovery" && (
    <>
      <!-- NOW READING -->
      <section>
        <p class="bd-overline mb-2">Now Reading</p>
        <div class="flex gap-2.5 items-start">
          <div class="shrink-0 rounded bg-muted" style="width:40px;height:58px;" />
          <div>
            <p class="text-[13px] font-medium leading-snug">—</p>
            <p class="text-[12px] text-[color:var(--fg-mute)] mt-0.5">—</p>
          </div>
        </div>
        <div class="mt-2 h-[2px] bg-muted rounded-full overflow-hidden">
          <div class="h-full bg-accent rounded-full" style="width:0%" />
        </div>
      </section>

      <!-- THIS WEEK -->
      <section>
        <p class="bd-overline mb-2">This Week</p>
        <ul class="flex flex-col gap-2">
          {recentPosts.map(post => (
            <li>
              <a href={`/${post.data.category}/${post.slug}`}
                class="block text-[13px] leading-snug hover:text-accent transition-colors">
                {post.data.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <!-- STATS -->
      <section>
        <p class="bd-overline mb-2">Stats</p>
        <div class="grid grid-cols-2 gap-2">
          {[
            { label: "notes", value: allPosts.length },
            { label: "tags", value: "—" },
          ].map(({ label, value }) => (
            <div class="bg-muted/50 rounded p-2 text-center">
              <p class="font-mono text-lg font-semibold">{value}</p>
              <p class="text-[11px] text-[color:var(--fg-faint)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <!-- FOOTNOTES -->
      <section>
        <p class="font-mono text-[11px] text-[color:var(--fg-veryfaint)] leading-relaxed">
          Asia/Seoul · ko-KR<br />
          Astro + Obsidian
        </p>
      </section>
    </>
  )}

  {variant === "category" && catMeta && (
    <>
      <!-- CATEGORY GRAPH placeholder -->
      <section>
        <p class="bd-overline mb-2">{catMeta.label} Graph</p>
        <div class="rounded border border-border bg-muted/30 flex items-center justify-center"
          style="height:160px;">
          <span class="text-[12px] text-[color:var(--fg-faint)]">graph</span>
        </div>
        <p class="font-mono text-[11px] text-[color:var(--fg-faint)] mt-1">
          {catPosts.length} notes · <a href="/" class="hover:text-accent">expand →</a>
        </p>
      </section>

      <!-- THIS WEEK (filtered) -->
      <section>
        <p class="bd-overline mb-2">This Week</p>
        <ul class="flex flex-col gap-2">
          {catPosts.map(post => (
            <li>
              <a href={`/${post.data.category}/${post.slug}`}
                class="block text-[13px] leading-snug hover:text-accent transition-colors">
                {post.data.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <!-- OTHER CATEGORIES -->
      <section>
        <p class="bd-overline mb-2">Other Categories</p>
        <nav class="flex flex-col gap-1">
          <a href="/thoughts" class="text-[13px] text-[color:var(--fg-mute)] hover:text-accent transition-colors">Thoughts</a>
          <a href="/writing"  class="text-[13px] text-[color:var(--fg-mute)] hover:text-accent transition-colors">Writing</a>
          <a href="/tech"     class="text-[13px] text-[color:var(--fg-mute)] hover:text-accent transition-colors">Tech</a>
          <a href="/books"    class="text-[13px] text-[color:var(--fg-mute)] hover:text-accent transition-colors">Books</a>
        </nav>
      </section>
    </>
  )}

  {variant === "reading" && (
    <>
      <!-- ON THIS PAGE (TOC) -->
      {headings.length > 0 && (
        <section>
          <p class="bd-overline mb-2">On This Page</p>
          <ul id="bd-toc" class="flex flex-col">
            {headings.map(h => (
              <li>
                <a
                  href={`#${h.slug}`}
                  class:list={[
                    "bd-toc-item block text-[12.5px] text-[color:var(--fg-mute)] hover:text-accent transition-colors border-l border-border",
                    h.depth === 3 ? "pl-[24px] text-[12px]" : "pl-[14px]",
                  ]}
                  style="padding-top:4px;padding-bottom:4px;"
                  data-heading={h.slug}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <!-- LOCAL GRAPH placeholder -->
      <section>
        <p class="bd-overline mb-2">Local Graph</p>
        <div class="rounded border border-border bg-muted/30 flex items-center justify-center"
          style="height:160px;">
          <span class="text-[12px] text-[color:var(--fg-faint)]">graph</span>
        </div>
        <p class="font-mono text-[11px] text-[color:var(--fg-faint)] mt-1">
          <a href="#graph-overlay" class="hover:text-accent">expand →</a>
        </p>
      </section>

      <!-- RELATED -->
      {relatedPosts.length > 0 && (
        <section>
          <p class="bd-overline mb-2">Related</p>
          <ul class="flex flex-col gap-1.5">
            {relatedPosts.map(post => post && (
              <li class="flex items-start gap-1.5">
                <span class="cat-dot mt-1.5 shrink-0"
                  style={`background:${getCategoryMeta(post.data.category)?.color ?? "var(--fg-faint)"}`} />
                <a href={`/${post.data.category}/${post.slug}`}
                  class="text-[13px] leading-snug hover:text-accent transition-colors border-b border-dashed border-accent/40">
                  {post.data.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <!-- BACKLINKS -->
      {backlinks.length > 0 && (
        <section>
          <p class="bd-overline mb-2">Backlinks</p>
          <ul class="flex flex-col gap-1.5">
            {backlinks.map(post => (
              <li>
                <a href={`/${post.data.category}/${post.slug}`}
                  class="text-[13px] text-[color:var(--fg-mute)] hover:text-accent transition-colors">
                  ← {post.data.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )}
</aside>
```

**Step 2: Commit**
```bash
git add src/components/RightRail.astro
git commit -m "feat: add RightRail component with discovery/category/reading variants"
```

---

## Task 6: BlogShell 레이아웃 생성 (3-컬럼 그리드)

**Files:**
- Create: `src/layouts/BlogShell.astro`

**Step 1: 파일 생성**

```astro
---
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import Sidebar from "@/components/Sidebar.astro";
import RightRail from "@/components/RightRail.astro";
import Layout from "./Layout.astro";

type RailVariant = "discovery" | "category" | "reading";

interface Props {
  /** <head> title용 */
  title?: string;
  /** Discovery or Reading 모드 (main column max-width 제어) */
  mode?: "discovery" | "reading";
  /** Right rail variant */
  rail?: RailVariant;
  /** 현재 활성 카테고리 키 (Sidebar, RightRail 전달) */
  activeCategory?: string;
  /** 현재 활성 토픽 키 */
  activeTopic?: string;
  /** 현재 활성 페이지 ("home" | "about") */
  activePage?: string;
  /** Reading 모드: post ID (backlinks 계산용) */
  postId?: string;
  /** Reading 모드: TOC headings */
  headings?: { depth: number; slug: string; text: string }[];
  /** SEO desc */
  description?: string;
}

const {
  title,
  mode = "discovery",
  rail = "discovery",
  activeCategory,
  activeTopic,
  activePage,
  postId,
  headings,
  description,
} = Astro.props;
---

<Layout pageTitle={title ?? "jacobsidian"} {description}>
  <Header />
  <!-- 3-column body -->
  <div
    id="shell-body"
    class="flex flex-1 min-h-0"
    style="min-height: calc(100svh - 56px);"
  >
    <Sidebar {activeCategory} {activeTopic} {activePage} />

    <!-- Main column -->
    <main
      id="main-content"
      class:list={[
        "flex-1 min-w-0",
        mode === "reading" ? "flex justify-center" : "",
      ]}
      style={mode === "reading"
        ? "padding: 32px 40px;"
        : "padding: 32px 28px;"}
    >
      {mode === "reading" ? (
        <div style="width:100%; max-width:680px;">
          <slot />
        </div>
      ) : (
        <slot />
      )}
    </main>

    <RightRail
      variant={rail}
      {postId}
      categoryKey={activeCategory}
      {headings}
    />
  </div>
  <Footer />
</Layout>
```

**Step 2: `src/layouts/Layout.astro` Props 확인 — `pageTitle`, `description`을 받는지 확인**

```bash
head -30 src/layouts/Layout.astro
```

Layout.astro가 `pageTitle` 이외 다른 prop 이름을 쓰면 BlogShell.astro에서 맞춰 수정.

**Step 3: dev에서 `/` 페이지에 BlogShell 임시 적용 (slot에 기존 내용 유지)해서 3컬럼 확인**

Step 4에서 실제 페이지 마이그레이션 전에 여기서 레이아웃 골격만 확인.

**Step 4: Commit**
```bash
git add src/layouts/BlogShell.astro
git commit -m "feat: add BlogShell 3-column layout with discovery/reading modes"
```

---

## Task 7: Home 페이지 BlogShell 전환 + 필터 pill 추가

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: 현재 파일 구조 파악**
```bash
cat src/pages/index.astro
```

**Step 2: BlogShell 임포트 및 적용**

`index.astro` 최상단 레이아웃 import를 교체:
- `Layout` + `Main` → `BlogShell`
- Props: `mode="discovery"`, `rail="discovery"`, `activePage="home"`

**Step 3: 카테고리 필터 pill row 추가**

기존 ASCII hero 아래, 그래프 위에 삽입:
```astro
<!-- Unified category filter -->
<div id="cat-filter-row" class="flex gap-2 overflow-x-auto pb-1 mb-4 flex-wrap">
  {[
    { key: "all", label: "All" },
    ...allCategories().map(([key, meta]) => ({ key, label: meta.label, color: meta.color })),
  ].map(({ key, label, color }) => (
    <button
      class="cat-filter-pill flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[13px] transition-all hover:border-accent hover:text-accent"
      data-cat={key}
      style={key !== "all" ? `--pill-color:${color}` : ""}
    >
      {key !== "all" && <span class="cat-dot" style={`background:${color}`} />}
      {label}
    </button>
  ))}
</div>
```

**Step 4: 필터 바닐라 JS 추가** (`<script>` 블록)

```javascript
(function initCatFilter() {
  let activeFilter = "all";
  const pills = document.querySelectorAll(".cat-filter-pill");
  const rows = document.querySelectorAll("[data-postcat]");

  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      activeFilter = pill.dataset.cat;
      pills.forEach(p => p.classList.toggle("active-pill", p.dataset.cat === activeFilter));
      rows.forEach(row => {
        const match = activeFilter === "all" || row.dataset.postcat === activeFilter;
        row.style.display = match ? "" : "none";
      });
      // graph filter event
      document.dispatchEvent(new CustomEvent("graph:filter", { detail: { category: activeFilter } }));
    });
  });
})();
```

CSS for active pill (in `global.css` or inline style):
```css
.active-pill {
  border-color: var(--pill-color, var(--accent));
  color: var(--pill-color, var(--accent));
  background-color: color-mix(in srgb, var(--pill-color, var(--accent)) 10%, transparent);
}
```

**Step 5: 각 post row에 `data-postcat={post.data.category}` 추가**

기존 post list 컴포넌트(Card.astro 등)에서 category를 `data-postcat`으로 노출해야 JS 필터가 동작함. `Card.astro`를 확인:
```bash
cat src/components/Card.astro
```
wrapper `<li>` 또는 `<article>`에 `data-postcat={category}` 추가.

**Step 6: 브라우저 확인**

`pnpm run dev` 후 `/` 페이지:
- 3컬럼 데스크탑 레이아웃 표시 확인
- 필터 pill 클릭 시 post 목록 필터 동작 확인
- 1024px 미만에서 양쪽 rail 숨겨지는지 확인

**Step 7: Commit**
```bash
git add src/pages/index.astro src/components/Card.astro src/styles/global.css
git commit -m "feat: migrate home page to BlogShell with category filter pills"
```

---

## Task 8: Category index 페이지 BlogShell 전환

**Files:**
- Modify: `src/pages/thoughts/index.astro`
- Modify: `src/pages/writing/index.astro`
- Modify: `src/pages/tech/index.astro`
- Modify: `src/pages/books/index.astro`

**Step 1: 각 파일에서 Layout+Main → BlogShell 교체**

각 파일 공통 패턴:
```astro
import BlogShell from "@/layouts/BlogShell.astro";
import { CATEGORIES } from "@/utils/getCategories";

const catKey = "thought"; // 해당 파일마다 다름
const meta = CATEGORIES[catKey];
```

BlogShell props:
- `mode="discovery"`, `rail="category"`, `activeCategory={catKey}`

**Step 2: Category header 추가** (기존 Main의 pageTitle 대체)

기존 `<Main pageTitle="Thoughts">` 대신 BlogShell 내부 `<slot>`에:
```astro
<!-- Category header -->
<header class="mb-6">
  <div class="flex items-center gap-2 mb-1">
    <span class="cat-dot" style={`background:${meta.color}`} />
    <p class="bd-overline">Category</p>
  </div>
  <h1 class="text-[28px] font-bold tracking-[-0.02em]">{meta.label}</h1>
  <p class="mt-1 text-[15px] text-[color:var(--fg-mute)]">{meta.desc}</p>
</header>
```

> **중요**: `meta.desc`는 기존 페이지의 `pageDesc` 값을 우선합니다. Task 2에서 기존 코드의 description을 확인해서 `getCategories.ts`를 이미 업데이트했어야 합니다.

**Step 3: 각 카테고리 페이지 브라우저 확인**

`/thoughts`, `/writing`, `/tech`, `/books` 각각 확인. 3컬럼, 카테고리 헤더, 우측 rail "category" 위젯.

**Step 4: Commit**
```bash
git add src/pages/thoughts/index.astro src/pages/writing/index.astro src/pages/tech/index.astro src/pages/books/index.astro
git commit -m "feat: migrate category index pages to BlogShell"
```

---

## Task 9: About 페이지 BlogShell 전환

**Files:**
- Modify: `src/pages/about.astro`
- Modify or check: `src/layouts/AboutLayout.astro`

**Step 1: `about.astro` 레이아웃 교체**

```astro
import BlogShell from "@/layouts/BlogShell.astro";
```

BlogShell props: `mode="discovery"`, `rail="discovery"`, `activePage="about"`

**Step 2: 기존 `AboutLayout.astro` 콘텐츠를 `<slot>` 안으로 인라인 이동 또는 래핑**

AboutLayout이 자체 헤더/레이아웃을 포함한다면, 콘텐츠 부분만 BlogShell slot으로 옮기고 AboutLayout은 제거하거나 유지.

**Step 3: 브라우저 확인**
```bash
pnpm run dev
```
`/about` 에서 3컬럼, 우측 rail "discovery" 위젯 표시.

**Step 4: Commit**
```bash
git add src/pages/about.astro src/layouts/AboutLayout.astro
git commit -m "feat: migrate about page to BlogShell"
```

---

## Task 10: Post detail 페이지 BlogShell 전환 (Reading 모드)

**Files:**
- Modify: `src/layouts/PostDetails.astro`

**Step 1: 현재 파일 구조 파악**
```bash
cat src/layouts/PostDetails.astro
```

**Step 2: BlogShell 래핑으로 전환**

`PostDetails.astro` 최상단 레이아웃 교체:
```astro
import BlogShell from "./BlogShell.astro";
```

BlogShell props:
- `mode="reading"`, `rail="reading"`
- `activeCategory={post.data.category}`
- `postId={post.id}`
- `headings={headings}` (Astro의 `getHeadings()` 결과)

**Step 3: headings 추출**

Astro content collections `render()`의 반환값:
```astro
const { Content, headings } = await post.render();
```
`headings`를 BlogShell에 전달.

**Step 4: Back 링크 data-driven으로 교체**

기존 하드코딩된 "← Thoughts" 등을 `getCategoryMeta(post.data.category)?.label`로 교체:
```astro
import { getCategoryMeta } from "@/utils/getCategories";
const catMeta = getCategoryMeta(post.data.category);
```
```astro
<a href={`/${post.data.category}`} class="text-[color:var(--fg-mute)] hover:text-accent text-sm transition-colors">
  ← {catMeta?.label ?? post.data.category}
</a>
```

**Step 5: TOC scroll spy 스크립트 추가** (`<script>` 블록)

```javascript
(function initTocSpy() {
  const items = document.querySelectorAll(".bd-toc-item");
  if (!items.length) return;
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          items.forEach(item => {
            const active = item.dataset.heading === id;
            item.classList.toggle("!border-l-2", active);
            item.classList.toggle("!border-accent", active);
            item.classList.toggle("!text-accent", active);
          });
        }
      });
    },
    { rootMargin: "0px 0px -60% 0px" }
  );
  document.querySelectorAll("article h2[id], article h3[id]").forEach(h => observer.observe(h));
})();
```

**Step 6: 브라우저 확인**

포스트 상세 페이지에서:
- 680px max-width 센터 정렬 확인
- 우측 TOC 표시 + 스크롤 spy 동작
- 모바일(768px 이하)에서 양쪽 rail 숨겨짐 확인

**Step 7: Commit**
```bash
git add src/layouts/PostDetails.astro
git commit -m "feat: migrate post detail to BlogShell reading mode with TOC"
```

---

## Task 11: 반응형 모바일 확인 + 최종 QA

**Files:** 없음 (확인만)

**Step 1: 모바일 드로어 동작 확인**

브라우저 DevTools에서 375px, 768px 뷰포트:
- Header 햄버거 메뉴 동작 (기존 유지)
- 양쪽 rail(`lg:flex`) 숨겨짐 확인
- 포스트 상세 페이지 full-width 확인

**Step 2: 라이트/다크 모드 토큰 확인**

새 `--fg-mute`, `--cat-*` 토큰이 양쪽 테마에서 올바르게 적용되는지 확인.

**Step 3: 빌드 확인**
```bash
pnpm run build
```
에러 없이 빌드 완료 확인.

**Step 4: Lint 확인**
```bash
pnpm run lint
```

**Step 5: 최종 Commit**
```bash
git add -A
git commit -m "chore: final QA and cleanup for desktop layout redesign"
```

---

## 구현 순서 요약

| # | Task | 예상 소요 |
|---|------|-----------|
| 1 | CSS 토큰 + 유틸리티 | 10분 |
| 2 | getCategories 유틸 | 15분 |
| 3 | Header 리디자인 | 20분 |
| 4 | Sidebar 컴포넌트 | 30분 |
| 5 | RightRail 컴포넌트 | 40분 |
| 6 | BlogShell 레이아웃 | 20분 |
| 7 | Home 페이지 전환 + 필터 | 30분 |
| 8 | Category index 페이지 전환 | 20분 |
| 9 | About 페이지 전환 | 15분 |
| 10 | Post detail 전환 + TOC | 30분 |
| 11 | 모바일 + 최종 QA | 20분 |

## 스코프 밖 (이번 작업에서 제외)

- GraphCanvas 필터 이벤트 연동 (Home 필터 → 그래프 노드 dim) — 기본 구조 완성 후 별도 작업
- Now Reading 실제 데이터 연결 — 현재 mock
- Topic 페이지 (`/tags/[tag]`) 테마 변경 — 별도 작업
- Search modal 스타일링 — Pagefind 기본 유지
- V2/V3/V4 디자인 변형 — V1 Quiet Rails만 구현
