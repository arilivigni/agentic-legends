# Copilot / Agent instructions — agentic-legends

This file is read by GitHub Copilot CLI / coding agents working in this
repo. Keep it short, specific, and actionable.

## Project at a glance

- **Stack:** Phaser 3 + TypeScript + Vite, deployed to GitHub Pages.
- **Source layout:** game code in `src/` (scenes in `src/scenes/`,
  systems in `src/systems/`, entities in `src/entities/`). Generated /
  bundled art lives in `src/assets/generated/`.
- **Tests:** Vitest under `tests/`. Run with `pnpm test`.
- **Typecheck:** `pnpm exec tsc --noEmit`.
- **Build:** `pnpm build` (output in `dist/`).

## Release process — REQUIRED on every version bump

Whenever you bump the version in `package.json` (major / minor / patch
— e.g. `0.1.2` → `0.1.3`), you must complete **all** of the following
steps in the same change set so the GitHub Release stays in sync with
the code:

1. **Update `package.json`** to the new SemVer version.
2. **Update `CHANGELOG.md`**:
   - Add a new `## [x.y.z] - <Beta|Stable|YYYY-MM-DD>` section at the
     top (above the previous entry).
   - Group changes under `### Added`, `### Changed`, `### Fixed`,
     `### Removed` as appropriate. Be specific — players and reviewers
     read this as the release body.
3. **Run quality gates** and make sure they pass before tagging:
   - `pnpm exec tsc --noEmit`
   - `pnpm test`
   - `pnpm build`
4. **Commit** the version + CHANGELOG bump together with the feature
   work. Conventional commit style (`feat:`, `fix:`, `chore:`...).
5. **Tag and push** using the `v` prefix:
   ```sh
   git tag -a vX.Y.Z -m "vX.Y.Z — <one-line summary>"
   git push origin vX.Y.Z
   ```
6. **Verify the Release workflow** picked up the tag:
   ```sh
   gh run list --limit 3
   ```
   The `Release` workflow (`.github/workflows/release.yml`) extracts
   the matching `## [x.y.z]` section from `CHANGELOG.md` and publishes
   it as the GitHub Release body. If it fails, fix forward — do **not**
   delete the tag.

> Do not push a tag without a matching CHANGELOG entry — the release
> body will be empty.

### When to bump

- **Patch (`0.1.x`)** — bug fixes, small content tweaks, balance
  changes, copy edits.
- **Minor (`0.x.0`)** — new levels, new mechanics, new characters,
  new quizzes, anything player-visible.
- **Major (`x.0.0`)** — reserved for save-format breaks or a full
  rework. While the game is in Beta, stay on `0.x.y`.

## Code conventions

- TypeScript strict mode is on; no `any` unless justified with a
  comment.
- Phaser scenes extend `BaseLevelScene` where possible — it owns the
  full level lifecycle (player, enemies, mentor, reward modal, quiz,
  lava, fatal-fall, penalty bugs). Per-level differences go in
  `LevelConfig`, not in scene subclass overrides.
- Pass scene-to-scene state via `this.scene.start("Name", { ... })`
  and read it through helpers like `initialPowers()`, `initialHearts()`,
  `initialWrongAnswers()`. Don't reach into globals.
- Game-art assets that contain text bubbles or titles must be cropped
  (`Mentor.cropTopFraction`) or replaced with a Phaser-drawn icon
  generated in `PreloadScene.create()`. The game must not display
  copy from poster art in-world.

## Testing expectations

- Add Vitest cases under `tests/` for any pure utility (e.g.
  `src/util/shuffle.ts`). Phaser-coupled scene logic does not need
  unit tests — exercise it manually via `pnpm dev`.
- Keep the test suite green (`pnpm test`) before every commit.
