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
      thought: { label: "Thought", desc: "생각의 조각들", color: "var(--cat-essay)", topics: [] },
      journal: { label: "Journal", desc: "일상의 기록", color: "var(--cat-essay)", topics: [] },
    },
  },
  tech: {
    label: "Tech",
    color: "var(--cat-tech)",
    subs: {
      dev: { label: "Dev", desc: "Keep Building Something", color: "var(--cat-tech)", topics: [] },
      work: { label: "Work", desc: "어떻게 일할 것인가", color: "var(--cat-tech)", topics: [] },
      it: { label: "IT", desc: "IT 업계 이모저모", color: "var(--cat-tech)", topics: [] },
    },
  },
  review: {
    label: "Review",
    color: "var(--cat-review)",
    subs: {
      book: { label: "Book", desc: "읽고 남은 것들", color: "var(--cat-review)", topics: [] },
      cinema: { label: "Cinema", desc: "본 영화에 대하여", color: "var(--cat-review)", topics: [] },
    },
  },
  fiction: {
    label: "Fiction",
    color: "var(--cat-fiction)",
    subs: {
      novel: { label: "Novel", desc: "언젠가 완성될 소설", color: "var(--cat-fiction)", topics: [] },
      tales: { label: "Tales", desc: "짧은 이야기", color: "var(--cat-fiction)", topics: [] },
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


