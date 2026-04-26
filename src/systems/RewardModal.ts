import Phaser from "phaser";

/**
 * Full-screen modal that displays a reward poster (full, uncropped).
 * Resolves once the player presses space / clicks.
 */
export function showRewardModal(scene: Phaser.Scene, textureKey: string, caption: string): Promise<void> {
  return new Promise((resolve) => {
    const w = scene.scale.width;
    const h = scene.scale.height;

    const dim = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.9)
      .setScrollFactor(0).setDepth(300);

    // Reserve a slim strip at the bottom for caption + prompt; the poster fills
    // the rest. We never enlarge — at most native size — so any text baked into
    // the image stays crisp and is guaranteed to be fully visible.
    const captionY = h - 56;
    const promptY = h - 24;
    const reservedBottom = h - (captionY - 30); // ~86 px
    const padX = 32;
    const padTop = 32;
    const maxW = w - padX * 2;
    const maxH = h - padTop - reservedBottom;

    let img: Phaser.GameObjects.Image | null = null;
    if (scene.textures.exists(textureKey)) {
      img = scene.add.image(0, 0, textureKey).setScrollFactor(0).setDepth(301);
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      img.setScale(scale);
      const drawnH = img.height * scale;
      img.setPosition(w / 2, padTop + drawnH / 2);
    }

    const captionText = scene.add.text(w / 2, captionY, caption, {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      color: "#f78166",
      align: "center",
      wordWrap: { width: w - 120 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const prompt = scene.add.text(w / 2, promptY, "▶ Press Space to continue", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
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
