# jacobsidian 디자인 아이덴티티

**방향:** Quiet Craft — 미니멀하되 마이크로인터랙션에서 공들인 티가 나는 블로그

레퍼런스: paco.me (미니멀, hover 애니메이션) + joshwcomeau.com ("만들어진 느낌")

---

## 1. Color & Theme

시스템 다크/라이트 모드 모두 공들여 지원.

### Light mode
| 역할 | 값 |
|------|----|
| Background | `#f8f8f7` |
| Foreground | `#1a1918` |
| Accent | `#3d5a99` |
| Muted | `#e8e6e3` |
| Border | `#d4d0cb` |

### Dark mode
| 역할 | 값 |
|------|----|
| Background | `#141414` |
| Foreground | `#e8e6e3` |
| Accent | `#7aa2d4` |
| Muted | `#242424` |
| Border | `#2e2e2e` |

강조색은 인디고 계열 하나로 통일 — 링크, hover underline, 태그, 코드 강조 모두 이 색 계열 사용.

---

## 2. Typography

**폰트:** Pretendard Variable (jsdelivr CDN)  
**코드 폰트:** JetBrains Mono

| 용도 | 크기 | 굵기 |
|------|------|------|
| 본문 | 16px / line-height 1.75 | 400 |
| 포스트 제목 (h1) | 28px mobile / 36px desktop | 700 |
| 섹션 제목 (h2) | 20px | 600 |
| 소제목 (h3) | 17px | 600 (italic 제거) |
| 카드 제목 | 15px | 500 |
| 날짜/메타 | 13px | 400, muted색 |
| 코드 | 14px | 400 |

- 제목 `letter-spacing: -0.02em`
- 단락 간격 `margin-bottom: 1.5em`

---

## 3. Layout & Navigation

**콘텐츠 최대 너비:** 680px, 중앙 정렬

### 반응형
| 브레이크포인트 | 처리 |
|--------------|------|
| mobile `< 640px` | 햄버거 메뉴 또는 하단 탭바 |
| tablet `640–1024px` | 너비 100%, 패딩 24px |
| desktop `> 1024px` | 최대 680px 중앙 정렬 |

### Header
- 로고: `jacobsidian` 텍스트 (Pretendard 600)
- Nav: `Thoughts · Writing · Tech · Books · About`
- Active: solid underline 2px accent색 (현재 wavy 제거)
- 우측: 다크/라이트 토글 아이콘

### Footer
- `© 2025 Jacob Lee · RSS` 한 줄

---

## 4. 콘텐츠 구조 (카테고리)

| Nav 표시 | frontmatter category | 내용 |
|---------|---------------------|------|
| Thoughts | `thought` | 에세이, 생각 |
| Writing | `writing` | 소설 |
| Tech | `tech` (현재 `it` → rename) | 개발 |
| Books | books 컬렉션 별도 | 독후감 |
| About | 정적 페이지 | 짧은 자기소개 |

---

## 5. 홈 페이지

```
[Hero]
  Jacob Lee
  글, 소설, 개발 기록.

[Recent posts — 날짜 + 제목 + 카테고리 리스트]
  2025.05.10   어떤 제목                    Thoughts
  2025.04.28   또 다른 제목                  Tech
  ...
  → 모든 글 보기

[Footer]
```

소개는 최소화. About 페이지에서 2–3문장 자기소개.

---

## 6. Books 페이지

- 커버 이미지 그리드
- 표지 썸네일 + 책 제목 + 저자
- 읽기 상태 표시 없음 (발행된 것 = 이미 읽은 것)

---

## 7. 마이크로인터랙션

| 요소 | 인터랙션 |
|------|---------|
| 글 리스트 hover | 제목 4px 오른쪽 이동 + accent 색 전환 (150ms ease) |
| 날짜 | 평소 muted, hover 시 fade-in으로 진해짐 |
| 카테고리 배지 | hover 시 배경색 살짝 채워짐 |
| Books 카드 hover | scale(1.03) + 그림자 등장 |
| 링크 underline | 좌→우로 자라는 애니메이션 (clip-path) |
| 페이지 전환 | Astro View Transitions fade |
