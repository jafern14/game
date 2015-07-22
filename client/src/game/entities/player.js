var SPAWN_POINT_X = 30;
var SPAWN_POINT_Y = 30;

var Player = function () {
    Phaser.Sprite.call(this, game, SPAWN_POINT_X, SPAWN_POINT_Y, "dude")
    //this.player = game.add.sprite(SPAWN_POINT_X, SPAWN_POINT_Y, "dude");
    this.scale.set(.3,.3);

    this.anchor.x = .5;
    this.anchor.y = .5;
    this.rotation = 3 * Math.PI / 2;
   


    game.physics.enable(this, Phaser.Physics.ARCADE);
    game.input.onDown.add(this.direct, this);

    game.add.existing(this);
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);


Player.prototype.update = function() {
    game.physics.arcade.collide(this, level.blockLayer);

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

/*var tween;  
Player.prototype.move = function() {
    if (this.position.x != this.direction.x && this.position.y != this.direction.y) {
        var pointer = this.direction;

        if (tween && tween.isRunning) {
            tween.stop();
        }

        this.rotation = game.physics.arcade.angleToPointer(this.player) + Math.PI;
        var duration = (game.physics.arcade.distanceToPointer(this) / 200) * 1000;
        tween = game.add.tween(this).to({ x: pointer.x, y: pointer.y }, duration, Phaser.Easing.Linear.None, true);       
   
    } 
}*/

Player.prototype.move = function() {
    if (this.position.x != this.direction.x && this.position.y != this.direction.y) {
        game.physics.arcade.collide(this, level.blockLayer);
        this.rotation = game.physics.arcade.angleToPointer(this) + Math.PI;
        //game.physics.arcade.moveToXY(this, this.direction.x, this.direction.y, 200)
    }
}

Player.prototype.direct = function(mouse) {
    this.direction = new Phaser.Point(mouse.clientX, mouse.clientY);
    this.move();
}