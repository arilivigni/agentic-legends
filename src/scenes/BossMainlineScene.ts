import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { Adventurer, type Power } from "../entities/Adventurer";
import { Hud } from "../systems/Hud";
import { AudioBus } from "../systems/AudioBus";

/**
 * Multi-phase boss. Three phases — each requires a different power to expose
 * the corruption core, then any contact below the core deals damage.
 *  Phase 1 (fork)    — boss splits into two clones, one is real; double-jump
 *                      to reach a high platform that lets you land on the real one.
 *  Phase 2 (bubbles) — boss surrounds itself with fog walls; presence of the
 *                      bubbles dissolves them, exposing the core.
 *  Phase 3 (goggles) — boss hides behind invisible barriers; goggles reveal
 *                      the safe lane to attack.
 */
export class BossMainlineScene extends Phaser.Scene {
  private player!: Adventurer;
  private hud!: Hud;
  private boss!: Phaser.GameObjects.Container;
  private bossBody!: Phaser.GameObjects.Arc;
  private bossX = GAME_WIDTH - 220;
  private bossHp = 3;
  private phase = 0; // 0..2
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private fogWalls!: Phaser.Physics.Arcade.StaticGroup;
  private hiddenWalls!: Phaser.Physics.Arcade.StaticGroup;
  private clones: Phaser.GameObjects.Arc[] = [];
  private invulnerable = false;
  private bossText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;

  constructor() { super("BossMainline"); }

  init(data: { powers?: Power[]; hearts?: number }) {
    this.bossHp = 3;
    this.phase = 0;
    this.invulnerable = false;
    this.clones = [];
    (this as unknown as { initData: { powers: Power[]; hearts: number } }).initData = {
      powers: data.powers ?? [],
      hearts: data.hearts ?? 3,
    };
  }

  create() {
    const data = (this as unknown as { initData: { powers: Power[]; hearts: number } }).initData;

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x3a0d24, 0x3a0d24, 0xb02a55, 0xb02a55, 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setScrollFactor(0);

    this.platforms = this.physics.add.staticGroup();
    const ground = GAME_HEIGHT - 40;
    this.makeRect(GAME_WIDTH / 2, ground, GAME_WIDTH, 28, 0x4a5568);
    this.makeRect(280, ground - 180, 180, 28, 0x4a5568);
    this.makeRect(560, ground - 300, 180, 28, 0x4a5568);
    this.makeRect(900, ground - 220, 180, 28, 0x4a5568);

    this.fogWalls = this.physics.add.staticGroup();
    this.hiddenWalls = this.physics.add.staticGroup();

    const playerTex =
      data.powers.includes("goggles") ? "adventurer-goggles" :
      data.powers.includes("bubbles") ? "adventurer-bubbles" :
      data.powers.includes("fork") ? "adventurer-fork" : "adventurer-fork";

    this.player = new Adventurer(this, 80, GAME_HEIGHT - 200, playerTex);
    for (const p of data.powers) this.player.grantPower(p);
    this.player.hearts = data.hearts;
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.fogWalls);
    this.physics.add.collider(this.player, this.hiddenWalls);

    this.bossBody = this.add.circle(0, 0, 60, 0xb02a55).setStrokeStyle(4, 0x3a0d24);
    const bossEye = this.add.circle(0, -10, 14, 0xffd166);
    this.boss = this.add.container(this.bossX, GAME_HEIGHT - 180, [this.bossBody, bossEye]);
    this.tweens.add({ targets: this.boss, y: this.boss.y - 18, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.hud = new Hud(this, "Mainline Corruption — final stand");
    this.hud.setHearts(this.player.hearts);
    this.hud.setPowers(this.player.powers);

    this.bossText = this.add.text(GAME_WIDTH - 24, 24, this.bossHpString(), {
      fontFamily: "system-ui, sans-serif",
      fontSize: "20px",
      color: "#ff6b81",
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(50);
    this.phaseText = this.add.text(GAME_WIDTH / 2, 60, "", {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      color: "#e6edf3",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(50);

    this.input.keyboard!.on("keydown-ESC", () => this.scene.pause());
    this.input.keyboard!.on("keydown-M", () => AudioBus.toggleMute());

    AudioBus.startBackground([220, 233, 277, 330, 277, 233]);
    this.startPhase();
  }

  private bossHpString() { return `Corruption HP: ${"●".repeat(this.bossHp)}${"○".repeat(Math.max(0, 3 - this.bossHp))}`; }

  private makeRect(x: number, y: number, w: number, h: number, color: number) {
    const r = this.add.rectangle(x, y, w, h, color).setStrokeStyle(2, 0x2d3748);
    this.physics.add.existing(r, true);
    this.platforms.add(r);
    return r;
  }

  private startPhase() {
    this.invulnerable = true;
    this.clones.forEach((c) => c.destroy());
    this.clones = [];
    this.fogWalls.clear(true, true);
    this.hiddenWalls.clear(true, true);
    const requirement: Power = (["fork", "bubbles", "goggles"] as Power[])[this.phase];
    const labels: Record<Power, string> = {
      fork: "Phase 1 — split paths. Use the Fork (double jump) to land on top.",
      bubbles: "Phase 2 — fog walls. Bubbles of Clarity dissolve them.",
      goggles: "Phase 3 — hidden barriers. Goggles of Insight reveal the lane.",
    };
    this.phaseText.setText(labels[requirement]);

    if (requirement === "fork") {
      const c1 = this.add.circle(this.bossX - 80, GAME_HEIGHT - 180, 50, 0x6e1c39).setStrokeStyle(3, 0x3a0d24);
      const c2 = this.add.circle(this.bossX + 80, GAME_HEIGHT - 180, 50, 0x6e1c39).setStrokeStyle(3, 0x3a0d24);
      this.clones = [c1, c2];
    }
    if (requirement === "bubbles") {
      const wall1 = this.add.rectangle(this.bossX - 120, GAME_HEIGHT - 100, 30, 200, 0xb6c2cf, 0.85).setStrokeStyle(2, 0x4a5568);
      const wall2 = this.add.rectangle(this.bossX + 120, GAME_HEIGHT - 100, 30, 200, 0xb6c2cf, 0.85).setStrokeStyle(2, 0x4a5568);
      this.physics.add.existing(wall1, true);
      this.physics.add.existing(wall2, true);
      this.fogWalls.add(wall1);
      this.fogWalls.add(wall2);
      this.physics.add.collider(this.player, this.fogWalls);
    }
    if (requirement === "goggles") {
      const ceiling = this.add.rectangle(this.bossX, GAME_HEIGHT - 240, 240, 28, 0x6cd0ff, 0).setStrokeStyle(2, 0x6cd0ff);
      this.physics.add.existing(ceiling, true);
      this.hiddenWalls.add(ceiling);
    }

    this.tweens.add({ targets: this.boss, alpha: { from: 0.4, to: 1 }, duration: 250, repeat: 2, onComplete: () => { this.invulnerable = false; } });
  }

  override update() {
    this.player.update();
    if (this.player.y > GAME_HEIGHT + 60) {
      this.player.hearts = Math.max(0, this.player.hearts - 1);
      AudioBus.hit();
      this.hud.setHearts(this.player.hearts);
      if (this.player.hearts <= 0) return this.gameOver();
      this.player.setPosition(80, GAME_HEIGHT - 200);
      this.player.setVelocity(0, 0);
      return;
    }

    const requirement: Power = (["fork", "bubbles", "goggles"] as Power[])[this.phase];

    // Phase 2: bubbles dissolves fog
    if (requirement === "bubbles" && this.player.powers.has("bubbles")) {
      this.fogWalls.clear(true, true);
    }
    // Phase 3: goggles reveal hidden ceiling (and disable it as a barrier under)
    if (requirement === "goggles") {
      const reveal = this.player.powers.has("goggles");
      this.hiddenWalls.children.iterate((c) => {
        const r = c as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
        r.fillAlpha = reveal ? 0.6 : 0;
        r.body.enable = !reveal; // when revealed it becomes safe (dissolves)
        return true;
      });
    }

    // Hit detection: player must touch the boss container's bbox while phase requirement met
    if (!this.invulnerable && this.canDamageBoss(requirement)) {
      const bx = this.boss.x, by = this.boss.y;
      const dx = Math.abs(this.player.x - bx);
      const dy = Math.abs(this.player.y - by);
      if (dx < 70 && dy < 80) {
        this.bossHp -= 1;
        AudioBus.collect();
        this.cameras.main.flash(160, 255, 100, 100);
        this.bossText.setText(this.bossHpString());
        this.invulnerable = true;
        this.player.setVelocityY(-360);
        if (this.bossHp <= 0) return this.win();
        this.phase = Math.min(2, this.phase + 1);
        this.time.delayedCall(700, () => this.startPhase());
      }
    }

    // Boss "attack": shoots small dot toward player periodically (visual only here)
    // Skipped for simplicity; contact damage when player overlaps boss while invulnerable phase
    if (!this.invulnerable) {
      const dx = Math.abs(this.player.x - this.boss.x);
      const dy = Math.abs(this.player.y - this.boss.y);
      if (dx < 60 && dy < 60 && !this.canDamageBoss(requirement)) {
        if (this.player.damage(this.time.now)) {
          AudioBus.hit();
          this.hud.setHearts(this.player.hearts);
          if (this.player.hearts <= 0) this.gameOver();
        }
      }
    }
  }

  private canDamageBoss(requirement: Power): boolean {
    if (requirement === "fork") return this.player.powers.has("fork") && this.player.y < this.boss.y - 30;
    if (requirement === "bubbles") return this.player.powers.has("bubbles") && this.fogWalls.countActive(true) === 0;
    if (requirement === "goggles") return this.player.powers.has("goggles");
    return false;
  }

  private win() {
    AudioBus.victory();
    AudioBus.stopBackground();
    this.scene.start("Victory");
  }
  private gameOver() {
    AudioBus.stopBackground();
    this.scene.start("GameOver", { from: "BossMainline" });
  }
}
