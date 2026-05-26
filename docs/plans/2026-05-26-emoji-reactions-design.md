# Emoji Reactions Design

Date: 2026-05-26

## Goal

Allow readers to react to posts and comments with any emoji (via emoji-mart picker). Reactions are anonymous, tracked per-browser via localStorage, and support toggle + change.

---

## Supabase Schema

```sql
create table reactions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,  -- "post" | "comment"
  target_id text not null,    -- post slug or comment uuid
  emoji text not null,        -- single emoji character e.g. "👍"
  count int not null default 0,
  unique (target_type, target_id, emoji)
);

alter table reactions enable row level security;
create policy "anon select" on reactions for select to anon using (true);

-- increment/decrement via RPC only
create or replace function increment_reaction(
  p_target_type text,
  p_target_id text,
  p_emoji text,
  p_delta int
) returns void language plpgsql as $$
begin
  insert into reactions (target_type, target_id, emoji, count)
    values (p_target_type, p_target_id, p_emoji, greatest(0, p_delta))
    on conflict (target_type, target_id, emoji)
    do update set count = greatest(0, reactions.count + p_delta);
end;
$$;
```

---

## localStorage Schema

Key: `jb:reactions`
Value: `Record<string, string[]>` — target key → list of emojis I've reacted with

Target key format:
- Post: `"post:{slug}"`
- Comment: `"comment:{uuid}"`

Example:
```json
{
  "post:my-first-post": ["👍", "❤️"],
  "comment:abc-123": ["😂"]
}
```

---

## UI

### Post reactions
Placed below post body, above comments section.

```
[👍 3] [❤️ 12] [😂 1]  [+]
```

- Reacted emojis are highlighted (accent color)
- `[+]` opens emoji-mart picker
- Click existing emoji → toggle (add if not reacted, remove if already reacted)

### Comment reactions
Added alongside existing like button on each comment.

```
[♥ 2]  [😂]  [+]
```

- Existing `like_count` heart button stays as-is
- `[+]` opens emoji-mart picker for that comment

---

## Data Flow

1. **Page load** → fetch all reactions for the target from Supabase
2. **localStorage check** → highlight emojis I've already reacted with
3. **Click emoji** →
   - Optimistic UI update immediately
   - Toggle in localStorage
   - Call Supabase RPC `increment_reaction(target_type, target_id, emoji, delta)` with delta +1 or -1
4. **Open picker** → emoji-mart popup → selecting emoji triggers same toggle flow

---

## Packages

- `emoji-mart` — lazy loaded on `[+]` button click (no bundle impact until used)
- `@emoji-mart/data` — emoji dataset

---

## Out of Scope

- Per-user reaction analytics (admin dashboard)
- Reaction notifications
- Rate limiting (localStorage prevents accidental spam)
