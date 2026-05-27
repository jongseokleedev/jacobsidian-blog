import { ui, type Lang, languages } from "./ui";

export { type Lang, languages };

export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split("/");
  if (first === "en") return "en";
  return "ko";
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof lang]): string {
    return ui[lang][key] ?? ui["ko"][key];
  };
}

export function getEnUrl(url: URL): string {
  const path = url.pathname;
  if (path.startsWith("/en")) return path;
  return "/en" + (path === "/" ? "" : path);
}

export function getKoUrl(url: URL): string {
  const path = url.pathname;
  if (path.startsWith("/en/")) return path.slice(3) || "/";
  if (path === "/en") return "/";
  return path;
}
