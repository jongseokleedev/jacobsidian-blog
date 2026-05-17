import satori from "satori";
import { SITE } from "@/config";
import { getCategoryMeta, getParentMeta } from "@/utils/getCategories";
import loadGoogleFonts from "../loadGoogleFont";

const BG = "#141414";
const FG = "#e8e6e3";
const ACCENT = "#7aa2d4";
const MUTED = "rgba(232,230,227,0.35)";
const BORDER = "#2e2e2e";

// Hardcoded OG colors (dark mode palette) per parent category
const PARENT_COLORS = {
  essay:   "#a78bfa",
  tech:    "#60a5fa",
  review:  "#fbbf24",
  fiction: "#34d399",
};

export default async post => {
  const { title, category, pubDatetime } = post.data;

  const catMeta = getCategoryMeta(category);
  const parentKey = category.split("-")[0];
  const parentMeta = getParentMeta(category);

  const catLabel = catMeta
    ? `${parentMeta?.label ?? parentKey} · ${catMeta.label}`
    : category;
  const catColor = PARENT_COLORS[parentKey] ?? ACCENT;

  const dateStr = new Date(pubDatetime).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });

  const allText = title + SITE.title + catLabel + dateStr + "jacobsidian.com" + "jacob" + "sidian";

  return satori(
    {
      type: "div",
      props: {
        style: {
          background: BG,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          fontFamily: "IBM Plex Mono",
          position: "relative",
        },
        children: [
          // Top accent line
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: catColor,
              },
            },
          },
          // Header: wordmark + category badge
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "baseline" },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: { fontSize: 28, fontWeight: 400, color: FG },
                          children: "jacob",
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: { fontSize: 28, fontWeight: 700, color: ACCENT },
                          children: "sidian",
                        },
                      },
                    ],
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      border: `1px solid ${catColor}`,
                      borderRadius: "999px",
                      padding: "6px 16px",
                      fontSize: 18,
                      color: catColor,
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: catColor,
                            marginRight: "8px",
                          },
                        },
                      },
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
                    fontSize: title.length > 28 ? 52 : 66,
                    fontWeight: 700,
                    color: FG,
                    lineHeight: 1.3,
                    fontFamily: "Noto Sans KR",
                    maxWidth: "960px",
                    overflow: "hidden",
                  },
                  children: title,
                },
              },
            },
          },
          // Footer
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              },
              children: [
                {
                  type: "span",
                  props: { style: { fontSize: 18, color: MUTED }, children: dateStr },
                },
                {
                  type: "span",
                  props: { style: { fontSize: 18, color: MUTED }, children: "jacobsidian.com" },
                },
              ],
            },
          },
          // Outer border
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                inset: "24px",
                border: `1px solid ${BORDER}`,
                borderRadius: "12px",
              },
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(allText),
    }
  );
};
