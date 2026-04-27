import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

const ASSETS = import.meta.glob("../assets/generated/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function urlFor(slug: string): string | undefined {
  const match = Object.entries(ASSETS).find(([k]) => k.endsWith(`/${slug}.webp`));
  return match?.[1];
}

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const barBg = this.add.rectangle(w / 2, h / 2, 480, 24, 0x222a36).setStrokeStyle(2, 0x3a4759);
    const bar = this.add.rectangle(w / 2 - 240, h / 2, 0, 20, 0xf78166).setOrigin(0, 0.5);
    this.add.text(w / 2, h / 2 - 48, "Loading Codia...", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "28px",
      color: "#e6edf3",
    }).setOrigin(0.5);

    this.load.on("progress", (p: number) => {
      bar.width = 480 * p;
      bar.x = w / 2 - 240;
    });

    const keys: Array<[string, string]> = [
      ["start-mol", "start-mol"],
      ["mona-intro", "mona-intro"],
      ["mona-portrait", "mona-intro-portrait"],
      ["ducky-intro", "ducky-intro"],
      ["ducky-portrait", "ducky-intro-portrait"],
      ["copilot-intro", "copilot-intro"],
      ["copilot-portrait", "copilot-intro-portrait"],
      ["adventurer-bubbles", "adventurer-bubbles-portrait"],
      ["adventurer-fork", "adventurer-fork-portrait"],
      ["adventurer-goggles", "adventurer-goggles-portrait"],
      ["bubbles-reward", "bubbles-reward"],
      ["fork-reward", "fork-reward"],
      ["goggles-reward", "goggles-reward"],
      ["next-challenge-hero", "next-challenge-hero"],
      ["next-challenge-item", "next-challenge-item"],
    ];
    for (const [key, slug] of keys) {
      const url = urlFor(slug);
      if (url) this.load.image(key, url);
    }
  }

  create() {
    document.getElementById("boot-msg")?.remove();
    this.generateRewardIcons();
    this.scene.start("Title");
  }

  private generateRewardIcons() {
    const size = 96;
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // Fork of Curiosity — orange diamond gem with highlight
    g.clear();
    g.fillStyle(0xff8a3d, 1);
    g.fillTriangle(size / 2, 6, size - 10, size / 2, size / 2, size - 6);
    g.fillTriangle(size / 2, 6, 10, size / 2, size / 2, size - 6);
    g.lineStyle(3, 0xffd166, 1);
    g.strokeTriangle(size / 2, 6, size - 10, size / 2, size / 2, size - 6);
    g.strokeTriangle(size / 2, 6, 10, size / 2, size / 2, size - 6);
    g.fillStyle(0xfff3b0, 0.85);
    g.fillTriangle(size / 2, 16, size / 2 + 14, size / 2, size / 2, size / 2 + 6);
    g.generateTexture("fork-icon", size, size);

    // Bubbles of Clarity — three glowing blue spheres
    g.clear();
    g.fillStyle(0x6cd0ff, 0.35);
    g.fillCircle(size / 2, size / 2 + 4, size / 2 - 2);
    g.fillStyle(0x3aa0ff, 1);
    g.fillCircle(size / 2, size / 2 + 8, 26);
    g.fillStyle(0x9be7ff, 1);
    g.fillCircle(size / 2 - 10, size / 2 - 2, 8);
    g.fillStyle(0x6cd0ff, 1);
    g.fillCircle(size / 2 + 18, size / 2 - 14, 6);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(size / 2 - 5, size / 2 + 2, 5);
    g.lineStyle(2, 0xe6f7ff, 0.9);
    g.strokeCircle(size / 2, size / 2 + 8, 26);
    g.generateTexture("bubbles-icon", size, size);

    // Goggles of Insight — two purple-rimmed blue lenses on a strap
    g.clear();
    g.fillStyle(0x2a3457, 1);
    g.fillRect(8, size / 2 - 6, size - 16, 12);
    g.fillStyle(0x6c63ff, 1);
    g.fillCircle(size / 2 - 18, size / 2, 18);
    g.fillCircle(size / 2 + 18, size / 2, 18);
    g.fillStyle(0x6cd0ff, 1);
    g.fillCircle(size / 2 - 18, size / 2, 12);
    g.fillCircle(size / 2 + 18, size / 2, 12);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(size / 2 - 22, size / 2 - 4, 4);
    g.fillCircle(size / 2 + 14, size / 2 - 4, 4);
    g.lineStyle(2, 0xe6edf3, 0.9);
    g.strokeCircle(size / 2 - 18, size / 2, 18);
    g.strokeCircle(size / 2 + 18, size / 2, 18);
    g.generateTexture("goggles-icon", size, size);

    g.destroy();
  }
}
