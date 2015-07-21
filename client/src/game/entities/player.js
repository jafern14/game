var SPAWN_POINT_X = 100;
var SPAWN_POINT_Y = 100;

var Player = function (x, y) {
	player = game.add.sprite(SPAWN_POINT_X, SPAWN_POINT_Y, "dude");
	game.physics.arcade.enable(player);

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    this.velocityX = 150;
    this.veloictyY = 150;

    this.targetX = SPAWN_POINT_X;
    this.targetY = SPAWN_POINT_Y;

    game.input.onDown.add(this.direct, this);
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);


var tween;  
Player.prototype.move = function() {

    var pointer = this.direction;

    if (tween && tween.isRunning)
    {
        tween.stop();
    }


    this.player.rotation = game.physics.arcade.angleToPointer(this.player) + Math.PI;

    var duration = (game.physics.arcade.distanceToPointer(this.player) / 150) * 1000;
    tween = game.add.tween(this.player).to({ x: pointer.x, y: pointer.y }, duration, Phaser.Easing.Linear.None, true);

}

Player.prototype.direct = function(mouse) {
    this.direction = new Phaser.Point(mouse.clientX, mouse.clientY);

    this.move();
}