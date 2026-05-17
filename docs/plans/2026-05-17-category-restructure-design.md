# Category Restructure Design

**Date:** 2026-05-17

## Goal

기존 4개 flat 카테고리(thought, writing, tech, book)를 상위/하위 2계층 구조로 재편한다. 콘텐츠 성격에 맞는 분류 체계를 갖추고, 블로그 코드·Obsidian 볼트·sync 스크립트·Templater 템플릿까지 일관되게 반영한다.

---

## Category Structure

```
Essay
  └─ Thought    생각, 단상, 에세이
  └─ Journal    일상, 여행, 회고

Tech
  └─ Dev        개발 기술, 코드
  └─ Work       방법론, 팀, 협업, 회고
  └─ IT         업계 트렌드, 제품, 시장

Review
  └─ Book       독서 노트
  └─ Cinema     영화 감상

Fiction
  └─ Novel      장편소설
  └─ Tales      단편소설
```

---

## Content Migration Map

### Essay/Thought
- AI와 질문, 그리고 사랑 (`20260514-2114`)
- 그럴 수도 있지 (`20260514-2115`)
- 스타트업의 시간은 빠르게 흐른다 (`20260515-1013`)
- 1년 간의 공백 (`20260517-1337`)
- 책과 글쓰기 *(볼트에만 있음)*

### Essay/Journal
- Untitled × 2 (`20210817-1336`, `20220130-1335`) *(제목 재지정 필요)*
- 반려견을 떠나보내며 *(볼트에만 있음)*

### Tech/Work
- 효율적인 회의를 위한 속성 정의 (`20260315-1014`)
- 이슈 분석 프로세스 (`20260915-1014`)
- 서비스 작명에 대한 고찰 (`20260515-1013-3`)

### Tech/IT
- 왜 AI 시대의 협업 도구는 코드 기반이어야 하는가 (`20260513-1350`)
- 갤럭시워치 톺아보기 (`20260514-1200`)
- NFT 이야기 (`20260515-1013-2`)

### Tech/Dev
- *(현재 없음)*

### Review/Book
- 기존 `book` 카테고리 전체 (19편, 알라딘 제외)

### Review/Cinema
- 다시 보는 알라딘 (`20260514-1547`)

### Fiction/Tales
- 엄마 풀 (`20260513-2148`)

---

## Affected Systems

### 1. Blog Code
- `src/content.config.ts` — category enum 변경 (`thought | writing | tech | book` → `essay-thought | essay-journal | tech-dev | tech-work | tech-it | review-book | review-cinema | fiction-novel | fiction-tales` 또는 상위/하위 필드 분리)
- `src/pages/` — 상위/하위 카테고리 라우팅 추가
- 내비게이션 컴포넌트 — 2계층 메뉴 반영
- `src/utils/getPath.ts` 등 URL 생성 유틸 업데이트

### 2. Obsidian Vault
볼트 `022-1.Public` 하위 폴더 재편:
```
기존                          →  변경
022-1-1.생각/                 →  Essay/Thought/
022-1-2.글쓰기/               →  Essay/Journal/ + Fiction/Tales/ + Fiction/Novel/
022-1-3.IT/                   →  Tech/Dev/ + Tech/Work/ + Tech/IT/
022-1-4.책/                   →  Review/Book/ + Review/Cinema/
```

### 3. scripts/config.ts
`POST_SOURCES` 매핑을 새 폴더 구조에 맞게 전면 업데이트.

### 4. Obsidian Templater Templates
새 글 작성 시 카테고리/폴더가 자동 반영되도록 템플릿 수정.

---

## URL Strategy

기존 URL redirect 없이 새 구조로 전환한다.
URL 형태는 구현 시 결정 (예: `/essay/thought/slug` 또는 `/thought/slug`).

---

## Out of Scope

- 콘텐츠 내용 수정
- 디자인 변경 (내비게이션 UI는 기존 틀 활용)
- Untitled 글 제목 재지정 (사용자가 직접 처리)
