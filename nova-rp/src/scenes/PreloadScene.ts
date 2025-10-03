import Phaser from 'phaser';
import { NOVARP_THEME } from '../game/config';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const graphics = this.add.graphics();

    graphics.clear();
    graphics.fillStyle(NOVARP_THEME.primary, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);

    graphics.clear();
    graphics.fillStyle(0x152039, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(1, 0x1e2a4a, 1);
    graphics.strokeRect(0.5, 0.5, 31, 31);
    graphics.generateTexture('tile', 32, 32);

    graphics.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor(NOVARP_THEME.background);
    this.scene.start('MainMenu');
  }
}
