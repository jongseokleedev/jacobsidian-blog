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
];

export const ANIMALS = [
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
];

export function generateNickname(): string {
  const s = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
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
}

export function getLikedIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem("jb:comment-likes") ?? "[]")); }
  catch { return new Set(); }
}

export function toggleLike(id: string): boolean {
  const liked = getLikedIds();
  if (liked.has(id)) { liked.delete(id); } else { liked.add(id); }
  localStorage.setItem("jb:comment-likes", JSON.stringify([...liked]));
  return liked.has(id);
}
