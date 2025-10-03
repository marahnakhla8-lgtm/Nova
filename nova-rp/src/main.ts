import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MainMenuScene from './scenes/MainMenuScene';
import GameScene from './scenes/GameScene';
import { GAME_WIDTH, GAME_HEIGHT, NOVARP_THEME } from './game/config';

function createGame(): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'app',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: NOVARP_THEME.background,
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false },
    },
    scene: [BootScene, PreloadScene, MainMenuScene, GameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      expandParent: true,
    },
    render: { pixelArt: false, antialias: true },
  });

  const persisted = loadSettings();
  game.registry.set('playerSpeed', persisted.playerSpeed);

  setupUI(game, persisted);

  return game;
}

function loadSettings(): { playerSpeed: number } {
  try {
    const raw = localStorage.getItem('nova.settings');
    if (!raw) return { playerSpeed: 220 };
    const parsed = JSON.parse(raw);
    return {
      playerSpeed: typeof parsed.playerSpeed === 'number' ? parsed.playerSpeed : 220,
    };
  } catch {
    return { playerSpeed: 220 };
  }
}

function saveSettings(next: { playerSpeed: number }) {
  localStorage.setItem('nova.settings', JSON.stringify(next));
}

function setupUI(game: Phaser.Game, initial: { playerSpeed: number }) {
  const root = document.createElement('div');
  root.className = 'ui-root';
  document.body.appendChild(root);

  // Chat input
  const chat = document.createElement('input');
  chat.type = 'text';
  chat.placeholder = 'Say something…';
  chat.className = 'chat-input hidden';
  root.appendChild(chat);

  // Settings overlay
  const overlay = document.createElement('div');
  overlay.className = 'settings-overlay hidden';
  overlay.innerHTML = `
    <div class="settings-panel">
      <h2>NovaRP Settings</h2>
      <label class="setting">
        <span>Player Speed</span>
        <input id="playerSpeed" type="range" min="120" max="400" step="5" value="${initial.playerSpeed}">
        <span class="value" id="playerSpeedValue">${initial.playerSpeed}</span>
      </label>
      <div class="actions">
        <button id="closeSettings">Save & Close</button>
      </div>
    </div>
  `;
  root.appendChild(overlay);

  const speedInput = overlay.querySelector<HTMLInputElement>('#playerSpeed')!;
  const speedValue = overlay.querySelector<HTMLSpanElement>('#playerSpeedValue')!;
  const closeBtn = overlay.querySelector<HTMLButtonElement>('#closeSettings')!;

  const showChat = () => {
    chat.classList.remove('hidden');
    chat.value = '';
    chat.focus();
  };
  const hideChat = () => {
    chat.classList.add('hidden');
    chat.blur();
  };

  game.events.on('nova:chat:open', showChat);
  game.events.on('nova:toggle-settings', () => toggleOverlay());

  chat.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideChat();
      return;
    }
    if (e.key === 'Enter') {
      const text = chat.value.trim();
      if (text) game.events.emit('nova:chat:message', text);
      hideChat();
    }
  });

  const toggleOverlay = (force?: boolean) => {
    const shouldShow = typeof force === 'boolean' ? force : overlay.classList.contains('hidden');
    overlay.classList.toggle('hidden', !shouldShow);
    if (shouldShow) {
      // Sync displayed value
      speedValue.textContent = String(speedInput.value);
    } else {
      const next = { playerSpeed: Number(speedInput.value) };
      game.registry.set('playerSpeed', next.playerSpeed);
      saveSettings(next);
    }
  };

  closeBtn.addEventListener('click', () => toggleOverlay(false));
  overlay.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Escape') toggleOverlay(false);
  });

  speedInput.addEventListener('input', () => {
    speedValue.textContent = String(speedInput.value);
  });
}

createGame();
