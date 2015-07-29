var SPAWN_POINT_X = 30;
var SPAWN_POINT_Y = 120;
var MAX_VELOCITY = 150;

var Player = function () {
    Phaser.Sprite.call(this, game, SPAWN_POINT_X, SPAWN_POINT_Y, "dude");
    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.sourceHeight = 100;
    this.body.sourceWidth = 100;

    game.input.onDown.add(this.move, this);

    this.scale.set(.3,.3);

    this.anchor.x = .5;
    this.anchor.y = .5;
    this.rotation = 3 * Math.PI / 2;

    this.destination;
    game.add.existing(this);
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.destroy = function() {
    this.body.destroy();
}

Player.prototype.update = function() {
    game.debug.body(this, "rgba(0,255,0,1)", false);
    this.checkLocation();    
}

Player.prototype.move = function(pointer) {
    this.destination = new Phaser.Point(pointer.x, pointer.y);
    this.rotation = game.physics.arcade.angleToPointer(this.body, pointer) + Math.PI;
    game.physics.arcade.moveToXY(this, pointer.x, pointer.y, MAX_VELOCITY);
}

Player.prototype.checkLocation = function() {
    game.physics.arcade.overlap(this, level.blockLayer);
    game.physics.arcade.overlap(this, level.deathLayer, this.die);     
    
    if (this.destination != null) {
        if (Math.abs(this.position.x - this.destination.x) < MAX_VELOCITY/50) {
            this.body.velocity.x = -(this.position.x - this.destination.x);
            
        }
        if (Math.abs(this.position.y - this.destination.y) < MAX_VELOCITY/50) {
            this.body.velocity.y = -(this.position.y - this.destination.y);
        }

        if (this.position.x == this.destination.x && this.position.y == this.destination.y) {
            this.destination == null;
        }
    }
}
