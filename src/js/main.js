'use strict';

var PlayState = require('./playstate.js');

var HeroSelectState = require('./heroselect.js');


var BootScene = {
  preload: function () {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // load here assets required for the loading screen
    this.game.load.image('preloader_bar', 'images/preloader_bar.png');
  },

  create: function () {
    this.game.state.start('preloader');
  }
};


var PreloaderScene = {
  init: function () {
    this.game.renderer.renderSession.roundPixels = true;

    this.game.coins = 0;
  },

  preload: function () {
    this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(this.loadingBar);

    // TODO: load here the assets for the game
    // this.game.load.json('level:0', 'data/level00.json');
    // this.game.load.json('level:1', 'data/level01.json');

    this.game.load.json('level:0', 'data/level_t.json');
    this.game.load.json('level:1', 'data/level_e.json');
    this.game.load.json('level:2', 'data/level_a.json');
    this.game.load.json('level:3', 'data/level_m.json');
    this.game.load.json('level:4', 'data/level_o.json');
    this.game.load.json('level:5', 'data/level_end.json');

    this.game.load.image('font:numbers', 'images/numbers.png');

    this.game.load.image('icon:coin', 'images/coin_icon.png');
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    this.game.load.image('key', 'images/key.png');

    this.game.load.spritesheet('decoration', 'images/decor.png', 42, 42);
    this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
    this.game.load.spritesheet('heroine', 'images/heroine.png', 36, 42);
    this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    this.game.load.spritesheet('door', 'images/door.png', 42, 66);
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);

    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:key', 'audio/key.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');
    this.game.load.audio('bgm', ['audio/bgm.mp3', 'audio/bgm.ogg']);

    this.game.load.image("hero_stopped", "images/hero_stopped.png");
    this.game.load.image("heroine_stopped", "images/heroine_stopped.png");
    this.game.load.spritesheet('baby', 'images/baby.png', 18, 21);

    this.game.load.image('mountains-back', 'images/mountains-back.png');
		this.game.load.image('mountains-mid1', 'images/mountains-mid1.png');
		this.game.load.image('mountains-mid2', 'images/mountains-mid2.png');
		this.game.load.image('sun', 'images/sun.png');
		this.game.load.image('moon', 'images/moon.png');
  },

  create: function () {
    this.game.state.start('heroSelect', true, false);
    // this.game.state.start('play', true, false, {level: 0});
  }
};


window.onload = function () {
  var game = new Phaser.Game(960, 600, Phaser.CANVAS, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayState);
  game.state.add('heroSelect', HeroSelectState);

  game.state.start('boot');
};
