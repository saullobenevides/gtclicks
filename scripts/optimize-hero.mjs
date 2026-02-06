#!/usr/bin/env node
/**
 * Otimiza a imagem hero para melhorar LCP/FCP.
 * Gera versão WebP comprimida a partir do PNG original.
 * Execute: node scripts/optimize-hero.mjs
 */
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const inputPath = join(publicDir, "hero-gtclicks.png");
const outputPath = join(publicDir, "hero-gtclicks.webp");

if (!existsSync(inputPath)) {
  console.error("Arquivo não encontrado:", inputPath);
  process.exit(1);
}

const info = await sharp(inputPath).metadata();
const maxWidth = 1920;
const width = Math.min(info.width || 1920, maxWidth);

await sharp(inputPath)
  .resize(width, null, { withoutEnlargement: true })
  .webp({ quality: 80, effort: 6 })
  .toFile(outputPath);

const before = (readFileSync(inputPath).length / 1024).toFixed(0);
const after = (readFileSync(outputPath).length / 1024).toFixed(0);
console.log(
  `Hero otimizado: ${before}KB → ${after}KB (${Math.round(
    (1 - after / before) * 100
  )}% menor)`
);
console.log("Arquivo gerado:", outputPath);
