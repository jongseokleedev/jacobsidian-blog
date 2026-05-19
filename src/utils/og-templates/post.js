import satori from "satori";
import { SITE } from "@/config";
import { getCategoryMeta, getParentMeta } from "@/utils/getCategories";
import loadGoogleFonts from "../loadGoogleFont";

// Brand palette (obsidian dark)
const BG     = "#0d0c0a";
const FG     = "#efece5";
const MUTED  = "rgba(239,236,229,0.38)";
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

export default async post => {
  const { title, category, pubDatetime } = post.data;

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

  const titleSize = title.length > 28 ? 52 : 64;

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

          // Post title
          {
            type: "div",
            props: {
              style: { display: "flex", flex: 1, alignItems: "center" },
              children: {
                type: "p",
                props: {
                  style: {
                    fontSize:    titleSize,
                    fontWeight:  700,
                    color:       FG,
                    lineHeight:  1.3,
                    fontFamily:  "Noto Sans KR",
                    maxWidth:    "980px",
                    overflow:    "hidden",
                    margin:      0,
                  },
                  children: title,
                },
              },
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
                { type: "span", props: { style: { fontSize: 17, color: MUTED }, children: SITE.website.replace(/https?:\/\//, "") } },
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
      fonts:     await loadGoogleFonts(),
    }
  );
};
