import Phaser from 'phaser';
import { NOVARP_THEME, WORLD_BOUNDS } from '../game/config';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private background!: Phaser.GameObjects.TileSprite;

  constructor() {
    super('Game');
  }

  create() {
    this.cameras.main.setBackgroundColor(NOVARP_THEME.background);

    this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'tile')
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.physics.world.setBounds(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height);

    this.player = this.physics.add.sprite(WORLD_BOUNDS.width / 2, WORLD_BOUNDS.height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    this.cameras.main.setBounds(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as Record<string, Phaser.Input.Keyboard.Key>;

    this.game.events.on('nova:chat:message', (text: string) => this.showChatBubble(text));
    this.input.keyboard?.on('keydown-ENTER', () => this.game.events.emit('nova:chat:open'));
    this.input.keyboard?.on('keydown-ESC', () => this.game.events.emit('nova:toggle-settings'));
  }

  update() {
    const configuredSpeed = (this.registry.get('playerSpeed') as number) ?? 220;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    const leftDown = this.cursors.left?.isDown || this.wasd.A?.isDown;
    const rightDown = this.cursors.right?.isDown || this.wasd.D?.isDown;
    const upDown = this.cursors.up?.isDown || this.wasd.W?.isDown;
    const downDown = this.cursors.down?.isDown || this.wasd.S?.isDown;

    if (leftDown) {
      body.setVelocityX(-configuredSpeed);
    } else if (rightDown) {
      body.setVelocityX(configuredSpeed);
    }

    if (upDown) {
      body.setVelocityY(-configuredSpeed);
    } else if (downDown) {
      body.setVelocityY(configuredSpeed);
    }

    body.velocity.normalize().scale(configuredSpeed);

    this.background.tilePositionX = this.cameras.main.scrollX * 0.5;
    this.background.tilePositionY = this.cameras.main.scrollY * 0.5;
  }

  private showChatBubble(text: string) {
    const bubble = this.add.text(this.player.x, this.player.y - 40, text, {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: bubble,
      y: bubble.y - 10,
      alpha: 0,
      duration: 2000,
      ease: 'Sine.easeOut',
      onComplete: () => bubble.destroy(),
    });
  }
}
