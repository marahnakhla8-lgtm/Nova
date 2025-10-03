import Phaser from 'phaser';
import { NOVARP_THEME } from '../game/config';

export default class MainMenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private startText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(NOVARP_THEME.background);

    this.titleText = this.add.text(width / 2, height / 2 - 80, 'NovaRP', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto',
      fontSize: '72px',
      color: NOVARP_THEME.textLight,
    }).setOrigin(0.5);

    this.subtitleText = this.add.text(width / 2, this.titleText.y + 56, 'A modern web roleplay sandbox', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto',
      fontSize: '18px',
      color: NOVARP_THEME.textMuted,
    }).setOrigin(0.5);

    this.startText = this.add.text(width / 2, height / 2 + 40, 'Enter City', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#4a5cff',
      padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.startText.on('pointerover', () => this.startText.setStyle({ backgroundColor: '#6c7cff' }));
    this.startText.on('pointerout', () => this.startText.setStyle({ backgroundColor: '#4a5cff' }));
    this.startText.on('pointerdown', () => this.scene.start('Game'));

    this.add.text(width / 2, this.startText.y + 56, 'Settings (Esc)', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto',
      fontSize: '16px',
      color: NOVARP_THEME.textMuted,
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.game.events.emit('nova:toggle-settings');
    });

    this.scale.on('resize', (size) => this.layout(size.width, size.height));
  }

  private layout(width: number, height: number) {
    this.titleText.setPosition(width / 2, height / 2 - 80);
    this.subtitleText.setPosition(width / 2, (height / 2 - 80) + 56);
    this.startText.setPosition(width / 2, height / 2 + 40);
  }
}
