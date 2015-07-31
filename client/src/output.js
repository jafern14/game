(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MAX_VELOCITY = 150;

var Player = function (x, y) {
    Phaser.Sprite.call(this, game, x, y, "dude");
    game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.body.sourceHeight = 100;
    this.body.sourceWidth = 100;

    game.input.onDown.add(this.move, this);

    this.scale.set(.3,.3);

    this.anchor.x = .5;
    this.anchor.y = .5;
    this.rotation = 3 * Math.PI / 2;

    this.destination;
    game.add.existing(this);
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.update = function() {
    game.debug.body(this, "rgba(0,255,0,1)", false);
    this.checkLocation();    
}

Player.prototype.move = function(pointer) {
    this.destination = new Phaser.Point(pointer.x, pointer.y);
    this.rotation = game.physics.arcade.angleToPointer(this.body, pointer) + Math.PI;
    game.physics.arcade.moveToXY(this, pointer.x, pointer.y, MAX_VELOCITY);
}

Player.prototype.checkLocation = function() {
    game.physics.arcade.overlap(this, level.blockLayer);
    game.physics.arcade.overlap(this, level.deathLayer, this.die);     
    
    if (this.destination != null) {
        if (Math.abs(this.position.x - this.destination.x) < MAX_VELOCITY/100) {
            this.body.velocity.x = -(this.position.x - this.destination.x);
            
        }
        if (Math.abs(this.position.y - this.destination.y) < MAX_VELOCITY/100) {
            this.body.velocity.y = -(this.position.y - this.destination.y);
        }

        if (this.position.x == this.destination.x && this.position.y == this.destination.y) {
            this.destination == null;
        }
    }
}

},{}],2:[function(require,module,exports){
var Boot = function() {};

module.exports = Boot;

Boot.prototype = {
	create: function() {
		game.stage.disableVisibilityChange = true;
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
var SPAWN_POINT_X1 = 30;
var SPAWN_POINT_Y1 = 120;
var Player = require("../entities/player")
//var Camera = require("../entities/camera")

var Level = function () {};

module.exports = Level;

Level.prototype.create  = function() { 
		level = this;
		this.initializeMap();
		game.physics.startSystem(Phaser.Physics.ARCADE);
		this.initializePlayer();
		this.initializeCamera(this.player);
		game.camera.follow(this.player);	
}

Level.prototype.update = function() {
	this.player.update();
}

Level.prototype.render = function() {
	//game.debug.cameraInfo(game.camera, 32, 32);
	//game.debug.spriteCoords(this.player, 32, 500);
}

Level.prototype.initializeMap = function() {
	this.map = game.add.tilemap("map");

	this.map.addTilesetImage("volcano-tileset", "tiles", 16, 16);

	this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Ground"), game.width, game.height);
	game.world.addAt(this.groundLayer, 0);
	this.groundLayer.resizeWorld();		
	
	this.blockLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Wall"), game.width, game.height);
    game.world.addAt(this.blockLayer, 1);
    this.map.setCollision([160, 161, 189, 190, 191, 192, 220, 221, 222], true, "Wall");
	this.blockLayer.resizeWorld(); 
	game.physics.arcade.enable(this.blockLayer);

	this.deathLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Lava"), game.width, game.height);
    game.world.addAt(this.deathLayer, 2);
    this.map.setCollision([121, 124, 152, 154, 184, 211, 213, 214, 400, 401, 402, 430, 431, 432, 460, 461, 462], true, "Lava");		
    this.deathLayer.resizeWorld();
    game.physics.arcade.enable(this.deathLayer);
}

Level.prototype.initializePlayer = function() {
	this.player = new Player(SPAWN_POINT_X1, SPAWN_POINT_Y1);
}

Level.prototype.initializeCamera = function (target) {
	//this.camera = new Phaser.Camera(game, 1, SPAWN_POINT_X1, SPAWN_POINT_Y1, 1, 1);
	//this.camera.follow(target, 1);
}
 
Level.prototype.findAllTiles = function() {
	var a = [191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 221, 221, 221, 221, 221, 221, 221, 191, 191, 191, 191, 191, 221, 221, 221, 221, 221, 221, 221, 221, 221, 221, 221, 221, 221, 221, 221, 221, 221, 221, 191, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 220, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 220, 221, 221, 221, 222, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 220, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 191, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 161, 161, 191, 191, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 161, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 190, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 190, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 221, 221, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 220, 191, 191, 191, 191, 191, 191, 191, 191, 191, 221, 221, 221, 221, 221, 222, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 220, 221, 191, 191, 191, 191, 221, 221, 222, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 220, 221, 221, 222, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	    var m = {};
	    for ( i = 0; i < a.length; i++) {
	    	if 	(a[i] != 0) {
	    		if (m[a[i]] != null ) {
	    			m[a[i]] ++;
	    		}
	    		else {
	    			m[a[i]] = 1;
	    		} 
	    	}
	    }
	    console.log(m);
}
},{"../entities/player":1}],4:[function(require,module,exports){
var TextConfigurer = require("../util/text_configurer")

var Preloader = function() {};

module.exports = Preloader;

Preloader.prototype = {
	preload: function() {
		this.displayLoader();

		this.load.tilemap("map", "assets/map/Lava-1.json", null, Phaser.Tilemap.TILED_JSON);
		this.load.image("tiles", "assets/tiles/volcano-tileset.png");
		this.load.spritesheet("dude", "assets/textures/enemy.png");

		cursors = game.input.keyboard.createCursorKeys();
		mouse = game.input.mouse;
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
window.game = new Phaser.Game(608, 608, Phaser.AUTO, '');

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
