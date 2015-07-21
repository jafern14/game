(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
var Player = require("../entities/player")

var Level = function () {};

module.exports = Level;

Level.prototype = {
	create: function() {
		level = this;
		this.initializeMap();
		this.initializePlayer();
		game.physics.startSystem(Phaser.Physics.ARCADE);
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

	    this.map.setCollision([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28], true, "Block");
		this.blockLayer.resizeWorld(); 

		game.physics.arcade.enable(this.blockLayer);
	},

	initializePlayer : function () {
		this.player = new Player();
	}
};
},{"../entities/player":1}],4:[function(require,module,exports){
var TextConfigurer = require("../util/text_configurer")

var Preloader = function() {};

module.exports = Preloader;

Preloader.prototype = {
	preload: function() {
		this.displayLoader();

		this.load.tilemap("map", "assets/map/map2.json", null, Phaser.Tilemap.TILED_JSON);
		this.load.image("tiles", "assets/tiles/tileset.png");
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
