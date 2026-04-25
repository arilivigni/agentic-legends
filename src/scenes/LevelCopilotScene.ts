import { GAME_HEIGHT } from "../config";
import { MENTOR_DIALOG } from "../data/story";
import { BaseLevelScene, type LevelConfig } from "./BaseLevelScene";

export class LevelCopilotScene extends BaseLevelScene {
  constructor() { super({ key: "LevelCopilot" }); }
  config(): LevelConfig {
    const ground = GAME_HEIGHT - 40;
    return {
      key: "LevelCopilot",
      next: "BossMainline",
      title: "Sky of the Sacred Tree — find Copilot",
      bgKey: "copilot-intro",
      bgTint: 0x6cd0ff,
      topColor: 0x0a1f44,
      bottomColor: 0x6cd0ff,
      worldWidth: 4400,
      platforms: [
        { x: 700, y: ground, w: 1400 },
        { x: 2400, y: ground, w: 600 },
        { x: 4000, y: ground, w: 800 },
        { x: 1600, y: ground - 200, w: 200 },
        { x: 2100, y: ground - 280, w: 180 },
        { x: 3300, y: ground - 220, w: 200 },
        { x: 3700, y: ground - 300, w: 180 },
      ],
      hiddenPlatforms: [
        { x: 1500, y: ground - 80, w: 160 },
        { x: 1850, y: ground - 140, w: 160 },
        { x: 2750, y: ground - 100, w: 200 },
        { x: 3050, y: ground - 200, w: 180 },
      ],
      enemies: [
        { x: 900, y: ground - 60, range: 220 },
        { x: 4250, y: ground - 60, range: 220 },
      ],
      mentor: { x: 4300, y: ground - 80, portraitKey: "copilot-portrait" },
      rewardKey: "goggles-reward",
      rewardPower: "goggles",
      mentorDialog: MENTOR_DIALOG.copilot,
      startingPlayerTexture: "adventurer-goggles",
      bgMusic: [392, 494, 587, 698, 880, 698, 587, 494],
    };
  }
}
