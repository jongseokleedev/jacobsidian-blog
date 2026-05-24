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
