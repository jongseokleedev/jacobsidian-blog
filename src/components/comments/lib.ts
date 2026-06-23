export const SITUATIONS = [
  "새벽에 글 읽는",
  "창문 너머 바라보는",
  "커피 마시는",
  "졸다 깨어난",
  "빗소리 듣는",
  "산책하다 돌아온",
  "책 읽다 잠든",
  "별 세다 지친",
  "고민하다 멈춘",
  "하늘 보다 생각에 빠진",
  "음악 듣는",
  "따뜻한 차 마시는",
  "창가에 앉은",
  "오후 볕 쬐는",
  "꿈에서 막 깨어난",
  "눈 오는 날 바라보는",
  "혼자 밥 먹는",
  "이어폰 끼고 걷는",
  "낮잠에서 깨어난",
  "멍하니 앉아있는",
  "일기 쓰다 멈춘",
  "버스 창가에 기댄",
  "향 피워두고 앉은",
  "노을 보다 놓친",
  "할 일 미루고 있는",
  "따뜻한 이불 속의",
  "지도 없이 걷는",
  "오래된 사진 보는",
  "혼자 영화 보는",
  "밤하늘 올려다보는",
  "빈 카페에 혼자 앉은",
  "우산 없이 비 맞는",
  "졌지만 웃고 있는",
  "첫 페이지만 읽은",
  "괜찮은 척하는",
  "배고픈데 못 고르는",
  "마감 직전의",
  "길을 잃은 척하는",
  "아무것도 안 하는",
  "천천히 걷기로 한",
  "잎사귀를 덮고 있는"
];

export const ANIMALS = [
  "애벌레",
  "부엉이",
  "고양이",
  "펭귄",
  "판다",
  "너구리",
  "해달",
  "문어",
  "다람쥐",
  "여우",
  "두더지",
  "수달",
  "고슴도치",
  "나무늘보",
  "미어캣",
  "라마",
  "카피바라",
  "비버",
  "알파카",
  "플라밍고",
  "코알라",
  "오리",
  "강아지",
  "토끼",
  "햄스터",
  "사슴",
  "돌고래",
  "북극곰",
  "기린",
  "하마",
  "참새",
  "물범",
  "낙타",
  "타조",
  "왜가리",
  "스라소니",
  "아르마딜로",
  "비글",
  "매",
  "개구리",
  "오소리",
  "마시마로",
];

export const DARK_SITUATIONS = [
  // 냉소/허무
  "모든 게 다 피곤한",
  "웃음 포인트가 고장난",
  "희망 재고 소진된",
  "이유 없이 허탈한",
  "착한 척이 지겨운",
  "사과를 거부하는",
  "참는 게 미덕인 세상이 틀렸다는",
  "눈치 보다 지쳐버린",
  "틀렸어도 인정 안 할",
  "싫은 사람이 너무 많은",
  "설레임 유효기간 만료된",
  "에너지가 딱 0 인",
  "분위기 맞춰주기 그만둔",
  "기대가 사치가 된",
  "위로가 식상해진",
  "감정 낭비를 줄이는",
  "열심히 산 게 억울한",
  "그러든지 말든지인",
  "좋아하는 척 그만둔",
  "더 이상 참지 않기로 한",
  // 그 여자
  "네일 말리는 중인",
  "피부 관리 받는",
  "혼자 호캉스 중인",
  "플레이리스트 정리하는",
  "쇼핑 목록 짜는",
  "답장 고민하다 관둔",
  "차단 버튼 누른",
  "연락 씹고 운동하는",
  "읽고 안 답한",
  "먼저 연락 안 하기로 한",
  "딱 나만 챙기는",
  "아무한테도 연락 안 하는",
  "예약 취소한",
  "관심사가 나 자신인",
  "내 돈으로 내가 사는",
  "bitch가 되고 싶은",
  // 그 남자
  "헬스장 가는",
  "혼자 라면 끓이는",
  "유튜브 보다 잠든",
  "혼자 드라이브 하는",
  "아무 생각 없는",
  "답장 늦게 하는",
  "읽씹 중인",
  "먼저 연락 안 하는",
  "연락 안 하고 잘 사는",
  "기분 티 안 내는",
  "게임하다 밥 까먹은",
  "이어폰 끼고 딴 세상인",
  "좋아하는 팀 응원하는",
  "그냥 조용히 있는",
  "뭔가 혼자 보는",
];

export function generateNickname(): string {
  const isDark =
    typeof document !== "undefined" &&
    document.firstElementChild?.getAttribute("data-theme") === "dark";
  const pool = isDark ? DARK_SITUATIONS : SITUATIONS;
  const s = pool[Math.floor(Math.random() * pool.length)];
  const a = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${s} ${a}`;
}

export function getNickname(): string {
  if (typeof localStorage === "undefined") return generateNickname();
  const saved = localStorage.getItem("jb:comment-nickname");
  if (saved) return saved;
  const nick = generateNickname();
  localStorage.setItem("jb:comment-nickname", nick);
  return nick;
}

export function saveNickname(nick: string): void {
  localStorage.setItem("jb:comment-nickname", nick);
}

async function generateFingerprint(): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  let canvasSig = "";
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("jacobsidian", 2, 15);
    canvasSig = canvas.toDataURL().slice(-32);
  }

  const signals = [
    navigator.userAgent,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    String(navigator.hardwareConcurrency ?? ""),
    canvasSig,
  ].join("|");

  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signals));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export async function getFingerprint(): Promise<string> {
  if (typeof localStorage === "undefined") return "";
  const saved = localStorage.getItem("jb:fingerprint");
  if (saved) return saved;
  const fp = await generateFingerprint();
  localStorage.setItem("jb:fingerprint", fp);
  return fp;
}

import { createClient } from "@supabase/supabase-js";

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL as string,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string,
    );
  }
  return _supabase;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  nickname: string;
  body: string;
  created_at: string;
  like_count: number;
  fingerprint_id?: string | null;
}

export function getLikedIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem("jb:comment-likes") ?? "[]")); }
  catch { return new Set(); }
}

export async function toggleLike(id: string): Promise<{ liked: boolean; count: number }> {
  const liked = getLikedIds();
  const nowLiked = !liked.has(id);
  const delta = nowLiked ? 1 : -1;
  if (nowLiked) { liked.add(id); } else { liked.delete(id); }
  localStorage.setItem("jb:comment-likes", JSON.stringify([...liked]));
  const fingerprint_id = await getFingerprint();
  const sb = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (sb as any).rpc("increment_like", { comment_id: id, delta });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (sb as any).from("comment_like_events").insert({
    comment_id: id,
    delta,
    fingerprint_id: fingerprint_id || null,
  }).then((r: any) => { if (r?.error) console.error("comment_like_events insert", r.error); });
  const { data } = await sb.from("comments").select("like_count").eq("id", id).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { liked: nowLiked, count: (data as any)?.like_count ?? 0 };
}

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
  const fingerprint_id = await getFingerprint();
  const sb = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (sb as any).rpc("increment_reaction", {
    p_target_type: targetType,
    p_target_id: targetId,
    p_emoji: emoji,
    p_delta: delta,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (sb as any).from("reaction_events").insert({
    target_type: targetType,
    target_id: targetId,
    emoji,
    delta,
    fingerprint_id: fingerprint_id || null,
  }).then((r: any) => { if (r?.error) console.error("reaction_events insert", r.error); });
  return { reacted };
}
