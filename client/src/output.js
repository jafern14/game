(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Enemy = function (startX, startY, endX, endY, _velocity) {
    Phaser.Sprite.call(this, game, startX, startY, "enemy");
    game.physics.arcade.enable(this);

    this.body.collideWorldBounds = true;

    this.body.sourceHeight = 100;
    this.body.sourceWidth = 100;

    
    this.velocity = _velocity;

    this.startPoint = new Phaser.Point(startX, startY);
    this.endPoint = new Phaser.Point(endX, endY); 
    this.moveToEnd = false;

    this.scale.set(.3,.3);
    this.anchor.x = .5;
    this.anchor.y = .5;
    this.rotation = Math.PI / 2;

    this.animations.add("walk");
    this.animations.play("walk", 6, true);

    //set bounding box
    this.body.collideWorldBounds = true;
    
    game.add.existing(this);
}

module.exports = Enemy;

Enemy.prototype = Object.create(Phaser.Sprite.prototype);

Enemy.prototype.update = function() {
    game.debug.body(this, "rgba(255,0,0,2)", false);
    this.move();
}

Enemy.prototype.move = function () {
    if (this.reachedDestination()) { 
        destination = null;

        if (this.moveToEnd) {
            this.moveToEnd = false;
            destination = this.startPoint;
        } 
        else {
            this.moveToEnd = true;
            destination = this.endPoint;
        }
        //rotate sprite to face the direction it will be moving
        this.rotation = game.physics.arcade.angleToXY(this.body, destination.x, destination.y);
        //move character to the point (player doesnt stop once it hits that point with this method - see checkLocation()) 
        game.physics.arcade.moveToXY(this, destination.x, destination.y, this.velocity);

    }
}

Enemy.prototype.reachedDestination = function () {
    if (this.moveToEnd) {
        if (this.position.x >= this.endPoint.x && this.position.y >= this.endPoint.y) {
            return true;   
        }
    }
    else {
        if (this.position.x <= this.startPoint.x && this.position.y <= this.startPoint.y) {
            return true;   
        }
    }
    return false;
}
},{}],2:[function(require,module,exports){
var MAX_VELOCITY = 150;

var Player = function (x, y) {
    Phaser.Sprite.call(this, game, x, y, "dude");
    game.physics.arcade.enable(this);

    //set bounding box
    this.body.collideWorldBounds = true;
    this.body.sourceHeight = 100;
    this.body.sourceWidth = 100;

    //initialize the "onclick" function
    game.input.onDown.add(this.move, this);

    //shrink character
    this.scale.set(.3,.3);

    //set the players position to the center of the sprite
    this.anchor.x = .5;
    this.anchor.y = .5;
    //turn character the other direction
    this.rotation = Math.PI ;

    //create this value for some null check
    this.destination;

    //add sprite to game
    game.add.existing(this);
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.update = function() {
    //display bounding box
    game.debug.body(this, "rgba(0,255,0,1)", false);

    //if player is moving this will tell it when to stop
    this.checkLocation();    
}

Player.prototype.move = function(pointer) {
    //players destination is written according to world view. (not camera)
    this.destination = new Phaser.Point(game.camera.x + pointer.x, game.camera.y + pointer.y);

    //rotate sprite to face the direction it will be moving
    this.rotation = game.physics.arcade.angleToXY(this.body, this.destination.x, this.destination.y) + Math.PI;

    //move character to the point (player doesnt stop once it hits that point with this method - see checkLocation()) 
    game.physics.arcade.moveToXY(this, game.camera.x + pointer.x, game.camera.y + pointer.y, MAX_VELOCITY);
}

Player.prototype.checkLocation = function() {
    //check contact with rock walls
    game.physics.arcade.overlap(this, level.blockLayer);

    //check contact with lava - add "die" callback if contact is made
    game.physics.arcade.overlap(this, level.deathLayer, this.die);     
    
    //if there is no contact, stop the character from moving after they've reached their destination
    //made it approximate destination because its unlikely it will end on that exact location
    if (this.destination != null) {
        //once it gets close enough to the x destination lower x velocity
        if (Math.abs(this.position.x - this.destination.x) < MAX_VELOCITY/100) {
            this.body.velocity.x = -(this.position.x - this.destination.x);
            
        }
        //once it gets close enough to the y destination lower y velocity
        if (Math.abs(this.position.y - this.destination.y) < MAX_VELOCITY/100) {
            this.body.velocity.y = -(this.position.y - this.destination.y);
        }
        //stop movement completely - destination has been reached.
        if (this.position.x == this.destination.x && this.position.y == this.destination.y) {
            this.destination == null;
        }
    }
}

},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
var SPAWN_POINT_X1 = 30;
var SPAWN_POINT_Y1 = 120;
var Player = require("../entities/player");
var Enemy = require("../entities/enemy");

var Level = function () {};

module.exports = Level;

Level.prototype.create = function() { 
	// initialize things
	level = this;
	this.initializeMap();
	game.physics.startSystem(Phaser.Physics.ARCADE);
	this.initializePlayer();
	this.initializeEnemies();
	this.initializeGameCamera();

	// setup keyboard input
	this.cursors = game.input.keyboard.createCursorKeys();
	game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.wasd = {
		'up' : game.input.keyboard.addKey(Phaser.Keyboard.W),
		'down' : game.input.keyboard.addKey(Phaser.Keyboard.S),
		'left' : game.input.keyboard.addKey(Phaser.Keyboard.A),
		'right' :game.input.keyboard.addKey(Phaser.Keyboard.D),
	}
	//on keyboard input toggle camera
	game.input.keyboard.onDownCallback = this.toggleCamera;
	// add player to keyboard context
	game.input.keyboard.player = this.player;

	
}

Level.prototype.initializeGameCamera = function () {
	//set camaera to follow character
	game.camera.following = true;
	game.camera.follow(this.player);
}

Level.prototype.toggleCamera = function() {
	//if spacebar was hit, toggle camera
	if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
		if (game.camera.following === true) {
			//unfollow
			game.camera.following = false;
			game.camera.unfollow();
		} else {
			//follow player
			game.camera.following = true;
			game.camera.follow(this.player);
		}	
	}	
}

Level.prototype.update = function() {
	//game camera updates
	this.moveGameCamera();
};

Level.prototype.render = function() {
	//Show game stats - fps, camera location, sprite location
	//game.debug.cameraInfo(game.camera, 32, 32);
	//game.debug.spriteCoords(this.enemy, 32, 500);
};

Level.prototype.initializeMap = function() {
	//read from tilemap "map"
	this.map = game.add.tilemap("map");
	//tileset = volcano-set (inside Lava-1.json, tiles is from preloaded image
	this.map.addTilesetImage("volcano-tileset", "tiles", 16, 16);

	//Create Ground Layer
	this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Ground"), game.width, game.height);
	game.world.addAt(this.groundLayer, 0);
	this.groundLayer.resizeWorld();		
	
	//Create Wall Layer, add collision tiles, eneable physics. 
	this.blockLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Wall"), game.width, game.height);
    game.world.addAt(this.blockLayer, 1);
    this.map.setCollision([160, 161, 189, 190, 191, 192, 220, 221, 222], true, "Wall");
	this.blockLayer.resizeWorld(); 
	game.physics.arcade.enable(this.blockLayer);

	//Create Death Layer, add collision tiles, enable physics.
	this.deathLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Lava"), game.width, game.height);
    game.world.addAt(this.deathLayer, 2);
    this.map.setCollision([121, 124, 152, 154, 184, 211, 213, 214, 400, 401, 402, 430, 431, 432, 460, 461, 462], true, "Lava");		
    this.deathLayer.resizeWorld();
    game.physics.arcade.enable(this.deathLayer);
};

Level.prototype.initializePlayer = function() {
	// create a new player at that spawn location.
	this.player = new Player(SPAWN_POINT_X1, SPAWN_POINT_Y1);
};

Level.prototype.initializeEnemies = function() {
	this.enemies = 
	[
		new Enemy(200, 200, 500, 300, 100),
		new Enemy(100, 200, 200, 350, 100),
		new Enemy(250, 150, 400, 300, 100),
		new Enemy(100, 200, 400, 300, 100)
	];
}


Level.prototype.moveGameCamera = function() {
	//check if camera is set to follow character
	if (game.camera.following == false) {
		// move camera
		if (this.wasd.up.isDown) {
			game.camera.y -= 4;
		}
		if (this.wasd.down.isDown) {
			game.camera.y += 4;
		}
		if (this.wasd.left.isDown) {
			game.camera.x -= 4;
		}
		if (this.wasd.right.isDown) {
			game.camera.x += 4;
		}
	}
};
 
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
};
},{"../entities/enemy":1,"../entities/player":2}],5:[function(require,module,exports){
var TextConfigurer = require("../util/text_configurer")

var Preloader = function() {};

module.exports = Preloader;

Preloader.prototype = {
	preload: function() {
		this.displayLoader();
		this.load.tilemap("map", "assets/map/Levels/Lava-2.json", null, Phaser.Tilemap.TILED_JSON);
		this.load.image("tiles", "assets/tiles/volcano-tileset.png");
		this.load.spritesheet("dude", "assets/textures/enemy.png");
		this.load.spritesheet("enemy", "assets/textures/zombie.png", 157, 102)

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
},{"../util/text_configurer":6}],6:[function(require,module,exports){
exports.configureText = function(text, color, size) {
	text.font = "Carter One";
	text.fill = color;
	text.fontSize = size;
}
},{}],7:[function(require,module,exports){
window.game = new Phaser.Game(608, 608, Phaser.AUTO, '');

startGame();

function startGame() {
	//initialize all the game states.
	game.state.add("Boot", require("./game/states/boot"));
	game.state.add("Preloader", require("./game/states/preloader"));
    game.state.add("Level", require("./game/states/level"));
	game.state.start("Boot");
};3
},{"./game/states/boot":3,"./game/states/level":4,"./game/states/preloader":5}]},{},[7]);
