import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { VICTORY_NARRATION } from "../data/story";

export class VictoryScene extends Phaser.Scene {
  constructor() { super("Victory"); }
  create() {
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    if (this.textures.exists("next-challenge-hero")) {
      const bg = this.add.image(w / 2, h / 2, "next-challenge-hero");
      const s = Math.max(w / bg.width, h / bg.height);
      bg.setScale(s).setAlpha(0.4);
    }
    this.add.rectangle(w / 2, h / 2, w, h, 0x0d1117, 0.55);
    this.add.text(w / 2, 120, "The Mainline is restored.", {
      fontFamily: "Georgia, serif", fontSize: "48px", color: "#f78166",
      stroke: "#000", strokeThickness: 4,
    }).setOrigin(0.5);
    VICTORY_NARRATION.forEach((line, i) => {
      this.add.text(w / 2, 240 + i * 80, line, {
        fontFamily: "Georgia, serif", fontSize: "24px", color: "#e6edf3",
        align: "center", wordWrap: { width: w - 240 },
      }).setOrigin(0.5);
    });
    const prompt = this.add.text(w / 2, h - 80, "Press Space to play again", {
      fontFamily: "system-ui, sans-serif", fontSize: "20px", color: "#f78166",
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });
    const restart = () => this.scene.start("Title");
    this.input.keyboard?.once("keydown-SPACE", restart);
    this.input.once("pointerdown", restart);
  }
}
