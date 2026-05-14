import type { LinkMap } from "./linkMap";

const OBSIDIAN_BLOCK_LANGS = ["meta-bind-button", "meta-bind", "dataviewjs", "dataview"];

export function stripObsidianBlocks(markdown: string): string {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*\`\`\`(?:${OBSIDIAN_BLOCK_LANGS.join("|")})\\b[\\s\\S]*?\\n\`\`\`[ \\t]*(?=\\n|$)`,
    "g"
  );

  return markdown
    .replace(pattern, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\s+$/, "\n")
    .replace(/^\n+/, "");
}

export function stripLeadingH1(markdown: string): string {
  return markdown.replace(/^#[ \t]+.+(\r?\n|$)/, "").replace(/^\n+/, "");
}

function slugifyAnchor(section: string): string {
  return section
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]/g, "");
}

const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"];
const IMAGE_EXT_RE = new RegExp(`\\.(?:${IMAGE_EXTS.join("|")})$`, "i");

export type ImageResolver = (filename: string) => string | null;

export function transformImageEmbeds(
  markdown: string,
  resolver: ImageResolver
): string {
  return markdown.replace(/!\[\[([^\[\]\n]+)\]\]/g, (match, inner: string) => {
    const [target, ...rest] = inner.split("|").map(s => s.trim());
    if (!IMAGE_EXT_RE.test(target)) return match;

    const url = resolver(target);
    if (!url) return match;

    const aliasRaw = rest.join("|").trim();
    const isSizeHint = /^\d+(?:x\d+)?$/i.test(aliasRaw);
    const altBase = target.replace(IMAGE_EXT_RE, "");
    const alt = aliasRaw && !isSizeHint ? aliasRaw : altBase;

    return `![${alt}](${url})`;
  });
}

export type NoteBodyResolver = (target: string) => string | null;

function extractSection(body: string, section: string): string | null {
  const lines = body.split("\n");
  const target = section.toLowerCase().trim();
  let startIdx = -1;
  let startLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m && m[2].toLowerCase().trim() === target) {
      startIdx = i + 1;
      startLevel = m[1].length;
      break;
    }
  }
  if (startIdx === -1) return null;

  let endIdx = lines.length;
  for (let i = startIdx; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+/);
    if (m && m[1].length <= startLevel) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join("\n").trim();
}

export function transformTransclusions(
  markdown: string,
  resolver: NoteBodyResolver
): string {
  return markdown.replace(/!\[\[([^\[\]\n]+)\]\]/g, (match, inner: string) => {
    const [target, sectionRaw] = inner.split("#").map(s => s.trim());
    if (IMAGE_EXT_RE.test(target)) return match;

    const body = resolver(target);
    if (body == null) return match;

    if (sectionRaw) {
      const section = extractSection(body, sectionRaw);
      return section ?? match;
    }
    return body.trim();
  });
}

export function transformWikilinks(markdown: string, linkMap: LinkMap): string {
  return markdown.replace(/(?<!!)\[\[([^\[\]\n]+)\]\]/g, (_match, inner: string) => {
    const [targetPart, alias] = inner.split("|").map(s => s.trim());
    const [target, section] = targetPart.split("#").map(s => s.trim());
    const entry = linkMap.get(target);
    const display = alias || (section ? target : target);

    if (!entry) return display;

    const href = section ? `${entry.url}#${slugifyAnchor(section)}` : entry.url;
    return `[${display}](${href})`;
  });
}
