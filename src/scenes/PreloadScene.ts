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
    this.scene.start("Title");
  }
}
