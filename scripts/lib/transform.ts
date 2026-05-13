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
