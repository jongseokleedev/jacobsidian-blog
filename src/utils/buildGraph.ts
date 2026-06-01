export interface GraphNode {
  id: string;
  title: string;
  url: string;
  type: "post" | "book" | "tag" | "series";
  category?: string;
  tags: string[];
  pubDatetime?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "wikilink" | "tag" | "series";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface InputNode {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  links: string[];
  url: string;
  type: "post" | "book";
  category?: string;
  pubDatetime?: string;
  series?: string;
  seriesSlug?: string;
}

export function buildGraphData(items: InputNode[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const tagNodes = new Map<string, GraphNode>();
  const seriesNodes = new Map<string, GraphNode>();
  const slugToId = new Map<string, string>();

  for (const item of items) {
    nodes.push({ id: item.id, title: item.title, url: item.url, type: item.type, category: item.category, tags: item.tags, pubDatetime: item.pubDatetime });
    slugToId.set(item.slug, item.id);
    slugToId.set(item.title, item.id);
    slugToId.set(item.id, item.id);

    for (const tag of item.tags) {
      // 시리즈 이름 태그는 태그 노드 대신 시리즈 허브 노드로 처리
      if (item.series && tag === item.series) continue;
      if (!tagNodes.has(tag)) {
        tagNodes.set(tag, { id: `tag:${tag}`, title: tag, url: `/tags/${tag}`, type: "tag", tags: [] });
      }
    }

    if (item.series && !seriesNodes.has(item.series)) {
      const seriesUrl = item.seriesSlug ? `/series/${item.seriesSlug}` : `/series/${item.series.replace(/\s+/g, "-").toLowerCase()}`;
      seriesNodes.set(item.series, {
        id: `series:${item.series}`,
        title: item.series,
        url: seriesUrl,
        type: "series",
        category: item.category,
        tags: [],
      });
    }
  }

  for (const [, tagNode] of tagNodes) nodes.push(tagNode);
  for (const [, seriesNode] of seriesNodes) nodes.push(seriesNode);

  for (const item of items) {
    for (const link of item.links) {
      const targetId = slugToId.get(link);
      if (targetId && targetId !== item.id) {
        edges.push({ source: item.id, target: targetId, type: "wikilink" });
      }
    }
  }

  for (const item of items) {
    for (const tag of item.tags) {
      if (item.series && tag === item.series) continue;
      edges.push({ source: item.id, target: `tag:${tag}`, type: "tag" });
    }
    if (item.series) {
      edges.push({ source: item.id, target: `series:${item.series}`, type: "series" });
    }
  }

  return { nodes, edges };
}
