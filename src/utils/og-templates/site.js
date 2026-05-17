import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

const BG = "#141414";
const FG = "#e8e6e3";
const ACCENT = "#7aa2d4";
const MUTED = "rgba(232,230,227,0.4)";
const BORDER = "#2e2e2e";

export default async () => {
  const allText = SITE.title + SITE.desc + "jacobsidian.com" + "jacob" + "sidian";
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
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "IBM Plex Mono",
          position: "relative",
        },
        children: [
          // Subtle top accent border
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: ACCENT,
              },
            },
          },
          // Center content
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              },
              children: [
                // Wordmark: "jacob" + "sidian"
                {
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "baseline" },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: 96,
                            fontWeight: 400,
                            color: FG,
                            letterSpacing: "-2px",
                          },
                          children: "jacob",
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: 96,
                            fontWeight: 700,
                            color: ACCENT,
                            letterSpacing: "-2px",
                          },
                          children: "sidian",
                        },
                      },
                    ],
                  },
                },
                // Description
                {
                  type: "p",
                  props: {
                    style: {
                      fontSize: 24,
                      color: MUTED,
                      marginTop: "16px",
                      letterSpacing: "0.02em",
                    },
                    children: SITE.desc,
                  },
                },
              ],
            },
          },
          // Bottom hostname
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "40px",
                right: "60px",
                fontSize: 18,
                color: MUTED,
                letterSpacing: "0.05em",
              },
              children: "jacobsidian.com",
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
                pointerEvents: "none",
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
