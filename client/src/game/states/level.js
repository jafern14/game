var Level = function () {};

module.exports = Level;

Level.prototype = {
	create: function() {

		this.initializeMap();
	},

	initializeMap: function() {	
		this.map = game.add.tilemap("map");

		this.map.addTilesetImage("Desert", "Ground", 32, 32);
		this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Ground"), 1200, 1200);
		game.world.addAt(this.groundLayer, 0);
		this.groundLayer.resizeWorld();
	}
};