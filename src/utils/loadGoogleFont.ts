// Exact character set derived from all post titles + site metadata.
// Fixed across builds so fonts are fetched ONCE per build (module-level cache).
const OG_CHARS =
  "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`" +
  "abcdefghijklmnopqrstuvwxyz{|}~\u00B7\u2014\u2018" +
  "가각간감갑개갤게견경고공과관구군권그글기까나날내년노누느는능니다단대던데델도돌되두둑드들딘" +
  "떠똑라란랑래량러럭려력로록론르른를리링마만많맞맡매머멍멘며명모무문미바반발방백번법벽보" +
  "본분불뷰브비빠사삶상생서석성세소속숲슈스시신실쓰쓸아안않알았애야어엄업엇었에엘예온올와" +
  "완왔왜용우워웨위유율은을의이인일자작잡장저적점정주중지질집째차찰찾채책청체치커코타탄탈" +
  "터토통톺투트튼티팀패풀프하한해협확회효후흐흔";

const cache = new Map<string, ArrayBuffer>();

async function loadGoogleFont(
  font: string,
  weight: number,
  extraChars = ""
): Promise<ArrayBuffer> {
  const chars = extraChars
    ? [...new Set([...OG_CHARS, ...extraChars])].join("")
    : OG_CHARS;
  const key = `${font}:${weight}:${chars}`;
  if (cache.has(key)) return cache.get(key)!;

  const API = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(chars)}`;

  const css = await (
    await fetch(API, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) throw new Error("Failed to download dynamic font");

  const res = await fetch(resource[1]);
  if (!res.ok) {
    throw new Error("Failed to download dynamic font. Status: " + res.status);
  }

  const data = await res.arrayBuffer();
  cache.set(key, data);
  return data;
}

async function loadGoogleFonts(
  extraChars = ""
): Promise<Array<{ name: string; data: ArrayBuffer; weight: number; style: string }>> {
  const fontsConfig = [
    { name: "Inter",        font: "Inter",        weight: 300, style: "normal", extra: "" },
    { name: "Inter",        font: "Inter",        weight: 800, style: "normal", extra: "" },
    { name: "Noto Sans KR", font: "Noto+Sans+KR", weight: 400, style: "normal", extra: extraChars },
    { name: "Noto Sans KR", font: "Noto+Sans+KR", weight: 700, style: "normal", extra: extraChars },
  ];

  return Promise.all(
    fontsConfig.map(async ({ name, font, weight, style, extra }) => {
      const data = await loadGoogleFont(font, weight, extra);
      return { name, data, weight, style };
    })
  );
}

export default loadGoogleFonts;
