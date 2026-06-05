// Categories available in English. Controls /en/ page generation, sitemap, and list pages.
// Add a category here when you start translating it.
export const EN_CATEGORIES = new Set([
  "essay-thought",
  "essay-journal",
  "tech-dev",
  "tech-work",
  "tech-it",
] as const);

export const SITE = {
  website: "https://jacobsidian.com/",
  author: "Jacob",
  profile: "https://www.linkedin.com/in/jacob-baa05b2b0/",
  desc: "jacobsidian - 글쓰기를 좋아하는 어느 개발자의 기록 저장소",
  title: "jacobsidian",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "ko",
  timezone: "Asia/Seoul",
} as const;
