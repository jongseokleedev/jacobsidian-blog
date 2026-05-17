# Category Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 기존 4개 flat 카테고리(thought/writing/tech/book)를 상위/하위 2계층 구조(Essay·Tech·Review·Fiction × 각 하위)로 전면 재편한다.

**Architecture:** category 값을 `essay-thought`, `tech-work` 등 `{parent}-{sub}` 형태의 단일 문자열로 표현한다. 상위/하위를 파싱하는 유틸을 두고, URL은 `/{parent}/{sub}/{slug}` 형태로 라우팅한다. 볼트 폴더·sync 스크립트·Templater 템플릿도 동일 구조로 맞춘다.

**Tech Stack:** Astro v5, TypeScript strict, Zod, pnpm, Obsidian Templater

---

## Category Mapping Reference

```
essay-thought   Essay > Thought
essay-journal   Essay > Journal
tech-dev        Tech > Dev
tech-work       Tech > Work
tech-it         Tech > IT
review-book     Review > Book
review-cinema   Review > Cinema
fiction-novel   Fiction > Novel
fiction-tales   Fiction > Tales
```

## Content Migration Reference

| slug | 현재 category | 새 category |
|------|--------------|-------------|
| 20260514-2114 | thought | essay-thought |
| 20260514-2115 | thought | essay-thought |
| 20260515-1013 | thought | essay-thought |
| 20260517-1337 | thought | essay-thought |
| 20210817-1336 | thought | essay-journal |
| 20220130-1335 | thought | essay-journal |
| 20260315-1014 | tech | tech-work |
| 20260915-1014 | tech | tech-work |
| 20260515-1013-3 | tech | tech-work |
| 20260513-1350 | tech | tech-it |
| 20260514-1200 | tech | tech-it |
| 20260515-1013-2 | tech | tech-it |
| 20260513-2148 | writing | fiction-tales |
| 20260514-1547 | book | review-cinema |
| 나머지 book × 19 | book | review-book |

---

## Task 1: category 유틸 업데이트

**Files:**
- Modify: `src/utils/getCategories.ts`
- Modify: `src/utils/getPath.ts`

**Step 1: `getCategories.ts` 전체 교체**

```typescript
export type TopicMeta = { key: string; label: string };

export type CategoryMeta = {
  label: string;
  desc: string;
  color: string;
  topics: TopicMeta[];
};

export type ParentMeta = {
  label: string;
  color: string;
  subs: Record<string, CategoryMeta>;
};

// 단일 카테고리 키: "{parent}-{sub}"
export const CATEGORY_KEYS = [
  "essay-thought",
  "essay-journal",
  "tech-dev",
  "tech-work",
  "tech-it",
  "review-book",
  "review-cinema",
  "fiction-novel",
  "fiction-tales",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const PARENTS: Record<string, ParentMeta> = {
  essay: {
    label: "Essay",
    color: "var(--cat-essay)",
    subs: {
      thought: { label: "Thought", desc: "생각, 단상, 에세이", color: "var(--cat-essay)", topics: [] },
      journal: { label: "Journal", desc: "일상, 여행, 기록",  color: "var(--cat-essay)", topics: [] },
    },
  },
  tech: {
    label: "Tech",
    color: "var(--cat-tech)",
    subs: {
      dev:  { label: "Dev",  desc: "개발 기술, 코드",         color: "var(--cat-tech)", topics: [] },
      work: { label: "Work", desc: "방법론, 팀, 협업",        color: "var(--cat-tech)", topics: [] },
      it:   { label: "IT",   desc: "업계 트렌드, 제품, 시장", color: "var(--cat-tech)", topics: [] },
    },
  },
  review: {
    label: "Review",
    color: "var(--cat-review)",
    subs: {
      book:   { label: "Book",   desc: "독서 노트",  color: "var(--cat-review)", topics: [] },
      cinema: { label: "Cinema", desc: "영화 감상",  color: "var(--cat-review)", topics: [] },
    },
  },
  fiction: {
    label: "Fiction",
    color: "var(--cat-fiction)",
    subs: {
      novel: { label: "Novel", desc: "장편소설", color: "var(--cat-fiction)", topics: [] },
      tales: { label: "Tales", desc: "단편소설", color: "var(--cat-fiction)", topics: [] },
    },
  },
};

export function parseCategory(key: string): { parent: string; sub: string } {
  const [parent, sub] = key.split("-");
  return { parent, sub };
}

export function getCategoryMeta(key: string): CategoryMeta | undefined {
  const { parent, sub } = parseCategory(key);
  return PARENTS[parent]?.subs[sub];
}

export function getParentMeta(key: string): ParentMeta | undefined {
  const { parent } = parseCategory(key);
  return PARENTS[parent];
}

export function allCategories(): [string, CategoryMeta][] {
  return Object.entries(PARENTS).flatMap(([parentKey, pm]) =>
    Object.entries(pm.subs).map(([subKey, sm]) => [`${parentKey}-${subKey}`, sm] as [string, CategoryMeta])
  );
}
```

**Step 2: `getPath.ts` 수정**

```typescript
import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import { parseCategory } from "./getCategories";

type Entry = CollectionEntry<"posts">;

export function getPath(entry: Entry): string {
  const basename = entry.id.split("/").pop() ?? entry.id;
  const slug = slugifyStr(basename);
  const { parent, sub } = parseCategory(entry.data.category);
  return `/${parent}/${sub}/${slug}/`;
}
```

**Step 3: 빌드 확인 (타입 에러 파악용)**

```bash
pnpm run build 2>&1 | grep "error" | head -30
```

---

## Task 2: content schema 업데이트

**Files:**
- Modify: `src/content.config.ts`

**Step 1: category enum 변경**

```typescript
category: z.enum([
  "essay-thought",
  "essay-journal",
  "tech-dev",
  "tech-work",
  "tech-it",
  "review-book",
  "review-cinema",
  "fiction-novel",
  "fiction-tales",
]),
```

**Step 2: `books` collection 제거 (모든 콘텐츠를 posts로 통합)**

`books` defineCollection 블록 전체 삭제, `export const collections = { posts }` 로 변경.

> **주의:** 현재 book 카테고리 글들은 이미 `src/data/posts/`에 있으므로 파일 이동 불필요. `src/data/books/` 디렉토리가 비어있음을 먼저 확인.

**Step 3: 빌드 확인**

```bash
pnpm run build 2>&1 | grep "error" | head -30
```

---

## Task 3: 기존 포스트 frontmatter 일괄 수정

**Files:**
- Modify: `src/data/posts/*.md` (마이그레이션 테이블 기준)

**Step 1: 스크립트로 일괄 치환**

```bash
# thought → essay-thought (4개)
for f in src/data/posts/20260514-2114.md src/data/posts/20260514-2115.md src/data/posts/20260515-1013.md src/data/posts/20260517-1337.md; do
  sed -i '' 's/^category: thought$/category: essay-thought/' "$f"
done

# thought → essay-journal (2개)
for f in src/data/posts/20210817-1336.md src/data/posts/20220130-1335.md; do
  sed -i '' 's/^category: thought$/category: essay-journal/' "$f"
done

# tech → tech-work (3개)
for f in src/data/posts/20260315-1014.md src/data/posts/20260915-1014.md src/data/posts/20260515-1013-3.md; do
  sed -i '' 's/^category: tech$/category: tech-work/' "$f"
done

# tech → tech-it (3개)
for f in src/data/posts/20260513-1350.md src/data/posts/20260514-1200.md src/data/posts/20260515-1013-2.md; do
  sed -i '' 's/^category: tech$/category: tech-it/' "$f"
done

# writing → fiction-tales (1개)
sed -i '' 's/^category: writing$/category: fiction-tales/' src/data/posts/20260513-2148.md

# book → review-cinema (1개)
sed -i '' 's/^category: book$/category: review-cinema/' src/data/posts/20260514-1547.md

# 나머지 book → review-book
for f in src/data/posts/*.md; do
  sed -i '' 's/^category: book$/category: review-book/' "$f"
done
```

**Step 2: 검증 — 구 카테고리가 남아있지 않은지 확인**

```bash
grep -rn "^category: thought\|^category: writing\|^category: tech\b\|^category: book" src/data/posts/
```
Expected: 출력 없음

**Step 3: 빌드 확인**

```bash
pnpm run build 2>&1 | grep "error" | head -20
```

**Step 4: Commit**

```bash
git add src/data/posts/
git commit -m "content: migrate all posts to new category structure"
```

---

## Task 4: 라우팅 페이지 재편

**Files:**
- Delete: `src/pages/thoughts/`, `src/pages/writing/`, `src/pages/tech/`, `src/pages/books/`
- Create: `src/pages/[parent]/[sub]/index.astro`
- Create: `src/pages/[parent]/[sub]/[slug].astro`

**Step 1: 기존 카테고리 페이지 삭제**

```bash
rm -rf src/pages/thoughts src/pages/writing src/pages/tech src/pages/books
```

**Step 2: `src/pages/[parent]/[sub]/index.astro` 생성**

```astro
---
import { getCollection } from "astro:content";
import BlogShell from "@/layouts/BlogShell.astro";
import getSortedPosts from "@/utils/getSortedPosts";
import { getCategoryMeta, PARENTS } from "@/utils/getCategories";

export async function getStaticPaths() {
  return Object.entries(PARENTS).flatMap(([parent, pm]) =>
    Object.keys(pm.subs).map(sub => ({ params: { parent, sub } }))
  );
}

const { parent, sub } = Astro.params;
const catKey = `${parent}-${sub}`;
const meta = getCategoryMeta(catKey)!;

const all = await getCollection("posts", ({ data }) => data.category === catKey && !data.draft);
const posts = getSortedPosts(all);
---

<BlogShell mode="discovery" rail="category" activeCategory={catKey} title={meta.label}>
  <header class="mb-6">
    <div class="flex items-center gap-2 mb-1">
      <span class="cat-dot" style={`background:${meta.color}`} />
      <p class="bd-overline">Category</p>
    </div>
    <h1 class="text-[28px] font-bold tracking-[-0.02em]">{meta.label}</h1>
    <p class="mt-1 text-[15px]" style="color: var(--fg-mute);">{meta.desc}</p>
  </header>

  {posts.length > 0 ? (
    <section>
      <ul id="post-list" class="divide-y divide-border">
        {posts.map(({ data, id }) => (
          <li>
            <a
              href={`/${parent}/${sub}/${id.split("/").pop()}`}
              class="group post-grid py-4 transition-colors duration-150 hover:text-accent"
            >
              <span class="text-xs text-foreground/40 tabular-nums self-center whitespace-nowrap">
                {new Date(data.pubDatetime).toLocaleDateString("ko-KR", {
                  year: "numeric", month: "2-digit", day: "2-digit",
                })}
              </span>
              <span class="font-medium truncate self-center transition-transform duration-150 group-hover:translate-x-1">
                {data.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  ) : (
    <p class="pt-12 text-sm text-foreground/40 text-center">아직 글이 없습니다.</p>
  )}
</BlogShell>
```

**Step 3: `src/pages/[parent]/[sub]/[slug].astro` 생성**

```astro
---
import { type CollectionEntry, getCollection } from "astro:content";
import PostDetails from "@/layouts/PostDetails.astro";
import getSortedPosts from "@/utils/getSortedPosts";
import { slugifyStr } from "@/utils/slugify";
import { PARENTS } from "@/utils/getCategories";

export async function getStaticPaths() {
  const allPaths = [];
  for (const [parent, pm] of Object.entries(PARENTS)) {
    for (const sub of Object.keys(pm.subs)) {
      const catKey = `${parent}-${sub}`;
      const posts = await getCollection(
        "posts",
        ({ data }) => data.category === catKey && !data.draft
      );
      for (const post of posts) {
        allPaths.push({
          params: {
            parent,
            sub,
            slug: slugifyStr(post.id.split("/").pop() ?? post.id),
          },
          props: { post },
        });
      }
    }
  }
  return allPaths;
}

type Props = { post: CollectionEntry<"posts"> };
const { post } = Astro.props;
const catKey = post.data.category;

const all = await getCollection("posts", ({ data }) => data.category === catKey);
const sortedPosts = getSortedPosts(all);
---

<PostDetails post={post} posts={sortedPosts} />
```

**Step 4: 빌드 확인**

```bash
pnpm run build 2>&1 | grep "error" | head -20
```

**Step 5: Commit**

```bash
git add src/pages/
git commit -m "feat: migrate routing to parent/sub/slug structure"
```

---

## Task 5: Sidebar / RightRail / 기타 컴포넌트 수정

**Files:**
- Modify: `src/components/Sidebar.astro`
- Modify: `src/components/RightRail.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/archives/index.astro`
- Modify: `src/layouts/PostDetails.astro`

**Step 1: Sidebar.astro — catPath 로직 수정**

기존:
```typescript
const catPath = key === "thought" ? "/thoughts" : key === "book" ? "/books" : `/${key}`;
```
변경 (parseCategory 활용):
```typescript
import { parseCategory } from "@/utils/getCategories";
// ...
const { parent, sub } = parseCategory(key);
const catPath = `/${parent}/${sub}`;
```

**Step 2: RightRail.astro — catUrl 함수 수정**

기존:
```typescript
if (key === "thought") return "/thoughts";
if (key === "book") return "/books";
```
변경:
```typescript
import { parseCategory } from "@/utils/getCategories";
function catUrl(key: string) {
  const { parent, sub } = parseCategory(key);
  return `/${parent}/${sub}`;
}
```
그리고 post URL 생성 부분도 `getPath` 유틸 활용하도록 통일.

**Step 3: index.astro — CATEGORY_LABEL 및 필터 업데이트**

```typescript
import { PARENTS, allCategories } from "@/utils/getCategories";
// CATEGORY_LABEL을 allCategories()로 대체
// 필터 버튼 렌더링을 PARENTS 기준 상위 카테고리로 그룹화
```

**Step 4: archives/index.astro — categoryLabel 업데이트**

동일하게 `allCategories()`로 대체.

**Step 5: global.css — CSS 변수 추가**

`src/styles/global.css`에서 기존 `--cat-thought`, `--cat-writing`, `--cat-tech`, `--cat-book` 을 새 이름으로 추가/교체:
```css
--cat-essay:   /* 기존 --cat-thought 값 */;
--cat-tech:    /* 유지 */;
--cat-review:  /* 기존 --cat-book 값 */;
--cat-fiction: /* 기존 --cat-writing 값 */;
```

**Step 6: 빌드 + 개발서버 확인**

```bash
pnpm run build 2>&1 | grep "error"
pnpm run dev
```

**Step 7: Commit**

```bash
git add src/components/ src/pages/index.astro src/pages/archives/ src/layouts/ src/styles/
git commit -m "feat: update nav components for new category structure"
```

---

## Task 6: sync 스크립트 업데이트

**Files:**
- Modify: `scripts/config.ts`
- Modify: `scripts/sync.ts`
- Modify: `scripts/lib/normalize.ts`

**Step 1: `config.ts` — POST_SOURCES 및 PostCategory 재정의**

```typescript
const PUBLIC_BASE = "020.Area/022.Writing/022-1.Public";

export const POST_SOURCES = {
  "essay-thought": path.join(PUBLIC_BASE, "Essay/Thought"),
  "essay-journal": path.join(PUBLIC_BASE, "Essay/Journal"),
  "tech-dev":      path.join(PUBLIC_BASE, "Tech/Dev"),
  "tech-work":     path.join(PUBLIC_BASE, "Tech/Work"),
  "tech-it":       path.join(PUBLIC_BASE, "Tech/IT"),
  "review-book":   path.join(PUBLIC_BASE, "Review/Book"),
  "review-cinema": path.join(PUBLIC_BASE, "Review/Cinema"),
  "fiction-novel": path.join(PUBLIC_BASE, "Fiction/Novel"),
  "fiction-tales": path.join(PUBLIC_BASE, "Fiction/Tales"),
} as const;

// BOOKS_SOURCE 제거 (review-book으로 통합)
export type PostCategory = keyof typeof POST_SOURCES;
```

**Step 2: `sync.ts` — CATEGORY_TO_SEGMENT 및 books 관련 코드 제거**

```typescript
// CATEGORY_TO_SEGMENT 변경
const CATEGORY_TO_SEGMENT: Record<PostCategory, string> = {
  "essay-thought": "essay/thought",
  "essay-journal": "essay/journal",
  "tech-dev":      "tech/dev",
  "tech-work":     "tech/work",
  "tech-it":       "tech/it",
  "review-book":   "review/book",
  "review-cinema": "review/cinema",
  "fiction-novel": "fiction/novel",
  "fiction-tales": "fiction/tales",
};
```
- `discoverBooks` 호출 및 books 관련 로직 제거
- URL 생성: `/${CATEGORY_TO_SEGMENT[post.category]}/${slug}/`

**Step 3: `normalize.ts` — book 타입 제거, PostCategory 통합**

기존 `normalizeBookFrontmatter` 함수 및 `category: "book"` 하드코딩 제거. 모든 콘텐츠를 `normalizePostFrontmatter`로 처리.

**Step 4: dry-run 테스트**

```bash
pnpm run sync
```
Expected: 오류 없이 dry-run 완료

**Step 5: Commit**

```bash
git add scripts/
git commit -m "feat: update sync script for new category structure"
```

---

## Task 7: Obsidian 볼트 폴더 재편

> **주의:** 이 작업은 파일 이동이므로 Obsidian을 닫고 진행하거나, 이동 후 Obsidian에서 vault reload.

**Step 1: 새 폴더 생성**

```bash
VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/jacobsidian"
PUBLIC="$VAULT/020.Area/022.Writing/022-1.Public"

mkdir -p "$PUBLIC/Essay/Thought"
mkdir -p "$PUBLIC/Essay/Journal"
mkdir -p "$PUBLIC/Tech/Dev"
mkdir -p "$PUBLIC/Tech/Work"
mkdir -p "$PUBLIC/Tech/IT"
mkdir -p "$PUBLIC/Review/Book"
mkdir -p "$PUBLIC/Review/Cinema"
mkdir -p "$PUBLIC/Fiction/Novel"
mkdir -p "$PUBLIC/Fiction/Tales"
```

**Step 2: 기존 파일 이동**

```bash
# Thought (022-1-1.생각 → Essay/Thought)
mv "$PUBLIC/022-1-1.생각/"* "$PUBLIC/Essay/Thought/" 2>/dev/null || true

# Writing (022-1-2.글쓰기 → Fiction/Tales, 단 엄마 풀 등 단편)
mv "$PUBLIC/022-1-2.글쓰기/"*.md "$PUBLIC/Fiction/Tales/" 2>/dev/null || true

# IT (022-1-3.IT → Tech/ 하위 분산)
# work 파일들
mv "$PUBLIC/022-1-3.IT/효율적인 회의를 위한 속성 정의.md" "$PUBLIC/Tech/Work/"
mv "$PUBLIC/022-1-3.IT/이슈 분석 프로세스.md" "$PUBLIC/Tech/Work/"
mv "$PUBLIC/022-1-3.IT/서비스 작명에 대한 고찰.md" "$PUBLIC/Tech/Work/"
# it 파일들
mv "$PUBLIC/022-1-3.IT/왜 AI 시대의 협업 도구는 코드 기반이어야 하는가.md" "$PUBLIC/Tech/IT/"
mv "$PUBLIC/022-1-3.IT/갤럭시워치 톺아보기.md" "$PUBLIC/Tech/IT/"
mv "$PUBLIC/022-1-3.IT/NFT 이야기.md" "$PUBLIC/Tech/IT/"

# Books (022-1-4.책 → Review/Book, 알라딘만 Cinema)
mv "$PUBLIC/022-1-4.책/다시 보는 알라딘.md" "$PUBLIC/Review/Cinema/"
mv "$PUBLIC/022-1-4.책/"*.md "$PUBLIC/Review/Book/" 2>/dev/null || true

# Public 바로 아래 중복 파일들 정리 (이미 022-1-3.IT에 있는 사본)
# 내용 확인 후 수동 삭제 필요
```

**Step 3: 남은 파일 수동 확인**

```bash
ls "$PUBLIC/"*.md 2>/dev/null
ls "$PUBLIC/022-1-1.생각/" 2>/dev/null
ls "$PUBLIC/022-1-2.글쓰기/" 2>/dev/null
ls "$PUBLIC/022-1-3.IT/" 2>/dev/null
ls "$PUBLIC/022-1-4.책/" 2>/dev/null
```

모두 비어있으면 구 폴더 삭제:
```bash
rmdir "$PUBLIC/022-1-1.생각" "$PUBLIC/022-1-2.글쓰기" "$PUBLIC/022-1-3.IT" "$PUBLIC/022-1-4.책" 2>/dev/null || true
```

**Step 4: sync dry-run 재확인**

```bash
pnpm run sync
```

---

## Task 8: Obsidian Templater 템플릿 업데이트

**Files (볼트):**
- Modify: `030.Resource/033.Template/post-thought.md` → `post-essay-thought.md`
- Modify: `030.Resource/033.Template/post-it.md` → `post-tech-it.md`
- Modify: `030.Resource/033.Template/post-writing.md` → `post-fiction-tales.md`
- Create: `030.Resource/033.Template/post-essay-journal.md`
- Create: `030.Resource/033.Template/post-tech-dev.md`
- Create: `030.Resource/033.Template/post-tech-work.md`
- Create: `030.Resource/033.Template/post-review-book.md`
- Create: `030.Resource/033.Template/post-review-cinema.md`
- Create: `030.Resource/033.Template/post-fiction-novel.md`

**Step 1: 각 템플릿 category 값 업데이트**

기존 `post-thought.md` 패턴:
```yaml
category: thought
```
→ 각 템플릿마다 해당 category 값으로 교체. 예시 `post-essay-thought.md`:
```yaml
---
type: post
category: essay-thought
title: "<% tp.file.title %>"
slug: <% tp.date.now("YYYYMMDD-HHmm") %>
status: draft
created: <% tp.date.now("YYYY-MM-DD") %>
published_at:
tags: []
---
```

**Step 2: 기존 템플릿 파일명 변경 + 구 파일 삭제**

Obsidian 파일 탐색기에서 직접 rename 또는:
```bash
TMPL="$VAULT/030.Resource/033.Template"
mv "$TMPL/post-thought.md" "$TMPL/post-essay-thought.md"
mv "$TMPL/post-it.md" "$TMPL/post-tech-it.md"
mv "$TMPL/post-writing.md" "$TMPL/post-fiction-tales.md"
```

**Step 3: Obsidian에서 Templater 폴더 설정 확인**

Obsidian → Settings → Templater → Template folder location이 `030.Resource/033.Template`인지 확인.

---

## Task 9: 최종 검증 및 커밋

**Step 1: 전체 빌드**

```bash
pnpm run build
```
Expected: 오류 없이 완료

**Step 2: 테스트**

```bash
pnpm run test
```

**Step 3: 개발서버 smoke test**

```bash
pnpm run dev
```
체크리스트:
- [ ] 홈(`/`) — 카테고리 필터 정상
- [ ] `/essay/thought` — 글 목록 표시
- [ ] `/tech/it/20260513-1350` — 포스트 상세 접근
- [ ] `/review/book/20260513-1439` — 독서 노트 접근
- [ ] `/review/cinema/20260514-1547` — 알라딘 감상 접근
- [ ] `/fiction/tales/20260513-2148` — 엄마 풀 접근
- [ ] 사이드바 카테고리 링크 정상

**Step 4: 최종 커밋**

```bash
git add -A
git commit -m "feat: complete category restructure to 2-tier parent/sub system"
```
