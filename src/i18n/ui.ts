export const languages = {
  ko: "한국어",
  en: "English",
} as const;

export type Lang = keyof typeof languages;

export const ui = {
  ko: {
    "nav.search": "Jacob's second brain 탐색…",
    "nav.searchLabel": "검색",
    "nav.about": "About",
    "nav.langToggle": "EN",
    "footer.rights": "All rights reserved.",
    "post.readMore": "더 보기",
    "post.backToList": "목록으로",
    "404.title": "페이지를 찾을 수 없습니다",
    "404.desc": "존재하지 않는 페이지입니다.",
  },
  en: {
    "nav.search": "Wander Jacob's second brain…",
    "nav.searchLabel": "Search",
    "nav.about": "About",
    "nav.langToggle": "KR",
    "footer.rights": "All rights reserved.",
    "post.readMore": "Read more",
    "post.backToList": "Back to list",
    "404.title": "Page not found",
    "404.desc": "This page does not exist.",
  },
} as const;
