// Placeholder to check whether scene works.

import Inventory from '../features/inventory.js';
import Hotbar from '../features/hotbar.js';
import GameState from '../features/gameState.js';
import { fetchWeather } from '../features/weather.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.spritesheet('player', 'assets/sprites/player.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image('forest-tiles', 'assets/tilesets/forest.png');
        this.load.tilemapTiledJSON('hazy-forest', 'assets/maps/hazy-forest.tmj');

        this.load.image('home-tiles', 'assets/tilesets/home_interior.png');
        this.load.tilemapTiledJSON('home', 'assets/maps/home.tmj');

        this.load.image('fortress-tiles', 'assets/tilesets/fortress.png');
        this.load.tilemapTiledJSON('fortress', 'assets/maps/fortress.tmj')

        this.load.image('inventory-ui', 'assets/UI/inventory.png');
        this.load.image('lock', 'assets/UI/lock.png');

        this.load.image('hotbar-ui', 'assets/UI/hotbar.png');

        this.load.image('ui-panel', 'assets/UI/panel.png');
        this.load.image('ui-button', 'assets/UI/button.png');
        this.load.image('ui-button-active', 'assets/UI/button_active.png');

        this.load.tilemapTiledJSON('crossroads', 'assets/maps/crossroads.tmj');

        this.load.image('guild-tiles', 'assets/tilesets/guild.png');
        this.load.tilemapTiledJSON('guild-hall', 'assets/maps/guild-hall.tmj');

        this.load.image('bounty-board', 'assets/UI/bounty_board.png');

        this.load.image('shop-tiles', 'assets/tilesets/shop.png');
        this.load.tilemapTiledJSON('shop', 'assets/maps/shop.tmj');

        this.load.image('status-ui', 'assets/UI/statusbar.png');
        this.load.image('hp-fill', 'assets/UI/hp_fill.png');
        this.load.image('mp-fill', 'assets/UI/mp_fill.png');
        this.load.image('skillbar-ui', 'assets/UI/skillbar.png');

        this.load.spritesheet('force-blast', 'assets/sprites/force_blast.png', { frameWidth: 24, frameHeight: 24 });
        this.load.image('light', 'assets/sprites/light.png');

        this.load.spritesheet('lightning', 'assets/sprites/lightning.png', { frameWidth: 80, frameHeight: 16 });

        this.load.tilemapTiledJSON('venerable-peak', 'assets/maps/venerable-peak.tmj');

        this.load.spritesheet('fortress-sheet', 'assets/tilesets/fortress.png', { frameWidth: 16, frameHeight: 16 });

        this.load.spritesheet('rock-monster', 'assets/sprites/rock_monster.png', {
            frameWidth: 24,
            frameHeight: 24
        });
        this.load.image('rock', 'assets/sprites/rock.png');
        this.load.image('rock-shadow', 'assets/sprites/rock_shadow.png');

        this.load.spritesheet('fungi', 'assets/sprites/fungi.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image('title-bg', 'assets/UI/title_bg.png');
        this.load.image('settings-bg', 'assets/UI/settings_bg.png');
        this.load.image('menu-bg', 'assets/UI/menu_bg.png');
        this.load.image('score-bg', 'assets/UI/score_bg.png');

        const MUSIC = ['forest', 'home', 'peak'];
        for (let i = 0; i < MUSIC.length; i++) {
            this.load.audio('music-' + MUSIC[i], [
                'assets/audio/music/' + MUSIC[i] + '.mp3',
                'assets/audio/music/' + MUSIC[i] + '.ogg'
            ]);
        }

        const SFX = ['pickup', 'eat', 'coins', 'ui_click', 'ui_confirm', 'ui_error', 'player_takeDamage', 'force','monster_hit', 'monster_die', 'rock_throw', 'rock_land', 'blitz', 'projection', 'door_open', 'new_day', 'game_over', 'ending'];
        for (let i = 0; i < SFX.length; i++) {
            this.load.audio(SFX[i], [
                'assets/audio/sfx/' + SFX[i] + '.mp3',
                'assets/audio/sfx/' + SFX[i] + '.ogg'
            ]);
        }


    }

    async create() {
        this.anims.create ({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 0, 2, 0] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create ({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player', { frames: [4, 3, 5, 3] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create ({
            key: 'walk-side',
            frames: this.anims.generateFrameNumbers('player', { frames: [7, 6] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create ({
            key: 'rock-idle',
            frames: this.anims.generateFrameNumbers('rock-monster', { frames: [0, 1, 0, 2] }),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create ({
            key: 'rock-hop',
            frames: this.anims.generateFrameNumbers('rock-monster', { frames: [3, 4, 0] }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create ({
            key: 'rock-throw',
            frames: this.anims.generateFrameNumbers('rock-monster', { frames: [5, 5, 6] }),
            frameRate: 6
        });

        this.anims.create ({
            key: 'rock-death',
            frames: this.anims.generateFrameNumbers('rock-monster', { frames: [7, 8, 9, 10] }),
            frameRate: 6
        });

        this.anims.create ({
            key: 'force-blast',
            frames: this.anims.generateFrameNumbers('force-blast', { frames: [0, 1, 2, 3] }),
            frameRate: 12
        });

        this.anims.create ({
            key: 'lightning',
            frames: this.anims.generateFrameNumbers('lightning', { frames: [0, 1, 2, 1, 3] }),
            frameRate: 16
        })

        const inventory = new Inventory();
        
        this.registry.set('inventory', inventory);
        this.registry.set('hotbar', new Hotbar(inventory));
        this.registry.set('learned', new Set());
        this.registry.set('state', new GameState());
        let musicVolume = 0.5;
        let sfxVolume = 0.6;
        try {
            const saved = JSON.parse(localStorage.getItem('fungiSettings'));
            if (saved) {
                musicVolume = saved.musicVolume;
                sfxVolume = saved.sfxVolume;
            }
        }  catch (error) {
        }
        this.registry.set('musicVolume', musicVolume);
        this.registry.set('sfxVolume', sfxVolume);
        
        inventory.coins = 100;
        
        const weather = await fetchWeather();
        this.registry.set('weather', weather);
        this.scene.start('TitleScene');
    }
}