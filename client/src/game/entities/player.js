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

Player.prototype.update = function() {

	player.body.velocity.x = 0;
    player.body.velocity.y = 0;
        
	if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else if (cursors.down.isDown)
    {
        //  Move to the right
        player.body.velocity.y = 150;

        //player.animations.play('right');
    }
    else if (cursors.up.isDown)
    {
        //  Move to the right
        player.body.velocity.y = -150;

        //player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();
        player.frame = 4;
    }
}

Player.prototype.direct = function(mouse) {
   
    this.targetX = mouse.clientX;
    this.targetY = mouse.clientY;
}