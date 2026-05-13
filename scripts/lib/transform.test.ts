import { describe, expect, it } from "vitest";
import { stripObsidianBlocks } from "./transform";

describe("stripObsidianBlocks", () => {
  it("removes meta-bind-button fenced blocks", () => {
    const input = `안녕하세요.

\`\`\`meta-bind-button
label: "발행 처리 ✓"
style: primary
\`\`\`

본문 계속.`;
    expect(stripObsidianBlocks(input)).toBe("안녕하세요.\n\n본문 계속.");
  });

  it("removes meta-bind inline blocks", () => {
    const input = `Hello.

\`\`\`meta-bind
INPUT[text:foo]
\`\`\`

End.`;
    expect(stripObsidianBlocks(input)).toBe("Hello.\n\nEnd.");
  });

  it("removes dataview and dataviewjs blocks", () => {
    const input = `before

\`\`\`dataview
TABLE x FROM "Y"
\`\`\`

middle

\`\`\`dataviewjs
dv.list([1,2])
\`\`\`

after`;
    expect(stripObsidianBlocks(input)).toBe("before\n\nmiddle\n\nafter");
  });

  it("removes multiple consecutive obsidian blocks", () => {
    const input = `top

\`\`\`meta-bind-button
a: 1
\`\`\`

\`\`\`meta-bind-button
b: 2
\`\`\`

bottom`;
    expect(stripObsidianBlocks(input)).toBe("top\n\nbottom");
  });

  it("preserves regular code fences", () => {
    const input = "```ts\nconst x = 1;\n```";
    expect(stripObsidianBlocks(input)).toBe(input);
  });

  it("preserves untagged code fences", () => {
    const input = "```\nplain\n```";
    expect(stripObsidianBlocks(input)).toBe(input);
  });

  it("collapses 3+ consecutive blank lines to 2", () => {
    const input = `a



b`;
    expect(stripObsidianBlocks(input)).toBe("a\n\nb");
  });

  it("trims trailing whitespace", () => {
    const input = `body.

\`\`\`meta-bind-button
foo: bar
\`\`\`

`;
    expect(stripObsidianBlocks(input)).toBe("body.\n");
  });
});
