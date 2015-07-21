var Player = require("../entities/player")

var Level = function () {};

module.exports = Level;

Level.prototype = {
	create: function() {
		level = this;
		this.initializeMap();
		this.initializePlayer();
	},

	update: function() {
		this.player.update();
	},

	initializeMap: function() {	
		this.map = game.add.tilemap("map");

		this.map.addTilesetImage("tiles", "tiles", 32, 32);
		this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Ground"), 600, 600);
		game.world.addAt(this.groundLayer, 0);

		this.groundLayer.resizeWorld();		
		
		
		this.blockLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Block"), 600, 600);
	    game.world.addAt(this.blockLayer, 1);

	    this.map.setCollision([1,2,3,9,10,11,28], true, "Block");
		


		this.blockLayer.resizeWorld(); 
	},

	initializePlayer : function () {
		this.player = new Player();
	}
};