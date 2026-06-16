import satori from "satori";
import { SITE } from "@/config";
import { getCategoryMeta, getParentMeta } from "@/utils/getCategories";
import { getDescription } from "@/utils/getDescription";
import loadGoogleFonts from "../loadGoogleFont";

// Brand palette (obsidian dark)
const BG     = "#0d0c0a";
const FG     = "#efece5";
const MUTED  = "rgba(239,236,229,0.45)";
const DESC   = "rgba(239,236,229,0.72)";
const BORDER = "#272420";

// Category accent colors per parent
const PARENT_COLORS = {
  essay:   "#a78bfa",
  tech:    "#60a5fa",
  review:  "#fbbf24",
  fiction: "#34d399",
};

// Logo mark — replicates Logo.astro SVG (3 nodes + 3 edges)
function logoMark(size, color) {
  return {
    type: "svg",
    props: {
      viewBox: "0 0 32 32",
      width:   String(size),
      height:  String(size),
      fill:    "none",
      children: [
        { type: "line",   props: { x1:"7",  y1:"9",  x2:"22", y2:"22", stroke: color, strokeWidth:"1.6", strokeLinecap:"round" } },
        { type: "line",   props: { x1:"22", y1:"22", x2:"25", y2:"8",  stroke: color, strokeWidth:"1.6", strokeLinecap:"round" } },
        { type: "line",   props: { x1:"7",  y1:"9",  x2:"25", y2:"8",  stroke: color, strokeWidth:"1.6", strokeLinecap:"round", opacity:"0.4" } },
        { type: "circle", props: { cx:"7",  cy:"9",  r:"3.2", fill: color } },
        { type: "circle", props: { cx:"22", cy:"22", r:"4",   fill: color } },
        { type: "circle", props: { cx:"25", cy:"8",  r:"2.4", fill: color } },
      ],
    },
  };
}

// Series mark (3-layer stack icon)
function seriesMark(size, color) {
  return {
    type: "svg",
    props: {
      viewBox: "0 0 24 24",
      width:   String(size),
      height:  String(size),
      fill:    "none",
      children: [
        { type: "path", props: { d: "M12 2 2 7l10 5 10-5-10-5Z", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" } },
        { type: "path", props: { d: "m2 12 10 5 10-5",            stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" } },
        { type: "path", props: { d: "m2 17 10 5 10-5",            stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" } },
      ],
    },
  };
}

// Wordmark — mirrors .jsd-wm: jac(thin) + ob(bold) + sidian(thin)
function wordmark(fontSize, color) {
  const thin = { fontWeight: 300, opacity: 0.55, color, fontFamily: "Inter" };
  const bold = { fontWeight: 800,                color, fontFamily: "Inter" };
  return {
    type: "div",
    props: {
      style: {
        display:       "flex",
        alignItems:    "baseline",
        letterSpacing: "-0.04em",
        lineHeight:    1,
        fontSize,
      },
      children: [
        { type: "span", props: { style: thin, children: "jac" } },
        { type: "span", props: { style: bold, children: "ob" } },
        { type: "span", props: { style: thin, children: "sidian" } },
      ],
    },
  };
}

// Subtle dot grid background (Obsidian-style)
function dotGrid() {
  const dots = [];
  const cols = 30;
  const rows = 16;
  const stepX = 1200 / cols;
  const stepY = 630 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        type: "circle",
        props: {
          cx: String(c * stepX + stepX / 2),
          cy: String(r * stepY + stepY / 2),
          r: "1",
          fill: FG,
          opacity: "0.05",
        },
      });
    }
  }
  return {
    type: "svg",
    props: {
      width: "1200",
      height: "630",
      viewBox: "0 0 1200 630",
      style: { position: "absolute", top: 0, left: 0 },
      children: dots,
    },
  };
}

// Truncate while preserving word/character boundary
function clamp(s, max) {
  if (!s) return "";
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

export default async post => {
  const { title, category, pubDatetime, series } = post.data;
  const description = getDescription(post, 200);

  const catMeta    = getCategoryMeta(category);
  const parentKey  = category.split("-")[0];
  const parentMeta = getParentMeta(category);
  const catLabel   = catMeta
    ? `${parentMeta?.label ?? parentKey} · ${catMeta.label}`
    : category;
  const catColor   = PARENT_COLORS[parentKey] ?? "#7aa2d4";

  const dateStr = new Date(pubDatetime).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });

  const descText = clamp(description, 120);
  const seriesText = series ? clamp(series, 36) : "";

  // Title sizing — adjust based on length AND whether desc is present
  let titleSize;
  if (title.length > 40) titleSize = 50;
  else if (title.length > 28) titleSize = 58;
  else titleSize = 68;
  if (descText) titleSize = Math.max(48, titleSize - 4);

  // Collect ALL text characters to ensure font glyphs are loaded
  const extraChars = title + " " + (descText || "") + " " + (seriesText || "") + " " + catLabel;

  return satori(
    {
      type: "div",
      props: {
        style: {
          background:    BG,
          width:         "100%",
          height:        "100%",
          display:       "flex",
          flexDirection: "column",
          justifyContent:"space-between",
          padding:       "56px 64px",
          position:      "relative",
        },
        children: [
          // Subtle dot grid texture
          dotGrid(),

          // Top accent line
          {
            type: "div",
            props: {
              style: {
                position:   "absolute",
                top:        0, left: 0, right: 0,
                height:     "3px",
                background: catColor,
              },
            },
          },

          // Header: logo lockup (left) + category badge (right)
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between" },
              children: [
                // Logo lockup
                {
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "center", gap: "12px" },
                    children: [
                      logoMark(32, FG),
                      wordmark(26, FG),
                    ],
                  },
                },
                // Category badge
                {
                  type: "div",
                  props: {
                    style: {
                      display:      "flex",
                      alignItems:   "center",
                      border:       `1px solid ${catColor}`,
                      borderRadius: "999px",
                      padding:      "6px 16px",
                      fontSize:     17,
                      color:        catColor,
                      fontFamily:   "Inter",
                      fontWeight:   300,
                      gap:          "8px",
                    },
                    children: [
                      { type: "div", props: { style: { width: "7px", height: "7px", borderRadius: "50%", background: catColor } } },
                      catLabel,
                    ],
                  },
                },
              ],
            },
          },

          // Main content block: series badge + title + description
          {
            type: "div",
            props: {
              style: {
                display:       "flex",
                flex:          1,
                flexDirection: "column",
                justifyContent:"center",
                gap:           "20px",
                maxWidth:      "1020px",
              },
              children: [
                // Series badge (only if series)
                ...(seriesText ? [{
                  type: "div",
                  props: {
                    style: {
                      display:      "flex",
                      alignItems:   "center",
                      alignSelf:    "flex-start",
                      gap:          "8px",
                      padding:      "5px 12px",
                      borderRadius: "999px",
                      background:   `${catColor}1f`,
                      border:       `1px solid ${catColor}55`,
                      color:        catColor,
                      fontFamily:   "Inter",
                      fontWeight:   400,
                      fontSize:     18,
                    },
                    children: [
                      seriesMark(16, catColor),
                      { type: "span", props: { style: { fontFamily: "Noto Sans KR" }, children: seriesText } },
                    ],
                  },
                }] : []),

                // Title
                {
                  type: "p",
                  props: {
                    style: {
                      fontSize:    titleSize,
                      fontWeight:  700,
                      color:       FG,
                      lineHeight:  1.25,
                      fontFamily:  "Noto Sans KR",
                      margin:      0,
                      letterSpacing: "-0.02em",
                    },
                    children: title,
                  },
                },

                // Description (only if present)
                ...(descText ? [{
                  type: "p",
                  props: {
                    style: {
                      fontSize:    24,
                      fontWeight:  400,
                      color:       DESC,
                      lineHeight:  1.45,
                      fontFamily:  "Noto Sans KR",
                      margin:      0,
                      maxWidth:    "920px",
                    },
                    children: descText,
                  },
                }] : []),
              ],
            },
          },

          // Footer: date + domain
          {
            type: "div",
            props: {
              style: {
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                fontFamily:     "Inter",
                fontWeight:     300,
              },
              children: [
                { type: "span", props: { style: { fontSize: 17, color: MUTED }, children: dateStr } },
                { type: "span", props: { style: { fontSize: 17, color: MUTED }, children: SITE.website.replace(/https?:\/\//, "").replace(/\/$/, "") } },
              ],
            },
          },

          // Outer border
          {
            type: "div",
            props: {
              style: {
                position:     "absolute",
                inset:        "24px",
                border:       `1px solid ${BORDER}`,
                borderRadius: "12px",
                pointerEvents: "none",
              },
            },
          },
        ],
      },
    },
    {
      width:     1200,
      height:    630,
      embedFont: true,
      fonts:     await loadGoogleFonts(extraChars),
    }
  );
};
