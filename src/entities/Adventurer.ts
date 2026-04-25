import Phaser from "phaser";
import { PHYSICS } from "../config";

export type Power = "fork" | "bubbles" | "goggles";

interface PlayerInputs {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  altLeft: Phaser.Input.Keyboard.Key;
  altRight: Phaser.Input.Keyboard.Key;
  altJump: Phaser.Input.Keyboard.Key;
}

export class Adventurer extends Phaser.Physics.Arcade.Sprite {
  powers: Set<Power> = new Set();
  hearts = 3;
  invulnerableUntil = 0;
  private inputs!: PlayerInputs;
  private jumpsRemaining = 1;
  private jumpHeld = false;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setSize(this.width * 0.45, this.height * 0.85);
    const targetH = 120;
    this.setScale(targetH / this.height);
    this.setDepth(10);

    const kb = scene.input.keyboard!;
    this.inputs = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      altLeft: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      altRight: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      altJump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };
  }

  setTextureForPower(scene: Phaser.Scene) {
    if (this.powers.has("goggles") && scene.textures.exists("adventurer-goggles")) {
      this.setTexture("adventurer-goggles");
    } else if (this.powers.has("bubbles") && scene.textures.exists("adventurer-bubbles")) {
      this.setTexture("adventurer-bubbles");
    } else if (this.powers.has("fork") && scene.textures.exists("adventurer-fork")) {
      this.setTexture("adventurer-fork");
    }
  }

  grantPower(p: Power) {
    this.powers.add(p);
    this.setTextureForPower(this.scene);
  }

  damage(now: number): boolean {
    if (now < this.invulnerableUntil) return false;
    this.hearts -= 1;
    this.invulnerableUntil = now + 1200;
    this.setVelocityY(-300);
    this.setVelocityX(this.flipX ? 240 : -240);
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.2, to: 1 },
      duration: 200,
      repeat: 5,
    });
    return true;
  }

  override update() {
    const left = this.inputs.left.isDown || this.inputs.altLeft.isDown;
    const right = this.inputs.right.isDown || this.inputs.altRight.isDown;
    const jumpDown = this.inputs.jump.isDown || this.inputs.altJump.isDown;

    if (left) {
      this.setVelocityX(-PHYSICS.playerSpeed);
      this.setFlipX(true);
    } else if (right) {
      this.setVelocityX(PHYSICS.playerSpeed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    const onFloor = this.body?.blocked.down || this.body?.touching.down;
    if (onFloor) {
      this.jumpsRemaining = this.powers.has("fork") ? 2 : 1;
    }

    if (jumpDown && !this.jumpHeld && this.jumpsRemaining > 0) {
      const v = this.jumpsRemaining === 2 ? PHYSICS.jumpVelocity : PHYSICS.doubleJumpVelocity;
      this.setVelocityY(v);
      this.jumpsRemaining -= 1;
    }
    this.jumpHeld = jumpDown;
  }
}
