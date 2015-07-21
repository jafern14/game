var SPAWN_POINT_X = 150;
var SPAWN_POINT_Y = 175;

var Player = function () {
    this.player = game.add.sprite(SPAWN_POINT_X, SPAWN_POINT_Y, "dude");
    this.player.scale.set(.4,.4);

    this.player.anchor.x = .5;
    this.player.anchor.y = .5;
    this.player.rotation = 3 * Math.PI / 2;
   
    game.physics.arcade.enable(this.player);

    game.physics.arcade.collide(this, level.blockLayer);
    game.input.onDown.add(this.direct, this);
}
module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);


var tween;  
Player.prototype.move = function() {
    if (this.player.position.x != this.direction.x && this.player.position.y != this.direction.y){
        var pointer = this.direction;

        if (tween && tween.isRunning)
        {
            tween.stop();
        }

        this.player.rotation = game.physics.arcade.angleToPointer(this.player) + Math.PI;

        var duration = (game.physics.arcade.distanceToPointer(this.player) / 200) * 1000;
        tween = game.add.tween(this.player).to({ x: pointer.x, y: pointer.y }, duration, Phaser.Easing.Linear.None, true);       
    }
}

Player.prototype.direct = function(mouse) {
    this.direction = new Phaser.Point(mouse.clientX, mouse.clientY);
    this.move();
}