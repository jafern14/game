var SPAWN_POINT_X = 100;
var SPAWN_POINT_Y = 100;

var Player = function (x, y) {
	player = game.add.sprite(SPAWN_POINT_X, SPAWN_POINT_Y, "dude");
	game.physics.arcade.enable(player);

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    this.velocityX = 150;
    this.veloictyY = 150;

    this.directionQueue = [];


    game.input.onDown.add(this.direct, this);
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.update = function() {
    this.move();
}

Player.prototype.move = function() {
    if (this.directionQueue.length > 0) {
        direction = this.directionQueue[0];        

        //if Player is at point
        if (player.position.x == direction.x && player.position.y == direction.y) {
            // Remove from queue
            this.directionQueue = this.directionQueue.slice(1, this.directionQueue.length - 1);
        }
    }
}

Player.prototype.direct = function(mouse) {
    if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
        this.directionQueue.push(new Phaser.Point(mouse.clientX, mouse.clientY))
    }
    else {
        this.directionQueue = [new Phaser.Point(mouse.clientX, mouse.clientY)]
    }

    console.log(this.directionQueue[0] + " " +  player.position);
}