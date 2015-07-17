var SPAWN_POINT_X = 150;
var SPAWN_POINT_Y = 175;

var Player = function () {
	this.player = game.add.sprite(SPAWN_POINT_X, SPAWN_POINT_Y, "dude");
    this.player.anchor.x = .5;
    this.player.anchor.y = .5;
    this.player.rotation = 3 * Math.PI / 2;
	
    game.physics.arcade.enable(this.player);

    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);

    this.direction = new Phaser.Point(SPAWN_POINT_X, SPAWN_POINT_Y);
    
    game.input.onDown.add(this.direct, this);
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.update = function() {
    //this.move();
}

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