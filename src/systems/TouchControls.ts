import Phaser from "phaser";

/**
 * Shared input state populated by on-screen touch controls (or by external
 * sources). Adventurer ORs these into the keyboard inputs so the player
 * can drive the character with the same physics on phones and tablets.
 *
 * The state lives on the Phaser game registry so it is shared across
 * scenes without re-instantiation.
 */
export interface TouchInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  /** Set to a fresh number on each fresh "press" of jump (for edge detection). */
  jumpPressedAt: number;
}

const REGISTRY_KEY = "touchInput";

export function getTouchInput(scene: Phaser.Scene): TouchInputState {
  let s = scene.game.registry.get(REGISTRY_KEY) as TouchInputState | undefined;
  if (!s) {
    s = { left: false, right: false, jump: false, jumpPressedAt: -1 };
    scene.game.registry.set(REGISTRY_KEY, s);
  }
  return s;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;
}

/**
 * Renders fixed-position touch buttons (D-pad on the left, Jump on the
 * right) over the active scene. Buttons are scroll-locked, depth pinned
 * above HUD, and use multi-pointer tracking so the player can hold
 * left/right and tap jump simultaneously.
 *
 * Call attach() in a scene's create(); call detach() if leaving via a
 * scene that owns separate controls (the registry keeps state in sync).
 */
export class TouchControls {
  private scene: Phaser.Scene;
  private state: TouchInputState;
  private objects: Phaser.GameObjects.GameObject[] = [];
  private pointerOwners = new Map<number, "left" | "right" | "jump">();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.state = getTouchInput(scene);
  }

  attach() {
    if (!isTouchDevice()) return; // No-op on desktops.

    const cam = this.scene.cameras.main;
    const w = cam.width;
    const h = cam.height;
    // Clamp button radius so phones in landscape don't get tiny buttons
    // (small h) or oversized ones on tablets (large h).
    const r = Math.max(38, Math.min(70, Math.min(w, h) * 0.075));

    const mkButton = (
      x: number,
      y: number,
      label: string,
      slot: "left" | "right" | "jump",
    ) => {
      const ring = this.scene.add.circle(x, y, r, 0x0d1117, 0.55)
        .setStrokeStyle(2, 0xe6edf3, 0.9)
        .setScrollFactor(0)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true });
      const text = this.scene.add.text(x, y, label, {
        fontFamily: "system-ui, sans-serif",
        fontSize: `${Math.round(r)}px`,
        color: "#e6edf3",
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

      const press = (id: number) => {
        this.pointerOwners.set(id, slot);
        if (slot === "jump") {
          if (!this.state.jump) this.state.jumpPressedAt = this.scene.time.now;
          this.state.jump = true;
        } else {
          this.state[slot] = true;
        }
        ring.setFillStyle(0x238636, 0.75);
      };
      ring.on("pointerdown", (pointer: Phaser.Input.Pointer) => press(pointer.id));
      ring.on("pointerover", (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown) press(pointer.id);
      });
      // Release is handled globally below to support drag-off-button.

      this.objects.push(ring, text);
    };

    const margin = r * 1.25;
    const baseY = h - margin - r * 0.5;
    mkButton(margin + r, baseY, "◀", "left");
    mkButton(margin + r * 3.4, baseY, "▶", "right");
    mkButton(w - margin - r, baseY, "⤒", "jump");

    // Track release across the whole scene so dragging off a button cancels it.
    const release = (pointer: Phaser.Input.Pointer) => {
      const slot = this.pointerOwners.get(pointer.id);
      if (!slot) return;
      this.pointerOwners.delete(pointer.id);
      // Only clear if no other active pointer owns this slot.
      const stillHeld = Array.from(this.pointerOwners.values()).includes(slot);
      if (!stillHeld) this.state[slot] = false;
      // Reset the rings that aren't being touched.
      for (const o of this.objects) {
        if (o instanceof Phaser.GameObjects.Arc) {
          (o as Phaser.GameObjects.Arc).setFillStyle(0x0d1117, 0.55);
        }
      }
    };
    this.scene.input.on("pointerup", release);
    this.scene.input.on("pointerupoutside", release);
    this.scene.input.on("pointercancel", release);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.detach());
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.detach());

    // Multi-touch support
    this.scene.input.addPointer(3);
  }

  detach() {
    for (const o of this.objects) o.destroy();
    this.objects = [];
    this.pointerOwners.clear();
    // Clear shared state so a stale "left" doesn't carry into the next scene.
    this.state.left = false;
    this.state.right = false;
    this.state.jump = false;
  }
}
