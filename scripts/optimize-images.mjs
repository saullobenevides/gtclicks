#!/usr/bin/env node
/**
 * Otimiza todas as imagens estáticas do /public para WebP.
 * Melhora LCP, FCP e reduz consumo de banda.
 * Execute: npm run optimize:images
 */
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const CONFIGS = [
  {
    input: "hero-gtclicks.png",
    output: "hero-gtclicks.webp",
    maxWidth: 1920,
    quality: 80,
  },
  {
    input: "logo.png",
    output: "logo.webp",
    maxWidth: 256,
    quality: 90,
  },
  {
    input: "icons/icon-calendar.png",
    output: "icons/icon-calendar.webp",
    maxWidth: 128,
    quality: 85,
  },
  {
    input: "icons/icon-location.png",
    output: "icons/icon-location.webp",
    maxWidth: 128,
    quality: 85,
  },
];

let totalBefore = 0;
let totalAfter = 0;

for (const cfg of CONFIGS) {
  const inputPath = join(publicDir, cfg.input);
  if (!existsSync(inputPath)) {
    console.warn("Pulando (não encontrado):", cfg.input);
    continue;
  }

  const outputPath = join(publicDir, cfg.output);
  const info = await sharp(inputPath).metadata();
  const width = Math.min(info.width || cfg.maxWidth, cfg.maxWidth);

  await sharp(inputPath)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality: cfg.quality, effort: 6 })
    .toFile(outputPath);

  const before = readFileSync(inputPath).length;
  const after = readFileSync(outputPath).length;
  totalBefore += before;
  totalAfter += after;

  const pct = Math.round((1 - after / before) * 100);
  console.log(
    `${cfg.input} → ${cfg.output}: ${(before / 1024).toFixed(0)}KB → ${(
      after / 1024
    ).toFixed(0)}KB (${pct}% menor)`
  );
}

if (totalBefore > 0) {
  console.log(
    `\nTotal: ${(totalBefore / 1024).toFixed(0)}KB → ${(
      totalAfter / 1024
    ).toFixed(0)}KB (${Math.round(
      (1 - totalAfter / totalBefore) * 100
    )}% menor)`
  );
}
