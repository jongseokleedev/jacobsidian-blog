import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const HOST = "jacobsidian.com";
const KEY = "d8f8006b6ff949c288483054a97260f0";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const PROJECT_ROOT = path.resolve(new URL("..", import.meta.url).pathname);

function parseCategory(category: string): { parent: string; sub: string } {
  const [parent, sub] = category.split("-");
  return { parent, sub };
}

async function urlForPostFile(relPath: string): Promise<string | null> {
  const full = path.join(PROJECT_ROOT, relPath);
  const isEn = relPath.endsWith(".en.md");
  try {
    const raw = await fs.readFile(full, "utf8");
    const fm = matter(raw).data as { category?: string; slug?: string; draft?: boolean };
    if (fm.draft) return null;
    if (!fm.category) return null;
    const { parent, sub } = parseCategory(fm.category);
    if (!parent || !sub) return null;
    const baseName = path.basename(relPath, isEn ? ".en.md" : ".md");
    const slug = (fm.slug && String(fm.slug).trim()) || baseName;
    const prefix = isEn ? "en/" : "";
    return `https://${HOST}/${prefix}${parent}/${sub}/${slug}/`;
  } catch {
    return null;
  }
}

async function changedPostFiles(): Promise<string[]> {
  try {
    const out = execFileSync("git", ["diff", "--name-only", "HEAD~1", "HEAD"], {
      cwd: PROJECT_ROOT,
    }).toString();
    return out
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.startsWith("src/data/posts/") && s.endsWith(".md"));
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const files = await changedPostFiles();
  if (files.length === 0) {
    console.log("[indexnow] no post changes in HEAD — skipped.");
    return;
  }

  const urls = (await Promise.all(files.map(urlForPostFile))).filter(
    (u): u is string => !!u
  );
  if (urls.length === 0) {
    console.log("[indexnow] no publishable URLs (drafts or unknown category).");
    return;
  }

  const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };
  console.log(`[indexnow] pushing ${urls.length} URL(s):`);
  for (const u of urls) console.log(`  · ${u}`);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (res.status === 200 || res.status === 202) {
    console.log(`[indexnow] accepted (HTTP ${res.status}).`);
  } else {
    const text = await res.text().catch(() => "");
    console.warn(`[indexnow] HTTP ${res.status}: ${text}`);
  }
}

main().catch(err => {
  console.error("[indexnow] error:", err);
  process.exit(0); // 배포는 막지 않음
});
