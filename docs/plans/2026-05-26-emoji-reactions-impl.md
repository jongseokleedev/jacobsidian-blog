# Emoji Reactions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add emoji reactions to posts and comments — readers can pick any emoji via emoji-mart, toggle reactions, and see counts in real time.

**Architecture:** Reactions are stored in a Supabase `reactions` table (target_type + target_id + emoji + count). A Supabase RPC handles increment/decrement atomically. The browser tracks which emojis the user has reacted with in localStorage (`jb:reactions`). emoji-mart is lazy-loaded on first `[+]` click to avoid bundle impact. Post reactions are a new `PostReactions.astro` component placed between the post body and comments. Comment reactions are added to the existing `buildCommentEl` in `Comments.astro`.

**Tech Stack:** Astro v5, Supabase JS client (existing `getSupabase()` from `src/components/comments/lib.ts`), emoji-mart + @emoji-mart/data (lazy loaded), TypeScript strict, pnpm.

---

## Supabase Setup (run in SQL editor before starting)

```sql
create table reactions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id text not null,
  emoji text not null,
  count int not null default 0,
  unique (target_type, target_id, emoji)
);

alter table reactions enable row level security;
create policy "anon select" on reactions for select to anon using (true);
grant select on public.reactions to anon;

create or replace function increment_reaction(
  p_target_type text,
  p_target_id text,
  p_emoji text,
  p_delta int
) returns void language plpgsql security definer as $$
begin
  insert into reactions (target_type, target_id, emoji, count)
    values (p_target_type, p_target_id, p_emoji, greatest(0, p_delta))
    on conflict (target_type, target_id, emoji)
    do update set count = greatest(0, reactions.count + p_delta);
end;
$$;
```

---

## Task 1: Reaction utility functions in lib.ts

**Files:**
- Modify: `src/components/comments/lib.ts`

**Step 1: Add these functions to the bottom of `src/components/comments/lib.ts`**

```typescript
export interface Reaction {
  emoji: string;
  count: number;
}

export function getMyReactions(targetKey: string): Set<string> {
  try {
    const all = JSON.parse(localStorage.getItem("jb:reactions") ?? "{}");
    return new Set(all[targetKey] ?? []);
  } catch {
    return new Set();
  }
}

function saveMyReactions(targetKey: string, emojis: Set<string>): void {
  try {
    const all = JSON.parse(localStorage.getItem("jb:reactions") ?? "{}");
    if (emojis.size === 0) {
      delete all[targetKey];
    } else {
      all[targetKey] = [...emojis];
    }
    localStorage.setItem("jb:reactions", JSON.stringify(all));
  } catch { /* ignore */ }
}

export async function fetchReactions(
  targetType: string,
  targetId: string,
): Promise<Reaction[]> {
  const { data } = await getSupabase()
    .from("reactions")
    .select("emoji, count")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .gt("count", 0)
    .order("count", { ascending: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]) ?? [];
}

export async function toggleReaction(
  targetType: string,
  targetId: string,
  emoji: string,
): Promise<{ reacted: boolean }> {
  const targetKey = `${targetType}:${targetId}`;
  const mine = getMyReactions(targetKey);
  const reacted = !mine.has(emoji);
  const delta = reacted ? 1 : -1;
  if (reacted) { mine.add(emoji); } else { mine.delete(emoji); }
  saveMyReactions(targetKey, mine);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (getSupabase() as any).rpc("increment_reaction", {
    p_target_type: targetType,
    p_target_id: targetId,
    p_emoji: emoji,
    p_delta: delta,
  });
  return { reacted };
}
```

**Step 2: Run build to confirm no type errors**
```bash
pnpm run build
```
Expected: 0 errors.

**Step 3: Commit**
```bash
git add src/components/comments/lib.ts
git commit -m "feat: add reaction utility functions to lib.ts"
```

---

## Task 2: ReactionBar component (shared UI)

**Files:**
- Create: `src/components/reactions/ReactionBar.astro`

**Step 1: Install emoji-mart**
```bash
pnpm add emoji-mart @emoji-mart/data
```

**Step 2: Create `src/components/reactions/ReactionBar.astro`**

Use safe DOM methods only — no innerHTML.

```astro
---
interface Props {
  targetType: "post" | "comment";
  targetId: string;
}
const { targetType, targetId } = Astro.props;
---

<div
  class="reaction-bar flex flex-wrap items-center gap-1.5"
  data-target-type={targetType}
  data-target-id={targetId}
>
  <button
    type="button"
    class="reaction-add-btn flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors"
    style="border: 1px solid var(--border); color: var(--fg-mute);"
    aria-label="이모지 반응 추가"
  >+ 반응</button>
</div>

<script>
  import { fetchReactions, toggleReaction, getMyReactions } from "@/components/comments/lib";

  function makeReactionBtn(emoji: string, count: number, reacted: boolean): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.emoji = emoji;
    btn.className = "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors";
    applyReactionStyle(btn, reacted);

    const emojiSpan = document.createElement("span");
    emojiSpan.textContent = emoji;

    const countSpan = document.createElement("span");
    countSpan.className = "reaction-count";
    countSpan.textContent = String(count);

    btn.appendChild(emojiSpan);
    btn.appendChild(countSpan);
    return btn;
  }

  function applyReactionStyle(btn: HTMLButtonElement, reacted: boolean) {
    btn.style.borderColor = reacted ? "var(--accent)" : "var(--border)";
    btn.style.color = reacted ? "var(--accent)" : "var(--fg-mute)";
  }

  function upsertReactionBtn(
    bar: HTMLElement,
    emoji: string,
    count: number,
    reacted: boolean,
    addBtn: HTMLElement,
  ): HTMLButtonElement | null {
    const existing = bar.querySelector<HTMLButtonElement>(`[data-emoji="${CSS.escape(emoji)}"]`);
    if (existing) {
      existing.querySelector(".reaction-count")!.textContent = String(count);
      applyReactionStyle(existing, reacted);
      if (count === 0) { existing.remove(); return null; }
      return existing;
    }
    if (count === 0) return null;
    const btn = makeReactionBtn(emoji, count, reacted);
    bar.insertBefore(btn, addBtn);
    return btn;
  }

  function bindReactionBtn(
    btn: HTMLButtonElement,
    targetType: string,
    targetId: string,
    targetKey: string,
    addBtn: HTMLElement,
    bar: HTMLElement,
  ) {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", async () => {
      const emoji = btn.dataset.emoji!;
      const mine = getMyReactions(targetKey);
      const reacted = !mine.has(emoji);
      const currentCount = parseInt(btn.querySelector(".reaction-count")!.textContent ?? "0");
      const newCount = Math.max(0, currentCount + (reacted ? 1 : -1));
      upsertReactionBtn(bar, emoji, newCount, reacted, addBtn);
      await toggleReaction(targetType, targetId, emoji);
    });
  }

  async function initBar(bar: HTMLElement) {
    const targetType = bar.dataset.targetType as "post" | "comment";
    const targetId = bar.dataset.targetId!;
    const targetKey = `${targetType}:${targetId}`;
    const addBtn = bar.querySelector<HTMLElement>(".reaction-add-btn")!;

    const reactions = await fetchReactions(targetType, targetId);
    const mine = getMyReactions(targetKey);

    for (const { emoji, count } of reactions) {
      const btn = upsertReactionBtn(bar, emoji, count, mine.has(emoji), addBtn);
      if (btn) bindReactionBtn(btn, targetType, targetId, targetKey, addBtn, bar);
    }

    addBtn.addEventListener("click", async () => {
      const existingPopup = document.getElementById("emoji-picker-popup");
      if (existingPopup) { existingPopup.remove(); return; }

      const [{ Picker }, data] = await Promise.all([
        import("emoji-mart"),
        import("@emoji-mart/data"),
      ]);

      const popup = document.createElement("div");
      popup.id = "emoji-picker-popup";
      popup.style.cssText = "position:fixed; z-index:9999; box-shadow:0 4px 24px rgba(0,0,0,0.2);";

      const rect = addBtn.getBoundingClientRect();
      popup.style.top = `${rect.bottom + 8 + window.scrollY}px`;
      popup.style.left = `${rect.left}px`;
      document.body.appendChild(popup);

      new Picker({
        data: data.default,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onEmojiSelect: async (em: any) => {
          popup.remove();
          const emoji = em.native as string;
          const mine = getMyReactions(targetKey);
          const existing = bar.querySelector<HTMLButtonElement>(`[data-emoji="${CSS.escape(emoji)}"]`);
          const currentCount = parseInt(existing?.querySelector(".reaction-count")?.textContent ?? "0");
          const reacted = !mine.has(emoji);
          const newCount = Math.max(0, currentCount + (reacted ? 1 : -1));
          const btn = upsertReactionBtn(bar, emoji, newCount, reacted, addBtn);
          if (btn) bindReactionBtn(btn, targetType, targetId, targetKey, addBtn, bar);
          await toggleReaction(targetType, targetId, emoji);
        },
        theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
        locale: "ko",
        parent: popup,
      });

      setTimeout(() => {
        document.addEventListener("click", function close(e) {
          if (!popup.contains(e.target as Node) && e.target !== addBtn) {
            popup.remove();
            document.removeEventListener("click", close);
          }
        });
      }, 0);
    });
  }

  document.addEventListener("astro:page-load", () => {
    document.querySelectorAll<HTMLElement>(".reaction-bar").forEach(bar => {
      initBar(bar);
    });
  });
</script>
```

**Step 3: Run build**
```bash
pnpm run build
```
Expected: 0 errors.

**Step 4: Commit**
```bash
git add src/components/reactions/ReactionBar.astro
git commit -m "feat: add ReactionBar component with lazy emoji-mart picker"
```

---

## Task 3: Post reactions

**Files:**
- Create: `src/components/reactions/PostReactions.astro`
- Modify: `src/layouts/PostDetails.astro`

**Step 1: Create `src/components/reactions/PostReactions.astro`**

```astro
---
import ReactionBar from "./ReactionBar.astro";
interface Props { postId: string; }
const { postId } = Astro.props;
---
<div class="mt-8 mb-2">
  <ReactionBar targetType="post" targetId={postId} />
</div>
```

**Step 2: Modify `src/layouts/PostDetails.astro`**

Find the import section and add:
```astro
import PostReactions from "@/components/reactions/PostReactions.astro";
```

Find the line with `{!post.data.disableComments && <Comments postId={post.id} />}` and add PostReactions just before:
```astro
<PostReactions postId={post.id} />
{!post.data.disableComments && <Comments postId={post.id} />}
```

**Step 3: Run build**
```bash
pnpm run build
```

**Step 4: Commit**
```bash
git add src/components/reactions/PostReactions.astro src/layouts/PostDetails.astro
git commit -m "feat: add emoji reactions to post pages"
```

---

## Task 4: Comment reactions

**Files:**
- Modify: `src/components/comments/Comments.astro`

**Step 1: Read the file and find `buildCommentEl`**

In the `buildCommentEl` function, after `li.appendChild(likeBtn)`, add:

```typescript
const reactionWrap = document.createElement("div");
reactionWrap.className = "reaction-bar flex flex-wrap items-center gap-1.5 mt-1";
reactionWrap.dataset.targetType = "comment";
reactionWrap.dataset.targetId = comment.id;

const reactionAddBtn = document.createElement("button");
reactionAddBtn.type = "button";
reactionAddBtn.className = "reaction-add-btn flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors";
reactionAddBtn.style.cssText = "border: 1px solid var(--border); color: var(--fg-mute);";
reactionAddBtn.setAttribute("aria-label", "이모지 반응 추가");
reactionAddBtn.textContent = "+ 반응";
reactionWrap.appendChild(reactionAddBtn);
li.appendChild(reactionWrap);
```

**Step 2: Import reaction utilities**

The script block already has imports from `./lib`. Add to the import line:
```typescript
import { fetchReactions, toggleReaction, getMyReactions } from "./lib";
```

**Step 3: Add `initReactionBar` function to `initComments()`**

Copy the same `initBar` logic from `ReactionBar.astro` into `initComments()` as a local `initReactionBar(bar)` function. (Same logic — safe DOM methods, lazy emoji-mart load, optimistic update.)

**Step 4: Call `initReactionBar` on newly built comments**

At the end of `buildCommentEl`, after appending `reactionWrap`:
```typescript
// Initialize asynchronously after DOM insertion (called from appendComment)
```

In `appendComment`, after `replyList.appendChild(newEl)` / `getOrCreateTopList().appendChild(newEl)`:
```typescript
const bar = newEl.querySelector<HTMLElement>(".reaction-bar");
if (bar) initReactionBar(bar);
```

Also in `initComments()` at page load, initialize existing comment reaction bars:
```typescript
document.querySelectorAll<HTMLElement>(".reaction-bar[data-target-type='comment']").forEach(bar => {
  initReactionBar(bar);
});
```

**Step 5: Run build**
```bash
pnpm run build
```

**Step 6: Commit**
```bash
git add src/components/comments/Comments.astro
git commit -m "feat: add emoji reactions to comments"
```

---

## Done Checklist

- [ ] Supabase schema applied (reactions table + RPC + grant)
- [ ] Reaction utility functions in lib.ts (getMyReactions, fetchReactions, toggleReaction)
- [ ] ReactionBar renders `+ 반응` button, lazy-loads emoji-mart on click
- [ ] Selecting emoji toggles reaction + optimistic UI update
- [ ] Count = 0 → button disappears
- [ ] Post reactions appear between post body and comments
- [ ] Comment reactions appear below each comment's like button
- [ ] My reactions highlighted (accent color) on page reload
- [ ] Picker closes on outside click
