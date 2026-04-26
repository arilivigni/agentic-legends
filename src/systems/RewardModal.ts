import Phaser from "phaser";

/**
 * Full-screen modal that displays a reward poster (full, uncropped).
 * Resolves once the player presses space / clicks.
 */
export function showRewardModal(scene: Phaser.Scene, textureKey: string, caption: string): Promise<void> {
  return new Promise((resolve) => {
    const w = scene.scale.width;
    const h = scene.scale.height;

    const dim = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(300);

    let img: Phaser.GameObjects.Image | null = null;
    if (scene.textures.exists(textureKey)) {
      img = scene.add.image(w / 2, h / 2 - 30, textureKey).setScrollFactor(0).setDepth(301);
      // Fit fully within (w - 80) × (h - 180), preserve aspect ratio so any
      // text on the poster stays readable and nothing is cropped.
      const maxW = w - 80;
      const maxH = h - 200;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      img.setScale(scale);
    }

    const captionText = scene.add.text(w / 2, h - 90, caption, {
      fontFamily: "Georgia, serif",
      fontSize: "22px",
      color: "#f78166",
      align: "center",
      wordWrap: { width: w - 120 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const prompt = scene.add.text(w / 2, h - 50, "▶ Press Space to continue", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "16px",
      color: "#c9d1d9",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    scene.tweens.add({ targets: prompt, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

    const advance = () => {
      cleanup();
      resolve();
    };
    const cleanup = () => {
      scene.input.keyboard?.off("keydown-SPACE", advance);
      scene.input.keyboard?.off("keydown-ENTER", advance);
      scene.input.off("pointerdown", advance);
      [dim, captionText, prompt].forEach((o) => o.destroy());
      img?.destroy();
    };
    scene.input.keyboard?.on("keydown-SPACE", advance);
    scene.input.keyboard?.on("keydown-ENTER", advance);
    scene.input.on("pointerdown", advance);
  });
}
