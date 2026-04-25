import Phaser from "phaser";
import { COLORS } from "../config";

export class CorruptionEnemy extends Phaser.Physics.Arcade.Sprite {
  private patrolMin: number;
  private patrolMax: number;
  private speed = 70;

  constructor(scene: Phaser.Scene, x: number, y: number, range: number) {
    const tex = ensureTexture(scene);
    super(scene, x, y, tex);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(false);
    this.setBounce(0);
    this.patrolMin = x - range;
    this.patrolMax = x + range;
    this.setVelocityX(this.speed);
    this.setDepth(9);
  }

  override update() {
    if (this.x < this.patrolMin) {
      this.setVelocityX(this.speed);
      this.setFlipX(false);
    } else if (this.x > this.patrolMax) {
      this.setVelocityX(-this.speed);
      this.setFlipX(true);
    }
  }
}

function ensureTexture(scene: Phaser.Scene): string {
  const key = "corruption-blob";
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  g.fillStyle(COLORS.corruption, 1);
  g.fillCircle(24, 24, 22);
  g.fillStyle(0x000000, 0.4);
  g.fillCircle(16, 18, 4);
  g.fillCircle(32, 18, 4);
  g.generateTexture(key, 48, 48);
  g.destroy();
  return key;
}
