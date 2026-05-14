# jacobsidian-blog

Jacob의 개인 블로그 — Astro + Obsidian 연동 기반의 정적 사이트입니다.

## 스택

- **Astro** v5 — 정적 사이트 생성
- **Tailwind CSS** v4 — 스타일링
- **Pagefind** — 정적 사이트 검색
- **Vitest** — 단위 테스트 (sync 스크립트)
- **pnpm** — 패키지 매니저

## 시작하기

```bash
pnpm install
pnpm run dev        # http://localhost:4321
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm run dev` | 개발 서버 시작 |
| `pnpm run build` | 프로덕션 빌드 (`dist/`) |
| `pnpm run preview` | 빌드 결과 미리보기 |
| `pnpm run lint` | ESLint 검사 |
| `pnpm run format` | Prettier 포맷 |
| `pnpm run test` | 단위 테스트 실행 |
| `pnpm run sync` | Obsidian 볼트 동기화 (dry-run) |
| `pnpm run sync:apply` | Obsidian 볼트 동기화 적용 |

## 콘텐츠 작성

포스트는 `src/data/posts/`, 북노트는 `src/data/books/`에 Markdown으로 작성합니다.

필수 frontmatter:

```yaml
---
title: '제목'
category: tech          # thought | writing | tech
pubDatetime: '2026-05-13T00:00:00.000Z'
description: '한 줄 요약'
---
```

## 프로젝트 구조

```
src/
├── components/     # .astro 컴포넌트
├── data/
│   ├── posts/      # 블로그 포스트 (.md)
│   └── books/      # 북노트 (.md)
├── layouts/        # 페이지 레이아웃
├── pages/          # 파일 기반 라우팅
├── scripts/        # Obsidian 동기화 스크립트
├── styles/         # global.css, typography.css
├── utils/          # 공통 헬퍼 함수
├── config.ts       # 사이트 설정 (제목, 저자 등)
└── content.config.ts  # 콘텐츠 컬렉션 스키마
```

## Obsidian 연동

`scripts/sync.ts`를 통해 Obsidian 볼트에서 콘텐츠를 가져옵니다.

```bash
pnpm run sync        # 변경사항 확인 (dry-run)
pnpm run sync:apply  # 실제 적용
pnpm run vault:push  # 동기화 + 커밋 + 푸시
```

## 라이선스

MIT
