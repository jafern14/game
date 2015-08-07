var Enemy = function (startX, startY, endX, endY, _velocity) {
    Phaser.Sprite.call(this, game, startX, startY, "enemy");
    game.physics.arcade.enable(this);

    this.body.collideWorldBounds = true;

    this.body.sourceHeight = 100;
    this.body.sourceWidth = 100;

    
    this.velocity = _velocity;

    this.startPoint = new Phaser.Point(startX, startY);
    this.endPoint = new Phaser.Point(endX, endY); 
    this.moveToEnd = false;

    this.scale.set(.3,.3);
    this.anchor.x = .5;
    this.anchor.y = .5;
    this.rotation = Math.PI / 2;

    this.animations.add("walk");
    this.animations.play("walk", 6, true);

    //set bounding box
    this.body.collideWorldBounds = true;
    
    game.add.existing(this);
}

module.exports = Enemy;

Enemy.prototype = Object.create(Phaser.Sprite.prototype);

Enemy.prototype.update = function() {
    game.debug.body(this, "rgba(255,0,0,2)", false);
    this.move();
}

Enemy.prototype.move = function () {
    if (this.reachedDestination()) { 
        destination = null;

        if (this.moveToEnd) {
            this.moveToEnd = false;
            destination = this.startPoint;
        } 
        else {
            this.moveToEnd = true;
            destination = this.endPoint;
        }
        //rotate sprite to face the direction it will be moving
        this.rotation = game.physics.arcade.angleToXY(this.body, destination.x, destination.y);
        //move character to the point (player doesnt stop once it hits that point with this method - see checkLocation()) 
        game.physics.arcade.moveToXY(this, destination.x, destination.y, this.velocity);

    }
}

Enemy.prototype.reachedDestination = function () {
    if (this.moveToEnd) {
        if (this.position.x >= this.endPoint.x && this.position.y >= this.endPoint.y) {
            return true;   
        }
    }
    else {
        if (this.position.x <= this.startPoint.x && this.position.y <= this.startPoint.y) {
            return true;   
        }
    }
    return false;
}