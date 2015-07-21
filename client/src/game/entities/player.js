var SPAWN_POINT_X = 30;
var SPAWN_POINT_Y = 30;

var Player = function () {
    this.player = game.add.sprite(SPAWN_POINT_X, SPAWN_POINT_Y, "dude");
    this.player.scale.set(.3,.3);

    this.player.anchor.x = .5;
    this.player.anchor.y = .5;
    this.player.rotation = 3 * Math.PI / 2;
   

    game.physics.arcade.enable(this.player);
    game.input.onDown.add(this.direct, this);

    this.player.body.collideWorldBounds = true;
}
module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);


Player.prototype.update = function() {

    
    game.physics.arcade.collide(this, level.blockLayer);

    this.player.body.velocity.x = 0;


    if (cursors.left.isDown)
    {
        //  Move to the left
        this.player.body.velocity.x = -150;
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        this.player.body.velocity.x = 150;
    }
    else if (cursors.down.isDown)
    {
        //  Move to the right
        this.player.body.velocity.y = 150;
    }
    else if (cursors.up.isDown)
    {
        //  Move to the right
        this.player.body.velocity.y = -150;
    }
    else {
         this.player.body.velocity.y = 0;
         this.player.body.velocity.x = 0;
    }

}

/*var tween;  
Player.prototype.move = function() {
    if (this.player.position.x != this.direction.x && this.player.position.y != this.direction.y) {
        var pointer = this.direction;

        if (tween && tween.isRunning) {
            tween.stop();
        }

        this.player.rotation = game.physics.arcade.angleToPointer(this.player) + Math.PI;
        var duration = (game.physics.arcade.distanceToPointer(this.player) / 200) * 1000;
        tween = game.add.tween(this.player).to({ x: pointer.x, y: pointer.y }, duration, Phaser.Easing.Linear.None, true);       
   
} }*/

/*Player.prototype.move = function() {
    if (this.player.position.x != this.direction.x && this.player.position.y != this.direction.y) {
        this.player.rotation = game.physics.arcade.angleToPointer(this.player) + Math.PI;
        game.physics.arcade.moveToXY(this.player, this.direction.x, this.direction.y, 200)
    }
}*/

Player.prototype.direct = function(mouse) {
    this.direction = new Phaser.Point(mouse.clientX, mouse.clientY);
    //this.move();
}