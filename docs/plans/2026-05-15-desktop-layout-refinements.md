# Desktop Layout Refinements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the remaining layout refinements specified in `design_handoff_desktop_layout/README.md` — the 3-column shell and core components are done; this plan covers the widgets and page-level polish that are still missing.

**Architecture:** All changes are in existing `.astro` files and inline `<script>` blocks. No new components needed. Data (link counts, this-week counts) is computed at build time in `RightRail.astro` from the content collection.

**Tech Stack:** Astro v5, Tailwind CSS v4, vanilla DOM JS, content collections at `src/data/posts/`.

**Priority rule:** When design spec text conflicts with existing code copy (Korean descriptions, labels), keep the existing code. This plan is layout-only.

---

## What's already done

- 3-column `BlogShell` shell (left rail 232px | main 1fr | right rail 260px)
- `Sidebar.astro` with category tree + pinned (localStorage)
- `RightRail.astro` with discovery / category / reading variants
- `GraphCanvas.astro` categoryFilter prop + `graph:filter` event
- Header redesign (search pill, no nav links)
- Home page filter pills + archives with category dot + date
- Now Reading + Pinned localStorage hydration
- TOC scroll spy with IntersectionObserver in `PostDetails.astro`
- Category pages: header with dot + overline + h1 + desc

---

## Task 1: Home page — dynamic graph caption

**Context:** After the graph card, the design spec wants a caption: "지금까지 쓴 N개의 노트가 M개의 링크로 이어져 있어요." When a filter is active it changes to "{Label} 카테고리에 N개의 노트가 있어요." Do NOT add the `drag · zoom · hover` hint (user already removed it).

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Add build-time link count in the frontmatter**

After `const total = allItems.length;`, add:

```ts
const totalLinks = allPosts.reduce((sum, p) => sum + (p.data.links?.length ?? 0), 0);
```

**Step 2: Add the caption element after the graph card div**

After the closing `</div>` of the graph card and before the closing `</section>` of the hero section, insert:

```astro
<p
  id="graph-caption"
  data-total={total}
  data-total-links={totalLinks}
  class="mt-2 text-[13px]"
  style="color: var(--fg-mute);"
>
  지금까지 쓴 <strong class="text-foreground">{total}</strong>개의 노트가 <strong style="color: var(--accent);">{totalLinks}</strong>개의 링크로 이어져 있어요.
</p>
```

**Step 3: Wire caption update into the existing `applyFilter` function**

Inside the existing inline `<script>`, at the end of the `applyFilter(key)` function body, add:

```js
const captionEl = document.getElementById("graph-caption");
if (captionEl) {
  const t = captionEl.dataset.total ?? "0";
  const tl = captionEl.dataset.totalLinks ?? "0";
  const span = captionEl;
  // Clear and rebuild with safe DOM methods
  span.textContent = "";
  if (key === "all") {
    span.append("지금까지 쓴 ");
    const s1 = document.createElement("strong");
    s1.style.color = "var(--foreground)";
    s1.textContent = t + "개";
    span.append(s1, "의 노트가 ");
    const s2 = document.createElement("strong");
    s2.style.color = "var(--accent)";
    s2.textContent = tl + "개";
    span.append(s2, "의 링크로 이어져 있어요.");
  } else {
    const cnt = filteredItems().length;
    const pillLabel = pills.find(p => p.dataset.cat === key)?.textContent?.trim() ?? key;
    span.append(pillLabel + " 카테고리에 ");
    const s = document.createElement("strong");
    s.style.color = "var(--foreground)";
    s.textContent = cnt + "개";
    span.append(s, "의 노트가 있어요.");
  }
}
```

**Step 4: Verify visually**

```bash
pnpm run dev
```

Open `http://localhost:4321`. Confirm caption renders below graph. Click category pills and confirm caption updates.

**Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: home 그래프 아래 동적 캡션 추가 (노트/링크 수)"
```

---

## Task 2: RightRail stats widget — 4-stat grid

**Context:** The design (v1.jsx) shows a 2x2 grid: notes / links / tags / +Δ this week. Currently only notes + tags are shown.

**Files:**
- Modify: `src/components/RightRail.astro`

**Step 1: Add two new computed values in the frontmatter**

After `const uniqueTags = ...`, add:

```ts
const totalLinks = rawPosts.reduce((sum, p) => sum + (p.data.links?.length ?? 0), 0);
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const thisWeekCount = allPosts.filter(p => new Date(p.data.pubDatetime) >= oneWeekAgo).length;
```

**Step 2: Replace the STATS section**

Find and replace the existing stats section (inside the discovery variant block):

Old:
```astro
<!-- STATS -->
<section>
  <p class="bd-overline mb-2">Stats</p>
  <div class="grid grid-cols-2 gap-2">
    <div class="bg-muted/50 rounded p-2 text-center">
      <p class="font-mono text-lg font-semibold">{totalNotes}</p>
      <p class="text-[11px] text-[color:var(--fg-faint)]">notes</p>
    </div>
    <div class="bg-muted/50 rounded p-2 text-center">
      <p class="font-mono text-lg font-semibold">{uniqueTags}</p>
      <p class="text-[11px] text-[color:var(--fg-faint)]">tags</p>
    </div>
  </div>
</section>
```

New:
```astro
<!-- STATS -->
<section>
  <p class="bd-overline mb-2">Stats</p>
  <div class="grid grid-cols-2 gap-x-3 gap-y-4">
    <div>
      <p class="font-mono text-[22px] leading-none">{totalNotes}</p>
      <p class="text-[11px] mt-1" style="color: var(--fg-faint);">notes</p>
    </div>
    <div>
      <p class="font-mono text-[22px] leading-none">{totalLinks}</p>
      <p class="text-[11px] mt-1" style="color: var(--fg-faint);">links</p>
    </div>
    <div>
      <p class="font-mono text-[22px] leading-none">{uniqueTags}</p>
      <p class="text-[11px] mt-1" style="color: var(--fg-faint);">tags</p>
    </div>
    <div>
      <p class="font-mono text-[22px] leading-none" style="color: var(--accent);">+{thisWeekCount}</p>
      <p class="text-[11px] mt-1" style="color: var(--fg-faint);">this week</p>
    </div>
  </div>
</section>
```

**Step 3: Verify**

```bash
pnpm run dev
```

Open home page right rail — Stats should show 4 numbers in 2x2 layout.

**Step 4: Commit**

```bash
git add src/components/RightRail.astro
git commit -m "feat: stats 위젯 4항목으로 확장 (notes/links/tags/this week)"
```

---

## Task 3: RightRail "This Week" — add date display

**Context:** Design shows each "This Week" item with a small mono date line above the title. Currently only title is shown.

**Files:**
- Modify: `src/components/RightRail.astro`

**Step 1: Update the discovery variant "This Week" list**

Find inside the discovery variant block. Old:
```astro
<ul class="flex flex-col gap-2">
  {recentPosts.map(post => (
    <li>
      <a
        href={postUrl(post)}
        class="block text-[13px] leading-snug hover:text-accent transition-colors text-[color:var(--fg-mute)]"
      >
        {post.data.title}
      </a>
    </li>
  ))}
</ul>
```

New:
```astro
<ul class="flex flex-col gap-3">
  {recentPosts.map(post => (
    <li>
      <a href={postUrl(post)} class="block hover:text-accent transition-colors">
        <span class="block font-mono text-[10.5px] mb-0.5" style="color: var(--fg-veryfaint);">
          {new Date(post.data.pubDatetime).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })}
        </span>
        <span class="block text-[12.5px] leading-snug" style="color: var(--fg-mute);">
          {post.data.title}
        </span>
      </a>
    </li>
  ))}
</ul>
```

**Step 2: Apply the same update to the category variant "This Week" list**

Find inside the category variant block. Replace identically, using `catPosts` instead of `recentPosts`.

**Step 3: Verify**

```bash
pnpm run dev
```

Home page right rail and a category page right rail — each "This Week" item should show a small mono date above the title.

**Step 4: Commit**

```bash
git add src/components/RightRail.astro
git commit -m "feat: This Week 위젯 날짜 표시 추가"
```

---

## Task 4: About page — avatar + overline sections

**Context:** Current about.astro is a minimal placeholder. Design spec (v1.jsx V1About) shows: gradient avatar + h1 + subtitle, then bd-overline sections ABOUT / WHAT I'M DOING NOW / ELSEWHERE. Keep all Korean text from the existing about.astro. Right rail is already `rail="discovery"`.

**Files:**
- Modify: `src/pages/about.astro`

**Step 1: Rewrite the page content**

Replace the entire file:

```astro
---
import BlogShell from "@/layouts/BlogShell.astro";
import { SITE } from "@/config";
---

<BlogShell
  title={`About | ${SITE.title}`}
  mode="discovery"
  rail="discovery"
  activePage="about"
>
  <!-- Hero: avatar + name + subtitle -->
  <div class="flex items-center gap-5 mb-8">
    <div
      class="shrink-0 rounded-full flex items-center justify-center font-bold"
      style="width:72px; height:72px; font-size:28px; letter-spacing:-0.05em; background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 50%, var(--foreground))); color: var(--background);"
    >
      J
    </div>
    <div>
      <h1 class="text-[28px] font-bold tracking-tight leading-tight">Jacob Lee</h1>
      <p class="mt-1 text-[14px]" style="color: var(--fg-mute);">글쓰기를 좋아하는 어느 개발자의 기록 저장소.</p>
    </div>
  </div>

  <!-- ABOUT -->
  <p class="bd-overline mb-3">About</p>
  <div class="flex flex-col gap-4 text-[15px] leading-relaxed pb-8 border-b border-border" style="color: var(--fg-mute);">
    <p>
      반도체 대기업에서 7년, 지금은 스타트업에서 매니저 1년차. 사이드로 소설을 쓰고, 시간이 남으면 코드를 짜요.
      이 곳은 그 사이에서 생긴 짧은 글들을 모으는 공간이에요.
    </p>
    <p>
      노트 사이의 연결을 좋아해서 Obsidian으로 글을 관리하고, Astro로 빌드하고 있어요.
      기록은 휘발성이 강해요. 그래서 자주 돌아와서 다시 읽고, 새로 쓰고, 잇고 있어요.
    </p>
  </div>

  <!-- WHAT I'M DOING NOW -->
  <p class="bd-overline mt-8 mb-3">What I'm doing now</p>
  <ul class="flex flex-col gap-3 text-[14px] pb-8 border-b border-border">
    <li class="flex gap-3">
      <span class="shrink-0 w-4" style="color: var(--cat-tech);">—</span>
      <span>스타트업에서 프로덕트 매니징 1년차로 적응 중</span>
    </li>
    <li class="flex gap-3">
      <span class="shrink-0 w-4" style="color: var(--cat-writing);">—</span>
      <span>장편 소설 첫 챕터 다듬는 중</span>
    </li>
    <li class="flex gap-3">
      <span class="shrink-0 w-4" style="color: var(--cat-book);">—</span>
      <span>독서 중 — 좌측 사이드바의 Now Reading 참고</span>
    </li>
  </ul>

  <!-- ELSEWHERE -->
  <p class="bd-overline mt-8 mb-3">Elsewhere</p>
  <div class="flex gap-5 text-[13.5px]">
    <a href="https://github.com/jacoblee" class="hover:text-accent transition-colors" style="border-bottom: 1px dashed var(--border);">GitHub</a>
    <a href="mailto:jongsuklee45@gmail.com" class="hover:text-accent transition-colors" style="border-bottom: 1px dashed var(--border);">Email</a>
    <a href="/rss.xml" class="hover:text-accent transition-colors" style="border-bottom: 1px dashed var(--border);">RSS</a>
  </div>
</BlogShell>
```

**Step 2: Verify**

```bash
pnpm run dev
```

Open `/about`:
- Gradient circle "J" + h1 "Jacob Lee" + subtitle
- bd-overline "About" + 2 paragraphs
- bd-overline "What I'm doing now" + colored em-dash list
- bd-overline "Elsewhere" + dashed-underline links
- Right rail shows Now Reading, This Week, Stats (discovery widgets)
- Light and dark modes both look correct

**Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: About 페이지 레이아웃 개선 (아바타, 섹션 오버라인)"
```

---

## Task 5: Category pages — subtopic filter row infrastructure

**Context:** Design says category pages show a pill filter row when topics are defined. All categories currently have `topics: []` so the row won't render, but the infrastructure should be ready.

**Files:**
- Modify: `src/pages/thoughts/index.astro`, `src/pages/writing/index.astro`, `src/pages/tech/index.astro`, `src/pages/books/index.astro`
- Check: `src/styles/global.css`

**Step 1: Update `thoughts/index.astro`**

After `</header>` and before the `<section>` containing the post list, add the topic filter row:

```astro
{meta.topics.length > 0 && (
  <div id="topic-filter-row" class="flex gap-2 flex-wrap py-3 mb-4 border-b border-border overflow-x-auto">
    <button class="topic-pill cat-filter-pill active-pill rounded-full border border-border px-3 py-1 text-[12.5px] transition-all hover:border-accent hover:text-accent" data-topic="all">
      모두 보기
    </button>
    {meta.topics.map(t => (
      <button class="topic-pill cat-filter-pill rounded-full border border-border px-3 py-1 text-[12.5px] transition-all hover:border-accent hover:text-accent" data-topic={t.key}>
        {t.label}
      </button>
    ))}
  </div>
)}
```

Add `id="post-list"` to the `<ul>` and `data-tags={JSON.stringify(post.data.tags ?? [])}` to each `<li>`:

```astro
<ul id="post-list" class="divide-y divide-border">
  {posts.map(({ data, id }) => (
    <li data-tags={JSON.stringify(data.tags ?? [])}>
      ...
    </li>
  ))}
</ul>
```

Add inline script at bottom of file (before closing `</BlogShell>`):

```astro
<script>
  document.addEventListener("astro:page-load", () => {
    const pills = Array.from(document.querySelectorAll<HTMLButtonElement>(".topic-pill"));
    const items = Array.from(document.querySelectorAll<HTMLElement>("#post-list li[data-tags]"));
    if (!pills.length) return;
    function apply(key: string) {
      items.forEach(el => {
        if (key === "all") {
          el.classList.remove("hidden");
        } else {
          const tags: string[] = JSON.parse(el.dataset.tags ?? "[]");
          el.classList.toggle("hidden", !tags.includes(key));
        }
      });
      pills.forEach(p => p.classList.toggle("active-pill", p.dataset.topic === key));
    }
    pills.forEach(p => p.addEventListener("click", () => apply(p.dataset.topic ?? "all")));
  });
</script>
```

**Step 2: Repeat for the other three category pages**

Apply identical changes to:
- `src/pages/writing/index.astro`
- `src/pages/tech/index.astro`
- `src/pages/books/index.astro`

**Step 3: Verify the row is hidden when topics are empty**

```bash
pnpm run dev
```

Open `/thoughts` — no topic row should appear. Temporarily add a test topic to `getCategories.ts`:

```ts
thought: {
  ...
  topics: [{ key: "work", label: "Work · 일" }],
},
```

Reload `/thoughts` — topic row should appear with "모두 보기" and "Work · 일". Remove the test topic.

**Step 4: Commit**

```bash
git add src/pages/thoughts/index.astro src/pages/writing/index.astro src/pages/tech/index.astro src/pages/books/index.astro
git commit -m "feat: 카테고리 페이지 서브토픽 필터 인프라 추가"
```

---

## Task 6: Final build verification

**Step 1: Run full build**

```bash
pnpm run build
```

Expected: 0 TypeScript errors, 0 Astro check errors.

**Step 2: Preview and manual smoke test**

```bash
pnpm run preview
```

Check all 5 page types:
- `/` — caption below graph, 4-stat rail, This Week with dates
- `/thoughts` — category header, post list, right rail graph
- `/thoughts/[any-slug]` — post detail: TOC spy, local graph, related
- `/about` — avatar, 3 sections, discovery rail
- `/books/[any-slug]` — Now Reading auto-tracked

**Step 3: Final commit if any tweaks needed**

```bash
git add -p
git commit -m "fix: 빌드 후 최종 점검 수정"
```
