
var Player = function (x, y) {
	console.log("creating a player " + x  + " " + y);
	
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);