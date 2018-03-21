'use strict';

var HeroSelectState = {};

HeroSelectState.init = function () {
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        enter: Phaser.KeyCode.ENTER
    });
    this.selected = 'hero';
}

HeroSelectState.create = function () {
    this.game.stage.backgroundColor = "#000044";

    this.game.add.text(this.game.width / 2, 50, "#10 años <3", { font: "48px Arial", fill: "#ffffff" }).anchor.set(0.5);

    this.game.add.text(this.game.width / 2, 150, "Elige tu heroe", { font: "24px Arial", fill: "#ffffff" }).anchor.set(0.5);

    this.hero = this.game.add.sprite(this.game.width / 2 - 200, 300, 'hero_stopped');
    this.hero.scale.x += 2;
    this.hero.scale.y += 2;

    this.heroine = this.game.add.sprite(this.game.width / 2 + 100, 300, 'heroine_stopped');
    this.heroine.scale.x += 2;
    this.heroine.scale.y += 2;
    this.heroine.alpha = 0.5;
}

HeroSelectState.update = function () {
    if (this.keys.left.isDown) {
        if (this.selected === 'hero') {
            return
        }
        this.selected = 'hero'
        this.hero.alpha = 1
        this.heroine.alpha = 0.5
    } else if (this.keys.right.isDown) {
        if (this.selected === 'heroine') {
            return
        }
        this.selected = 'heroine'
        this.hero.alpha = 0.5
        this.heroine.alpha = 1
    } else if (this.keys.enter.isDown) {
        this.game.state.start('play', true, false, { level: 100, heroSelected: this.selected });
    }

}

module.exports = HeroSelectState;