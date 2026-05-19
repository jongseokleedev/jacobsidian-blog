import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

const BG     = "#0d0c0a";
const FG     = "#efece5";
const MUTED  = "rgba(239,236,229,0.4)";
const BORDER = "#272420";
const ACCENT = "#7aa2d4";

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

export default async () => {
  return satori(
    {
      type: "div",
      props: {
        style: {
          background:     BG,
          width:          "100%",
          height:         "100%",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          position:       "relative",
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
                background: ACCENT,
              },
            },
          },

          // Center: mark + wordmark + desc
          {
            type: "div",
            props: {
              style: {
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                gap:            "28px",
              },
              children: [
                logoMark(72, FG),
                wordmark(88, FG),
                {
                  type: "p",
                  props: {
                    style: {
                      fontSize:      22,
                      color:         MUTED,
                      letterSpacing: "0.02em",
                      fontFamily:    "Noto Sans KR",
                      fontWeight:    400,
                      margin:        0,
                      marginTop:     "-8px",
                    },
                    children: SITE.desc,
                  },
                },
              ],
            },
          },

          // Bottom right: domain
          {
            type: "div",
            props: {
              style: {
                position:      "absolute",
                bottom:        "40px",
                right:         "60px",
                fontSize:      17,
                color:         MUTED,
                letterSpacing: "0.05em",
                fontFamily:    "Inter",
                fontWeight:    300,
              },
              children: SITE.website.replace(/https?:\/\//, ""),
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
