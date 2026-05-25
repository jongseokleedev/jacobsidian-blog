import fs from "fs";
import path from "path";
import { Resvg } from "@resvg/resvg-js";
import toIco from "to-ico";

const svgPath = path.resolve("public/favicon.svg");
const icoPath = path.resolve("public/favicon.ico");

const svgContent = fs.readFileSync(svgPath, "utf-8");
const sizes = [16, 32, 48];

const pngBuffers = sizes.map(size => {
  const resvg = new Resvg(svgContent, {
    fitTo: { mode: "width", value: size },
  });
  return resvg.render().asPng();
});

const ico = await toIco(pngBuffers);
fs.writeFileSync(icoPath, ico);

// eslint-disable-next-line no-console
console.log(`favicon.ico generated (${sizes.join(", ")}px)`);
