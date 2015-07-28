var Player = require("../entities/player")

var Level = function () {};

module.exports = Level;

Level.prototype = {
	create: function() {
		level = this;
		this.initializeMap();
		game.physics.startSystem(Phaser.Physics.ARCADE);
		this.initializePlayer();
	},

	update: function() {
		this.player.update();
	},

	initializeMap: function() {	
		this.map = game.add.tilemap("map");

		this.map.addTilesetImage("tiles", "tiles", 32, 32);

		this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Ground"), game.width, game.height);
		game.world.addAt(this.groundLayer, 0);

		this.groundLayer.resizeWorld();		
		
		
		this.blockLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Block"), game.width, game.height);
	    game.world.addAt(this.blockLayer, 1);

	    this.map.setCollision([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28], true, "Block");
		this.blockLayer.resizeWorld(); 

		game.physics.arcade.enable(this.blockLayer);
	},

	initializePlayer : function () {
		this.player = new Player();
	}
};