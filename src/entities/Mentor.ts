import Phaser from "phaser";

export class Mentor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
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
