(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Player = function (x, y) {
	console.log("creating a player " + x  + " " + y);
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);
},{}],2:[function(require,module,exports){
var Boot = function() {};

module.exports = Boot;

Boot.prototype = {
	create: function() {
		if (game.device.desktop) {
			game.stage.scale.pageAlignHorizontally = true;
		}
		else {
			alert("Desktop game only")
		}

		game.state.start("Preloader");
	}
}
},{}],3:[function(require,module,exports){
var Player = require("../entities/player")

var Level = function () {};

module.exports = Level;

Level.prototype = {
	create: function() {

		this.initializeMap();
		this.initializePlayer();	
	},

	initializeMap: function() {	
		this.map = game.add.tilemap("map");

		this.map.addTilesetImage("tmw_desert_spacing", "tiles", 32, 32);
		this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Tile Layer 1"), 600, 600);
		game.world.addAt(this.groundLayer, 0);
		this.groundLayer.resizeWorld();		 
	},

	initializePlayer : function () {
		player = new Player(100, 100);
	}
};
},{"../entities/player":1}],4:[function(require,module,exports){
var TextConfigurer = require("../util/text_configurer")

var Preloader = function() {};

module.exports = Preloader;

Preloader.prototype = {
	preload: function() {
		this.displayLoader();

		this.load.tilemap("map", "assets/map/map.json", null, Phaser.Tilemap.TILED_JSON);
		this.load.image("tiles", "assets/tiles/tileset.png");
	},

	displayLoader: function() {
		this.text = game.add.text(game.camera.width / 2, 250, "Loading... ");
    	this.text.anchor.setTo(.5, .5);
		TextConfigurer.configureText(this.text, "white", 32);

    	this.load.onFileComplete.add(function(progress) {
	        this.text.setText("Loading... " + progress + "%");
	    }, this);

    	this.load.onLoadComplete.add(function() {
			game.state.start("Level");
	    });
	}
} 
},{"../util/text_configurer":5}],5:[function(require,module,exports){
exports.configureText = function(text, color, size) {
	text.font = "Carter One";
	text.fill = color;
	text.fontSize = size;
}
},{}],6:[function(require,module,exports){
window.game = new Phaser.Game(600, 600, Phaser.AUTO, '');

startGame();

function startGame() {
	// socket = io("http://localhost:8000");
	
	game.state.add("Boot", require("./game/states/boot"));
	game.state.add("Preloader", require("./game/states/preloader"));
    game.state.add("Level", require("./game/states/level"));
	game.state.start("Boot");


    /*require("./game/mods/phaser_enhancements");

	game.state.add("TitleScreen", require("./game/states/title_screen"));
	game.state.add("Lobby", require("./game/states/lobby"));
	game.state.add("StageSelect", require("./game/states/stage_select"));
	game.state.add("PendingGame", require("./game/states/pending_game"));
	
	game.state.add("GameOver", require("./game/states/game_over"));

	game.state.start('Boot');*/
};
},{"./game/states/boot":2,"./game/states/level":3,"./game/states/preloader":4}]},{},[6]);
