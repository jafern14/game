var SPAWN_POINT_X = 30;
var SPAWN_POINT_Y = 30;

var Player = function () {
    Phaser.Sprite.call(this, game, SPAWN_POINT_X, SPAWN_POINT_Y, "dude");
    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.fixedRotation = true;
    game.input.onDown.add(this.move, this);

    this.scale.set(.3,.3);

    this.anchor.x = .5;
    this.anchor.y = .5;
    this.rotation = 3 * Math.PI / 2;

    this.tween;
    game.add.existing(this);
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.update = function() {
    game.debug.body(this, "rgba(0,255,0,1)", false);
    //game.debug.body(level.blockLayer);
    //game.physics.arcade.collide(this, level.blockLayer);
    game.physics.arcade.overlap(this, level.blockLayer, this.die);
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;


    if (cursors.left.isDown)
    {
        //  Move to the left
        this.body.velocity.x = -150;
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        this.body.velocity.x = 150;
    }
    else if (cursors.down.isDown)
    {
        //  Move to the right
        this.body.velocity.y = 150;
    }
    else if (cursors.up.isDown)
    {
        //  Move to the right
        this.body.velocity.y = -150;
    }
    else {
        this.body.velocity.y = 0;
        this.body.velocity.x = 0;
    }
}

Player.prototype.move = function(pointer) {

    if (this.position.x != pointer.x && this.position.y != pointer.y) {

        if (this.tween && this.tween.isRunning) {
            this.tween.stop();
        }

        this.rotation = game.physics.arcade.angleToPointer(this) + Math.PI;
        var duration = (game.physics.arcade.distanceToPointer(this) / 200) * 1000;
        tween = game.add.tween(this).to({ x: pointer.x, y: pointer.y }, duration, Phaser.Easing.Linear.None, true);
    } 
}


Player.prototype.die = function () {
    console.log("overlap detected");
}