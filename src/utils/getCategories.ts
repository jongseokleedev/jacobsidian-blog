export type TopicMeta = { key: string; label: string };

export type CategoryMeta = {
  label: string;
  desc: string;
  color: string;
  topics: TopicMeta[];
};

export const CATEGORIES: Record<string, CategoryMeta> = {
  thought: {
    label: "Thoughts",
    desc: "일상 속의 공상과 단상",
    color: "var(--cat-thought)",
    topics: [
      { key: "work", label: "Work · 일" },
      { key: "life", label: "Life · 일상" },
      { key: "memo", label: "Memo · 짧은 단상" },
    ],
  },
  writing: {
    label: "Writing",
    desc: "에세이, 혹은 소설",
    color: "var(--cat-writing)",
    topics: [],
  },
  tech: {
    label: "Tech",
    desc: "개발자의 IT, 스타트업 이모저모",
    color: "var(--cat-tech)",
    topics: [],
  },
  book: {
    label: "Books",
    desc: "읽은 책들, 남은 생각들",
    color: "var(--cat-book)",
    topics: [],
  },
};

export const getCategoryMeta = (key: string): CategoryMeta | undefined =>
  CATEGORIES[key];

export const allCategories = (): [string, CategoryMeta][] =>
  Object.entries(CATEGORIES);
