# jacobsidian Design Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** astro-paper 기본 스타터를 "Quiet Craft" 디자인 아이덴티티로 전환 — Pretendard 폰트, 인디고 강조색, 680px 레이아웃, 마이크로인터랙션 포함.

**Architecture:** CSS 변수와 Tailwind 유틸리티 클래스를 수정하는 방식으로 최대한 기존 구조 유지. 새 컴포넌트는 Books 그리드 카드와 About 페이지만 추가. 카테고리 `it` → `tech` rename은 schema + pages 라우팅만 수정.

**Tech Stack:** Astro 5, Tailwind CSS v4, Pretendard Variable (jsdelivr CDN), JetBrains Mono (Google Fonts)

**Design Reference:** `docs/plans/2026-05-13-design-identity.md`

**Dev server:** `npm run dev` → http://localhost:4321

---

## Task 1: 폰트 교체 — Pretendard + JetBrains Mono

**Files:**
- Modify: `src/layouts/Layout.astro`
- Modify: `src/styles/global.css`

**Step 1: Layout.astro에서 폰트 링크 교체**

현재 Google Sans Code 로드 부분을 찾아서 아래로 교체:

```astro
<!-- 기존 Google Fonts 링크 제거 후 아래로 교체 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
/>
```

**Step 2: global.css 폰트 변수 수정**

`src/styles/global.css`의 `@theme inline` 블록:

```css
@theme inline {
  --font-app: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
    system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --color-muted: var(--muted);
  --color-border: var(--border);
}
```

**Step 3: 브라우저에서 확인**

`npm run dev` 후 http://localhost:4321 에서 폰트가 Pretendard로 바뀌었는지 확인.
코드 블록은 JetBrains Mono인지 확인.

**Step 4: Commit**

```bash
git add src/layouts/Layout.astro src/styles/global.css
git commit -m "feat: replace fonts with Pretendard Variable and JetBrains Mono"
```

---

## Task 2: 색상 토큰 업데이트

**Files:**
- Modify: `src/styles/global.css`

**Step 1: CSS 변수 교체**

`src/styles/global.css`의 `:root` / `html[data-theme]` 블록 전체 교체:

```css
:root,
html[data-theme="light"] {
  --background: #f8f8f7;
  --foreground: #1a1918;
  --accent: #3d5a99;
  --muted: #e8e6e3;
  --border: #d4d0cb;
}

html[data-theme="dark"] {
  --background: #141414;
  --foreground: #e8e6e3;
  --accent: #7aa2d4;
  --muted: #242424;
  --border: #2e2e2e;
}
```

**Step 2: 브라우저에서 확인**

라이트/다크 토글 눌러서 두 모드 모두 색상 확인.
특히 링크(accent), 배경, 본문 색이 맞는지 확인.

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: update color tokens to Quiet Craft palette"
```

---

## Task 3: 타이포그래피 + 레이아웃 폭

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/styles/typography.css`

**Step 1: global.css — 레이아웃 폭 680px로 변경**

`max-w-app` 유틸리티 수정:

```css
@utility max-w-app {
  max-width: 680px;
}
```

**Step 2: global.css — body 기본 폰트 크기/행간**

`@layer base` 내 `body` 규칙에 추가:

```css
body {
  @apply flex min-h-svh flex-col bg-background font-app text-foreground selection:bg-accent/75 selection:text-background;
  font-size: 16px;
  line-height: 1.75;
}
```

**Step 3: typography.css — prose 오버라이드 수정**

`.app-prose` 내에 아래 내용 추가/수정:

```css
.app-prose {
  @apply prose;

  /* 제목 letter-spacing */
  h1, h2, h3, h4 {
    @apply mb-3 text-foreground;
    letter-spacing: -0.02em;
  }

  /* h1 크기 */
  h1 {
    font-size: 2rem; /* 32px */
    font-weight: 700;
  }

  /* h2 크기 */
  h2 {
    font-size: 1.25rem; /* 20px */
    font-weight: 600;
  }

  /* h3 — italic 제거 */
  h3 {
    font-size: 1.0625rem; /* 17px */
    font-weight: 600;
    font-style: normal; /* 기존 italic 제거 */
  }

  /* 단락 간격 */
  p {
    @apply text-foreground;
    margin-bottom: 1.5em;
  }
  /* ... 나머지 기존 규칙 유지 */
}
```

**Step 4: 브라우저에서 확인**

- 콘텐츠 최대 폭이 680px로 줄었는지 확인
- 제목 letter-spacing이 눈에 띄게 좁아졌는지 확인
- h3가 더 이상 italic이 아닌지 확인

**Step 5: Commit**

```bash
git add src/styles/global.css src/styles/typography.css
git commit -m "feat: update typography — Pretendard sizes, spacing, 680px layout"
```

---

## Task 4: 카테고리 `it` → `tech` rename

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/pages/it/index.astro` → 파일명 변경 후 내용 수정
- Modify: `src/pages/it/[slug].astro` → 파일명 변경 후 내용 수정

**Step 1: content.config.ts schema 수정**

`category` enum 업데이트:

```typescript
category: z.enum(["thought", "writing", "tech"]),
```

**Step 2: it 폴더를 tech로 rename**

```bash
mv src/pages/it src/pages/tech
```

**Step 3: src/pages/tech/index.astro 내용 수정**

`category === "it"` → `category === "tech"`, 제목/설명 업데이트:

```astro
const all = await getCollection("posts", ({ data }) => data.category === "tech");
// ...
<Layout title={`Tech | ${SITE.title}`}>
  <Header />
  <Main pageTitle="Tech" pageDesc="개발과 기술에 대한 글">
```

**Step 4: Astro 빌드 오류 없는지 확인**

```bash
npm run build
```

오류 없으면 OK.

**Step 5: Commit**

```bash
git add src/content.config.ts src/pages/tech/
git rm -r src/pages/it/  # 이미 mv 했으므로 git이 추적하도록
git commit -m "feat: rename category it → tech, update routing"
```

---

## Task 5: Header 네비게이션 업데이트

**Files:**
- Modify: `src/components/Header.astro`

**Step 1: nav 항목 교체**

기존 `<ul id="menu-items">` 내부를 아래로 교체:

```astro
<ul
  id="menu-items"
  class:list={[
    "mt-4 grid w-44 grid-cols-2 place-content-center gap-2",
    "[&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium [&>li>a]:hover:text-accent sm:[&>li>a]:px-2 sm:[&>li>a]:py-1",
    "hidden",
    "sm:mt-0 sm:flex sm:w-auto sm:gap-x-5 sm:gap-y-0",
  ]}
>
  <li class="col-span-2">
    <a href="/thoughts" class:list={{ "active-nav": isActive("/thoughts") }}>
      Thoughts
    </a>
  </li>
  <li class="col-span-2">
    <a href="/writing" class:list={{ "active-nav": isActive("/writing") }}>
      Writing
    </a>
  </li>
  <li class="col-span-2">
    <a href="/tech" class:list={{ "active-nav": isActive("/tech") }}>
      Tech
    </a>
  </li>
  <li class="col-span-2">
    <a href="/books" class:list={{ "active-nav": isActive("/books") }}>
      Books
    </a>
  </li>
  <li class="col-span-2">
    <a href="/about" class:list={{ "active-nav": isActive("/about") }}>
      About
    </a>
  </li>
  <!-- 검색, 다크/라이트 토글은 기존 유지 -->
  <li class="col-span-1 flex items-center justify-center">
    <LinkButton href="/search" ...>
      <IconSearch />
    </LinkButton>
  </li>
  {SITE.lightAndDarkMode && (
    <li class="col-span-1 flex items-center justify-center">
      <button id="theme-btn" ...>
        ...
      </button>
    </li>
  )}
</ul>
```

**Step 2: active-nav 스타일 교체**

`src/styles/global.css`에서 `.active-nav` 수정:

```css
.active-nav {
  @apply underline decoration-2 underline-offset-4;
  text-decoration-color: var(--accent);
}
```

(wavy → solid, accent 색 명시)

**Step 3: 브라우저에서 확인**

- 네비에 Thoughts / Writing / Tech / Books / About 표시되는지
- 현재 페이지 active underline이 solid accent 색인지
- 모바일 햄버거 메뉴 작동하는지 (브라우저 폭 줄여서 확인)

**Step 4: Commit**

```bash
git add src/components/Header.astro src/styles/global.css
git commit -m "feat: update nav to Thoughts/Writing/Tech/Books/About with solid active style"
```

---

## Task 6: 홈 페이지 리디자인

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Hero 섹션 최소화**

`<section id="hero">` 교체:

```astro
<section id="hero" class="pt-12 pb-8 border-b border-border">
  <h1 class="text-2xl font-semibold tracking-tight mb-1">Jacob Lee</h1>
  <p class="text-sm text-foreground/60">글, 소설, 개발 기록.</p>
</section>
```

**Step 2: 최근 글 리스트 스타일 업그레이드**

`<section id="recent-posts">` 내 ul을 아래 구조로 변경
(Card 컴포넌트 대신 인라인으로 직접 작성해 홈 전용 스타일 적용):

```astro
<section id="recent-posts" class="pt-10 pb-6">
  <ul class="divide-y divide-border">
    {recentPosts.slice(0, SITE.postPerIndex).map(({ data, id, collection }) => (
      <li>
        <a
          href={`/${data.category === 'thought' ? 'thoughts' : data.category === 'tech' ? 'tech' : 'writing'}/${id}`}
          class="group flex items-baseline justify-between py-4 gap-4 hover:text-accent transition-colors duration-150"
        >
          <span class="flex items-baseline gap-3 min-w-0">
            <span class="text-xs text-foreground/40 shrink-0 tabular-nums">
              {new Date(data.pubDatetime).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })}
            </span>
            <span class="font-medium truncate group-hover:translate-x-1 transition-transform duration-150">
              {data.title}
            </span>
          </span>
          <span class="text-xs text-foreground/40 shrink-0 capitalize">
            {data.category === 'thought' ? 'Thoughts' : data.category === 'tech' ? 'Tech' : 'Writing'}
          </span>
        </a>
      </li>
    ))}
  </ul>
</section>
```

**Step 3: Featured 섹션 제거 또는 유지 결정**

Featured 포스트가 없으면 자동으로 숨겨지므로 기존 코드 유지해도 됨.

**Step 4: 브라우저에서 확인**

- Hero가 이름 + 한 줄로 최소화됐는지
- 포스트 리스트에 날짜 / 제목 / 카테고리 표시되는지
- 제목 hover 시 오른쪽으로 살짝 이동하는지

**Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: redesign home page — minimal hero, post list with micro-interactions"
```

---

## Task 7: 링크 underline 애니메이션 (전역)

**Files:**
- Modify: `src/styles/global.css`

**Step 1: 링크 hover underline grow 애니메이션 추가**

`@layer base` 내 `a` 규칙 수정:

```css
@layer base {
  /* prose 밖의 일반 링크 */
  main a:not([class]) {
    position: relative;
    text-decoration: none;
    color: var(--accent);
  }

  main a:not([class])::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 200ms ease;
  }

  main a:not([class]):hover::after {
    transform: scaleX(1);
  }
}
```

**Step 2: 브라우저에서 확인**

포스트 본문 내 링크 hover 시 밑줄이 왼→오로 자라는지 확인.

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add left-to-right underline grow animation for links"
```

---

## Task 8: Books 페이지 — 커버 이미지 그리드

**Files:**
- Modify: `src/pages/books/index.astro`
- Create: `src/components/BookCard.astro`

**Step 1: BookCard.astro 생성**

```astro
---
import type { CollectionEntry } from "astro:content";
import { getPath } from "@/utils/getPath";

type Props = CollectionEntry<"books">;

const entry = Astro.props;
const { data } = entry;
const { title, author, ogImage } = data;
const href = getPath(entry);
---

<li>
  <a
    href={href}
    class="group block overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:scale-[1.03] hover:border-accent/30"
  >
    {ogImage ? (
      <img
        src={typeof ogImage === "string" ? ogImage : ogImage.src}
        alt={title}
        class="w-full aspect-[2/3] object-cover"
      />
    ) : (
      <div class="w-full aspect-[2/3] bg-muted flex items-center justify-center">
        <span class="text-foreground/30 text-xs text-center px-2">{title}</span>
      </div>
    )}
    <div class="p-3">
      <p class="text-sm font-medium line-clamp-2 leading-snug">{title}</p>
      <p class="text-xs text-foreground/50 mt-1">{author}</p>
    </div>
  </a>
</li>
```

**Step 2: books/index.astro 그리드 레이아웃으로 교체**

```astro
---
import { getCollection } from "astro:content";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import BookCard from "@/components/BookCard.astro";
import { SITE } from "@/config";

const all = await getCollection("books", ({ data }) => !data.draft);
const books = all.sort(
  (a, b) =>
    new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() -
    new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime()
);
---

<Layout title={`Books | ${SITE.title}`}>
  <Header />
  <main id="main-content" class="app-layout pt-12 pb-16">
    <h1 class="text-2xl font-semibold tracking-tight mb-1">Books</h1>
    <p class="text-sm text-foreground/60 mb-8">읽은 책에 대한 노트</p>
    <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {books.map(entry => <BookCard {...entry} />)}
    </ul>
  </main>
  <Footer />
</Layout>
```

**Step 3: 브라우저에서 확인**

- `/books` 에서 그리드 레이아웃으로 표시되는지
- 커버 이미지가 없을 때 fallback placeholder가 나오는지
- hover 시 scale + shadow 효과 확인
- 모바일(2열) / 태블릿(3열) 반응형 확인

**Step 4: Commit**

```bash
git add src/components/BookCard.astro src/pages/books/index.astro
git commit -m "feat: books page — cover image grid with hover animations"
```

---

## Task 9: About 페이지

**Files:**
- Modify: `src/pages/about.md` (이미 존재)

**Step 1: about.md 내용 확인**

```bash
cat src/pages/about.md
```

**Step 2: 프론트매터 + 내용 업데이트**

```markdown
---
layout: "@/layouts/Layout.astro"
title: "About"
---

# Jacob Lee

개발자이자 글을 씁니다.

기술에 대한 생각(Tech), 일상의 에세이(Thoughts), 그리고 가끔 소설(Writing)을 씁니다.
읽은 책의 노트도 함께 기록합니다.

---

[GitHub](https://github.com/jacoblee) · [RSS](/rss.xml)
```

(실제 소개 내용은 본인이 직접 작성)

**Step 3: 브라우저에서 확인**

`/about` 이 헤더/푸터와 함께 잘 렌더링되는지 확인.

**Step 4: Commit**

```bash
git add src/pages/about.md
git commit -m "feat: update about page with bio"
```

---

## Task 10: Astro View Transitions 확인 + 페이지 전환 fade

**Files:**
- Modify: `src/layouts/Layout.astro`

**Step 1: ViewTransitions import 확인**

`src/layouts/Layout.astro`에 이미 있는지 확인:

```bash
grep -n "ViewTransitions\|view-transitions" src/layouts/Layout.astro
```

**Step 2: 없으면 추가**

```astro
---
import { ViewTransitions } from "astro:transitions";
---
<head>
  <!-- 기존 내용 -->
  <ViewTransitions />
</head>
```

**Step 3: 페이지 간 이동 시 fade 확인**

브라우저에서 링크 클릭 → 부드러운 전환이 일어나는지 확인.

**Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: ensure Astro View Transitions for smooth page fade"
```

---

## Task 11: 전체 반응형 검증

**Step 1: 브라우저 DevTools로 모바일 확인**

Chrome DevTools → Toggle Device Toolbar (Cmd+Shift+M)
iPhone SE (375px) 기준으로 각 페이지 확인:

- [ ] 홈 페이지 — 리스트 잘리지 않는지
- [ ] Header 햄버거 메뉴 열리고 닫히는지
- [ ] Books 그리드 2열로 표시되는지
- [ ] 포스트 본문 가독성 (패딩, 행간)
- [ ] 코드 블록 가로 스크롤 처리

**Step 2: 태블릿 (768px) 확인**

iPad 기준으로 동일하게 확인.

**Step 3: 문제 있으면 수정 후 commit**

```bash
git add -p  # 변경 사항 선택적 스테이징
git commit -m "fix: responsive layout adjustments"
```

---

## 완료 기준

- [ ] Pretendard 폰트가 모든 페이지에서 로드됨
- [ ] 라이트/다크 모두 인디고 강조색 팔레트 적용
- [ ] 콘텐츠 최대 폭 680px
- [ ] 네비: Thoughts / Writing / Tech / Books / About
- [ ] 홈: 최소 hero + 날짜·제목·카테고리 리스트
- [ ] 글 제목 hover 시 오른쪽 이동 애니메이션
- [ ] 링크 underline 좌→우 grow 애니메이션
- [ ] Books 커버 이미지 그리드
- [ ] About 페이지 자기소개 포함
- [ ] View Transitions 작동
- [ ] 모바일 375px 에서 레이아웃 깨지지 않음
