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

Player.prototype.checkLocation = function() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92NC4yLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiY2xpZW50L2Fzc2V0cy9tYXAvTGV2ZWxzL011bHRpLTEvbXVsdGktMS5qc29uIiwiY2xpZW50L3NyYy9nYW1lL2VudGl0aWVzL2NoZWNrcG9pbnQuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvZW5lbXkuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvcGxheWVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9ib290LmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9sZXZlbC5qcyIsImNsaWVudC9zcmMvZ2FtZS9zdGF0ZXMvcHJlbG9hZGVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3V0aWwvdGV4dF9jb25maWd1cmVyLmpzIiwiY2xpZW50L3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJ6b21iaWVzXCIgOiBbXG5cdFx0e1xuXHRcdFx0XCJwb3NpdGlvblwiIDogW1xuXHRcdFx0XHR7XCJ4XCIgOiAyNTAsIFwieVwiIDogMjAwfSxcblx0XHRcdFx0e1wieFwiIDogMjUwLCBcInlcIiA6IDI1MH1cblx0XHRcdF0sXG5cdFx0XHRcInNwZWVkXCIgOiAxMDBcblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicG9zaXRpb25cIiA6IFtcblx0XHRcdFx0e1wieFwiIDogMzAwLCBcInlcIiA6IDMwMH0sXG5cdFx0XHRcdHtcInhcIiA6IDM1MCwgXCJ5XCIgOiAzMDB9LFxuXHRcdFx0XHR7XCJ4XCIgOiAzMjUsIFwieVwiIDogMTAwfVxuXHRcdFx0XSxcblx0XHRcdFwic3BlZWRcIiA6IDE1MFxuXHRcdH1cblx0XSxcblx0XCJjaGVja3BvaW50c1wiIDogW1xuXHRcdHtcblx0XHRcdFwic3Bhd25wb2ludHNcIiA6IFtcblx0XHRcdFx0e1wieFwiOiA4MCwgXCJ5XCI6IDc1fSxcblx0XHRcdFx0e1wieFwiOiA4MCwgXCJ5XCI6IDE1NX0sXG5cdFx0XHRcdHtcInhcIjogODAsIFwieVwiOiAyMzV9LFxuXHRcdFx0XHR7XCJ4XCI6IDgwLCBcInlcIjogMzE1fVxuXHRcdFx0XSxcblx0XHRcdFwiZGltZW5zaW9uc1wiIDoge1wieDBcIiA6IDAsIFwid2lkdGhcIiA6IDEwLCBcInkwXCIgOiAwLCBcImhlaWdodFwiIDogMTB9XG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInNwYXducG9pbnRzXCIgOiBbXG5cdFx0XHRcdHtcInhcIjogMCwgXCJ5XCI6IDB9LFxuXHRcdFx0XHR7XCJ4XCI6IDAsIFwieVwiOiAxfSxcblx0XHRcdFx0e1wieFwiOiAwLCBcInlcIjogMn0sXG5cdFx0XHRcdHtcInhcIjogMCwgXCJ5XCI6IDN9XG5cdFx0XHRdLFxuXHRcdFx0XCJkaW1lbnNpb25zXCIgOiB7XCJ4MFwiIDogMTAsIFwid2lkdGhcIiA6IDEwLCBcInkwXCIgOiAxMCwgXCJoZWlnaHRcIiA6IDEwfVxuXHRcdH1cblx0XVxufVxuIiwidmFyIENoZWNrcG9pbnQgPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCwgYWN0aXZhdGVkLCBvcmRlciwgZmluYWxDaGVja3BvaW50KSB7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIG51bGwpO1xuXHRnYW1lLnBoeXNpY3MuZW5hYmxlKHRoaXMsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cdHRoaXMuYm9keS5zZXRTaXplKHdpZHRoLCBoZWlnaHQsIDAsIDApO1xuXG5cdHRoaXMuZmluYWxDaGVja3BvaW50ID0gZmluYWxDaGVja3BvaW50O1xuICAgIHRoaXMub3JkZXIgPSBvcmRlcjtcbiAgICB0aGlzLmFjdGl2YXRlZCA9IGFjdGl2YXRlZDtcbiAgICAvL2FkZCBzcHJpdGUgdG8gZ2FtZVxuICAgIGdhbWUuZGVidWcuZ2VvbSh0aGlzICwncmJnYSgwLCAwLCAyNTUsIDEpJywgZmFsc2UpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoZWNrcG9pbnQ7XG5cbkNoZWNrcG9pbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5cbkNoZWNrcG9pbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vZ2FtZS5kZWJ1Zy5ib2R5KHRoaXMsIFwicmJnYSgwLCAwLCAyNTUsIDEpXCIsIGZhbHNlKTtcbn1cbiIsInZhciBFbmVteSA9IGZ1bmN0aW9uIChfcG9zaXRpb25zLCBfdmVsb2NpdHkpIHtcbiAgICB0aGlzLnBvc2l0aW9ucyA9IF9wb3NpdGlvbnM7XG4gICAgdGhpcy5jb3VudGVyID0gMDtcblxuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB0aGlzLnBvc2l0aW9uc1swXS54LCB0aGlzLnBvc2l0aW9uc1swXS55LCBcImVuZW15XCIpO1xuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMpO1xuXG4gICAgdGhpcy5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG4gICAgdGhpcy5ib2R5LnNvdXJjZUhlaWdodCA9IDEwMDtcbiAgICB0aGlzLmJvZHkuc291cmNlV2lkdGggPSAxMDA7XG5cbiAgICB0aGlzLm1heF92ZWxvY2l0eSA9IF92ZWxvY2l0eTtcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gbnVsbDsgICAgXG4gICAgXG4gICAgdGhpcy5zY2FsZS5zZXQoLjMsLjMpO1xuICAgIHRoaXMuYW5jaG9yLnggPSAuNTtcbiAgICB0aGlzLmFuY2hvci55ID0gLjU7XG4gICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuXG4gICAgdGhpcy5hbmltYXRpb25zLmFkZChcIndhbGtcIik7XG4gICAgdGhpcy5hbmltYXRpb25zLnBsYXkoXCJ3YWxrXCIsIDYsIHRydWUpO1xuXG4gICAgLy9zZXQgYm91bmRpbmcgYm94XG4gICAgdGhpcy5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG4gICAgXG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodGhpcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5lbXk7XG5cbkVuZW15LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5FbmVteS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgLy9nYW1lLmRlYnVnLmJvZHkodGhpcywgXCJyZ2JhKDI1NSwwLDAsMilcIiwgZmFsc2UpO1xuICAgIHRoaXMubW92ZSgpO1xufVxuXG5FbmVteS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5kZXN0aW5hdGlvbiA9PSBudWxsKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5wb3NpdGlvbnNbdGhpcy5jb3VudGVyJXRoaXMucG9zaXRpb25zLnNpemVdLngpO1xuICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gbmV3IFBoYXNlci5Qb2ludCh0aGlzLnBvc2l0aW9uc1t0aGlzLmNvdW50ZXIldGhpcy5wb3NpdGlvbnMubGVuZ3RoXS54LCB0aGlzLnBvc2l0aW9uc1t0aGlzLmNvdW50ZXIldGhpcy5wb3NpdGlvbnMubGVuZ3RoXS55KTtcbiAgICBcbiAgICAgICAgLy9yb3RhdGUgc3ByaXRlIHRvIGZhY2UgdGhlIGRpcmVjdGlvbiBpdCB3aWxsIGJlIG1vdmluZ1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gZ2FtZS5waHlzaWNzLmFyY2FkZS5hbmdsZVRvWFkodGhpcy5ib2R5LCB0aGlzLmRlc3RpbmF0aW9uLngsIHRoaXMuZGVzdGluYXRpb24ueSk7XG5cbiAgICAgICAgLy9tb3ZlIGNoYXJhY3RlciB0byB0aGUgcG9pbnQgKHBsYXllciBkb2VzbnQgc3RvcCBvbmNlIGl0IGhpdHMgdGhhdCBwb2ludCB3aXRoIHRoaXMgbWV0aG9kIC0gc2VlIGNoZWNrTG9jYXRpb24oKSkgXG4gICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvWFkodGhpcywgdGhpcy5wb3NpdGlvbnNbdGhpcy5jb3VudGVyJXRoaXMucG9zaXRpb25zLmxlbmd0aF0ueCwgdGhpcy5wb3NpdGlvbnNbdGhpcy5jb3VudGVyJXRoaXMucG9zaXRpb25zLmxlbmd0aF0ueSwgdGhpcy5tYXhfdmVsb2NpdHkpO1xuXG4gICAgICAgIHRoaXMuY291bnRlciArKztcbiAgICB9IFxuICAgIHRoaXMuY2hlY2tMb2NhdGlvbigpO1xufVxuXG5FbmVteS5wcm90b3R5cGUuY2hlY2tMb2NhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vaWYgdGhlcmUgaXMgbm8gY29udGFjdCwgc3RvcCB0aGUgY2hhcmFjdGVyIGZyb20gbW92aW5nIGFmdGVyIHRoZXkndmUgcmVhY2hlZCB0aGVpciBkZXN0aW5hdGlvblxuICAgIC8vbWFkZSBpdCBhcHByb3hpbWF0ZSBkZXN0aW5hdGlvbiBiZWNhdXNlIGl0cyB1bmxpa2VseSBpdCB3aWxsIGVuZCBvbiB0aGF0IGV4YWN0IGxvY2F0aW9uXG4gICAgaWYgKHRoaXMuZGVzdGluYXRpb24gIT0gbnVsbCkge1xuICAgICAgICAvL29uY2UgaXQgZ2V0cyBjbG9zZSBlbm91Z2ggdG8gdGhlIHggZGVzdGluYXRpb24gbG93ZXIgeCB2ZWxvY2l0eVxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXN0aW5hdGlvbi54KSA8IHRoaXMubWF4X3ZlbG9jaXR5LzEwMCkge1xuICAgICAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAtKHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGVzdGluYXRpb24ueCk7ICAgIFxuICAgICAgICB9XG4gICAgICAgIC8vb25jZSBpdCBnZXRzIGNsb3NlIGVub3VnaCB0byB0aGUgeSBkZXN0aW5hdGlvbiBsb3dlciB5IHZlbG9jaXR5XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmRlc3RpbmF0aW9uLnkpIDwgdGhpcy5tYXhfdmVsb2NpdHkvMTAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueSA9IC0odGhpcy5wb3NpdGlvbi55IC0gdGhpcy5kZXN0aW5hdGlvbi55KTtcbiAgICAgICAgfVxuICAgICAgICAvL3N0b3AgbW92ZW1lbnQgY29tcGxldGVseSAtIGRlc3RpbmF0aW9uIGhhcyBiZWVuIHJlYWNoZWQuXG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRlc3RpbmF0aW9uLngpIDwgNSAmJiBNYXRoLmFicyh0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmRlc3RpbmF0aW9uLnkpIDwgNSkge1xuICAgICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ2YXIgTUFYX1ZFTE9DSVRZID0gMTUwO1xudmFyIFRleHRDb25maWd1cmVyID0gcmVxdWlyZShcIi4uL3V0aWwvdGV4dF9jb25maWd1cmVyXCIpXG5cbnZhciBQbGF5ZXIgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHRoaXMuaWQgPSBnYW1lLmdyYW5ueUNvdW50ZXIrKztcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgXCJncmFubnlcIik7XG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcyk7XG5cbiAgICAvLyBzZXQgYm91bmRpbmcgYm94XG4gICAgdGhpcy5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG4gICAgdGhpcy5ib2R5LnNvdXJjZUhlaWdodCA9IDgwO1xuICAgIHRoaXMuYm9keS5zb3VyY2VXaWR0aCA9IDgwO1xuICAgIFxuICAgIC8vIHNocmluayBjaGFyYWN0ZXJcbiAgICB0aGlzLnNjYWxlLnNldCguMywuMyk7XG5cbiAgICAvLyBzZXQgdGhlIHBsYXllcnMgcG9zaXRpb24gdG8gdGhlIGNlbnRlciBvZiB0aGUgc3ByaXRlXG4gICAgdGhpcy5hbmNob3IueCA9IC40NTtcbiAgICB0aGlzLmFuY2hvci55ID0gLjU1O1xuICAgIC8vIHR1cm4gY2hhcmFjdGVyIHRoZSBvdGhlciBkaXJlY3Rpb25cbiAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5QSSA7XG5cbiAgICAvLyBjcmVhdGUgdGhpcyB2YWx1ZSBmb3Igc29tZSBudWxsIGNoZWNrXG4gICAgdGhpcy5kZXN0aW5hdGlvbjtcblxuICAgIC8vIGFkZCBzcHJpdGUgdG8gZ2FtZVxuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcblxuUGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGRpc3BsYXkgYm91bmRpbmcgYm94XG4gICAgLy8gZ2FtZS5kZWJ1Zy5ib2R5KHRoaXMsIFwicmdiYSgwLDI1NSwwLDEwMClcIiwgZmFsc2UpO1xuXG4gICAgLy8gaWYgcGxheWVyIGlzIG1vdmluZyB0aGlzIHdpbGwgdGVsbCBpdCB3aGVuIHRvIHN0b3BcbiAgICB0aGlzLmNoZWNrTG9jYXRpb24oKTsgICAgXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihwb2ludGVyKSB7XG4gICAgLy8gcGxheWVycyBkZXN0aW5hdGlvbiBpcyB3cml0dGVuIGFjY29yZGluZyB0byB3b3JsZCB2aWV3LiAobm90IGNhbWVyYSlcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gbmV3IFBoYXNlci5Qb2ludChnYW1lLmNhbWVyYS54ICsgcG9pbnRlci54LCBnYW1lLmNhbWVyYS55ICsgcG9pbnRlci55KTtcblxuICAgIC8vIHJvdGF0ZSBzcHJpdGUgdG8gZmFjZSB0aGUgZGlyZWN0aW9uIGl0IHdpbGwgYmUgbW92aW5nXG4gICAgdGhpcy5yb3RhdGlvbiA9IGdhbWUucGh5c2ljcy5hcmNhZGUuYW5nbGVUb1hZKHRoaXMuYm9keSwgdGhpcy5kZXN0aW5hdGlvbi54LCB0aGlzLmRlc3RpbmF0aW9uLnkpICsgTWF0aC5QSTtcblxuICAgIC8vIG1vdmUgY2hhcmFjdGVyIHRvIHRoZSBwb2ludCAocGxheWVyIGRvZXNudCBzdG9wIG9uY2UgaXQgaGl0cyB0aGF0IHBvaW50IHdpdGggdGhpcyBtZXRob2QgLSBzZWUgY2hlY2tMb2NhdGlvbigpKSBcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1hZKHRoaXMsIGdhbWUuY2FtZXJhLnggKyBwb2ludGVyLngsIGdhbWUuY2FtZXJhLnkgKyBwb2ludGVyLnksIE1BWF9WRUxPQ0lUWSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrTG9jYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBjaGVjayBjb250YWN0IHdpdGggcm9jayB3YWxsc1xuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLCBsZXZlbC5ibG9ja0xheWVyKTtcblxuICAgIGdyYW5ueSA9IHRoaXM7XG4gICAgLy8gY2hlY2sgY29udGFjdCB3aXRoIGxhdmEgLSBhZGQgXCJkaWVcIiBjYWxsYmFjayBpZiBjb250YWN0IGlzIG1hZGVcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcywgbGV2ZWwuZGVhdGhMYXllcixcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXZlbC5raWxsR3Jhbm55KGdyYW5ueSlcbiAgICAgICAgfSk7XG5cbiAgICAvLyBjaGVjayBmb3IgY29udGFjdCB3aXRoIGVuZW1pZXNcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGV2ZWwuZW5lbWllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcywgbGV2ZWwuZW5lbWllc1tpXSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXZlbC5raWxsR3Jhbm55KGdyYW5ueSlcbiAgICAgICAgfSk7ICAgIFxuICAgIH1cblxuICAgIC8vIGNoZWNrIGZvciBjb250YWN0IHdpdGggY2hlY2twb2ludHNcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGV2ZWwuY2hlY2twb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMsIGxldmVsLmNoZWNrcG9pbnRzW2ldLCBmdW5jdGlvbigpIHsgXG4gICAgICAgICAgICBpZiAobGV2ZWwuY2hlY2twb2ludHNbaV0uYWN0aXZhdGVkID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsZXZlbC5jaGVja3BvaW50c1tpXS5maW5hbENoZWNrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2twb2ludFRleHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja3BvaW50VGV4dC5kZXN0cm95KCk7IFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2twb2ludFRleHQgPSBnYW1lLmFkZC50ZXh0KDIzMCwgMTAsIFwiQ2hlY2twb2ludCBSZWFjaGVkIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgVGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLmNoZWNrcG9pbnRUZXh0LCBcIndoaXRlXCIsIDI0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja3BvaW50VGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBnYW1lLnRpbWUuZXZlbnRzLmFkZCgyMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuYWRkLnR3ZWVuKHRoaXMuY2hlY2twb2ludFRleHQpLnRvKHt5OiAwfSwgMTUwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmFkZC50d2Vlbih0aGlzLmNoZWNrcG9pbnRUZXh0KS50byh7YWxwaGE6IDB9LCAxNTAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy53aW5UZXh0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2luVGV4dC5kZXN0cm95KCk7IFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2luVGV4dCA9IGdhbWUuYWRkLnRleHQoMjMwLCAyNTAsIFwiWW91IFdpbiFcIik7XG4gICAgICAgICAgICAgICAgICAgIFRleHRDb25maWd1cmVyLmNvbmZpZ3VyZVRleHQodGhpcy53aW5UZXh0LCBcIndoaXRlXCIsIDQ4KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aW5UZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGdhbWUudGltZS5ldmVudHMuYWRkKDUwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5zdGF0ZS5zdGFydChcIkxldmVsXCIpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV2ZWwuY2hlY2twb2ludHNbaV0uYWN0aXZhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gICBcbiAgICAgICAgfSk7XG4gICAgfSAgXG5cbiAgICAvLyBpZiB0aGVyZSBpcyBubyBjb250YWN0LCBzdG9wIHRoZSBjaGFyYWN0ZXIgZnJvbSBtb3ZpbmcgYWZ0ZXIgdGhleSd2ZSByZWFjaGVkIHRoZWlyIGRlc3RpbmF0aW9uXG4gICAgLy8gbWFkZSBpdCBhcHByb3hpbWF0ZSBkZXN0aW5hdGlvbiBiZWNhdXNlIGl0cyB1bmxpa2VseSBpdCB3aWxsIGVuZCBvbiB0aGF0IGV4YWN0IGxvY2F0aW9uXG4gICAgaWYgKHRoaXMuZGVzdGluYXRpb24gIT0gbnVsbCkge1xuICAgICAgICAvLyBvbmNlIGl0IGdldHMgY2xvc2UgZW5vdWdoIHRvIHRoZSB4IGRlc3RpbmF0aW9uIGxvd2VyIHggdmVsb2NpdHlcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGVzdGluYXRpb24ueCkgPCBNQVhfVkVMT0NJVFkvMTAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IC0odGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXN0aW5hdGlvbi54KTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgLy8gb25jZSBpdCBnZXRzIGNsb3NlIGVub3VnaCB0byB0aGUgeSBkZXN0aW5hdGlvbiBsb3dlciB5IHZlbG9jaXR5XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmRlc3RpbmF0aW9uLnkpIDwgTUFYX1ZFTE9DSVRZLzEwMCkge1xuICAgICAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnkgPSAtKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3RvcCBtb3ZlbWVudCBjb21wbGV0ZWx5IC0gZGVzdGluYXRpb24gaGFzIGJlZW4gcmVhY2hlZC5cbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24ueCA9PSB0aGlzLmRlc3RpbmF0aW9uLnggJiYgdGhpcy5wb3NpdGlvbi55ID09IHRoaXMuZGVzdGluYXRpb24ueSkge1xuICAgICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ2YXIgQm9vdCA9IGZ1bmN0aW9uKCkge307XG5cbm1vZHVsZS5leHBvcnRzID0gQm9vdDtcblxuQm9vdC5wcm90b3R5cGUgPSB7XG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0Z2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG5cdFx0aWYgKGdhbWUuZGV2aWNlLmRlc2t0b3ApIHtcblx0XHRcdGdhbWUuc3RhZ2Uuc2NhbGUucGFnZUFsaWduSG9yaXpvbnRhbGx5ID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRhbGVydChcIkRlc2t0b3AgZ2FtZSBvbmx5XCIpXG5cdFx0fVxuXHRcdGdhbWUuc3RhdGUuc3RhcnQoXCJQcmVsb2FkZXJcIik7XG5cdH1cbn1cbiIsInZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi4vZW50aXRpZXMvcGxheWVyXCIpO1xudmFyIEVuZW15ID0gcmVxdWlyZShcIi4uL2VudGl0aWVzL2VuZW15XCIpO1xudmFyIENoZWNrcG9pbnQgPSByZXF1aXJlKFwiLi4vZW50aXRpZXMvY2hlY2twb2ludFwiKTtcbnZhciBUZXh0Q29uZmlndXJlciA9IHJlcXVpcmUoXCIuLi91dGlsL3RleHRfY29uZmlndXJlclwiKTtcblxudmFyIExldmVsID0gZnVuY3Rpb24gKCkge307XG5cbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7XG5cbmdhbWUuZ3Jhbm55UG9pbnRlciA9IDA7XG5cbkxldmVsLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcblx0Z2FtZS5ncmFubnlDb3VudGVyID0gMDtcblx0Ly8gaW5pdGlhbGl6ZSB0aGluZ3Ncblx0bGV2ZWwgPSB0aGlzO1xuXHR0aGlzLmxpdmVzID0gMTA7XG5cdHRoaXMuZW5lbWllcyA9IFtdO1xuXHR0aGlzLnBsYXllcnMgPSBbXTtcblx0Z2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cblx0dGhpcy5pbml0aWFsaXplTWFwKCk7XG5cdHRoaXMuaW5pdGlhbGl6ZUNoZWNrcG9pbnRzKCk7XG5cdHRoaXMuaW5pdGlhbGl6ZUVuZW1pZXMoKTtcblx0dGhpcy5pbml0aWFsaXplUGxheWVyKCk7XG5cdHRoaXMuc2V0dXBHcmFubnlDb250cm9sbGVyKCk7XG5cblx0dGhpcy5pbml0aWFsaXplR2FtZUNhbWVyYSgpO1xuXG5cdC8vIGluaXRpYWxpemUgdGhlIFwib25jbGlja1wiIGZ1bmN0aW9uXG5cdGdhbWUuaW5wdXQub25Eb3duLmFkZCh0aGlzLm1vdmVHcmFubnksIHRoaXMpO1xuXG5cdC8vIHNldHVwIGtleWJvYXJkIGlucHV0XG5cdHNwYWNlYmFyID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcblxuXHR0aGlzLndhc2QgPSB7XG5cdFx0J3VwJyA6IGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5XKSxcblx0XHQnZG93bicgOiBnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUyksXG5cdFx0J2xlZnQnIDogZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkEpLFxuXHRcdCdyaWdodCcgOmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5EKVxuXHR9O1xuXG5cdC8vIG9uIGtleWJvYXJkIGlucHV0IHRvZ2dsZSBjYW1lcmFcblx0Z2FtZS5pbnB1dC5rZXlib2FyZC5vbkRvd25DYWxsYmFjayA9IHRoaXMudG9nZ2xlQ2FtZXJhO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLm1vdmVHcmFubnkgPSBmdW5jdGlvbihwb2ludCkge1xuXHR0aGlzLnBsYXllcnNbZ2FtZS5ncmFubnlQb2ludGVyXS5tb3ZlKHBvaW50KTtcbn1cblxuTGV2ZWwucHJvdG90eXBlLmFkZEhVRCA9IGZ1bmN0aW9uICgpIHtcblx0aWYgKHRoaXMubGl2ZXNUZXh0ICE9IG51bGwpIHtcblx0XHR0aGlzLmxpdmVzVGV4dC5kZXN0cm95KCk7XG5cdH1cblxuXHR0aGlzLmxpdmVzVGV4dCA9IGdhbWUuYWRkLnRleHQoMTAsIDEwLCBcIkxpdmVzOiBcIiArIHRoaXMubGl2ZXMpO1xuXHRUZXh0Q29uZmlndXJlci5jb25maWd1cmVUZXh0KHRoaXMubGl2ZXNUZXh0LCBcIndoaXRlXCIsIDMyKTtcblx0dGhpcy5saXZlc1RleHQuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cblx0aWYgKHRoaXMuY2FtZXJhVGV4dCAhPSBudWxsKSB7XG5cdFx0dGhpcy5jYW1lcmFUZXh0LmRlc3Ryb3koKTtcblx0fVxuXHR0aGlzLmNhbWVyYVRleHQgPSBnYW1lLmFkZC50ZXh0KDEwLCA0OCwgXCJDYW1lcmE6IExvY2tlZFwiKVxuXHRUZXh0Q29uZmlndXJlci5jb25maWd1cmVUZXh0KHRoaXMuY2FtZXJhVGV4dCwgXCJ3aGl0ZVwiLCAxNik7XG5cdHRoaXMuY2FtZXJhVGV4dCAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG59XG5cbkxldmVsLnByb3RvdHlwZS5raWxsR3Jhbm55ID0gZnVuY3Rpb24oZ3Jhbm55KSB7XG5cdGdyYW5ueS5raWxsKCk7XG59XG5cbkxldmVsLnByb3RvdHlwZS50b2dnbGVDYW1lcmEgPSBmdW5jdGlvbigpIHtcblx0Ly8gaWYgc3BhY2ViYXIgd2FzIGhpdCwgdG9nZ2xlIGNhbWVyYVxuXHRpZiAoZ2FtZS5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKSkge1xuXHRcdGlmIChnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPT09IHRydWUpIHtcblx0XHRcdC8vIHVuZm9sbG93XG5cdFx0XHRnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPSBmYWxzZTtcblx0XHRcdGdhbWUuY2FtZXJhLnVuZm9sbG93KCk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZm9sbG93IHBsYXllclxuXHRcdFx0Z2FtZS5jYW1lcmEuZm9sbG93aW5nID0gdHJ1ZTtcblx0XHRcdGdhbWUuY2FtZXJhLmZvbGxvdyhsZXZlbC5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0pO1xuXHRcdH1cblx0fVxufTtcblxuTGV2ZWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuXHQvLyBnYW1lIGNhbWVyYSB1cGRhdGVzXG5cdHRoaXMubW92ZUdhbWVDYW1lcmEoKTtcblxuXHQvLyBkaXNwbHkgY2hlY2twb2ludHMgc3F1YXJlc1xuXHRmb3IgKGkgPSAwOyBpIDwgdGhpcy5jaGVja3BvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdHRoaXMuY2hlY2twb2ludHNbaV0udXBkYXRlKCk7XG5cdH1cbn07XG5cbkxldmVsLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcblx0Ly8gU2hvdyBnYW1lIHN0YXRzIC0gZnBzLCBjYW1lcmEgbG9jYXRpb24sIHNwcml0ZSBsb2NhdGlvblxuXHQvL2dhbWUuZGVidWcuY2FtZXJhSW5mbyhnYW1lLmNhbWVyYSwgMzIsIDMyKTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5pbml0aWFsaXplR2FtZUNhbWVyYSA9IGZ1bmN0aW9uICgpIHtcblx0Ly8gc2V0IGNhbWFlcmEgdG8gZm9sbG93IGNoYXJhY3RlclxuXHRnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPSB0cnVlO1xuXHRnYW1lLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0pO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLmluaXRpYWxpemVNYXAgPSBmdW5jdGlvbigpIHtcblx0Ly8gcmVhZCBmcm9tIHRpbGVtYXAgXCJtYXBcIlxuXHR0aGlzLm1hcCA9IGdhbWUuYWRkLnRpbGVtYXAoXCJtYXBcIik7XG5cdC8vdGlsZXNldCA9IHZvbGNhbm8tc2V0IChpbnNpZGUgTGF2YS0xLmpzb24sIHRpbGVzIGlzIGZyb20gcHJlbG9hZGVkIGltYWdlXG5cdHRoaXMubWFwLmFkZFRpbGVzZXRJbWFnZShcInZvbGNhbm8tdGlsZXNldFwiLCBcInRpbGVzXCIsIDE2LCAxNik7XG5cblx0Ly8gQ3JlYXRlIEdyb3VuZCBMYXllclxuXHR0aGlzLmdyb3VuZExheWVyID0gbmV3IFBoYXNlci5UaWxlbWFwTGF5ZXIoZ2FtZSwgdGhpcy5tYXAsIHRoaXMubWFwLmdldExheWVySW5kZXgoXCJHcm91bmRcIiksIGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0KTtcblx0Z2FtZS53b3JsZC5hZGRBdCh0aGlzLmdyb3VuZExheWVyLCAwKTtcblx0dGhpcy5ncm91bmRMYXllci5yZXNpemVXb3JsZCgpO1xuXG5cdC8vIENyZWF0ZSBXYWxsIExheWVyLCBhZGQgY29sbGlzaW9uIHRpbGVzLCBlbmVhYmxlIHBoeXNpY3MuXG5cdHRoaXMuYmxvY2tMYXllciA9IG5ldyBQaGFzZXIuVGlsZW1hcExheWVyKGdhbWUsIHRoaXMubWFwLCB0aGlzLm1hcC5nZXRMYXllckluZGV4KFwiV2FsbFwiKSwgZ2FtZS53aWR0aCwgZ2FtZS5oZWlnaHQpO1xuICAgIGdhbWUud29ybGQuYWRkQXQodGhpcy5ibG9ja0xheWVyLCAxKTtcbiAgICB0aGlzLm1hcC5zZXRDb2xsaXNpb24oWzE2MCwgMTYxLCAxODksIDE5MCwgMTkxLCAxOTIsIDIyMCwgMjIxLCAyMjJdLCB0cnVlLCBcIldhbGxcIik7XG5cdHRoaXMuYmxvY2tMYXllci5yZXNpemVXb3JsZCgpO1xuXHRnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLmJsb2NrTGF5ZXIpO1xuXG5cdC8vIENyZWF0ZSBEZWF0aCBMYXllciwgYWRkIGNvbGxpc2lvbiB0aWxlcywgZW5hYmxlIHBoeXNpY3MuXG5cdHRoaXMuZGVhdGhMYXllciA9IG5ldyBQaGFzZXIuVGlsZW1hcExheWVyKGdhbWUsIHRoaXMubWFwLCB0aGlzLm1hcC5nZXRMYXllckluZGV4KFwiTGF2YVwiKSwgZ2FtZS53aWR0aCwgZ2FtZS5oZWlnaHQpO1xuICAgIGdhbWUud29ybGQuYWRkQXQodGhpcy5kZWF0aExheWVyLCAyKTtcbiAgICB0aGlzLm1hcC5zZXRDb2xsaXNpb24oWzEyMSwgMTI0LCAxNTIsIDE1NCwgMTg0LCAyMTEsIDIxMywgMjE0LCA0MDAsIDQwMSwgNDAyLCA0MzAsIDQzMSwgNDMyLCA0NjAsIDQ2MSwgNDYyXSwgdHJ1ZSwgXCJMYXZhXCIpO1xuICAgIHRoaXMuZGVhdGhMYXllci5yZXNpemVXb3JsZCgpO1xuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUuZW5hYmxlKHRoaXMuZGVhdGhMYXllcik7XG59O1xuXG5MZXZlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZVBsYXllciA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgaSA9IDA7XG5cdGdhbWUubG9hZFNwcml0ZXMuY2hlY2twb2ludHNbMF0uc3Bhd25wb2ludHMuZm9yRWFjaChmdW5jdGlvbihzcGF3bnBvaW50KSB7XG5cdFx0bGV2ZWwucGxheWVyc1tpKytdID0gbmV3IFBsYXllcihzcGF3bnBvaW50LngsIHNwYXducG9pbnQueSk7XG5cdH0pO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLmluaXRpYWxpemVFbmVtaWVzID0gZnVuY3Rpb24oKSB7XG5cdGdhbWUubG9hZFNwcml0ZXMuem9tYmllcy5mb3JFYWNoKGZ1bmN0aW9uKHpvbWJpZSkge1xuXHRcdGxldmVsLmVuZW1pZXMucHVzaChuZXcgRW5lbXkoem9tYmllLnBvc2l0aW9uLCB6b21iaWUuc3BlZWQpKTtcblx0fSk7XG59O1xuXG5MZXZlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZUNoZWNrcG9pbnRzID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuY2hlY2twb2ludHMgPVxuXHRbXG5cdFx0bmV3IENoZWNrcG9pbnQoMCwgODAsIDY0LCA4MCwgdHJ1ZSwgMSksXG5cdFx0bmV3IENoZWNrcG9pbnQoMzM2LCA1NDIsIDgwLCA2NCwgZmFsc2UsIDIpLFxuXHRcdG5ldyBDaGVja3BvaW50KDc1MCwgOTYsIDgwLCA0OCwgZmFsc2UsIDMpLFxuXHRcdG5ldyBDaGVja3BvaW50KDE1MDYsIDMzOCwgOTIsIDgwLCBmYWxzZSwgNCwgdHJ1ZSlcblx0XTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5zZXR1cEdyYW5ueUNvbnRyb2xsZXIgPSBmdW5jdGlvbigpIHtcblx0Z2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLk9ORSkucHJvY2Vzc0tleURvd24gPSBmdW5jdGlvbigpIHtcblx0XHRnYW1lLmdyYW5ueVBvaW50ZXIgPSAwO1xuXHRcdC8vaWYgKClcblx0XHRnYW1lLmNhbWVyYS5mb2xsb3cobGV2ZWwucGxheWVyc1tnYW1lLmdyYW5ueVBvaW50ZXJdKTtcblx0fVxuXHRnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVFdPKS5wcm9jZXNzS2V5RG93biA9IGZ1bmN0aW9uKCkge1xuXHRcdGdhbWUuZ3Jhbm55UG9pbnRlciA9IDE7XG5cdFx0Z2FtZS5jYW1lcmEuZm9sbG93KGxldmVsLnBsYXllcnNbZ2FtZS5ncmFubnlQb2ludGVyXSk7XG5cdH1cblx0Z2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlRIUkVFKS5wcm9jZXNzS2V5RG93biA9IGZ1bmN0aW9uKCkge1xuXHRcdGdhbWUuZ3Jhbm55UG9pbnRlciA9IDI7XG5cdFx0Z2FtZS5jYW1lcmEuZm9sbG93KGxldmVsLnBsYXllcnNbZ2FtZS5ncmFubnlQb2ludGVyXSk7XG5cdH1cblx0Z2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkZPVVIpLnByb2Nlc3NLZXlEb3duID0gZnVuY3Rpb24oKSB7XG5cdFx0Z2FtZS5ncmFubnlQb2ludGVyID0gMztcblx0XHRnYW1lLmNhbWVyYS5mb2xsb3cobGV2ZWwucGxheWVyc1tnYW1lLmdyYW5ueVBvaW50ZXJdKTtcblx0fVxufVxuXG5MZXZlbC5wcm90b3R5cGUubW92ZUdhbWVDYW1lcmEgPSBmdW5jdGlvbigpIHtcblx0Ly8gY2hlY2sgaWYgY2FtZXJhIGlzIHNldCB0byBmb2xsb3cgY2hhcmFjdGVyXG5cdGlmIChnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPT0gZmFsc2UpIHtcblx0XHQvLyBtb3ZlIGNhbWVyYVxuXHRcdGlmICh0aGlzLndhc2QudXAuaXNEb3duKSB7XG5cdFx0XHRnYW1lLmNhbWVyYS55IC09IDQ7XG5cdFx0fVxuXHRcdGlmICh0aGlzLndhc2QuZG93bi5pc0Rvd24pIHtcblx0XHRcdGdhbWUuY2FtZXJhLnkgKz0gNDtcblx0XHR9XG5cdFx0aWYgKHRoaXMud2FzZC5sZWZ0LmlzRG93bikge1xuXHRcdFx0Z2FtZS5jYW1lcmEueCAtPSA0O1xuXHRcdH1cblx0XHRpZiAodGhpcy53YXNkLnJpZ2h0LmlzRG93bikge1xuXHRcdFx0Z2FtZS5jYW1lcmEueCArPSA0O1xuXHRcdH1cblx0fVxufTtcbiIsInZhciBUZXh0Q29uZmlndXJlciA9IHJlcXVpcmUoXCIuLi91dGlsL3RleHRfY29uZmlndXJlclwiKVxuXG52YXIgUHJlbG9hZGVyID0gZnVuY3Rpb24oKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcmVsb2FkZXI7XG5cblByZWxvYWRlci5wcm90b3R5cGUgPSB7XG5cdHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZGlzcGxheUxvYWRlcigpO1xuXHRcdHRoaXMubG9hZC50aWxlbWFwKFwibWFwXCIsIFwiYXNzZXRzL21hcC9MZXZlbHMvTXVsdGktMS9NdWx0aS0xLW1hcC5qc29uXCIsIG51bGwsIFBoYXNlci5UaWxlbWFwLlRJTEVEX0pTT04pO1xuXHRcdHRoaXMubG9hZC5pbWFnZShcInRpbGVzXCIsIFwiYXNzZXRzL3RpbGVzL3ZvbGNhbm8tdGlsZXNldC5wbmdcIik7XG5cdFx0dGhpcy5sb2FkLnNwcml0ZXNoZWV0KFwiZ3Jhbm55XCIsIFwiYXNzZXRzL3RleHR1cmVzL2dyYW5ueS5wbmdcIik7XG5cdFx0dGhpcy5sb2FkLnNwcml0ZXNoZWV0KFwiZW5lbXlcIiwgXCJhc3NldHMvdGV4dHVyZXMvem9tYmllLnBuZ1wiLCAxNTcsIDEwMik7XG5cdFx0Z2FtZS5sb2FkU3ByaXRlcyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9hc3NldHMvbWFwL0xldmVscy9NdWx0aS0xL211bHRpLTEuanNvblwiKTtcblxuXHRcdGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcblx0XHRtb3VzZSA9IGdhbWUuaW5wdXQubW91c2U7XG5cdH0sXG5cblx0ZGlzcGxheUxvYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50ZXh0ID0gZ2FtZS5hZGQudGV4dChnYW1lLmNhbWVyYS53aWR0aCAvIDIsIDI1MCwgXCJMb2FkaW5nLi4uIFwiKTtcbiAgICBcdHRoaXMudGV4dC5hbmNob3Iuc2V0VG8oLjUsIC41KTtcblx0XHRUZXh0Q29uZmlndXJlci5jb25maWd1cmVUZXh0KHRoaXMudGV4dCwgXCJ3aGl0ZVwiLCAzMik7XG5cbiAgICBcdHRoaXMubG9hZC5vbkZpbGVDb21wbGV0ZS5hZGQoZnVuY3Rpb24ocHJvZ3Jlc3MpIHtcblx0ICAgICAgICB0aGlzLnRleHQuc2V0VGV4dChcIkxvYWRpbmcuLi4gXCIgKyBwcm9ncmVzcyArIFwiJVwiKTtcblx0ICAgIH0sIHRoaXMpO1xuXG4gICAgXHR0aGlzLmxvYWQub25Mb2FkQ29tcGxldGUuYWRkKGZ1bmN0aW9uKCkge1xuXHRcdFx0Z2FtZS5zdGF0ZS5zdGFydChcIkxldmVsXCIpO1xuXHQgICAgfSk7XG5cdH1cbn1cbiIsImV4cG9ydHMuY29uZmlndXJlVGV4dCA9IGZ1bmN0aW9uKHRleHQsIGNvbG9yLCBzaXplKSB7XG5cdHRleHQuZm9udCA9IFwiQ2FydGVyIE9uZVwiO1xuXHR0ZXh0LmZpbGwgPSBjb2xvcjtcblx0dGV4dC5mb250U2l6ZSA9IHNpemU7XG59XG4iLCJ3aW5kb3cuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg2MDgsIDYwOCwgUGhhc2VyLkFVVE8sICcnLCB7IGNyZWF0ZTogY3JlYXRlIH0pO1xuXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgLy9pbml0aWFsaXplIGFsbCB0aGUgZ2FtZSBzdGF0ZXMuXG4gICAgZ2FtZS5zdGF0ZS5hZGQoXCJCb290XCIsIHJlcXVpcmUoXCIuL2dhbWUvc3RhdGVzL2Jvb3RcIikpO1xuICAgIGdhbWUuc3RhdGUuYWRkKFwiUHJlbG9hZGVyXCIsIHJlcXVpcmUoXCIuL2dhbWUvc3RhdGVzL3ByZWxvYWRlclwiKSk7XG5cdGdhbWUuc3RhdGUuYWRkKFwiTGV2ZWxcIiwgcmVxdWlyZShcIi4vZ2FtZS9zdGF0ZXMvbGV2ZWxcIikpO1xuICAgIGdhbWUuc3RhdGUuc3RhcnQoXCJCb290XCIpO1xufTtcbiJdfQ==
