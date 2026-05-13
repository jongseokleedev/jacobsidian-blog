import { describe, expect, it } from "vitest";
import {
  stripObsidianBlocks,
  transformImageEmbeds,
  transformTransclusions,
  transformWikilinks,
} from "./transform";
import type { LinkMap } from "./linkMap";

function makeLinkMap(): LinkMap {
  return new Map([
    [
      "AI 시대",
      {
        basename: "Untitled",
        slug: "20260513-1350",
        title: "AI 시대",
        url: "/it/20260513-1350/",
      },
    ],
    [
      "Untitled",
      {
        basename: "Untitled",
        slug: "20260513-1350",
        title: "AI 시대",
        url: "/it/20260513-1350/",
      },
    ],
  ]);
}

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

describe("transformWikilinks", () => {
  const linkMap = makeLinkMap();

  it("resolves simple wikilink by basename", () => {
    expect(transformWikilinks("see [[Untitled]] for details", linkMap)).toBe(
      "see [Untitled](/it/20260513-1350/) for details"
    );
  });

  it("resolves wikilink by title", () => {
    expect(transformWikilinks("see [[AI 시대]] please", linkMap)).toBe(
      "see [AI 시대](/it/20260513-1350/) please"
    );
  });

  it("respects alias [[X|Y]] format", () => {
    expect(transformWikilinks("see [[Untitled|the post]]", linkMap)).toBe(
      "see [the post](/it/20260513-1350/)"
    );
  });

  it("preserves section anchors", () => {
    expect(transformWikilinks("see [[Untitled#section]]", linkMap)).toBe(
      "see [Untitled](/it/20260513-1350/#section)"
    );
  });

  it("handles alias + section", () => {
    expect(transformWikilinks("see [[Untitled#section|X]]", linkMap)).toBe(
      "see [X](/it/20260513-1350/#section)"
    );
  });

  it("falls back to plain text on miss", () => {
    expect(transformWikilinks("see [[Unknown]] here", linkMap)).toBe(
      "see Unknown here"
    );
  });

  it("uses alias text on miss", () => {
    expect(transformWikilinks("see [[Unknown|display]] here", linkMap)).toBe(
      "see display here"
    );
  });

  it("does not touch image embeds (![[...]])", () => {
    expect(transformWikilinks("![[image.png]]", linkMap)).toBe(
      "![[image.png]]"
    );
  });

  it("handles multiple links in one line", () => {
    expect(
      transformWikilinks("[[Untitled]] and [[AI 시대]]", linkMap)
    ).toBe(
      "[Untitled](/it/20260513-1350/) and [AI 시대](/it/20260513-1350/)"
    );
  });
});

describe("transformImageEmbeds", () => {
  const found = new Set<string>();
  const resolver = (name: string) => {
    if (name === "missing.png") return null;
    found.add(name);
    return `/images/${name}`;
  };

  it("converts ![[img.png]] to markdown image", () => {
    expect(transformImageEmbeds("![[hero.png]]", resolver)).toBe(
      "![hero](/images/hero.png)"
    );
  });

  it("uses alias as alt text when present", () => {
    expect(transformImageEmbeds("![[hero.png|cover photo]]", resolver)).toBe(
      "![cover photo](/images/hero.png)"
    );
  });

  it("strips numeric size hint from alt", () => {
    expect(transformImageEmbeds("![[hero.png|300]]", resolver)).toBe(
      "![hero](/images/hero.png)"
    );
  });

  it("strips WxH size hint from alt", () => {
    expect(transformImageEmbeds("![[hero.png|300x200]]", resolver)).toBe(
      "![hero](/images/hero.png)"
    );
  });

  it("keeps original syntax when resolver returns null", () => {
    expect(transformImageEmbeds("![[missing.png]]", resolver)).toBe(
      "![[missing.png]]"
    );
  });

  it("supports jpg, jpeg, gif, webp, svg", () => {
    for (const ext of ["jpg", "jpeg", "gif", "webp", "svg"]) {
      expect(transformImageEmbeds(`![[pic.${ext}]]`, resolver)).toBe(
        `![pic](/images/pic.${ext})`
      );
    }
  });

  it("ignores non-image embeds", () => {
    expect(transformImageEmbeds("![[some-note]]", resolver)).toBe(
      "![[some-note]]"
    );
  });
});

describe("transformTransclusions", () => {
  const noteBody = `# Title

intro paragraph

## section one

content of section one.

## section two

content of section two.`;

  const resolver = (name: string) => (name === "Untitled" ? noteBody : null);

  it("inlines entire note body for ![[Note]]", () => {
    const out = transformTransclusions("see\n\n![[Untitled]]\n\nend", resolver);
    expect(out).toContain("intro paragraph");
    expect(out).toContain("content of section one");
    expect(out).not.toContain("![[Untitled]]");
  });

  it("inlines just the section for ![[Note#section]]", () => {
    const out = transformTransclusions(
      "see\n\n![[Untitled#section one]]\n\nend",
      resolver
    );
    expect(out).toContain("content of section one");
    expect(out).not.toContain("content of section two");
    expect(out).not.toContain("intro paragraph");
  });

  it("preserves syntax when target not found", () => {
    expect(transformTransclusions("![[Missing]]", resolver)).toBe(
      "![[Missing]]"
    );
  });

  it("ignores image embeds (they end in image extension)", () => {
    expect(transformTransclusions("![[pic.png]]", resolver)).toBe(
      "![[pic.png]]"
    );
  });
});
