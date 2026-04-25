import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { TAGLINE } from "../data/story";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    if (this.textures.exists("start-mol")) {
      const bg = this.add.image(w / 2, h / 2, "start-mol");
      const scale = Math.max(w / bg.width, h / bg.height);
      bg.setScale(scale).setAlpha(0.55);
    }

    this.add.rectangle(w / 2, h / 2, w, h, 0x0d1117, 0.45);

    this.add.text(w / 2, 140, "AGENTIC LEGENDS", {
      fontFamily: "Georgia, serif",
      fontSize: "76px",
      color: "#f78166",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(w / 2, 210, "Restore the Sacred Mainline", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "26px",
      color: "#e6edf3",
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 + 60, TAGLINE, {
      fontFamily: "system-ui, sans-serif",
      fontSize: "20px",
      color: "#c9d1d9",
      align: "center",
      wordWrap: { width: w - 200 },
    }).setOrigin(0.5);

    const prompt = this.add.text(w / 2, h - 120, "Press SPACE or click to begin", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "22px",
      color: "#f78166",
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

    this.add.text(w / 2, h - 60, "Arrow keys / WASD to move • Space to jump • Esc to pause • M to mute", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "16px",
      color: "#8b949e",
    }).setOrigin(0.5);

    const start = () => this.scene.start("Intro");
    this.input.keyboard?.once("keydown-SPACE", start);
    this.input.keyboard?.once("keydown-ENTER", start);
    this.input.once("pointerdown", start);
  }
}
