/* Mock data — based on real posts from the blog */
window.BLOG_DATA = {
  posts: [
    { date: "2026.05.15", title: "스타트업의 시간은 빠르게 흐른다", category: "thought", label: "Thoughts" },
    { date: "2026.05.15", title: "AI 시대, 우리 팀은 왜 피그마를 떠났나", category: "tech", label: "Tech" },
    { date: "2026.05.15", title: "노트가 모이면 무엇이 되는가", category: "thought", label: "Thoughts" },
    { date: "2026.05.14", title: "엄마 풀", category: "writing", label: "Writing" },
    { date: "2026.05.14", title: "실패를 통과하는 일", category: "book", label: "Books" },
    { date: "2026.05.14", title: "일의 감각", category: "book", label: "Books" },
    { date: "2026.05.14", title: "Astro 5와 Tailwind v4 도입기", category: "tech", label: "Tech" },
    { date: "2026.05.13", title: "비 오는 도시", category: "writing", label: "Writing" },
    { date: "2026.05.13", title: "그래프 뷰 만들기 — D3와 Canvas", category: "tech", label: "Tech" },
    { date: "2026.05.12", title: "개발자의 글쓰기", category: "thought", label: "Thoughts" },
    { date: "2026.05.11", title: "오블완 챌린지 회고", category: "thought", label: "Thoughts" },
    { date: "2026.05.10", title: "달과 6펜스", category: "book", label: "Books" },
  ],
  counts: { all: 25, thought: 8, writing: 4, tech: 6, book: 7 },
  filters: [
    { key: "all", label: "All" },
    { key: "thought", label: "Thoughts", desc: "일상 속의 공상과 단상" },
    { key: "writing", label: "Writing",  desc: "긴 호흡으로 다듬은 글" },
    { key: "tech",    label: "Tech",     desc: "개발과 도구에 대한 기록" },
    { key: "book",    label: "Books",    desc: "읽은 책들, 남은 생각들" },
  ],
  /* Future hierarchy mock — subtopics under each category.
     This is what the left rail can grow into. */
  hierarchy: {
    thought: [
      { key: "work",   label: "Work · 일",          count: 4 },
      { key: "life",   label: "Life · 일상",         count: 2 },
      { key: "memo",   label: "Memo · 짧은 단상",    count: 2 },
    ],
    writing: [
      { key: "fiction", label: "Fiction · 소설",     count: 2 },
      { key: "essay",   label: "Essay · 산문",       count: 2 },
    ],
    tech: [
      { key: "ai",     label: "AI",                  count: 2 },
      { key: "astro",  label: "Astro",               count: 2 },
      { key: "tools",  label: "Tools",               count: 2 },
    ],
    book: [
      { key: "2026",   label: "2026",                count: 4 },
      { key: "2025",   label: "2025",                count: 3 },
    ],
  },
  tags: [
    { name: "obsidian", count: 6 },
    { name: "글쓰기", count: 5 },
    { name: "개발", count: 8 },
    { name: "life", count: 4 },
    { name: "management", count: 3 },
    { name: "ai", count: 3 },
    { name: "astro", count: 2 },
    { name: "회고", count: 4 },
  ],
  currentPost: {
    title: "스타트업의 시간은 빠르게 흐른다",
    date: "2026.05.15",
    category: "thought",
    label: "Thoughts",
    readingTime: 4,
    description: "스타트업과 대기업의 시간이 어떻게 다르게 흐르는지에 대한 짧은 단상.",
    tags: ["obsidian", "회고", "management"],
    headings: [
      { id: "miller", text: "밀러 행성의 시간", level: 2 },
      { id: "onboarding", text: "압축된 온보딩", level: 2 },
      { id: "tempo", text: "프로젝트 템포", level: 2 },
      { id: "decision", text: "의사결정의 무게", level: 2 },
    ],
    body: [
      { type: "p", text: "스타트업을 다니면서 느낀 점을 한 줄 요약하면, '스타트업의 시간은 빠르게 흐른다.'라는 것이다. 영화 [[인터스텔라]]를 보면 밀러 행성이라는 곳이 나온다. 밀러 행성에서의 1시간은 다른 행성에서의 7년과 같다. 첫 일주일을 보내면서 마치 밀러 행성에 있는 것 같은 느낌이 들었다." },
      { type: "h2", id: "onboarding", text: "압축된 온보딩" },
      { type: "p", text: "이렇게 느낀 몇가지 지점들이 있는데, 첫 번째로는 입사 온보딩 기간이다. 내가 경험한 바로는 대기업에서는 신입사원 기준 약 2~3개월의 온보딩 기간을 갖는다. 이 시기는 OJT형식으로 업무를 Follow up하는 기간도 아니고, 오로지 기업에서 제공하는 교육 프로그램에 참여하는 기간이다." },
      { type: "p", text: "스타트업에서는 이 과정이 매우 압축적이었다. 이에 따른 장점은 불필요한 교육으로 낭비하는 기간이 적다는 것, 단점으로는 숨돌릴 틈도 없이 실무에 투입되어서 빠르게 적응해야 한다는 것이다." },
      { type: "h2", id: "tempo", text: "프로젝트 템포" },
      { type: "p", text: "다음으로는 프로젝트 진행 템포가 매우 빠르다는 것이다. 내가 몸담았었던 반도체 산업은 하드웨어라는 기술적 특성이 있다. 당시에 프로젝트 초기 설계부터 출시까지의 주기가 2년 정도 걸렸었다. 거기다가 대기업 프로세스를 지켜야해서 의사결정은 느리고 무거웠다." },
    ],
    related: [
      { title: "실패를 통과하는 일", kind: "book" },
      { title: "개발 7년차, 매니저 1년차", kind: "book" },
      { title: "일의 감각", kind: "book" },
    ],
    backlinks: [
      { title: "노트가 모이면 무엇이 되는가", kind: "thought" },
      { title: "개발자의 글쓰기", kind: "thought" },
    ],
  },
  books: [
    { title: "실패를 통과하는 일", author: "Lee" },
    { title: "일의 감각", author: "Cho" },
    { title: "달과 6펜스", author: "Maugham" },
    { title: "개발 7년차, 매니저 1년차", author: "Camille" },
    { title: "노이즈", author: "Kahneman" },
    { title: "디자인의 디자인", author: "Hara" },
  ],
};
