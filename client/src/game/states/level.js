var Player = require("../entities/player")

var Level = function () {};

module.exports = Level;

Level.prototype = {
	create: function() {
		this.initializeMap();
		this.initializePlayer();	
	},

	update: function() {
		this.player.update();
	},

	initializeMap: function() {	
		this.map = game.add.tilemap("map");

		this.map.addTilesetImage("tileset", "tiles", 32, 32);
		this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Ground"), 600, 600);
		game.world.addAt(this.groundLayer, 0);

		/*
		this.blockLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Block"), 600, 600);
	    game.world.addAt(this.blockLayer, 1);

	    this.map.setCollision([1,2,3,9,10,11], true, "Block");
		*/


		this.groundLayer.resizeWorld();		
		//this.blockLayer.resizeWorld(); 
	},

	initializePlayer : function () {
		this.player = new Player();
	}
};