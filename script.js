// NovaRP - Game Logic and Interactive Features

class NovaRP {
    constructor() {
        this.characters = JSON.parse(localStorage.getItem('novarp_characters')) || [];
        this.currentCharacter = null;
        this.chatMessages = JSON.parse(localStorage.getItem('novarp_chat')) || [
            {
                time: new Date().toLocaleTimeString(),
                content: 'Welcome to NovaRP! Start your adventure by creating a character.',
                type: 'system'
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCharacterList();
        this.updateChatDisplay();
        this.loadGameState();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link.getAttribute('href'));
            });
        });

        // Character creation
        document.getElementById('startGameBtn')?.addEventListener('click', () => {
            this.showCharacterModal();
        });

        document.getElementById('createFirstCharacter')?.addEventListener('click', () => {
            this.showCharacterModal();
        });

        document.getElementById('characterForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCharacter();
        });

        document.getElementById('closeCharacterModal')?.addEventListener('click', () => {
            this.hideCharacterModal();
        });

        document.getElementById('cancelCharacter')?.addEventListener('click', () => {
            this.hideCharacterModal();
        });

        // Chat system
        document.getElementById('sendMessage')?.addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        document.getElementById('clearChat')?.addEventListener('click', () => {
            this.clearChat();
        });

        // World exploration
        document.querySelectorAll('.world-card .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.exploreWorld(e.target.closest('.world-card'));
            });
        });

        // Modal backdrop click
        document.getElementById('characterModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'characterModal') {
                this.hideCharacterModal();
            }
        });

        // Auto-save game state
        setInterval(() => {
            this.saveGameState();
        }, 30000); // Save every 30 seconds
    }

    handleNavigation(target) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="${target}"]`).classList.add('active');

        // Scroll to section
        const section = document.querySelector(target);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showCharacterModal() {
        const modal = document.getElementById('characterModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideCharacterModal() {
        const modal = document.getElementById('characterModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('characterForm').reset();
    }

    createCharacter() {
        const formData = new FormData(document.getElementById('characterForm'));
        const character = {
            id: Date.now(),
            name: formData.get('characterName'),
            class: formData.get('characterClass'),
            background: formData.get('characterBackground'),
            level: 1,
            experience: 0,
            stats: this.generateCharacterStats(formData.get('characterClass')),
            createdAt: new Date().toISOString(),
            lastPlayed: new Date().toISOString()
        };

        this.characters.push(character);
        this.currentCharacter = character;
        this.saveGameState();
        this.updateCharacterList();
        this.hideCharacterModal();
        
        // Add welcome message to chat
        this.addChatMessage('system', `Welcome ${character.name}! Your ${character.class} character has been created.`);
        
        // Show success notification
        this.showNotification(`Character "${character.name}" created successfully!`, 'success');
    }

    generateCharacterStats(characterClass) {
        const baseStats = {
            health: 100,
            energy: 100,
            strength: 10,
            intelligence: 10,
            charisma: 10,
            agility: 10
        };

        // Class-specific stat bonuses
        const classBonuses = {
            explorer: { agility: 5, intelligence: 3 },
            merchant: { charisma: 5, intelligence: 3 },
            warrior: { strength: 5, health: 20 },
            diplomat: { charisma: 5, intelligence: 3 }
        };

        const bonuses = classBonuses[characterClass] || {};
        return { ...baseStats, ...bonuses };
    }

    updateCharacterList() {
        const characterList = document.getElementById('characterList');
        
        if (this.characters.length === 0) {
            characterList.innerHTML = `
                <div class="no-characters">
                    <i class="fas fa-user-plus"></i>
                    <h3>No Characters Yet</h3>
                    <p>Create your first character to start your adventure</p>
                    <button class="btn btn-primary" id="createFirstCharacter">Create Character</button>
                </div>
            `;
            
            // Re-attach event listener
            document.getElementById('createFirstCharacter')?.addEventListener('click', () => {
                this.showCharacterModal();
            });
        } else {
            characterList.innerHTML = this.characters.map(character => `
                <div class="character-card" data-character-id="${character.id}">
                    <div class="character-avatar">
                        <i class="fas fa-user-astronaut"></i>
                    </div>
                    <div class="character-info">
                        <h3>${character.name}</h3>
                        <p>Level ${character.level} • ${this.capitalizeFirst(character.class)}</p>
                        <p class="character-stats">
                            <span>Health: ${character.stats.health}</span>
                            <span>Energy: ${character.stats.energy}</span>
                        </p>
                        <div class="character-actions">
                            <button class="btn btn-primary btn-sm" onclick="novaRP.selectCharacter(${character.id})">
                                Select
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="novaRP.editCharacter(${character.id})">
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    selectCharacter(characterId) {
        this.currentCharacter = this.characters.find(c => c.id === characterId);
        this.currentCharacter.lastPlayed = new Date().toISOString();
        this.saveGameState();
        
        this.addChatMessage('system', `Selected character: ${this.currentCharacter.name}`);
        this.showNotification(`Selected ${this.currentCharacter.name}`, 'success');
        
        // Update hero section with selected character
        this.updateHeroSection();
    }

    editCharacter(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (character) {
            // Pre-fill form with character data
            document.getElementById('characterName').value = character.name;
            document.getElementById('characterClass').value = character.class;
            document.getElementById('characterBackground').value = character.background;
            
            this.showCharacterModal();
            
            // Update form to edit mode
            const form = document.getElementById('characterForm');
            form.dataset.editMode = 'true';
            form.dataset.characterId = characterId;
        }
    }

    updateHeroSection() {
        if (this.currentCharacter) {
            const characterInfo = document.querySelector('.character-info');
            if (characterInfo) {
                characterInfo.innerHTML = `
                    <h3>${this.currentCharacter.name}</h3>
                    <p>Level ${this.currentCharacter.level} • ${this.capitalizeFirst(this.currentCharacter.class)}</p>
                `;
            }
        }
    }

    exploreWorld(worldCard) {
        if (!this.currentCharacter) {
            this.showNotification('Please select a character first!', 'warning');
            return;
        }

        const worldName = worldCard.querySelector('h3').textContent;
        this.addChatMessage('system', `${this.currentCharacter.name} is exploring ${worldName}...`);
        
        // Simulate exploration with random events
        setTimeout(() => {
            const events = [
                'discovered ancient ruins',
                'found valuable resources',
                'encountered friendly traders',
                'uncovered a hidden passage',
                'gained experience points'
            ];
            
            const event = events[Math.floor(Math.random() * events.length)];
            this.addChatMessage('exploration', `${this.currentCharacter.name} ${event}!`);
            
            // Award experience
            this.currentCharacter.experience += Math.floor(Math.random() * 50) + 10;
            this.checkLevelUp();
        }, 2000);
    }

    checkLevelUp() {
        const expNeeded = this.currentCharacter.level * 100;
        if (this.currentCharacter.experience >= expNeeded) {
            this.currentCharacter.level++;
            this.currentCharacter.experience -= expNeeded;
            
            // Increase stats on level up
            Object.keys(this.currentCharacter.stats).forEach(stat => {
                if (stat !== 'health' && stat !== 'energy') {
                    this.currentCharacter.stats[stat] += Math.floor(Math.random() * 2) + 1;
                }
            });
            
            this.addChatMessage('levelup', `🎉 ${this.currentCharacter.name} reached level ${this.currentCharacter.level}!`);
            this.showNotification(`Level up! ${this.currentCharacter.name} is now level ${this.currentCharacter.level}!`, 'success');
            this.updateCharacterList();
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (!this.currentCharacter) {
            this.showNotification('Please select a character first!', 'warning');
            return;
        }
        
        this.addChatMessage('player', message);
        input.value = '';
        
        // Simulate other players responding
        setTimeout(() => {
            this.simulateOtherPlayers();
        }, Math.random() * 3000 + 1000);
    }

    simulateOtherPlayers() {
        const responses = [
            'That sounds interesting!',
            'I had a similar experience on Nova Prime.',
            'Has anyone explored the Frontier Worlds recently?',
            'Great story!',
            'I\'m new here, any tips?',
            'The merchant guild is looking for new members.',
            'Anyone want to team up for exploration?'
        ];
        
        const playerNames = ['SpaceExplorer', 'NovaTrader', 'CosmicWarrior', 'StellarDiplomat', 'GalaxyWanderer'];
        const randomName = playerNames[Math.floor(Math.random() * playerNames.length)];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        this.addChatMessage('other', randomResponse, randomName);
    }

    addChatMessage(type, content, sender = null) {
        const message = {
            time: new Date().toLocaleTimeString(),
            content: content,
            type: type,
            sender: sender
        };
        
        this.chatMessages.push(message);
        this.updateChatDisplay();
        this.saveGameState();
    }

    updateChatDisplay() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = this.chatMessages.slice(-50).map(msg => {
            let className = 'message';
            let senderText = '';
            
            if (msg.type === 'system') {
                className += ' system-message';
            } else if (msg.type === 'player') {
                className += ' player-message';
                senderText = `${this.currentCharacter?.name || 'You'}: `;
            } else if (msg.type === 'other') {
                className += ' other-message';
                senderText = `${msg.sender}: `;
            } else if (msg.type === 'exploration') {
                className += ' exploration-message';
            } else if (msg.type === 'levelup') {
                className += ' levelup-message';
            }
            
            return `
                <div class="${className}">
                    <span class="message-time">[${msg.time}]</span>
                    <span class="message-content">${senderText}${msg.content}</span>
                </div>
            `;
        }).join('');
        
        // Auto-scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    clearChat() {
        this.chatMessages = [
            {
                time: new Date().toLocaleTimeString(),
                content: 'Chat cleared.',
                type: 'system'
            }
        ];
        this.updateChatDisplay();
        this.saveGameState();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    box-shadow: var(--shadow-lg);
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                }
                
                .notification-success {
                    border-left: 4px solid var(--success-color);
                }
                
                .notification-warning {
                    border-left: 4px solid var(--warning-color);
                }
                
                .notification-error {
                    border-left: 4px solid var(--error-color);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-primary);
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    saveGameState() {
        localStorage.setItem('novarp_characters', JSON.stringify(this.characters));
        localStorage.setItem('novarp_chat', JSON.stringify(this.chatMessages));
        if (this.currentCharacter) {
            localStorage.setItem('novarp_current_character', JSON.stringify(this.currentCharacter));
        }
    }

    loadGameState() {
        const savedCharacter = localStorage.getItem('novarp_current_character');
        if (savedCharacter) {
            this.currentCharacter = JSON.parse(savedCharacter);
            this.updateHeroSection();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.novaRP = new NovaRP();
});

// Add some additional CSS for dynamic elements
const additionalStyles = `
    .character-card {
        background: var(--gradient-card);
        border-radius: 1rem;
        padding: 1.5rem;
        border: 1px solid var(--border-color);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .character-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-lg);
    }
    
    .character-stats {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0.5rem 0;
    }
    
    .character-stats span {
        margin-right: 1rem;
    }
    
    .character-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    .player-message .message-content {
        color: var(--primary-color);
    }
    
    .other-message .message-content {
        color: var(--text-primary);
    }
    
    .exploration-message .message-content {
        color: var(--accent-color);
    }
    
    .levelup-message .message-content {
        color: var(--success-color);
        font-weight: 600;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);