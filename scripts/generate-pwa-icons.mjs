// Rasterises the AstelPO PWA icons. Run with: node scripts/generate-pwa-icons.mjs
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const DIR = "public/astelpo_26/icons";

const jobs = [
  { src: "icon-source.svg", out: "icon-192.png", size: 192 },
  { src: "icon-source.svg", out: "icon-512.png", size: 512 },
  { src: "icon-source.svg", out: "apple-touch-icon.png", size: 180 },
  { src: "maskable-source.svg", out: "maskable-192.png", size: 192 },
  { src: "maskable-source.svg", out: "maskable-512.png", size: 512 },
];

for (const { src, out, size } of jobs) {
  const svg = await readFile(`${DIR}/${src}`);
  await sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(`${DIR}/${out}`);
  console.log(`${out}  ${size}x${size}`);
}
