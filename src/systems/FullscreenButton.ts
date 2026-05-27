import Phaser from "phaser";
import { isTouchDevice } from "./TouchControls";

/**
 * Returns true when the browser exposes the standard Fullscreen API.
 * iOS Safari (including iPad iOS < 17) returns false here; on those
 * devices the only way to hide browser chrome is "Add to Home Screen".
 */
function fullscreenAvailable(scene: Phaser.Scene): boolean {
  return !!scene.scale.fullscreen?.available;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  // iPadOS 13+ reports as Mac; sniff touch + platform as a secondary signal.
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1)
  );
}

/**
 * Adds a tappable ⛶ fullscreen toggle to the scene at (x, y).
 * - On platforms with the Fullscreen API, toggles Phaser's scale manager.
 * - On iOS, shows a transient hint asking the player to use Safari's
 *   "Add to Home Screen" since the Fullscreen API is unavailable.
 *
 * No-op on desktops by default — pass `force: true` to render anyway.
 */
export function addFullscreenButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: { radius?: number; force?: boolean } = {},
): Phaser.GameObjects.GameObject[] {
  if (!options.force && !isTouchDevice()) return [];

  const r = options.radius ?? 22;
  const bg = scene.add.circle(x, y, r, 0x0d1117, 0.75)
    .setStrokeStyle(2, 0x6cd0ff)
    .setScrollFactor(0)
    .setDepth(60)
    .setInteractive({ useHandCursor: true });
  const glyph = scene.add.text(x, y, "⛶", {
    fontFamily: "system-ui, sans-serif",
    fontSize: `${Math.round(r * 1.1)}px`,
    color: "#6cd0ff",
  }).setOrigin(0.5).setScrollFactor(0).setDepth(61);

  bg.on("pointerover", () => bg.setFillStyle(0x21262d, 0.85));
  bg.on("pointerout", () => bg.setFillStyle(0x0d1117, 0.75));
  bg.on("pointerdown", () => {
    if (fullscreenAvailable(scene)) {
      scene.scale.toggleFullscreen();
      return;
    }
    showIOSHint(scene);
  });

  return [bg, glyph];
}

let hintActive = false;

function showIOSHint(scene: Phaser.Scene) {
  if (hintActive) return;
  hintActive = true;
  const w = scene.scale.width;
  const h = scene.scale.height;

  const msg = isIOS()
    ? "iOS Safari blocks fullscreen.\nTap Share → Add to Home Screen,\nthen launch from the home icon."
    : "Fullscreen isn't supported on this browser.";

  const dim = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55)
    .setScrollFactor(0).setDepth(400).setInteractive();
  const card = scene.add.rectangle(w / 2, h / 2, Math.min(w - 80, 520), 220, 0x161b22, 0.98)
    .setStrokeStyle(2, 0x6cd0ff).setScrollFactor(0).setDepth(401);
  const text = scene.add.text(w / 2, h / 2 - 18, msg, {
    fontFamily: "system-ui, sans-serif",
    fontSize: "18px",
    color: "#e6edf3",
    align: "center",
    lineSpacing: 6,
  }).setOrigin(0.5).setScrollFactor(0).setDepth(402);
  const close = scene.add.text(w / 2, h / 2 + 70, "▶ Got it", {
    fontFamily: "system-ui, sans-serif",
    fontSize: "18px",
    color: "#3fb950",
    backgroundColor: "#0d1117",
    padding: { left: 14, right: 14, top: 6, bottom: 6 },
  }).setOrigin(0.5).setScrollFactor(0).setDepth(402).setInteractive({ useHandCursor: true });

  const cleanup = () => {
    hintActive = false;
    [dim, card, text, close].forEach((o) => o.destroy());
  };
  dim.on("pointerdown", cleanup);
  close.on("pointerdown", cleanup);
}
