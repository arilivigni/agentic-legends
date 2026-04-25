import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

export class GameOverScene extends Phaser.Scene {
  private from: string = "LevelMona";
  constructor() { super("GameOver"); }
  init(data: { from?: string }) { this.from = data.from ?? "LevelMona"; }
  create() {
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    this.add.rectangle(w / 2, h / 2, w, h, 0x0d1117, 1);
    this.add.text(w / 2, 200, "Codia falters...", {
      fontFamily: "Georgia, serif", fontSize: "56px", color: "#ff6b81",
    }).setOrigin(0.5);
    this.add.text(w / 2, 290, "The corruption spreads, but the Adventurer can rise again.", {
      fontFamily: "Georgia, serif", fontSize: "22px", color: "#e6edf3",
      align: "center", wordWrap: { width: w - 240 },
    }).setOrigin(0.5);

    const retry = this.add.text(w / 2, 440, "Retry this stage (R)", {
      fontFamily: "system-ui, sans-serif", fontSize: "22px", color: "#f78166",
    }).setOrigin(0.5);
    const title = this.add.text(w / 2, 490, "Back to Title (T)", {
      fontFamily: "system-ui, sans-serif", fontSize: "22px", color: "#e6edf3",
    }).setOrigin(0.5);
    [retry, title].forEach((t) => this.tweens.add({ targets: t, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 }));

    this.input.keyboard?.once("keydown-R", () => this.scene.start(this.from));
    this.input.keyboard?.once("keydown-T", () => this.scene.start("Title"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start(this.from));
  }
}
