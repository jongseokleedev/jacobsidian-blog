export interface GraphNode {
  id: string;
  title: string;
  url: string;
  type: "post" | "book" | "tag";
  category?: string;
  tags: string[];
  pubDatetime?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "wikilink" | "tag";
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
}

export function buildGraphData(items: InputNode[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const tagNodes = new Map<string, GraphNode>();
  const slugToId = new Map<string, string>();

  for (const item of items) {
    nodes.push({ id: item.id, title: item.title, url: item.url, type: item.type, category: item.category, tags: item.tags, pubDatetime: item.pubDatetime });
    slugToId.set(item.slug, item.id);
    slugToId.set(item.title, item.id);
    slugToId.set(item.id, item.id);

    for (const tag of item.tags) {
      if (!tagNodes.has(tag)) {
        tagNodes.set(tag, { id: `tag:${tag}`, title: tag, url: `/tags/${tag}`, type: "tag", tags: [] });
      }
    }
  }

  for (const [, tagNode] of tagNodes) nodes.push(tagNode);

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
      edges.push({ source: item.id, target: `tag:${tag}`, type: "tag" });
    }
  }

  return { nodes, edges };
}
