import Phaser from "phaser";

export class Mentor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string, cropTopFraction = 0) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    if (cropTopFraction > 0 && scene.textures.exists(textureKey)) {
      const src = scene.textures.get(textureKey).getSourceImage() as HTMLImageElement;
      const fullW = src.width;
      const fullH = src.height;
      const cropY = Math.round(fullH * cropTopFraction);
      this.setCrop(0, cropY, fullW, fullH - cropY);
    }

    const targetH = 150;
    this.setScale(targetH / this.height);
    this.setDepth(8);
    this.refreshBody();

    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
