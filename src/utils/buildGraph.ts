export interface GraphNode {
  id: string;
  title: string;
  url: string;
  type: "post" | "book" | "tag";
  tags: string[];
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
}

export function buildGraphData(items: InputNode[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const tagNodes = new Map<string, GraphNode>();
  const slugToId = new Map<string, string>();

  for (const item of items) {
    nodes.push({ id: item.id, title: item.title, url: item.url, type: item.type, tags: item.tags });
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

  const tagToItems = new Map<string, string[]>();
  for (const item of items) {
    for (const tag of item.tags) {
      if (!tagToItems.has(tag)) tagToItems.set(tag, []);
      tagToItems.get(tag)!.push(item.id);
    }
  }
  for (const [, ids] of tagToItems) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        edges.push({ source: ids[i], target: ids[j], type: "tag" });
      }
    }
  }

  return { nodes, edges };
}
