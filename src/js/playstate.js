'use strict';

var Hero = require('./hero.js');
var Spider = require('./spider.js');

var PlayState = {};

const LEVEL_COUNT = 100;

PlayState.init = function (data) {
  this.keys = this.game.input.keyboard.addKeys({
    left: Phaser.KeyCode.LEFT,
    right: Phaser.KeyCode.RIGHT,
    up: Phaser.KeyCode.UP
  });

  this.coinPickupCount = 0;
  this.hasKey = false;
  // this.level = (data.level || 0) % LEVEL_COUNT;
  this.level = 100;
};

PlayState.create = function () {
  // fade in (from black)
  this.camera.flash('#000000');

  // create sound entities
  this.sfx = {
    jump: this.game.add.audio('sfx:jump'),
    coin: this.game.add.audio('sfx:coin'),
    key: this.game.add.audio('sfx:key'),
    stomp: this.game.add.audio('sfx:stomp'),
    door: this.game.add.audio('sfx:door')
  };
  // this.bgm = this.game.add.audio('bgm');
  // this.bgm.loopFull();

  // create level entities and decoration
  this.game.add.image(0, 0, 'background');
  this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));

  // create UI score boards
  this._createHud();
};

PlayState.update = function () {
  this._handleCollisions();
  this._handleInput();

  // update scoreboards
  this.coinFont.text = `x${this.coinPickupCount}`;
  this.keyIcon.frame = this.hasKey ? 1 : 0;
};

PlayState.shutdown = function () {
  this.bgm.stop();
};

PlayState._handleCollisions = function () {
  this.game.physics.arcade.collide(this.spiders, this.platforms);
  this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
  this.game.physics.arcade.collide(this.hero, this.platforms);

  // hero vs coins (pick up)
  this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
    null, this);
  // hero vs key (pick up)
  this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
    null, this);
  // hero vs door (end level)
  this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
    // ignore if there is no key or the player is on air
    function (hero, door) {
      return this.hasKey && hero.body.touching.down;
    }, this);
  // collision: hero vs enemies (kill or die)
  this.game.physics.arcade.overlap(this.hero, this.spiders,
    this._onHeroVsEnemy, null, this);
};

PlayState._handleInput = function () {
  if (this.keys.left.isDown) { // move hero left
    this.hero.move(-1);
  }
  else if (this.keys.right.isDown) { // move hero right
    this.hero.move(1);
  }
  else { // stop
    this.hero.move(0);
  }

  // handle jump
  const JUMP_HOLD = 200; // ms
  if (this.keys.up.downDuration(JUMP_HOLD)) {
    let didJump = this.hero.jump();
    if (didJump) { this.sfx.jump.play(); }
  }
  else {
    this.hero.stopJumpBoost();
  }
};

PlayState._onHeroVsKey = function (hero, key) {
  this.sfx.key.play();
  key.kill();
  this.hasKey = true;
};

PlayState._onHeroVsCoin = function (hero, coin) {
  this.sfx.coin.play();
  coin.kill();
  this.coinPickupCount++;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
  // the hero can kill enemies when is falling (after a jump, or a fall)
  if (hero.body.velocity.y > 0) {
    enemy.die();
    hero.bounce();
    this.sfx.stomp.play();
  }
  else { // game over -> play dying animation and restart the game
    hero.die();
    this.sfx.stomp.play();
    hero.events.onKilled.addOnce(function () {
      this.game.state.restart(true, false, { level: this.level });
    }, this);

    // NOTE: bug in phaser in which it modifies 'touching' when
    // checking for overlaps. This undoes that change so spiders don't
    // 'bounce' agains the hero
    enemy.body.touching = enemy.body.wasTouching;
  }
};

PlayState._onHeroVsDoor = function (hero, door) {
  // 'open' the door by changing its graphic and playing a sfx
  door.frame = 1;
  this.sfx.door.play();

  // play 'enter door' animation and change to the next level when it ends
  hero.freeze();
  this.game.add.tween(hero)
    .to({ x: this.door.x, alpha: 0 }, 500, null, true)
    .onComplete.addOnce(this._goToNextLevel, this);
};

PlayState._goToNextLevel = function () {
  this.camera.fade('#000000');
  this.camera.onFadeComplete.addOnce(function () {
    // change to next level
    this.game.state.restart(true, false, {
      level: this.level + 1
    });
  }, this);
};

PlayState._loadLevel = function (data) {
  // create all the groups/layers that we need
  this.bgDecoration = this.game.add.group();
  this.platforms = this.game.add.group();
  this.coins = this.game.add.group();
  this.spiders = this.game.add.group();
  this.enemyWalls = this.game.add.group();
  this.enemyWalls.visible = false;

  // spawn hero and enemies
  this._spawnCharacters({ hero: data.hero, spiders: data.spiders });

  // spawn level decoration
  data.decoration.forEach(function (deco) {
    this.bgDecoration.add(
      this.game.add.image(deco.x, deco.y, 'decoration', deco.frame));
  }, this);

  // spawn platforms
  data.platforms.forEach(this._spawnPlatform, this);

  // spawn important objects
  data.coins.forEach(this._spawnCoin, this);
  this._spawnKey(data.key.x, data.key.y);
  this._spawnDoor(data.door.x, data.door.y);

  // enable gravity
  const GRAVITY = 1200;
  this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnCharacters = function (data) {
  // spawn spiders
  data.spiders.forEach(function (spider) {
    let sprite = new Spider(this.game, spider.x, spider.y);
    this.spiders.add(sprite);
  }, this);

  // spawn hero
  this.hero = new Hero(this.game, data.hero.x, data.hero.y);
  this.game.add.existing(this.hero);
};

PlayState._spawnPlatform = function (platform) {
  let sprite = this.platforms.create(
    platform.x, platform.y, platform.image);

  // physics for platform sprites
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.body.immovable = true;

  // spawn invisible walls at each side, only detectable by enemies
  this._spawnEnemyWall(platform.x, platform.y, 'left');
  this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnEnemyWall = function (x, y, side) {
  let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
  // anchor and y displacement
  sprite.anchor.set(side === 'left' ? 1 : 0, 1);
  // physic properties
  this.game.physics.enable(sprite);
  sprite.body.immovable = true;
  sprite.body.allowGravity = false;
};

PlayState._spawnCoin = function (coin) {
  let sprite = this.coins.create(coin.x, coin.y, 'coin');
  sprite.anchor.set(0.5, 0.5);

  // physics (so we can detect overlap with the hero)
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;

  // animations
  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
  sprite.animations.play('rotate');
};

PlayState._spawnKey = function (x, y) {
  this.key = this.bgDecoration.create(x, y, 'key');
  this.key.anchor.set(0.5, 0.5);
  // enable physics to detect collisions, so the hero can pick the key up
  this.game.physics.enable(this.key);
  this.key.body.allowGravity = false;

  // add a small 'up & down' animation via a tween
  this.key.y -= 3;
  this.game.add.tween(this.key)
    .to({ y: this.key.y + 6 }, 800, Phaser.Easing.Sinusoidal.InOut)
    .yoyo(true)
    .loop()
    .start();
};

PlayState._spawnDoor = function (x, y) {
  this.door = this.bgDecoration.create(x, y, 'door');
  this.door.anchor.setTo(0.5, 1);
  this.game.physics.enable(this.door);
  this.door.body.allowGravity = false;
};

PlayState._createHud = function () {
  const NUMBERS_STR = '0123456789X ';
  this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
    NUMBERS_STR, 6);

  this.keyIcon = this.game.make.image(0, 19, 'icon:key');
  this.keyIcon.anchor.set(0, 0.5);

  let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');
  let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
    coinIcon.height / 2, this.coinFont);
  coinScoreImg.anchor.set(0, 0.5);

  this.hud = this.game.add.group();
  this.hud.add(coinIcon);
  this.hud.add(coinScoreImg);
  this.hud.add(this.keyIcon);
  this.hud.position.set(10, 10);
};

module.exports = PlayState;