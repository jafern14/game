var Player = require("../entities/player")

var Level = function () {};

module.exports = Level;

Level.prototype = {
	create: function() {
		this.initializeMap();
		this.initializePlayer();	
	},

	update: function() {

//		console.log(player)
		this.player.update();
	},

	initializeMap: function() {	
		this.map = game.add.tilemap("map");

		this.map.addTilesetImage("tmw_desert_spacing", "tiles", 32, 32);
		this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Tile Layer 1"), 600, 600);
		game.world.addAt(this.groundLayer, 0);
		this.groundLayer.resizeWorld();		 
	},

	initializePlayer : function () {
		this.player = new Player(100, 100);
	}
};