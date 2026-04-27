# Changelog

All notable changes to **Agentic Legends** are documented here.
This project follows [Semantic Versioning](https://semver.org/) and
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Versions in the `0.x` range are **beta** — APIs, levels, and balance may
change at any time. The first GA release will be `1.0.0`.

## [0.1.2] - Beta

### Changed
- End-of-level reward modal hides the redundant text caption on Levels 2
  (Ducky) and 3 (Copilot) so the in-image artwork stands on its own.
- Level 3 (Copilot): falling into the gaps is now **fatal** — you lose
  the run instead of just dropping a heart. Use the bridge platforms.
- In-world reward "gift" sprites are now clean Phaser-drawn icons (a
  fork-gem, a bubble cluster, and a pair of goggles) instead of the
  speech-bubble poster art that contained dialog text.
- The in-world mentor sprite for Ducky and Copilot crops the title band
  ("ENLIGHTENMENT" / "SPELLS") off the top of the portrait so no
  text is visible in-game.

### Added
- Animated **lava** in the floor gaps on Level 3, with shimmering glow
  and bobbing bubbles. Touching the lava is now fatal — the screen
  flashes red and the run ends immediately.

## [0.1.1] - Beta

### Changed
- Mona (Level 1) knowledge check now offers four answers — added **D. 10**.
  Correct answer is still **B. 6**.

### Added
- Vitest test suite with 18 passing tests covering the `fitWithin` poster
  scaler and the GH-600 quiz dataset.
- `CI` workflow (`.github/workflows/ci.yml`) that runs `tsc --noEmit` and
  `pnpm test` on every push to `main` and on pull requests.
- `.github/CODEOWNERS` assigning `@arilivigni` to all paths.

### Fixed
- Release workflow now extracts the matching `CHANGELOG.md` section into
  the GitHub Release body (with auto-generated commit notes appended), and
  runs the test suite before building the bundle.

## [0.1.0] - Beta

First public beta of the agentic-legends platformer.

### Added
- Three story levels — Mona (Fork of Curiosity), Ducky (Bubbles of Clarity),
  Copilot (Goggles of Insight) — plus a Mainline boss skirmish.
- Adventurer with hearts, sprint, variable jump, fork double-jump, bubbles
  fog-clear, and goggles hidden-platform reveal.
- Double-tap-Space leap for reaching tall platforms (tip surfaced on the
  Copilot level).
- Per-level GH-600 *Developing in Agentic AI Systems* multiple-choice quiz
  shown after the reward pickup; correct answer required to advance.
- Full-screen reward poster modal (uses the official intro art with text)
  shown when collecting each gift.
- Pause (Esc), mute (M), restart (R), and quit (Q) controls; on-screen
  controls panel.
- GitHub Pages deploy workflow.

### Known limitations
- Audio is procedural (no licensed soundtrack yet).
- Single difficulty curve.
- No persistent save / leaderboard.
