import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, PHYSICS } from "./config";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { TitleScene } from "./scenes/TitleScene";
import { IntroScene } from "./scenes/IntroScene";
import { LevelMonaScene } from "./scenes/LevelMonaScene";
import { LevelDuckyScene } from "./scenes/LevelDuckyScene";
import { LevelCopilotScene } from "./scenes/LevelCopilotScene";
import { BossMainlineScene } from "./scenes/BossMainlineScene";
import { VictoryScene } from "./scenes/VictoryScene";
import { GameOverScene } from "./scenes/GameOverScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0d1117",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: PHYSICS.gravity },
      debug: false,
    },
  },
  pixelArt: false,
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    IntroScene,
    LevelMonaScene,
    LevelDuckyScene,
    LevelCopilotScene,
    BossMainlineScene,
    VictoryScene,
    GameOverScene,
  ],
};

new Phaser.Game(config);
