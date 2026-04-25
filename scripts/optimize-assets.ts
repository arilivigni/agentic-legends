/**
 * Asset optimization pipeline.
 *
 * Reads the whitelisted PNGs in `assets-src/raw/`, downscales each to a
 * web-friendly WebP under `src/assets/generated/`, and additionally produces a
 * "portrait" version for character images where the title text band at the
 * top ~22% of the source has been cropped away.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const SRC_DIR = path.join(ROOT, "assets-src", "raw");
const OUT_DIR = path.join(ROOT, "src", "assets", "generated");

const FULL_WIDTH = 1280;
const PORTRAIT_WIDTH = 512;
const PORTRAIT_TOP_CROP = 0.22;

interface AssetSpec {
  file: string;
  slug: string;
  /** When true, also emit a `${slug}-portrait.webp` with the top text band cropped. */
  portrait: boolean;
}

const ASSETS: AssetSpec[] = [
  { file: "start-mol.png", slug: "start-mol", portrait: false },
  { file: "mona-intro.png", slug: "mona-intro", portrait: true },
  { file: "ducky-intro.png", slug: "ducky-intro", portrait: true },
  { file: "copilot-intro.png", slug: "copilot-intro", portrait: true },
  { file: "adventurer-bubbles-of-clarity.png", slug: "adventurer-bubbles", portrait: true },
  { file: "adventurer-fork-of-curiosity.png", slug: "adventurer-fork", portrait: true },
  { file: "adventurer-goggles-of-insight.png", slug: "adventurer-goggles", portrait: true },
  { file: "bubbles-of-clarity-reward.png", slug: "bubbles-reward", portrait: false },
  { file: "fork-of-curiosity-reward.png", slug: "fork-reward", portrait: false },
  { file: "goggles-of-insight-reward.png", slug: "goggles-reward", portrait: false },
  { file: "next-challenge-hero.png", slug: "next-challenge-hero", portrait: false },
  { file: "next-challenge-item.png", slug: "next-challenge-item", portrait: false },
];

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function processOne(spec: AssetSpec) {
  const srcPath = path.join(SRC_DIR, spec.file);
  const outFull = path.join(OUT_DIR, `${spec.slug}.webp`);
  const outPortrait = path.join(OUT_DIR, `${spec.slug}-portrait.webp`);

  const srcStat = await fs.stat(srcPath);
  const meta = await sharp(srcPath).metadata();
  const srcW = meta.width ?? FULL_WIDTH;
  const srcH = meta.height ?? FULL_WIDTH;

  await sharp(srcPath)
    .resize({ width: Math.min(FULL_WIDTH, srcW), withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(outFull);
  const fullStat = await fs.stat(outFull);

  let portraitStatSize: number | null = null;
  if (spec.portrait) {
    const cropTop = Math.floor(srcH * PORTRAIT_TOP_CROP);
    const cropHeight = srcH - cropTop;
    await sharp(srcPath)
      .extract({ left: 0, top: cropTop, width: srcW, height: cropHeight })
      .resize({ width: Math.min(PORTRAIT_WIDTH, srcW), withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toFile(outPortrait);
    portraitStatSize = (await fs.stat(outPortrait)).size;
  }

  const kb = (n: number) => `${(n / 1024).toFixed(0)}KB`;
  const portraitMsg = portraitStatSize !== null ? `, portrait ${kb(portraitStatSize)}` : "";
  console.log(
    `${spec.slug.padEnd(24)} ${kb(srcStat.size).padStart(7)} -> ${kb(fullStat.size).padStart(7)}${portraitMsg}`,
  );
}

async function main() {
  await ensureDir(OUT_DIR);
  console.log(`Optimizing ${ASSETS.length} assets...\n`);
  for (const spec of ASSETS) {
    await processOne(spec);
  }

  // Compute total transferred size
  const files = await fs.readdir(OUT_DIR);
  let total = 0;
  for (const f of files) {
    const s = await fs.stat(path.join(OUT_DIR, f));
    total += s.size;
  }
  console.log(`\nTotal generated: ${(total / 1024 / 1024).toFixed(2)} MB across ${files.length} files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
