(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
	"zombies" : [
		{
			"position" : [
				{"x" : 250, "y" : 200},
				{"x" : 250, "y" : 250}
			],
			"speed" : 100
		},
		{
			"position" : [
				{"x" : 300, "y" : 300},
				{"x" : 350, "y" : 300},
				{"x" : 325, "y" : 100}
			],
			"speed" : 150
		}
	],
	"checkpoints" : [
		{
			"spawnpoints" : [
				{"x": 80, "y": 75},
				{"x": 80, "y": 155},
				{"x": 80, "y": 235},
				{"x": 80, "y": 315}
			],
			"dimensions" : {"x0" : 0, "width" : 10, "y0" : 0, "height" : 10}
		},
		{
			"spawnpoints" : [
				{"x": 0, "y": 0},
				{"x": 0, "y": 1},
				{"x": 0, "y": 2},
				{"x": 0, "y": 3}
			],
			"dimensions" : {"x0" : 10, "width" : 10, "y0" : 10, "height" : 10}
		}
	]
}

},{}],2:[function(require,module,exports){
var Checkpoint = function (x, y, width, height, activated, order, finalCheckpoint) {
    Phaser.Sprite.call(this, game, x, y, null);
	game.physics.enable(this, Phaser.Physics.ARCADE);
	this.body.setSize(width, height, 0, 0);

	this.finalCheckpoint = finalCheckpoint;
    this.order = order;
    this.activated = activated;
    //add sprite to game
    game.debug.geom(this ,'rbga(0, 0, 255, 1)', false);
}

module.exports = Checkpoint;

Checkpoint.prototype = Object.create(Phaser.Sprite.prototype);

Checkpoint.prototype.update = function() {
    //game.debug.body(this, "rbga(0, 0, 255, 1)", false);
}

},{}],3:[function(require,module,exports){
var Enemy = function (_positions, _velocity) {
    this.positions = _positions;
    this.counter = 0;

    Phaser.Sprite.call(this, game, this.positions[0].x, this.positions[0].y, "enemy");
    game.physics.arcade.enable(this);

    this.body.collideWorldBounds = true;
    this.body.sourceHeight = 100;
    this.body.sourceWidth = 100;

    this.max_velocity = _velocity;
    this.destination = null;    
    
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
    //game.debug.body(this, "rgba(255,0,0,2)", false);
    this.move();
}

Enemy.prototype.move = function () {
    if (this.destination == null) {
        //console.log(this.positions[this.counter%this.positions.size].x);
        this.destination = new Phaser.Point(this.positions[this.counter%this.positions.length].x, this.positions[this.counter%this.positions.length].y);
    
        //rotate sprite to face the direction it will be moving
        this.rotation = game.physics.arcade.angleToXY(this.body, this.destination.x, this.destination.y);

        //move character to the point (player doesnt stop once it hits that point with this method - see checkLocation()) 
        game.physics.arcade.moveToXY(this, this.positions[this.counter%this.positions.length].x, this.positions[this.counter%this.positions.length].y, this.max_velocity);

        this.counter ++;
    } 
    this.checkLocation();
}

Enemy.prototype.checkLocation = function() {
    //if there is no contact, stop the character from moving after they've reached their destination
    //made it approximate destination because its unlikely it will end on that exact location
    if (this.destination != null) {
        //once it gets close enough to the x destination lower x velocity
        if (Math.abs(this.position.x - this.destination.x) < this.max_velocity/100) {
            this.body.velocity.x = -(this.position.x - this.destination.x);    
        }
        //once it gets close enough to the y destination lower y velocity
        if (Math.abs(this.position.y - this.destination.y) < this.max_velocity/100) {
            this.body.velocity.y = -(this.position.y - this.destination.y);
        }
        //stop movement completely - destination has been reached.
        if (Math.abs(this.position.x - this.destination.x) < 5 && Math.abs(this.position.y - this.destination.y) < 5) {
            this.destination = null;
        }
    }
}

},{}],4:[function(require,module,exports){
var MAX_VELOCITY = 150;
var TextConfigurer = require("../util/text_configurer")

var Player = function (x, y) {
    this.id = game.grannyCounter++;
    Phaser.Sprite.call(this, game, x, y, "granny");
    game.physics.arcade.enable(this);

    // set bounding box
    this.body.collideWorldBounds = true;
    this.body.sourceHeight = 80;
    this.body.sourceWidth = 80;
    
    // shrink character
    this.scale.set(.3,.3);

    // set the players position to the center of the sprite
    this.anchor.x = .45;
    this.anchor.y = .55;
    // turn character the other direction
    this.rotation = Math.PI ;

    // create this value for some null check
    this.destination;

    // add sprite to game
    game.add.existing(this);

    console.log(level)
}

module.exports = Player;

Player.prototype = Object.create(Phaser.Sprite.prototype);

Player.prototype.update = function() {
    // display bounding box
    // game.debug.body(this, "rgba(0,255,0,100)", false);

    // if player is moving this will tell it when to stop
    this.checkLocation();    
};

Player.prototype.move = function(pointer) {
    // players destination is written according to world view. (not camera)
    this.destination = new Phaser.Point(game.camera.x + pointer.x, game.camera.y + pointer.y);

    // rotate sprite to face the direction it will be moving
    this.rotation = game.physics.arcade.angleToXY(this.body, this.destination.x, this.destination.y) + Math.PI;

    // move character to the point (player doesnt stop once it hits that point with this method - see checkLocation()) 
    game.physics.arcade.moveToXY(this, game.camera.x + pointer.x, game.camera.y + pointer.y, MAX_VELOCITY);
};

Player.prototype.checkLocation = function(c) {
    // check contact with rock walls
    game.physics.arcade.overlap(this, level.blockLayer);

    granny = this;
    // check contact with lava - add "die" callback if contact is made
    game.physics.arcade.overlap(this, level.deathLayer,
        function() {
            level.killGranny(granny)
        });

    // check for contact with enemies
    for (i = 0; i < level.enemies.length; i++) {
        game.physics.arcade.overlap(this, level.enemies[i], function() {
            level.killGranny(granny)
        });    
    }

    // check for contact with checkpoints
    for (i = 0; i < level.checkpoints.length; i++) {
        game.physics.arcade.overlap(this, level.checkpoints[i], function() { 
            if (level.checkpoints[i].activated == false) {
                if (!level.checkpoints[i].finalCheckpoint) {
                    if (this.checkpointText != null) {
                        this.checkpointText.destroy(); 
                    }
                    this.checkpointText = game.add.text(230, 10, "Checkpoint Reached!");
                    TextConfigurer.configureText(this.checkpointText, "white", 24);
                    this.checkpointText.fixedToCamera = true;

                    game.time.events.add(2000, function() {
                        game.add.tween(this.checkpointText).to({y: 0}, 1500, Phaser.Easing.Linear.None, true);
                        game.add.tween(this.checkpointText).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
                    }, this);
                }
                else {
                    if (this.winText != null) {
                        this.winText.destroy(); 
                    }
                    this.winText = game.add.text(230, 250, "You Win!");
                    TextConfigurer.configureText(this.winText, "white", 48);
                    this.winText.fixedToCamera = true;

                    game.time.events.add(5000, function() {
                        game.state.start("Level");
                    }, this);
                }
                level.checkpoints[i].activated = true;
            }   
        });
    }  

    // if there is no contact, stop the character from moving after they've reached their destination
    // made it approximate destination because its unlikely it will end on that exact location
    if (this.destination != null) {
        // once it gets close enough to the x destination lower x velocity
        if (Math.abs(this.position.x - this.destination.x) < MAX_VELOCITY/100) {
            this.body.velocity.x = -(this.position.x - this.destination.x);    
        }
        // once it gets close enough to the y destination lower y velocity
        if (Math.abs(this.position.y - this.destination.y) < MAX_VELOCITY/100) {
            this.body.velocity.y = -(this.position.y - this.destination.y);
        }
        // stop movement completely - destination has been reached.
        if (this.position.x == this.destination.x && this.position.y == this.destination.y) {
            this.destination = null;
        }
    }
}

},{"../util/text_configurer":8}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
var Player = require("../entities/player");
var Enemy = require("../entities/enemy");
var Checkpoint = require("../entities/checkpoint");
var TextConfigurer = require("../util/text_configurer");

var Level = function () {};

module.exports = Level;

game.grannyPointer = 0;

Level.prototype.create = function() {
	game.grannyCounter = 0;
	// initialize things
	level = this;
	this.lives = 10;
	this.enemies = [];
	this.players = [];
	game.physics.startSystem(Phaser.Physics.ARCADE);

	this.initializeMap();
	this.initializeCheckpoints();
	this.initializeEnemies();
	this.initializePlayer();
	this.setupGrannyController();

	this.initializeGameCamera();

	// initialize the "onclick" function
	game.input.onDown.add(this.moveGranny, this);

	// setup keyboard input
	spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	this.wasd = {
		'up' : game.input.keyboard.addKey(Phaser.Keyboard.W),
		'down' : game.input.keyboard.addKey(Phaser.Keyboard.S),
		'left' : game.input.keyboard.addKey(Phaser.Keyboard.A),
		'right' :game.input.keyboard.addKey(Phaser.Keyboard.D)
	};

	// on keyboard input toggle camera
	game.input.keyboard.onDownCallback = this.toggleCamera;
};

Level.prototype.moveGranny = function(point) {
	this.players[game.grannyPointer].move(point);
}

Level.prototype.addHUD = function () {
	if (this.livesText != null) {
		this.livesText.destroy();
	}

	this.livesText = game.add.text(10, 10, "Lives: " + this.lives);
	TextConfigurer.configureText(this.livesText, "white", 32);
	this.livesText.fixedToCamera = true;

	if (this.cameraText != null) {
		this.cameraText.destroy();
	}
	this.cameraText = game.add.text(10, 48, "Camera: Locked")
	TextConfigurer.configureText(this.cameraText, "white", 16);
	this.cameraText .fixedToCamera = true;
}

Level.prototype.killGranny = function(granny) {
	granny.kill();
}

Level.prototype.toggleCamera = function() {
	// if spacebar was hit, toggle camera
	if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
		if (game.camera.following === true) {
			// unfollow
			game.camera.following = false;
			game.camera.unfollow();

		} else {
			// follow player
			game.camera.following = true;
			game.camera.follow(level.players[game.grannyPointer]);
		}
	}
};

Level.prototype.update = function() {
	// game camera updates
	this.moveGameCamera();

	// disply checkpoints squares
	for (i = 0; i < this.checkpoints.length; i++) {
		this.checkpoints[i].update();
	}
};

Level.prototype.render = function() {
	// Show game stats - fps, camera location, sprite location
	//game.debug.cameraInfo(game.camera, 32, 32);
};

Level.prototype.initializeGameCamera = function () {
	// set camaera to follow character
	game.camera.following = true;
	game.camera.follow(this.players[game.grannyPointer]);
};

Level.prototype.initializeMap = function() {
	// read from tilemap "map"
	this.map = game.add.tilemap("map");
	//tileset = volcano-set (inside Lava-1.json, tiles is from preloaded image
	this.map.addTilesetImage("volcano-tileset", "tiles", 16, 16);

	// Create Ground Layer
	this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Ground"), game.width, game.height);
	game.world.addAt(this.groundLayer, 0);
	this.groundLayer.resizeWorld();

	// Create Wall Layer, add collision tiles, eneable physics.
	this.blockLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Wall"), game.width, game.height);
    game.world.addAt(this.blockLayer, 1);
    this.map.setCollision([160, 161, 189, 190, 191, 192, 220, 221, 222], true, "Wall");
	this.blockLayer.resizeWorld();
	game.physics.arcade.enable(this.blockLayer);

	// Create Death Layer, add collision tiles, enable physics.
	this.deathLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex("Lava"), game.width, game.height);
    game.world.addAt(this.deathLayer, 2);
    this.map.setCollision([121, 124, 152, 154, 184, 211, 213, 214, 400, 401, 402, 430, 431, 432, 460, 461, 462], true, "Lava");
    this.deathLayer.resizeWorld();
    game.physics.arcade.enable(this.deathLayer);
};

Level.prototype.initializePlayer = function() {
	var i = 0;
	game.loadSprites.checkpoints[0].spawnpoints.forEach(function(spawnpoint) {
		level.players[i++] = new Player(spawnpoint.x, spawnpoint.y);
	});
};

Level.prototype.initializeEnemies = function() {
	game.loadSprites.zombies.forEach(function(zombie) {
		level.enemies.push(new Enemy(zombie.position, zombie.speed));
	});
};

Level.prototype.initializeCheckpoints = function() {
	this.checkpoints =
	[
		new Checkpoint(0, 80, 64, 80, true, 1),
		new Checkpoint(336, 542, 80, 64, false, 2),
		new Checkpoint(750, 96, 80, 48, false, 3),
		new Checkpoint(1506, 338, 92, 80, false, 4, true)
	];
};

Level.prototype.setupGrannyController = function() {
	game.input.keyboard.addKey(Phaser.Keyboard.ONE).processKeyDown = function() {
		game.grannyPointer = 0;
		//if ()
		game.camera.follow(level.players[game.grannyPointer]);
	}
	game.input.keyboard.addKey(Phaser.Keyboard.TWO).processKeyDown = function() {
		game.grannyPointer = 1;
		game.camera.follow(level.players[game.grannyPointer]);
	}
	game.input.keyboard.addKey(Phaser.Keyboard.THREE).processKeyDown = function() {
		game.grannyPointer = 2;
		game.camera.follow(level.players[game.grannyPointer]);
	}
	game.input.keyboard.addKey(Phaser.Keyboard.FOUR).processKeyDown = function() {
		game.grannyPointer = 3;
		game.camera.follow(level.players[game.grannyPointer]);
	}
}

Level.prototype.moveGameCamera = function() {
	// check if camera is set to follow character
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

},{"../entities/checkpoint":2,"../entities/enemy":3,"../entities/player":4,"../util/text_configurer":8}],7:[function(require,module,exports){
var TextConfigurer = require("../util/text_configurer")

var Preloader = function() {};

module.exports = Preloader;

Preloader.prototype = {
	preload: function() {
		this.displayLoader();
		this.load.tilemap("map", "assets/map/Levels/Multi-1/Multi-1-map.json", null, Phaser.Tilemap.TILED_JSON);
		this.load.image("tiles", "assets/tiles/volcano-tileset.png");
		this.load.spritesheet("granny", "assets/textures/granny.png");
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

},{"../../../assets/map/Levels/Multi-1/multi-1.json":1,"../util/text_configurer":8}],8:[function(require,module,exports){
exports.configureText = function(text, color, size) {
	text.font = "Carter One";
	text.fill = color;
	text.fontSize = size;
}

},{}],9:[function(require,module,exports){
window.game = new Phaser.Game(608, 608, Phaser.AUTO, '', { create: create });

function create() {
    //initialize all the game states.
    game.state.add("Boot", require("./game/states/boot"));
    game.state.add("Preloader", require("./game/states/preloader"));
	game.state.add("Level", require("./game/states/level"));
    game.state.start("Boot");
};

},{"./game/states/boot":5,"./game/states/level":6,"./game/states/preloader":7}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92NC4yLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiY2xpZW50L2Fzc2V0cy9tYXAvTGV2ZWxzL011bHRpLTEvbXVsdGktMS5qc29uIiwiY2xpZW50L3NyYy9nYW1lL2VudGl0aWVzL2NoZWNrcG9pbnQuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvZW5lbXkuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvcGxheWVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9ib290LmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9sZXZlbC5qcyIsImNsaWVudC9zcmMvZ2FtZS9zdGF0ZXMvcHJlbG9hZGVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3V0aWwvdGV4dF9jb25maWd1cmVyLmpzIiwiY2xpZW50L3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiem9tYmllc1wiIDogW1xuXHRcdHtcblx0XHRcdFwicG9zaXRpb25cIiA6IFtcblx0XHRcdFx0e1wieFwiIDogMjUwLCBcInlcIiA6IDIwMH0sXG5cdFx0XHRcdHtcInhcIiA6IDI1MCwgXCJ5XCIgOiAyNTB9XG5cdFx0XHRdLFxuXHRcdFx0XCJzcGVlZFwiIDogMTAwXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInBvc2l0aW9uXCIgOiBbXG5cdFx0XHRcdHtcInhcIiA6IDMwMCwgXCJ5XCIgOiAzMDB9LFxuXHRcdFx0XHR7XCJ4XCIgOiAzNTAsIFwieVwiIDogMzAwfSxcblx0XHRcdFx0e1wieFwiIDogMzI1LCBcInlcIiA6IDEwMH1cblx0XHRcdF0sXG5cdFx0XHRcInNwZWVkXCIgOiAxNTBcblx0XHR9XG5cdF0sXG5cdFwiY2hlY2twb2ludHNcIiA6IFtcblx0XHR7XG5cdFx0XHRcInNwYXducG9pbnRzXCIgOiBbXG5cdFx0XHRcdHtcInhcIjogODAsIFwieVwiOiA3NX0sXG5cdFx0XHRcdHtcInhcIjogODAsIFwieVwiOiAxNTV9LFxuXHRcdFx0XHR7XCJ4XCI6IDgwLCBcInlcIjogMjM1fSxcblx0XHRcdFx0e1wieFwiOiA4MCwgXCJ5XCI6IDMxNX1cblx0XHRcdF0sXG5cdFx0XHRcImRpbWVuc2lvbnNcIiA6IHtcIngwXCIgOiAwLCBcIndpZHRoXCIgOiAxMCwgXCJ5MFwiIDogMCwgXCJoZWlnaHRcIiA6IDEwfVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJzcGF3bnBvaW50c1wiIDogW1xuXHRcdFx0XHR7XCJ4XCI6IDAsIFwieVwiOiAwfSxcblx0XHRcdFx0e1wieFwiOiAwLCBcInlcIjogMX0sXG5cdFx0XHRcdHtcInhcIjogMCwgXCJ5XCI6IDJ9LFxuXHRcdFx0XHR7XCJ4XCI6IDAsIFwieVwiOiAzfVxuXHRcdFx0XSxcblx0XHRcdFwiZGltZW5zaW9uc1wiIDoge1wieDBcIiA6IDEwLCBcIndpZHRoXCIgOiAxMCwgXCJ5MFwiIDogMTAsIFwiaGVpZ2h0XCIgOiAxMH1cblx0XHR9XG5cdF1cbn1cbiIsInZhciBDaGVja3BvaW50ID0gZnVuY3Rpb24gKHgsIHksIHdpZHRoLCBoZWlnaHQsIGFjdGl2YXRlZCwgb3JkZXIsIGZpbmFsQ2hlY2twb2ludCkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBudWxsKTtcblx0Z2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXHR0aGlzLmJvZHkuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0LCAwLCAwKTtcblxuXHR0aGlzLmZpbmFsQ2hlY2twb2ludCA9IGZpbmFsQ2hlY2twb2ludDtcbiAgICB0aGlzLm9yZGVyID0gb3JkZXI7XG4gICAgdGhpcy5hY3RpdmF0ZWQgPSBhY3RpdmF0ZWQ7XG4gICAgLy9hZGQgc3ByaXRlIHRvIGdhbWVcbiAgICBnYW1lLmRlYnVnLmdlb20odGhpcyAsJ3JiZ2EoMCwgMCwgMjU1LCAxKScsIGZhbHNlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaGVja3BvaW50O1xuXG5DaGVja3BvaW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5DaGVja3BvaW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAvL2dhbWUuZGVidWcuYm9keSh0aGlzLCBcInJiZ2EoMCwgMCwgMjU1LCAxKVwiLCBmYWxzZSk7XG59XG4iLCJ2YXIgRW5lbXkgPSBmdW5jdGlvbiAoX3Bvc2l0aW9ucywgX3ZlbG9jaXR5KSB7XG4gICAgdGhpcy5wb3NpdGlvbnMgPSBfcG9zaXRpb25zO1xuICAgIHRoaXMuY291bnRlciA9IDA7XG5cbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgdGhpcy5wb3NpdGlvbnNbMF0ueCwgdGhpcy5wb3NpdGlvbnNbMF0ueSwgXCJlbmVteVwiKTtcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzKTtcblxuICAgIHRoaXMuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuICAgIHRoaXMuYm9keS5zb3VyY2VIZWlnaHQgPSAxMDA7XG4gICAgdGhpcy5ib2R5LnNvdXJjZVdpZHRoID0gMTAwO1xuXG4gICAgdGhpcy5tYXhfdmVsb2NpdHkgPSBfdmVsb2NpdHk7XG4gICAgdGhpcy5kZXN0aW5hdGlvbiA9IG51bGw7ICAgIFxuICAgIFxuICAgIHRoaXMuc2NhbGUuc2V0KC4zLC4zKTtcbiAgICB0aGlzLmFuY2hvci54ID0gLjU7XG4gICAgdGhpcy5hbmNob3IueSA9IC41O1xuICAgIHRoaXMucm90YXRpb24gPSBNYXRoLlBJIC8gMjtcblxuICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJ3YWxrXCIpO1xuICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwid2Fsa1wiLCA2LCB0cnVlKTtcblxuICAgIC8vc2V0IGJvdW5kaW5nIGJveFxuICAgIHRoaXMuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuICAgIFxuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZW15O1xuXG5FbmVteS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblxuRW5lbXkucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vZ2FtZS5kZWJ1Zy5ib2R5KHRoaXMsIFwicmdiYSgyNTUsMCwwLDIpXCIsIGZhbHNlKTtcbiAgICB0aGlzLm1vdmUoKTtcbn1cblxuRW5lbXkucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZGVzdGluYXRpb24gPT0gbnVsbCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5zaXplXS54KTtcbiAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IG5ldyBQaGFzZXIuUG9pbnQodGhpcy5wb3NpdGlvbnNbdGhpcy5jb3VudGVyJXRoaXMucG9zaXRpb25zLmxlbmd0aF0ueCwgdGhpcy5wb3NpdGlvbnNbdGhpcy5jb3VudGVyJXRoaXMucG9zaXRpb25zLmxlbmd0aF0ueSk7XG4gICAgXG4gICAgICAgIC8vcm90YXRlIHNwcml0ZSB0byBmYWNlIHRoZSBkaXJlY3Rpb24gaXQgd2lsbCBiZSBtb3ZpbmdcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IGdhbWUucGh5c2ljcy5hcmNhZGUuYW5nbGVUb1hZKHRoaXMuYm9keSwgdGhpcy5kZXN0aW5hdGlvbi54LCB0aGlzLmRlc3RpbmF0aW9uLnkpO1xuXG4gICAgICAgIC8vbW92ZSBjaGFyYWN0ZXIgdG8gdGhlIHBvaW50IChwbGF5ZXIgZG9lc250IHN0b3Agb25jZSBpdCBoaXRzIHRoYXQgcG9pbnQgd2l0aCB0aGlzIG1ldGhvZCAtIHNlZSBjaGVja0xvY2F0aW9uKCkpIFxuICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1hZKHRoaXMsIHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5sZW5ndGhdLngsIHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5sZW5ndGhdLnksIHRoaXMubWF4X3ZlbG9jaXR5KTtcblxuICAgICAgICB0aGlzLmNvdW50ZXIgKys7XG4gICAgfSBcbiAgICB0aGlzLmNoZWNrTG9jYXRpb24oKTtcbn1cblxuRW5lbXkucHJvdG90eXBlLmNoZWNrTG9jYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAvL2lmIHRoZXJlIGlzIG5vIGNvbnRhY3QsIHN0b3AgdGhlIGNoYXJhY3RlciBmcm9tIG1vdmluZyBhZnRlciB0aGV5J3ZlIHJlYWNoZWQgdGhlaXIgZGVzdGluYXRpb25cbiAgICAvL21hZGUgaXQgYXBwcm94aW1hdGUgZGVzdGluYXRpb24gYmVjYXVzZSBpdHMgdW5saWtlbHkgaXQgd2lsbCBlbmQgb24gdGhhdCBleGFjdCBsb2NhdGlvblxuICAgIGlmICh0aGlzLmRlc3RpbmF0aW9uICE9IG51bGwpIHtcbiAgICAgICAgLy9vbmNlIGl0IGdldHMgY2xvc2UgZW5vdWdoIHRvIHRoZSB4IGRlc3RpbmF0aW9uIGxvd2VyIHggdmVsb2NpdHlcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGVzdGluYXRpb24ueCkgPCB0aGlzLm1heF92ZWxvY2l0eS8xMDApIHtcbiAgICAgICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gLSh0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRlc3RpbmF0aW9uLngpOyAgICBcbiAgICAgICAgfVxuICAgICAgICAvL29uY2UgaXQgZ2V0cyBjbG9zZSBlbm91Z2ggdG8gdGhlIHkgZGVzdGluYXRpb24gbG93ZXIgeSB2ZWxvY2l0eVxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5wb3NpdGlvbi55IC0gdGhpcy5kZXN0aW5hdGlvbi55KSA8IHRoaXMubWF4X3ZlbG9jaXR5LzEwMCkge1xuICAgICAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnkgPSAtKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9zdG9wIG1vdmVtZW50IGNvbXBsZXRlbHkgLSBkZXN0aW5hdGlvbiBoYXMgYmVlbiByZWFjaGVkLlxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXN0aW5hdGlvbi54KSA8IDUgJiYgTWF0aC5hYnModGhpcy5wb3NpdGlvbi55IC0gdGhpcy5kZXN0aW5hdGlvbi55KSA8IDUpIHtcbiAgICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIE1BWF9WRUxPQ0lUWSA9IDE1MDtcbnZhciBUZXh0Q29uZmlndXJlciA9IHJlcXVpcmUoXCIuLi91dGlsL3RleHRfY29uZmlndXJlclwiKVxuXG52YXIgUGxheWVyID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICB0aGlzLmlkID0gZ2FtZS5ncmFubnlDb3VudGVyKys7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZ3Jhbm55XCIpO1xuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMpO1xuXG4gICAgLy8gc2V0IGJvdW5kaW5nIGJveFxuICAgIHRoaXMuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuICAgIHRoaXMuYm9keS5zb3VyY2VIZWlnaHQgPSA4MDtcbiAgICB0aGlzLmJvZHkuc291cmNlV2lkdGggPSA4MDtcbiAgICBcbiAgICAvLyBzaHJpbmsgY2hhcmFjdGVyXG4gICAgdGhpcy5zY2FsZS5zZXQoLjMsLjMpO1xuXG4gICAgLy8gc2V0IHRoZSBwbGF5ZXJzIHBvc2l0aW9uIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNwcml0ZVxuICAgIHRoaXMuYW5jaG9yLnggPSAuNDU7XG4gICAgdGhpcy5hbmNob3IueSA9IC41NTtcbiAgICAvLyB0dXJuIGNoYXJhY3RlciB0aGUgb3RoZXIgZGlyZWN0aW9uXG4gICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguUEkgO1xuXG4gICAgLy8gY3JlYXRlIHRoaXMgdmFsdWUgZm9yIHNvbWUgbnVsbCBjaGVja1xuICAgIHRoaXMuZGVzdGluYXRpb247XG5cbiAgICAvLyBhZGQgc3ByaXRlIHRvIGdhbWVcbiAgICBnYW1lLmFkZC5leGlzdGluZyh0aGlzKTtcblxuICAgIGNvbnNvbGUubG9nKGxldmVsKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcblxuUGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGRpc3BsYXkgYm91bmRpbmcgYm94XG4gICAgLy8gZ2FtZS5kZWJ1Zy5ib2R5KHRoaXMsIFwicmdiYSgwLDI1NSwwLDEwMClcIiwgZmFsc2UpO1xuXG4gICAgLy8gaWYgcGxheWVyIGlzIG1vdmluZyB0aGlzIHdpbGwgdGVsbCBpdCB3aGVuIHRvIHN0b3BcbiAgICB0aGlzLmNoZWNrTG9jYXRpb24oKTsgICAgXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihwb2ludGVyKSB7XG4gICAgLy8gcGxheWVycyBkZXN0aW5hdGlvbiBpcyB3cml0dGVuIGFjY29yZGluZyB0byB3b3JsZCB2aWV3LiAobm90IGNhbWVyYSlcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gbmV3IFBoYXNlci5Qb2ludChnYW1lLmNhbWVyYS54ICsgcG9pbnRlci54LCBnYW1lLmNhbWVyYS55ICsgcG9pbnRlci55KTtcblxuICAgIC8vIHJvdGF0ZSBzcHJpdGUgdG8gZmFjZSB0aGUgZGlyZWN0aW9uIGl0IHdpbGwgYmUgbW92aW5nXG4gICAgdGhpcy5yb3RhdGlvbiA9IGdhbWUucGh5c2ljcy5hcmNhZGUuYW5nbGVUb1hZKHRoaXMuYm9keSwgdGhpcy5kZXN0aW5hdGlvbi54LCB0aGlzLmRlc3RpbmF0aW9uLnkpICsgTWF0aC5QSTtcblxuICAgIC8vIG1vdmUgY2hhcmFjdGVyIHRvIHRoZSBwb2ludCAocGxheWVyIGRvZXNudCBzdG9wIG9uY2UgaXQgaGl0cyB0aGF0IHBvaW50IHdpdGggdGhpcyBtZXRob2QgLSBzZWUgY2hlY2tMb2NhdGlvbigpKSBcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1hZKHRoaXMsIGdhbWUuY2FtZXJhLnggKyBwb2ludGVyLngsIGdhbWUuY2FtZXJhLnkgKyBwb2ludGVyLnksIE1BWF9WRUxPQ0lUWSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrTG9jYXRpb24gPSBmdW5jdGlvbihjKSB7XG4gICAgLy8gY2hlY2sgY29udGFjdCB3aXRoIHJvY2sgd2FsbHNcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcywgbGV2ZWwuYmxvY2tMYXllcik7XG5cbiAgICBncmFubnkgPSB0aGlzO1xuICAgIC8vIGNoZWNrIGNvbnRhY3Qgd2l0aCBsYXZhIC0gYWRkIFwiZGllXCIgY2FsbGJhY2sgaWYgY29udGFjdCBpcyBtYWRlXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMsIGxldmVsLmRlYXRoTGF5ZXIsXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV2ZWwua2lsbEdyYW5ueShncmFubnkpXG4gICAgICAgIH0pO1xuXG4gICAgLy8gY2hlY2sgZm9yIGNvbnRhY3Qgd2l0aCBlbmVtaWVzXG4gICAgZm9yIChpID0gMDsgaSA8IGxldmVsLmVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMsIGxldmVsLmVuZW1pZXNbaV0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV2ZWwua2lsbEdyYW5ueShncmFubnkpXG4gICAgICAgIH0pOyAgICBcbiAgICB9XG5cbiAgICAvLyBjaGVjayBmb3IgY29udGFjdCB3aXRoIGNoZWNrcG9pbnRzXG4gICAgZm9yIChpID0gMDsgaSA8IGxldmVsLmNoZWNrcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLCBsZXZlbC5jaGVja3BvaW50c1tpXSwgZnVuY3Rpb24oKSB7IFxuICAgICAgICAgICAgaWYgKGxldmVsLmNoZWNrcG9pbnRzW2ldLmFjdGl2YXRlZCA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGlmICghbGV2ZWwuY2hlY2twb2ludHNbaV0uZmluYWxDaGVja3BvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrcG9pbnRUZXh0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2twb2ludFRleHQuZGVzdHJveSgpOyBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrcG9pbnRUZXh0ID0gZ2FtZS5hZGQudGV4dCgyMzAsIDEwLCBcIkNoZWNrcG9pbnQgUmVhY2hlZCFcIik7XG4gICAgICAgICAgICAgICAgICAgIFRleHRDb25maWd1cmVyLmNvbmZpZ3VyZVRleHQodGhpcy5jaGVja3BvaW50VGV4dCwgXCJ3aGl0ZVwiLCAyNCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2twb2ludFRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgZ2FtZS50aW1lLmV2ZW50cy5hZGQoMjAwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmFkZC50d2Vlbih0aGlzLmNoZWNrcG9pbnRUZXh0KS50byh7eTogMH0sIDE1MDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5hZGQudHdlZW4odGhpcy5jaGVja3BvaW50VGV4dCkudG8oe2FscGhhOiAwfSwgMTUwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMud2luVGV4dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndpblRleHQuZGVzdHJveSgpOyBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLndpblRleHQgPSBnYW1lLmFkZC50ZXh0KDIzMCwgMjUwLCBcIllvdSBXaW4hXCIpO1xuICAgICAgICAgICAgICAgICAgICBUZXh0Q29uZmlndXJlci5jb25maWd1cmVUZXh0KHRoaXMud2luVGV4dCwgXCJ3aGl0ZVwiLCA0OCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2luVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBnYW1lLnRpbWUuZXZlbnRzLmFkZCg1MDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuc3RhdGUuc3RhcnQoXCJMZXZlbFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldmVsLmNoZWNrcG9pbnRzW2ldLmFjdGl2YXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9ICAgXG4gICAgICAgIH0pO1xuICAgIH0gIFxuXG4gICAgLy8gaWYgdGhlcmUgaXMgbm8gY29udGFjdCwgc3RvcCB0aGUgY2hhcmFjdGVyIGZyb20gbW92aW5nIGFmdGVyIHRoZXkndmUgcmVhY2hlZCB0aGVpciBkZXN0aW5hdGlvblxuICAgIC8vIG1hZGUgaXQgYXBwcm94aW1hdGUgZGVzdGluYXRpb24gYmVjYXVzZSBpdHMgdW5saWtlbHkgaXQgd2lsbCBlbmQgb24gdGhhdCBleGFjdCBsb2NhdGlvblxuICAgIGlmICh0aGlzLmRlc3RpbmF0aW9uICE9IG51bGwpIHtcbiAgICAgICAgLy8gb25jZSBpdCBnZXRzIGNsb3NlIGVub3VnaCB0byB0aGUgeCBkZXN0aW5hdGlvbiBsb3dlciB4IHZlbG9jaXR5XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRlc3RpbmF0aW9uLngpIDwgTUFYX1ZFTE9DSVRZLzEwMCkge1xuICAgICAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAtKHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGVzdGluYXRpb24ueCk7ICAgIFxuICAgICAgICB9XG4gICAgICAgIC8vIG9uY2UgaXQgZ2V0cyBjbG9zZSBlbm91Z2ggdG8gdGhlIHkgZGVzdGluYXRpb24gbG93ZXIgeSB2ZWxvY2l0eVxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5wb3NpdGlvbi55IC0gdGhpcy5kZXN0aW5hdGlvbi55KSA8IE1BWF9WRUxPQ0lUWS8xMDApIHtcbiAgICAgICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS55ID0gLSh0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmRlc3RpbmF0aW9uLnkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHN0b3AgbW92ZW1lbnQgY29tcGxldGVseSAtIGRlc3RpbmF0aW9uIGhhcyBiZWVuIHJlYWNoZWQuXG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPT0gdGhpcy5kZXN0aW5hdGlvbi54ICYmIHRoaXMucG9zaXRpb24ueSA9PSB0aGlzLmRlc3RpbmF0aW9uLnkpIHtcbiAgICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIEJvb3QgPSBmdW5jdGlvbigpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb3Q7XG5cbkJvb3QucHJvdG90eXBlID0ge1xuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlO1xuXHRcdGlmIChnYW1lLmRldmljZS5kZXNrdG9wKSB7XG5cdFx0XHRnYW1lLnN0YWdlLnNjYWxlLnBhZ2VBbGlnbkhvcml6b250YWxseSA9IHRydWU7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0YWxlcnQoXCJEZXNrdG9wIGdhbWUgb25seVwiKVxuXHRcdH1cblx0XHRnYW1lLnN0YXRlLnN0YXJ0KFwiUHJlbG9hZGVyXCIpO1xuXHR9XG59XG4iLCJ2YXIgUGxheWVyID0gcmVxdWlyZShcIi4uL2VudGl0aWVzL3BsYXllclwiKTtcbnZhciBFbmVteSA9IHJlcXVpcmUoXCIuLi9lbnRpdGllcy9lbmVteVwiKTtcbnZhciBDaGVja3BvaW50ID0gcmVxdWlyZShcIi4uL2VudGl0aWVzL2NoZWNrcG9pbnRcIik7XG52YXIgVGV4dENvbmZpZ3VyZXIgPSByZXF1aXJlKFwiLi4vdXRpbC90ZXh0X2NvbmZpZ3VyZXJcIik7XG5cbnZhciBMZXZlbCA9IGZ1bmN0aW9uICgpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsO1xuXG5nYW1lLmdyYW5ueVBvaW50ZXIgPSAwO1xuXG5MZXZlbC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cdGdhbWUuZ3Jhbm55Q291bnRlciA9IDA7XG5cdC8vIGluaXRpYWxpemUgdGhpbmdzXG5cdGxldmVsID0gdGhpcztcblx0dGhpcy5saXZlcyA9IDEwO1xuXHR0aGlzLmVuZW1pZXMgPSBbXTtcblx0dGhpcy5wbGF5ZXJzID0gW107XG5cdGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG5cdHRoaXMuaW5pdGlhbGl6ZU1hcCgpO1xuXHR0aGlzLmluaXRpYWxpemVDaGVja3BvaW50cygpO1xuXHR0aGlzLmluaXRpYWxpemVFbmVtaWVzKCk7XG5cdHRoaXMuaW5pdGlhbGl6ZVBsYXllcigpO1xuXHR0aGlzLnNldHVwR3Jhbm55Q29udHJvbGxlcigpO1xuXG5cdHRoaXMuaW5pdGlhbGl6ZUdhbWVDYW1lcmEoKTtcblxuXHQvLyBpbml0aWFsaXplIHRoZSBcIm9uY2xpY2tcIiBmdW5jdGlvblxuXHRnYW1lLmlucHV0Lm9uRG93bi5hZGQodGhpcy5tb3ZlR3Jhbm55LCB0aGlzKTtcblxuXHQvLyBzZXR1cCBrZXlib2FyZCBpbnB1dFxuXHRzcGFjZWJhciA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG5cblx0dGhpcy53YXNkID0ge1xuXHRcdCd1cCcgOiBnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVyksXG5cdFx0J2Rvd24nIDogZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlMpLFxuXHRcdCdsZWZ0JyA6IGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5BKSxcblx0XHQncmlnaHQnIDpnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRClcblx0fTtcblxuXHQvLyBvbiBrZXlib2FyZCBpbnB1dCB0b2dnbGUgY2FtZXJhXG5cdGdhbWUuaW5wdXQua2V5Ym9hcmQub25Eb3duQ2FsbGJhY2sgPSB0aGlzLnRvZ2dsZUNhbWVyYTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5tb3ZlR3Jhbm55ID0gZnVuY3Rpb24ocG9pbnQpIHtcblx0dGhpcy5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0ubW92ZShwb2ludCk7XG59XG5cbkxldmVsLnByb3RvdHlwZS5hZGRIVUQgPSBmdW5jdGlvbiAoKSB7XG5cdGlmICh0aGlzLmxpdmVzVGV4dCAhPSBudWxsKSB7XG5cdFx0dGhpcy5saXZlc1RleHQuZGVzdHJveSgpO1xuXHR9XG5cblx0dGhpcy5saXZlc1RleHQgPSBnYW1lLmFkZC50ZXh0KDEwLCAxMCwgXCJMaXZlczogXCIgKyB0aGlzLmxpdmVzKTtcblx0VGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLmxpdmVzVGV4dCwgXCJ3aGl0ZVwiLCAzMik7XG5cdHRoaXMubGl2ZXNUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG5cdGlmICh0aGlzLmNhbWVyYVRleHQgIT0gbnVsbCkge1xuXHRcdHRoaXMuY2FtZXJhVGV4dC5kZXN0cm95KCk7XG5cdH1cblx0dGhpcy5jYW1lcmFUZXh0ID0gZ2FtZS5hZGQudGV4dCgxMCwgNDgsIFwiQ2FtZXJhOiBMb2NrZWRcIilcblx0VGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLmNhbWVyYVRleHQsIFwid2hpdGVcIiwgMTYpO1xuXHR0aGlzLmNhbWVyYVRleHQgLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xufVxuXG5MZXZlbC5wcm90b3R5cGUua2lsbEdyYW5ueSA9IGZ1bmN0aW9uKGdyYW5ueSkge1xuXHRncmFubnkua2lsbCgpO1xufVxuXG5MZXZlbC5wcm90b3R5cGUudG9nZ2xlQ2FtZXJhID0gZnVuY3Rpb24oKSB7XG5cdC8vIGlmIHNwYWNlYmFyIHdhcyBoaXQsIHRvZ2dsZSBjYW1lcmFcblx0aWYgKGdhbWUuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUikpIHtcblx0XHRpZiAoZ2FtZS5jYW1lcmEuZm9sbG93aW5nID09PSB0cnVlKSB7XG5cdFx0XHQvLyB1bmZvbGxvd1xuXHRcdFx0Z2FtZS5jYW1lcmEuZm9sbG93aW5nID0gZmFsc2U7XG5cdFx0XHRnYW1lLmNhbWVyYS51bmZvbGxvdygpO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGZvbGxvdyBwbGF5ZXJcblx0XHRcdGdhbWUuY2FtZXJhLmZvbGxvd2luZyA9IHRydWU7XG5cdFx0XHRnYW1lLmNhbWVyYS5mb2xsb3cobGV2ZWwucGxheWVyc1tnYW1lLmdyYW5ueVBvaW50ZXJdKTtcblx0XHR9XG5cdH1cbn07XG5cbkxldmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcblx0Ly8gZ2FtZSBjYW1lcmEgdXBkYXRlc1xuXHR0aGlzLm1vdmVHYW1lQ2FtZXJhKCk7XG5cblx0Ly8gZGlzcGx5IGNoZWNrcG9pbnRzIHNxdWFyZXNcblx0Zm9yIChpID0gMDsgaSA8IHRoaXMuY2hlY2twb2ludHMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLmNoZWNrcG9pbnRzW2ldLnVwZGF0ZSgpO1xuXHR9XG59O1xuXG5MZXZlbC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG5cdC8vIFNob3cgZ2FtZSBzdGF0cyAtIGZwcywgY2FtZXJhIGxvY2F0aW9uLCBzcHJpdGUgbG9jYXRpb25cblx0Ly9nYW1lLmRlYnVnLmNhbWVyYUluZm8oZ2FtZS5jYW1lcmEsIDMyLCAzMik7XG59O1xuXG5MZXZlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZUdhbWVDYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG5cdC8vIHNldCBjYW1hZXJhIHRvIGZvbGxvdyBjaGFyYWN0ZXJcblx0Z2FtZS5jYW1lcmEuZm9sbG93aW5nID0gdHJ1ZTtcblx0Z2FtZS5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyc1tnYW1lLmdyYW5ueVBvaW50ZXJdKTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5pbml0aWFsaXplTWFwID0gZnVuY3Rpb24oKSB7XG5cdC8vIHJlYWQgZnJvbSB0aWxlbWFwIFwibWFwXCJcblx0dGhpcy5tYXAgPSBnYW1lLmFkZC50aWxlbWFwKFwibWFwXCIpO1xuXHQvL3RpbGVzZXQgPSB2b2xjYW5vLXNldCAoaW5zaWRlIExhdmEtMS5qc29uLCB0aWxlcyBpcyBmcm9tIHByZWxvYWRlZCBpbWFnZVxuXHR0aGlzLm1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJ2b2xjYW5vLXRpbGVzZXRcIiwgXCJ0aWxlc1wiLCAxNiwgMTYpO1xuXG5cdC8vIENyZWF0ZSBHcm91bmQgTGF5ZXJcblx0dGhpcy5ncm91bmRMYXllciA9IG5ldyBQaGFzZXIuVGlsZW1hcExheWVyKGdhbWUsIHRoaXMubWFwLCB0aGlzLm1hcC5nZXRMYXllckluZGV4KFwiR3JvdW5kXCIpLCBnYW1lLndpZHRoLCBnYW1lLmhlaWdodCk7XG5cdGdhbWUud29ybGQuYWRkQXQodGhpcy5ncm91bmRMYXllciwgMCk7XG5cdHRoaXMuZ3JvdW5kTGF5ZXIucmVzaXplV29ybGQoKTtcblxuXHQvLyBDcmVhdGUgV2FsbCBMYXllciwgYWRkIGNvbGxpc2lvbiB0aWxlcywgZW5lYWJsZSBwaHlzaWNzLlxuXHR0aGlzLmJsb2NrTGF5ZXIgPSBuZXcgUGhhc2VyLlRpbGVtYXBMYXllcihnYW1lLCB0aGlzLm1hcCwgdGhpcy5tYXAuZ2V0TGF5ZXJJbmRleChcIldhbGxcIiksIGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0KTtcbiAgICBnYW1lLndvcmxkLmFkZEF0KHRoaXMuYmxvY2tMYXllciwgMSk7XG4gICAgdGhpcy5tYXAuc2V0Q29sbGlzaW9uKFsxNjAsIDE2MSwgMTg5LCAxOTAsIDE5MSwgMTkyLCAyMjAsIDIyMSwgMjIyXSwgdHJ1ZSwgXCJXYWxsXCIpO1xuXHR0aGlzLmJsb2NrTGF5ZXIucmVzaXplV29ybGQoKTtcblx0Z2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5ibG9ja0xheWVyKTtcblxuXHQvLyBDcmVhdGUgRGVhdGggTGF5ZXIsIGFkZCBjb2xsaXNpb24gdGlsZXMsIGVuYWJsZSBwaHlzaWNzLlxuXHR0aGlzLmRlYXRoTGF5ZXIgPSBuZXcgUGhhc2VyLlRpbGVtYXBMYXllcihnYW1lLCB0aGlzLm1hcCwgdGhpcy5tYXAuZ2V0TGF5ZXJJbmRleChcIkxhdmFcIiksIGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0KTtcbiAgICBnYW1lLndvcmxkLmFkZEF0KHRoaXMuZGVhdGhMYXllciwgMik7XG4gICAgdGhpcy5tYXAuc2V0Q29sbGlzaW9uKFsxMjEsIDEyNCwgMTUyLCAxNTQsIDE4NCwgMjExLCAyMTMsIDIxNCwgNDAwLCA0MDEsIDQwMiwgNDMwLCA0MzEsIDQzMiwgNDYwLCA0NjEsIDQ2Ml0sIHRydWUsIFwiTGF2YVwiKTtcbiAgICB0aGlzLmRlYXRoTGF5ZXIucmVzaXplV29ybGQoKTtcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLmRlYXRoTGF5ZXIpO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLmluaXRpYWxpemVQbGF5ZXIgPSBmdW5jdGlvbigpIHtcblx0dmFyIGkgPSAwO1xuXHRnYW1lLmxvYWRTcHJpdGVzLmNoZWNrcG9pbnRzWzBdLnNwYXducG9pbnRzLmZvckVhY2goZnVuY3Rpb24oc3Bhd25wb2ludCkge1xuXHRcdGxldmVsLnBsYXllcnNbaSsrXSA9IG5ldyBQbGF5ZXIoc3Bhd25wb2ludC54LCBzcGF3bnBvaW50LnkpO1xuXHR9KTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5pbml0aWFsaXplRW5lbWllcyA9IGZ1bmN0aW9uKCkge1xuXHRnYW1lLmxvYWRTcHJpdGVzLnpvbWJpZXMuZm9yRWFjaChmdW5jdGlvbih6b21iaWUpIHtcblx0XHRsZXZlbC5lbmVtaWVzLnB1c2gobmV3IEVuZW15KHpvbWJpZS5wb3NpdGlvbiwgem9tYmllLnNwZWVkKSk7XG5cdH0pO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLmluaXRpYWxpemVDaGVja3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmNoZWNrcG9pbnRzID1cblx0W1xuXHRcdG5ldyBDaGVja3BvaW50KDAsIDgwLCA2NCwgODAsIHRydWUsIDEpLFxuXHRcdG5ldyBDaGVja3BvaW50KDMzNiwgNTQyLCA4MCwgNjQsIGZhbHNlLCAyKSxcblx0XHRuZXcgQ2hlY2twb2ludCg3NTAsIDk2LCA4MCwgNDgsIGZhbHNlLCAzKSxcblx0XHRuZXcgQ2hlY2twb2ludCgxNTA2LCAzMzgsIDkyLCA4MCwgZmFsc2UsIDQsIHRydWUpXG5cdF07XG59O1xuXG5MZXZlbC5wcm90b3R5cGUuc2V0dXBHcmFubnlDb250cm9sbGVyID0gZnVuY3Rpb24oKSB7XG5cdGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5PTkUpLnByb2Nlc3NLZXlEb3duID0gZnVuY3Rpb24oKSB7XG5cdFx0Z2FtZS5ncmFubnlQb2ludGVyID0gMDtcblx0XHQvL2lmICgpXG5cdFx0Z2FtZS5jYW1lcmEuZm9sbG93KGxldmVsLnBsYXllcnNbZ2FtZS5ncmFubnlQb2ludGVyXSk7XG5cdH1cblx0Z2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlRXTykucHJvY2Vzc0tleURvd24gPSBmdW5jdGlvbigpIHtcblx0XHRnYW1lLmdyYW5ueVBvaW50ZXIgPSAxO1xuXHRcdGdhbWUuY2FtZXJhLmZvbGxvdyhsZXZlbC5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0pO1xuXHR9XG5cdGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5USFJFRSkucHJvY2Vzc0tleURvd24gPSBmdW5jdGlvbigpIHtcblx0XHRnYW1lLmdyYW5ueVBvaW50ZXIgPSAyO1xuXHRcdGdhbWUuY2FtZXJhLmZvbGxvdyhsZXZlbC5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0pO1xuXHR9XG5cdGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5GT1VSKS5wcm9jZXNzS2V5RG93biA9IGZ1bmN0aW9uKCkge1xuXHRcdGdhbWUuZ3Jhbm55UG9pbnRlciA9IDM7XG5cdFx0Z2FtZS5jYW1lcmEuZm9sbG93KGxldmVsLnBsYXllcnNbZ2FtZS5ncmFubnlQb2ludGVyXSk7XG5cdH1cbn1cblxuTGV2ZWwucHJvdG90eXBlLm1vdmVHYW1lQ2FtZXJhID0gZnVuY3Rpb24oKSB7XG5cdC8vIGNoZWNrIGlmIGNhbWVyYSBpcyBzZXQgdG8gZm9sbG93IGNoYXJhY3RlclxuXHRpZiAoZ2FtZS5jYW1lcmEuZm9sbG93aW5nID09IGZhbHNlKSB7XG5cdFx0Ly8gbW92ZSBjYW1lcmFcblx0XHRpZiAodGhpcy53YXNkLnVwLmlzRG93bikge1xuXHRcdFx0Z2FtZS5jYW1lcmEueSAtPSA0O1xuXHRcdH1cblx0XHRpZiAodGhpcy53YXNkLmRvd24uaXNEb3duKSB7XG5cdFx0XHRnYW1lLmNhbWVyYS55ICs9IDQ7XG5cdFx0fVxuXHRcdGlmICh0aGlzLndhc2QubGVmdC5pc0Rvd24pIHtcblx0XHRcdGdhbWUuY2FtZXJhLnggLT0gNDtcblx0XHR9XG5cdFx0aWYgKHRoaXMud2FzZC5yaWdodC5pc0Rvd24pIHtcblx0XHRcdGdhbWUuY2FtZXJhLnggKz0gNDtcblx0XHR9XG5cdH1cbn07XG4iLCJ2YXIgVGV4dENvbmZpZ3VyZXIgPSByZXF1aXJlKFwiLi4vdXRpbC90ZXh0X2NvbmZpZ3VyZXJcIilcblxudmFyIFByZWxvYWRlciA9IGZ1bmN0aW9uKCkge307XG5cbm1vZHVsZS5leHBvcnRzID0gUHJlbG9hZGVyO1xuXG5QcmVsb2FkZXIucHJvdG90eXBlID0ge1xuXHRwcmVsb2FkOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRpc3BsYXlMb2FkZXIoKTtcblx0XHR0aGlzLmxvYWQudGlsZW1hcChcIm1hcFwiLCBcImFzc2V0cy9tYXAvTGV2ZWxzL011bHRpLTEvTXVsdGktMS1tYXAuanNvblwiLCBudWxsLCBQaGFzZXIuVGlsZW1hcC5USUxFRF9KU09OKTtcblx0XHR0aGlzLmxvYWQuaW1hZ2UoXCJ0aWxlc1wiLCBcImFzc2V0cy90aWxlcy92b2xjYW5vLXRpbGVzZXQucG5nXCIpO1xuXHRcdHRoaXMubG9hZC5zcHJpdGVzaGVldChcImdyYW5ueVwiLCBcImFzc2V0cy90ZXh0dXJlcy9ncmFubnkucG5nXCIpO1xuXHRcdHRoaXMubG9hZC5zcHJpdGVzaGVldChcImVuZW15XCIsIFwiYXNzZXRzL3RleHR1cmVzL3pvbWJpZS5wbmdcIiwgMTU3LCAxMDIpO1xuXHRcdGdhbWUubG9hZFNwcml0ZXMgPSByZXF1aXJlKFwiLi4vLi4vLi4vYXNzZXRzL21hcC9MZXZlbHMvTXVsdGktMS9tdWx0aS0xLmpzb25cIik7XG5cblx0XHRjdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG5cdFx0bW91c2UgPSBnYW1lLmlucHV0Lm1vdXNlO1xuXHR9LFxuXG5cdGRpc3BsYXlMb2FkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudGV4dCA9IGdhbWUuYWRkLnRleHQoZ2FtZS5jYW1lcmEud2lkdGggLyAyLCAyNTAsIFwiTG9hZGluZy4uLiBcIik7XG4gICAgXHR0aGlzLnRleHQuYW5jaG9yLnNldFRvKC41LCAuNSk7XG5cdFx0VGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLnRleHQsIFwid2hpdGVcIiwgMzIpO1xuXG4gICAgXHR0aGlzLmxvYWQub25GaWxlQ29tcGxldGUuYWRkKGZ1bmN0aW9uKHByb2dyZXNzKSB7XG5cdCAgICAgICAgdGhpcy50ZXh0LnNldFRleHQoXCJMb2FkaW5nLi4uIFwiICsgcHJvZ3Jlc3MgKyBcIiVcIik7XG5cdCAgICB9LCB0aGlzKTtcblxuICAgIFx0dGhpcy5sb2FkLm9uTG9hZENvbXBsZXRlLmFkZChmdW5jdGlvbigpIHtcblx0XHRcdGdhbWUuc3RhdGUuc3RhcnQoXCJMZXZlbFwiKTtcblx0ICAgIH0pO1xuXHR9XG59XG4iLCJleHBvcnRzLmNvbmZpZ3VyZVRleHQgPSBmdW5jdGlvbih0ZXh0LCBjb2xvciwgc2l6ZSkge1xuXHR0ZXh0LmZvbnQgPSBcIkNhcnRlciBPbmVcIjtcblx0dGV4dC5maWxsID0gY29sb3I7XG5cdHRleHQuZm9udFNpemUgPSBzaXplO1xufVxuIiwid2luZG93LmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoNjA4LCA2MDgsIFBoYXNlci5BVVRPLCAnJywgeyBjcmVhdGU6IGNyZWF0ZSB9KTtcblxuZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIC8vaW5pdGlhbGl6ZSBhbGwgdGhlIGdhbWUgc3RhdGVzLlxuICAgIGdhbWUuc3RhdGUuYWRkKFwiQm9vdFwiLCByZXF1aXJlKFwiLi9nYW1lL3N0YXRlcy9ib290XCIpKTtcbiAgICBnYW1lLnN0YXRlLmFkZChcIlByZWxvYWRlclwiLCByZXF1aXJlKFwiLi9nYW1lL3N0YXRlcy9wcmVsb2FkZXJcIikpO1xuXHRnYW1lLnN0YXRlLmFkZChcIkxldmVsXCIsIHJlcXVpcmUoXCIuL2dhbWUvc3RhdGVzL2xldmVsXCIpKTtcbiAgICBnYW1lLnN0YXRlLnN0YXJ0KFwiQm9vdFwiKTtcbn07XG4iXX0=
