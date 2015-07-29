var Camera = function (x, y) {
    this = new Phaser.Camera(game, x, y, 100, 100);
}

module.exports = Camera;

Camera.prototype = Object.create(Phaser.Camera.prototype);