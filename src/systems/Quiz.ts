import Phaser from "phaser";
import type { QuizQuestion } from "../data/quizzes";
import { shuffleQuestion } from "../util/shuffle";

/**
 * Modal multiple-choice quiz. Shown at the end of each level once the player
 * has picked up the reward. Resolves with `true` when the player answers
 * correctly and clicks Continue. Player must keep selecting until correct, so
 * progression is gated on understanding rather than luck.
 */
export class Quiz {
  private scene: Phaser.Scene;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(question: QuizQuestion): Promise<{ wrongCount: number }> {
    const q = shuffleQuestion(question);
    return new Promise((resolve) => {
      let wrongCount = 0;
      const w = this.scene.scale.width;
      const h = this.scene.scale.height;

      const dim = this.scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
        .setScrollFactor(0).setDepth(300);
      const card = this.scene.add.rectangle(w / 2, h / 2, Math.min(w - 80, 880), 460, 0x161b22, 0.98)
        .setStrokeStyle(3, 0xf78166).setScrollFactor(0).setDepth(301);

      const header = this.scene.add.text(w / 2, h / 2 - 200, "Knowledge Check", {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        color: "#f78166",
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      const prompt = this.scene.add.text(w / 2, h / 2 - 130, q.prompt, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        color: "#e6edf3",
        align: "center",
        wordWrap: { width: Math.min(w - 140, 800) },
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(302);

      const feedback = this.scene.add.text(w / 2, h / 2 + 130, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#8b949e",
        align: "center",
        wordWrap: { width: Math.min(w - 140, 800) },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

      const continueLabel = this.scene.add.text(w / 2, h / 2 + 195, "▶ Press Space to continue", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        color: "#3fb950",
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setVisible(false);

      const optionTexts: Phaser.GameObjects.Text[] = [];
      const optionBgs: Phaser.GameObjects.Rectangle[] = [];
      let answered = false;

      const yStart = h / 2 - 30;
      q.options.forEach((opt, i) => {
        const y = yStart + i * 38;
        const bg = this.scene.add.rectangle(w / 2, y, Math.min(w - 200, 720), 32, 0x21262d, 1)
          .setStrokeStyle(1, 0x30363d).setScrollFactor(0).setDepth(302).setInteractive({ useHandCursor: true });
        const t = this.scene.add.text(w / 2, y, `${String.fromCharCode(65 + i)}.  ${opt}`, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "17px",
          color: "#e6edf3",
        }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
        bg.on("pointerover", () => { if (!answered) bg.setFillStyle(0x30363d); });
        bg.on("pointerout", () => { if (!answered) bg.setFillStyle(0x21262d); });
        bg.on("pointerdown", () => choose(i));
        optionTexts.push(t);
        optionBgs.push(bg);
      });

      const numberKeys = ["ONE", "TWO", "THREE", "FOUR", "FIVE"];
      const letterKeys = ["A", "B", "C", "D", "E"];
      const handlers: Array<() => void> = [];
      q.options.forEach((_, i) => {
        const fn = () => choose(i);
        handlers.push(fn);
        this.scene.input.keyboard?.on(`keydown-${numberKeys[i]}`, fn);
        this.scene.input.keyboard?.on(`keydown-${letterKeys[i]}`, fn);
      });
      const continueHandler = () => {
        if (!answered) return;
        cleanup();
        resolve({ wrongCount });
      };
      this.scene.input.keyboard?.on("keydown-SPACE", continueHandler);
      this.scene.input.keyboard?.on("keydown-ENTER", continueHandler);

      const choose = (i: number) => {
        const correct = i === q.correctIndex;
        if (correct) {
          answered = true;
          optionBgs[i].setFillStyle(0x238636);
          feedback.setText(q.successMessage).setColor("#3fb950");
          continueLabel.setVisible(true);
          this.scene.tweens.add({ targets: continueLabel, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });
        } else {
          wrongCount += 1;
          optionBgs[i].setFillStyle(0x6e1c2e);
          feedback.setText(q.failureMessage + "\nTry again.").setColor("#ff6b81");
          // Re-enable after a beat
          this.scene.time.delayedCall(900, () => {
            if (!answered) optionBgs[i].setFillStyle(0x21262d);
          });
        }
      };

      const cleanup = () => {
        handlers.forEach((fn, i) => {
          this.scene.input.keyboard?.off(`keydown-${numberKeys[i]}`, fn);
          this.scene.input.keyboard?.off(`keydown-${letterKeys[i]}`, fn);
        });
        this.scene.input.keyboard?.off("keydown-SPACE", continueHandler);
        this.scene.input.keyboard?.off("keydown-ENTER", continueHandler);
        [dim, card, header, prompt, feedback, continueLabel, ...optionBgs, ...optionTexts].forEach((o) => o.destroy());
      };
    });
  }
}
