var Preloader = function(game) {
    this.asset = null;
    this.ready = false;
};

var TextConfigurer = require("../util/text_configurer");

module.exports = Preloader;

Preloader.prototype = {

    preload: function() {
        this.displayLoader();
        this.load.tilemap("map", "assets/levels/level-1/level-1-map.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.image("tiles", "assets/tiles/volcano-tileset.png");
        this.load.spritesheet("dude", "assets/textures/enemy.png");
        this.load.spritesheet("enemy", "assets/textures/zombie.png", 157, 102);
        game.loadSprites = require("../../assets/levels/level-1/level-1-sprites.json");

        cursors = game.input.keyboard.createCursorKeys();
        mouse = game.input.mouse;
        /* 
       this.asset = this.add.sprite(320, 240, 'preloader');
       this.asset.anchor.setTo(0.5, 0.5);
   
       this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
       this.load.setPreloadSprite(this.asset);
       this.load.image('testsprite', 'assets/test.png');
       */
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
    },
/*
    create: function() {
        this.asset.cropEnabled = false;
    },
*/
    update: function() {
        if (!!this.ready) {
            this.game.state.start('Menu');
        }
    },

    onLoadComplete: function() {
        this.ready = true;
    }
};


/*
var TextConfigurer = require("../util/text_configurer")

var Preloader = function() {};

module.exports = Preloader;

Preloader.prototype = {
	preload: function() {
		this.displayLoader();
		this.load.tilemap("map", "assets/map/Levels/Multi-1/Multi-1-map.json", null, Phaser.Tilemap.TILED_JSON);
		this.load.image("tiles", "assets/tiles/volcano-tileset.png");
		this.load.spritesheet("dude", "assets/textures/enemy.png");
		this.load.spritesheet("enemy", "assets/textures/zombie.png", 157, 102);
		game.loadSprites = require("../../../assets/map/Levels/Multi-1/multi-1.json");

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
*/