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
    Phaser.Sprite.call(this, game, x, y, "dude");
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
},{"../../../assets/map/Levels/Multi-1/multi-1.json":1,"../util/text_configurer":8}],8:[function(require,module,exports){
exports.configureText = function(text, color, size) {
	text.font = "Carter One";
	text.fill = color;
	text.fontSize = size;
}
},{}],9:[function(require,module,exports){
window.game = new Phaser.Game(608, 608, Phaser.AUTO, '', { create: create });

function create() {
	/*easyrtc.enableDebug(true);
	easyrtc.connect("game.server",
	 	function(easyrtcid, roomOwner) {
	    	//connected
	  	},
	  	function(errorText) {
			console.log("failed to connect ", erFrText);
		}
	);
	easyrtc.enableDataChannels(true);

	easyrtc.joinRoom(
		"lobby",
		null,
		function() {
		 	easyrtc.sendServerMessage("hello",  {message:'hello'},
	      	function(ackmessage){
		        console.log(ackmessage);
		    	}
		   	);
 		},
		function() {
			console.log('failed to join')	
		}	
	);*/


    //initialize all the game states.
    game.state.add("Boot", require("./game/states/boot"));
    game.state.add("Preloader", require("./game/states/preloader"));
	game.state.add("Level", require("./game/states/level"));
    game.state.start("Boot");
};






},{"./game/states/boot":5,"./game/states/level":6,"./game/states/preloader":7}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92NC4yLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiY2xpZW50L2Fzc2V0cy9tYXAvTGV2ZWxzL011bHRpLTEvbXVsdGktMS5qc29uIiwiY2xpZW50L3NyYy9nYW1lL2VudGl0aWVzL2NoZWNrcG9pbnQuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvZW5lbXkuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvcGxheWVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9ib290LmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9sZXZlbC5qcyIsImNsaWVudC9zcmMvZ2FtZS9zdGF0ZXMvcHJlbG9hZGVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3V0aWwvdGV4dF9jb25maWd1cmVyLmpzIiwiY2xpZW50L3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiem9tYmllc1wiIDogW1xuXHRcdHtcblx0XHRcdFwicG9zaXRpb25cIiA6IFtcblx0XHRcdFx0e1wieFwiIDogMjUwLCBcInlcIiA6IDIwMH0sXG5cdFx0XHRcdHtcInhcIiA6IDI1MCwgXCJ5XCIgOiAyNTB9XG5cdFx0XHRdLFxuXHRcdFx0XCJzcGVlZFwiIDogMTAwXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInBvc2l0aW9uXCIgOiBbXG5cdFx0XHRcdHtcInhcIiA6IDMwMCwgXCJ5XCIgOiAzMDB9LFxuXHRcdFx0XHR7XCJ4XCIgOiAzNTAsIFwieVwiIDogMzAwfSxcblx0XHRcdFx0e1wieFwiIDogMzI1LCBcInlcIiA6IDEwMH1cblx0XHRcdF0sXG5cdFx0XHRcInNwZWVkXCIgOiAxNTBcblx0XHR9XG5cdF0sXG5cdFwiY2hlY2twb2ludHNcIiA6IFtcblx0XHR7XG5cdFx0XHRcInNwYXducG9pbnRzXCIgOiBbXG5cdFx0XHRcdHtcInhcIjogODAsIFwieVwiOiA3NX0sXG5cdFx0XHRcdHtcInhcIjogODAsIFwieVwiOiAxNTV9LFxuXHRcdFx0XHR7XCJ4XCI6IDgwLCBcInlcIjogMjM1fSxcblx0XHRcdFx0e1wieFwiOiA4MCwgXCJ5XCI6IDMxNX1cblx0XHRcdF0sXG5cdFx0XHRcImRpbWVuc2lvbnNcIiA6IHtcIngwXCIgOiAwLCBcIndpZHRoXCIgOiAxMCwgXCJ5MFwiIDogMCwgXCJoZWlnaHRcIiA6IDEwfVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJzcGF3bnBvaW50c1wiIDogW1xuXHRcdFx0XHR7XCJ4XCI6IDAsIFwieVwiOiAwfSxcblx0XHRcdFx0e1wieFwiOiAwLCBcInlcIjogMX0sXG5cdFx0XHRcdHtcInhcIjogMCwgXCJ5XCI6IDJ9LFxuXHRcdFx0XHR7XCJ4XCI6IDAsIFwieVwiOiAzfVxuXHRcdFx0XSxcblx0XHRcdFwiZGltZW5zaW9uc1wiIDoge1wieDBcIiA6IDEwLCBcIndpZHRoXCIgOiAxMCwgXCJ5MFwiIDogMTAsIFwiaGVpZ2h0XCIgOiAxMH1cblx0XHR9XG5cdF1cbn1cbiIsInZhciBDaGVja3BvaW50ID0gZnVuY3Rpb24gKHgsIHksIHdpZHRoLCBoZWlnaHQsIGFjdGl2YXRlZCwgb3JkZXIsIGZpbmFsQ2hlY2twb2ludCkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBudWxsKTtcblx0Z2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXHR0aGlzLmJvZHkuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0LCAwLCAwKTtcblxuXHR0aGlzLmZpbmFsQ2hlY2twb2ludCA9IGZpbmFsQ2hlY2twb2ludDtcbiAgICB0aGlzLm9yZGVyID0gb3JkZXI7XG4gICAgdGhpcy5hY3RpdmF0ZWQgPSBhY3RpdmF0ZWQ7XG4gICAgLy9hZGQgc3ByaXRlIHRvIGdhbWVcbiAgICBnYW1lLmRlYnVnLmdlb20odGhpcyAsJ3JiZ2EoMCwgMCwgMjU1LCAxKScsIGZhbHNlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaGVja3BvaW50O1xuXG5DaGVja3BvaW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5DaGVja3BvaW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAvL2dhbWUuZGVidWcuYm9keSh0aGlzLCBcInJiZ2EoMCwgMCwgMjU1LCAxKVwiLCBmYWxzZSk7XG59IiwidmFyIEVuZW15ID0gZnVuY3Rpb24gKF9wb3NpdGlvbnMsIF92ZWxvY2l0eSkge1xuICAgIFxuICAgIHRoaXMucG9zaXRpb25zID0gX3Bvc2l0aW9ucztcbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHRoaXMucG9zaXRpb25zWzBdLngsIHRoaXMucG9zaXRpb25zWzBdLnksIFwiZW5lbXlcIik7XG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcyk7XG5cbiAgICB0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuc291cmNlSGVpZ2h0ID0gMTAwO1xuICAgIHRoaXMuYm9keS5zb3VyY2VXaWR0aCA9IDEwMDtcblxuICAgIHRoaXMubWF4X3ZlbG9jaXR5ID0gX3ZlbG9jaXR5O1xuICAgIHRoaXMuZGVzdGluYXRpb24gPSBudWxsOyAgICBcbiAgICBcbiAgICB0aGlzLnNjYWxlLnNldCguMywuMyk7XG4gICAgdGhpcy5hbmNob3IueCA9IC41O1xuICAgIHRoaXMuYW5jaG9yLnkgPSAuNTtcbiAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG5cbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFwid2Fsa1wiKTtcbiAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcIndhbGtcIiwgNiwgdHJ1ZSk7XG5cbiAgICAvL3NldCBib3VuZGluZyBib3hcbiAgICB0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICBcbiAgICBnYW1lLmFkZC5leGlzdGluZyh0aGlzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmVteTtcblxuRW5lbXkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5cbkVuZW15LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAvL2dhbWUuZGVidWcuYm9keSh0aGlzLCBcInJnYmEoMjU1LDAsMCwyKVwiLCBmYWxzZSk7XG4gICAgdGhpcy5tb3ZlKCk7XG59XG5cbkVuZW15LnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmRlc3RpbmF0aW9uID09IG51bGwpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnBvc2l0aW9uc1t0aGlzLmNvdW50ZXIldGhpcy5wb3NpdGlvbnMuc2l6ZV0ueCk7XG4gICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBuZXcgUGhhc2VyLlBvaW50KHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5sZW5ndGhdLngsIHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5sZW5ndGhdLnkpO1xuICAgIFxuICAgICAgICAvL3JvdGF0ZSBzcHJpdGUgdG8gZmFjZSB0aGUgZGlyZWN0aW9uIGl0IHdpbGwgYmUgbW92aW5nXG4gICAgICAgIHRoaXMucm90YXRpb24gPSBnYW1lLnBoeXNpY3MuYXJjYWRlLmFuZ2xlVG9YWSh0aGlzLmJvZHksIHRoaXMuZGVzdGluYXRpb24ueCwgdGhpcy5kZXN0aW5hdGlvbi55KTtcblxuICAgICAgICAvL21vdmUgY2hhcmFjdGVyIHRvIHRoZSBwb2ludCAocGxheWVyIGRvZXNudCBzdG9wIG9uY2UgaXQgaGl0cyB0aGF0IHBvaW50IHdpdGggdGhpcyBtZXRob2QgLSBzZWUgY2hlY2tMb2NhdGlvbigpKSBcbiAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9YWSh0aGlzLCB0aGlzLnBvc2l0aW9uc1t0aGlzLmNvdW50ZXIldGhpcy5wb3NpdGlvbnMubGVuZ3RoXS54LCB0aGlzLnBvc2l0aW9uc1t0aGlzLmNvdW50ZXIldGhpcy5wb3NpdGlvbnMubGVuZ3RoXS55LCB0aGlzLm1heF92ZWxvY2l0eSk7XG5cbiAgICAgICAgdGhpcy5jb3VudGVyICsrO1xuICAgIH0gXG4gICAgdGhpcy5jaGVja0xvY2F0aW9uKCk7XG59XG5cbkVuZW15LnByb3RvdHlwZS5jaGVja0xvY2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgLy9pZiB0aGVyZSBpcyBubyBjb250YWN0LCBzdG9wIHRoZSBjaGFyYWN0ZXIgZnJvbSBtb3ZpbmcgYWZ0ZXIgdGhleSd2ZSByZWFjaGVkIHRoZWlyIGRlc3RpbmF0aW9uXG4gICAgLy9tYWRlIGl0IGFwcHJveGltYXRlIGRlc3RpbmF0aW9uIGJlY2F1c2UgaXRzIHVubGlrZWx5IGl0IHdpbGwgZW5kIG9uIHRoYXQgZXhhY3QgbG9jYXRpb25cbiAgICBpZiAodGhpcy5kZXN0aW5hdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIC8vb25jZSBpdCBnZXRzIGNsb3NlIGVub3VnaCB0byB0aGUgeCBkZXN0aW5hdGlvbiBsb3dlciB4IHZlbG9jaXR5XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRlc3RpbmF0aW9uLngpIDwgdGhpcy5tYXhfdmVsb2NpdHkvMTAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IC0odGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXN0aW5hdGlvbi54KTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgLy9vbmNlIGl0IGdldHMgY2xvc2UgZW5vdWdoIHRvIHRoZSB5IGRlc3RpbmF0aW9uIGxvd2VyIHkgdmVsb2NpdHlcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSkgPCB0aGlzLm1heF92ZWxvY2l0eS8xMDApIHtcbiAgICAgICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS55ID0gLSh0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmRlc3RpbmF0aW9uLnkpO1xuICAgICAgICB9XG4gICAgICAgIC8vc3RvcCBtb3ZlbWVudCBjb21wbGV0ZWx5IC0gZGVzdGluYXRpb24gaGFzIGJlZW4gcmVhY2hlZC5cbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGVzdGluYXRpb24ueCkgPCA1ICYmIE1hdGguYWJzKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSkgPCA1KSB7XG4gICAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsInZhciBNQVhfVkVMT0NJVFkgPSAxNTA7XG52YXIgVGV4dENvbmZpZ3VyZXIgPSByZXF1aXJlKFwiLi4vdXRpbC90ZXh0X2NvbmZpZ3VyZXJcIilcblxudmFyIFBsYXllciA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgdGhpcy5pZCA9IGdhbWUuZ3Jhbm55Q291bnRlcisrO1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImR1ZGVcIik7XG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcyk7XG5cbiAgICAvLyBzZXQgYm91bmRpbmcgYm94XG4gICAgdGhpcy5ib2R5LmNvbGxpZGVXb3JsZEJvdW5kcyA9IHRydWU7XG4gICAgdGhpcy5ib2R5LnNvdXJjZUhlaWdodCA9IDgwO1xuICAgIHRoaXMuYm9keS5zb3VyY2VXaWR0aCA9IDgwO1xuICAgIFxuICAgIC8vIHNocmluayBjaGFyYWN0ZXJcbiAgICB0aGlzLnNjYWxlLnNldCguMywuMyk7XG5cbiAgICAvLyBzZXQgdGhlIHBsYXllcnMgcG9zaXRpb24gdG8gdGhlIGNlbnRlciBvZiB0aGUgc3ByaXRlXG4gICAgdGhpcy5hbmNob3IueCA9IC40NTtcbiAgICB0aGlzLmFuY2hvci55ID0gLjU1O1xuICAgIC8vIHR1cm4gY2hhcmFjdGVyIHRoZSBvdGhlciBkaXJlY3Rpb25cbiAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5QSSA7XG5cbiAgICAvLyBjcmVhdGUgdGhpcyB2YWx1ZSBmb3Igc29tZSBudWxsIGNoZWNrXG4gICAgdGhpcy5kZXN0aW5hdGlvbjtcblxuICAgIC8vIGFkZCBzcHJpdGUgdG8gZ2FtZVxuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcblxuUGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGRpc3BsYXkgYm91bmRpbmcgYm94XG4gICAgLy8gZ2FtZS5kZWJ1Zy5ib2R5KHRoaXMsIFwicmdiYSgwLDI1NSwwLDEwMClcIiwgZmFsc2UpO1xuXG4gICAgLy8gaWYgcGxheWVyIGlzIG1vdmluZyB0aGlzIHdpbGwgdGVsbCBpdCB3aGVuIHRvIHN0b3BcbiAgICB0aGlzLmNoZWNrTG9jYXRpb24oKTsgICAgXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihwb2ludGVyKSB7XG4gICAgLy8gcGxheWVycyBkZXN0aW5hdGlvbiBpcyB3cml0dGVuIGFjY29yZGluZyB0byB3b3JsZCB2aWV3LiAobm90IGNhbWVyYSlcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gbmV3IFBoYXNlci5Qb2ludChnYW1lLmNhbWVyYS54ICsgcG9pbnRlci54LCBnYW1lLmNhbWVyYS55ICsgcG9pbnRlci55KTtcblxuICAgIC8vIHJvdGF0ZSBzcHJpdGUgdG8gZmFjZSB0aGUgZGlyZWN0aW9uIGl0IHdpbGwgYmUgbW92aW5nXG4gICAgdGhpcy5yb3RhdGlvbiA9IGdhbWUucGh5c2ljcy5hcmNhZGUuYW5nbGVUb1hZKHRoaXMuYm9keSwgdGhpcy5kZXN0aW5hdGlvbi54LCB0aGlzLmRlc3RpbmF0aW9uLnkpICsgTWF0aC5QSTtcblxuICAgIC8vIG1vdmUgY2hhcmFjdGVyIHRvIHRoZSBwb2ludCAocGxheWVyIGRvZXNudCBzdG9wIG9uY2UgaXQgaGl0cyB0aGF0IHBvaW50IHdpdGggdGhpcyBtZXRob2QgLSBzZWUgY2hlY2tMb2NhdGlvbigpKSBcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1hZKHRoaXMsIGdhbWUuY2FtZXJhLnggKyBwb2ludGVyLngsIGdhbWUuY2FtZXJhLnkgKyBwb2ludGVyLnksIE1BWF9WRUxPQ0lUWSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrTG9jYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBjaGVjayBjb250YWN0IHdpdGggcm9jayB3YWxsc1xuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLCBsZXZlbC5ibG9ja0xheWVyKTtcblxuICAgIGdyYW5ueSA9IHRoaXM7XG4gICAgLy8gY2hlY2sgY29udGFjdCB3aXRoIGxhdmEgLSBhZGQgXCJkaWVcIiBjYWxsYmFjayBpZiBjb250YWN0IGlzIG1hZGVcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcywgbGV2ZWwuZGVhdGhMYXllcixcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXZlbC5raWxsR3Jhbm55KGdyYW5ueSlcbiAgICAgICAgfSk7XG5cbiAgICAvLyBjaGVjayBmb3IgY29udGFjdCB3aXRoIGVuZW1pZXNcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGV2ZWwuZW5lbWllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcywgbGV2ZWwuZW5lbWllc1tpXSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXZlbC5raWxsR3Jhbm55KGdyYW5ueSlcbiAgICAgICAgfSk7ICAgIFxuICAgIH1cblxuICAgIC8vIGNoZWNrIGZvciBjb250YWN0IHdpdGggY2hlY2twb2ludHNcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGV2ZWwuY2hlY2twb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMsIGxldmVsLmNoZWNrcG9pbnRzW2ldLCBmdW5jdGlvbigpIHsgXG4gICAgICAgICAgICBpZiAobGV2ZWwuY2hlY2twb2ludHNbaV0uYWN0aXZhdGVkID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsZXZlbC5jaGVja3BvaW50c1tpXS5maW5hbENoZWNrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2twb2ludFRleHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja3BvaW50VGV4dC5kZXN0cm95KCk7IFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2twb2ludFRleHQgPSBnYW1lLmFkZC50ZXh0KDIzMCwgMTAsIFwiQ2hlY2twb2ludCBSZWFjaGVkIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgVGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLmNoZWNrcG9pbnRUZXh0LCBcIndoaXRlXCIsIDI0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja3BvaW50VGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBnYW1lLnRpbWUuZXZlbnRzLmFkZCgyMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuYWRkLnR3ZWVuKHRoaXMuY2hlY2twb2ludFRleHQpLnRvKHt5OiAwfSwgMTUwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmFkZC50d2Vlbih0aGlzLmNoZWNrcG9pbnRUZXh0KS50byh7YWxwaGE6IDB9LCAxNTAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy53aW5UZXh0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2luVGV4dC5kZXN0cm95KCk7IFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2luVGV4dCA9IGdhbWUuYWRkLnRleHQoMjMwLCAyNTAsIFwiWW91IFdpbiFcIik7XG4gICAgICAgICAgICAgICAgICAgIFRleHRDb25maWd1cmVyLmNvbmZpZ3VyZVRleHQodGhpcy53aW5UZXh0LCBcIndoaXRlXCIsIDQ4KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aW5UZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGdhbWUudGltZS5ldmVudHMuYWRkKDUwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5zdGF0ZS5zdGFydChcIkxldmVsXCIpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV2ZWwuY2hlY2twb2ludHNbaV0uYWN0aXZhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gICBcbiAgICAgICAgfSk7XG4gICAgfSAgXG5cbiAgICAvLyBpZiB0aGVyZSBpcyBubyBjb250YWN0LCBzdG9wIHRoZSBjaGFyYWN0ZXIgZnJvbSBtb3ZpbmcgYWZ0ZXIgdGhleSd2ZSByZWFjaGVkIHRoZWlyIGRlc3RpbmF0aW9uXG4gICAgLy8gbWFkZSBpdCBhcHByb3hpbWF0ZSBkZXN0aW5hdGlvbiBiZWNhdXNlIGl0cyB1bmxpa2VseSBpdCB3aWxsIGVuZCBvbiB0aGF0IGV4YWN0IGxvY2F0aW9uXG4gICAgaWYgKHRoaXMuZGVzdGluYXRpb24gIT0gbnVsbCkge1xuICAgICAgICAvLyBvbmNlIGl0IGdldHMgY2xvc2UgZW5vdWdoIHRvIHRoZSB4IGRlc3RpbmF0aW9uIGxvd2VyIHggdmVsb2NpdHlcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGVzdGluYXRpb24ueCkgPCBNQVhfVkVMT0NJVFkvMTAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IC0odGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXN0aW5hdGlvbi54KTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgLy8gb25jZSBpdCBnZXRzIGNsb3NlIGVub3VnaCB0byB0aGUgeSBkZXN0aW5hdGlvbiBsb3dlciB5IHZlbG9jaXR5XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmRlc3RpbmF0aW9uLnkpIDwgTUFYX1ZFTE9DSVRZLzEwMCkge1xuICAgICAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnkgPSAtKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3RvcCBtb3ZlbWVudCBjb21wbGV0ZWx5IC0gZGVzdGluYXRpb24gaGFzIGJlZW4gcmVhY2hlZC5cbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24ueCA9PSB0aGlzLmRlc3RpbmF0aW9uLnggJiYgdGhpcy5wb3NpdGlvbi55ID09IHRoaXMuZGVzdGluYXRpb24ueSkge1xuICAgICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59IiwidmFyIEJvb3QgPSBmdW5jdGlvbigpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb3Q7XG5cbkJvb3QucHJvdG90eXBlID0ge1xuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlO1xuXHRcdGlmIChnYW1lLmRldmljZS5kZXNrdG9wKSB7XG5cdFx0XHRnYW1lLnN0YWdlLnNjYWxlLnBhZ2VBbGlnbkhvcml6b250YWxseSA9IHRydWU7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0YWxlcnQoXCJEZXNrdG9wIGdhbWUgb25seVwiKVxuXHRcdH1cblxuXHRcdGdhbWUuc3RhdGUuc3RhcnQoXCJQcmVsb2FkZXJcIik7XG5cdH1cbn0iLCJ2YXIgUGxheWVyID0gcmVxdWlyZShcIi4uL2VudGl0aWVzL3BsYXllclwiKTtcbnZhciBFbmVteSA9IHJlcXVpcmUoXCIuLi9lbnRpdGllcy9lbmVteVwiKTtcbnZhciBDaGVja3BvaW50ID0gcmVxdWlyZShcIi4uL2VudGl0aWVzL2NoZWNrcG9pbnRcIik7XG52YXIgVGV4dENvbmZpZ3VyZXIgPSByZXF1aXJlKFwiLi4vdXRpbC90ZXh0X2NvbmZpZ3VyZXJcIik7XG5cbnZhciBMZXZlbCA9IGZ1bmN0aW9uICgpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsO1xuXG5nYW1lLmdyYW5ueVBvaW50ZXIgPSAwO1xuXG5MZXZlbC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cdGdhbWUuZ3Jhbm55Q291bnRlciA9IDA7XG5cdC8vIGluaXRpYWxpemUgdGhpbmdzXG5cdGxldmVsID0gdGhpcztcblx0dGhpcy5saXZlcyA9IDEwO1xuXHR0aGlzLmVuZW1pZXMgPSBbXTtcblx0dGhpcy5wbGF5ZXJzID0gW107XG5cdGdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXG5cdHRoaXMuaW5pdGlhbGl6ZU1hcCgpO1xuXHR0aGlzLmluaXRpYWxpemVDaGVja3BvaW50cygpO1xuXHR0aGlzLmluaXRpYWxpemVFbmVtaWVzKCk7XG5cdHRoaXMuaW5pdGlhbGl6ZVBsYXllcigpO1xuXHR0aGlzLnNldHVwR3Jhbm55Q29udHJvbGxlcigpO1xuXG5cdHRoaXMuaW5pdGlhbGl6ZUdhbWVDYW1lcmEoKTtcblxuXHQvLyBpbml0aWFsaXplIHRoZSBcIm9uY2xpY2tcIiBmdW5jdGlvblxuXHRnYW1lLmlucHV0Lm9uRG93bi5hZGQodGhpcy5tb3ZlR3Jhbm55LCB0aGlzKTtcblxuXHQvLyBzZXR1cCBrZXlib2FyZCBpbnB1dFxuXHRzcGFjZWJhciA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUik7XG5cblx0dGhpcy53YXNkID0ge1xuXHRcdCd1cCcgOiBnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVyksXG5cdFx0J2Rvd24nIDogZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlMpLFxuXHRcdCdsZWZ0JyA6IGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5BKSxcblx0XHQncmlnaHQnIDpnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRClcblx0fTtcblxuXHQvLyBvbiBrZXlib2FyZCBpbnB1dCB0b2dnbGUgY2FtZXJhXG5cdGdhbWUuaW5wdXQua2V5Ym9hcmQub25Eb3duQ2FsbGJhY2sgPSB0aGlzLnRvZ2dsZUNhbWVyYTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5tb3ZlR3Jhbm55ID0gZnVuY3Rpb24ocG9pbnQpIHtcblx0dGhpcy5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0ubW92ZShwb2ludCk7XG59XG5cbkxldmVsLnByb3RvdHlwZS5hZGRIVUQgPSBmdW5jdGlvbiAoKSB7XG5cdGlmICh0aGlzLmxpdmVzVGV4dCAhPSBudWxsKSB7XG5cdFx0dGhpcy5saXZlc1RleHQuZGVzdHJveSgpO1xuXHR9XG5cblx0dGhpcy5saXZlc1RleHQgPSBnYW1lLmFkZC50ZXh0KDEwLCAxMCwgXCJMaXZlczogXCIgKyB0aGlzLmxpdmVzKTtcblx0VGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLmxpdmVzVGV4dCwgXCJ3aGl0ZVwiLCAzMik7XG5cdHRoaXMubGl2ZXNUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG5cdGlmICh0aGlzLmNhbWVyYVRleHQgIT0gbnVsbCkge1xuXHRcdHRoaXMuY2FtZXJhVGV4dC5kZXN0cm95KCk7XG5cdH1cblx0dGhpcy5jYW1lcmFUZXh0ID0gZ2FtZS5hZGQudGV4dCgxMCwgNDgsIFwiQ2FtZXJhOiBMb2NrZWRcIilcblx0VGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLmNhbWVyYVRleHQsIFwid2hpdGVcIiwgMTYpO1xuXHR0aGlzLmNhbWVyYVRleHQgLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xufVxuXG5MZXZlbC5wcm90b3R5cGUua2lsbEdyYW5ueSA9IGZ1bmN0aW9uKGdyYW5ueSkge1xuXHRncmFubnkua2lsbCgpO1xufVxuXG5MZXZlbC5wcm90b3R5cGUudG9nZ2xlQ2FtZXJhID0gZnVuY3Rpb24oKSB7XG5cdC8vIGlmIHNwYWNlYmFyIHdhcyBoaXQsIHRvZ2dsZSBjYW1lcmFcblx0aWYgKGdhbWUuaW5wdXQua2V5Ym9hcmQuaXNEb3duKFBoYXNlci5LZXlib2FyZC5TUEFDRUJBUikpIHtcblx0XHRpZiAoZ2FtZS5jYW1lcmEuZm9sbG93aW5nID09PSB0cnVlKSB7XG5cdFx0XHQvLyB1bmZvbGxvd1xuXHRcdFx0Z2FtZS5jYW1lcmEuZm9sbG93aW5nID0gZmFsc2U7XG5cdFx0XHRnYW1lLmNhbWVyYS51bmZvbGxvdygpO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGZvbGxvdyBwbGF5ZXJcblx0XHRcdGdhbWUuY2FtZXJhLmZvbGxvd2luZyA9IHRydWU7XG5cdFx0XHRnYW1lLmNhbWVyYS5mb2xsb3cobGV2ZWwucGxheWVyc1tnYW1lLmdyYW5ueVBvaW50ZXJdKTtcblx0XHR9XG5cdH1cbn07XG5cbkxldmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcblx0Ly8gZ2FtZSBjYW1lcmEgdXBkYXRlc1xuXHR0aGlzLm1vdmVHYW1lQ2FtZXJhKCk7XG5cblx0Ly8gZGlzcGx5IGNoZWNrcG9pbnRzIHNxdWFyZXNcblx0Zm9yIChpID0gMDsgaSA8IHRoaXMuY2hlY2twb2ludHMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLmNoZWNrcG9pbnRzW2ldLnVwZGF0ZSgpO1xuXHR9XG59O1xuXG5MZXZlbC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG5cdC8vIFNob3cgZ2FtZSBzdGF0cyAtIGZwcywgY2FtZXJhIGxvY2F0aW9uLCBzcHJpdGUgbG9jYXRpb25cblx0Ly9nYW1lLmRlYnVnLmNhbWVyYUluZm8oZ2FtZS5jYW1lcmEsIDMyLCAzMik7XG59O1xuXG5MZXZlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZUdhbWVDYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG5cdC8vIHNldCBjYW1hZXJhIHRvIGZvbGxvdyBjaGFyYWN0ZXJcblx0Z2FtZS5jYW1lcmEuZm9sbG93aW5nID0gdHJ1ZTtcblx0Z2FtZS5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyc1tnYW1lLmdyYW5ueVBvaW50ZXJdKTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5pbml0aWFsaXplTWFwID0gZnVuY3Rpb24oKSB7XG5cdC8vIHJlYWQgZnJvbSB0aWxlbWFwIFwibWFwXCJcblx0dGhpcy5tYXAgPSBnYW1lLmFkZC50aWxlbWFwKFwibWFwXCIpO1xuXHQvL3RpbGVzZXQgPSB2b2xjYW5vLXNldCAoaW5zaWRlIExhdmEtMS5qc29uLCB0aWxlcyBpcyBmcm9tIHByZWxvYWRlZCBpbWFnZVxuXHR0aGlzLm1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJ2b2xjYW5vLXRpbGVzZXRcIiwgXCJ0aWxlc1wiLCAxNiwgMTYpO1xuXG5cdC8vIENyZWF0ZSBHcm91bmQgTGF5ZXJcblx0dGhpcy5ncm91bmRMYXllciA9IG5ldyBQaGFzZXIuVGlsZW1hcExheWVyKGdhbWUsIHRoaXMubWFwLCB0aGlzLm1hcC5nZXRMYXllckluZGV4KFwiR3JvdW5kXCIpLCBnYW1lLndpZHRoLCBnYW1lLmhlaWdodCk7XG5cdGdhbWUud29ybGQuYWRkQXQodGhpcy5ncm91bmRMYXllciwgMCk7XG5cdHRoaXMuZ3JvdW5kTGF5ZXIucmVzaXplV29ybGQoKTtcblxuXHQvLyBDcmVhdGUgV2FsbCBMYXllciwgYWRkIGNvbGxpc2lvbiB0aWxlcywgZW5lYWJsZSBwaHlzaWNzLlxuXHR0aGlzLmJsb2NrTGF5ZXIgPSBuZXcgUGhhc2VyLlRpbGVtYXBMYXllcihnYW1lLCB0aGlzLm1hcCwgdGhpcy5tYXAuZ2V0TGF5ZXJJbmRleChcIldhbGxcIiksIGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0KTtcbiAgICBnYW1lLndvcmxkLmFkZEF0KHRoaXMuYmxvY2tMYXllciwgMSk7XG4gICAgdGhpcy5tYXAuc2V0Q29sbGlzaW9uKFsxNjAsIDE2MSwgMTg5LCAxOTAsIDE5MSwgMTkyLCAyMjAsIDIyMSwgMjIyXSwgdHJ1ZSwgXCJXYWxsXCIpO1xuXHR0aGlzLmJsb2NrTGF5ZXIucmVzaXplV29ybGQoKTtcblx0Z2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5ibG9ja0xheWVyKTtcblxuXHQvLyBDcmVhdGUgRGVhdGggTGF5ZXIsIGFkZCBjb2xsaXNpb24gdGlsZXMsIGVuYWJsZSBwaHlzaWNzLlxuXHR0aGlzLmRlYXRoTGF5ZXIgPSBuZXcgUGhhc2VyLlRpbGVtYXBMYXllcihnYW1lLCB0aGlzLm1hcCwgdGhpcy5tYXAuZ2V0TGF5ZXJJbmRleChcIkxhdmFcIiksIGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0KTtcbiAgICBnYW1lLndvcmxkLmFkZEF0KHRoaXMuZGVhdGhMYXllciwgMik7XG4gICAgdGhpcy5tYXAuc2V0Q29sbGlzaW9uKFsxMjEsIDEyNCwgMTUyLCAxNTQsIDE4NCwgMjExLCAyMTMsIDIxNCwgNDAwLCA0MDEsIDQwMiwgNDMwLCA0MzEsIDQzMiwgNDYwLCA0NjEsIDQ2Ml0sIHRydWUsIFwiTGF2YVwiKTtcbiAgICB0aGlzLmRlYXRoTGF5ZXIucmVzaXplV29ybGQoKTtcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLmRlYXRoTGF5ZXIpO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLmluaXRpYWxpemVQbGF5ZXIgPSBmdW5jdGlvbigpIHtcblx0dmFyIGkgPSAwO1xuXHRnYW1lLmxvYWRTcHJpdGVzLmNoZWNrcG9pbnRzWzBdLnNwYXducG9pbnRzLmZvckVhY2goZnVuY3Rpb24oc3Bhd25wb2ludCkge1xuXHRcdGxldmVsLnBsYXllcnNbaSsrXSA9IG5ldyBQbGF5ZXIoc3Bhd25wb2ludC54LCBzcGF3bnBvaW50LnkpO1xuXHR9KTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5pbml0aWFsaXplRW5lbWllcyA9IGZ1bmN0aW9uKCkge1xuXHRnYW1lLmxvYWRTcHJpdGVzLnpvbWJpZXMuZm9yRWFjaChmdW5jdGlvbih6b21iaWUpIHtcblx0XHRsZXZlbC5lbmVtaWVzLnB1c2gobmV3IEVuZW15KHpvbWJpZS5wb3NpdGlvbiwgem9tYmllLnNwZWVkKSk7XG5cdH0pO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLmluaXRpYWxpemVDaGVja3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmNoZWNrcG9pbnRzID1cblx0W1xuXHRcdG5ldyBDaGVja3BvaW50KDAsIDgwLCA2NCwgODAsIHRydWUsIDEpLFxuXHRcdG5ldyBDaGVja3BvaW50KDMzNiwgNTQyLCA4MCwgNjQsIGZhbHNlLCAyKSxcblx0XHRuZXcgQ2hlY2twb2ludCg3NTAsIDk2LCA4MCwgNDgsIGZhbHNlLCAzKSxcblx0XHRuZXcgQ2hlY2twb2ludCgxNTA2LCAzMzgsIDkyLCA4MCwgZmFsc2UsIDQsIHRydWUpXG5cdF07XG59O1xuXG5MZXZlbC5wcm90b3R5cGUuc2V0dXBHcmFubnlDb250cm9sbGVyID0gZnVuY3Rpb24oKSB7XG5cdGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5PTkUpLnByb2Nlc3NLZXlEb3duID0gZnVuY3Rpb24oKSB7XG5cdFx0Z2FtZS5ncmFubnlQb2ludGVyID0gMDtcblx0XHQvL2lmICgpXG5cdFx0Z2FtZS5jYW1lcmEuZm9sbG93KGxldmVsLnBsYXllcnNbZ2FtZS5ncmFubnlQb2ludGVyXSk7XG5cdH1cblx0Z2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlRXTykucHJvY2Vzc0tleURvd24gPSBmdW5jdGlvbigpIHtcblx0XHRnYW1lLmdyYW5ueVBvaW50ZXIgPSAxO1xuXHRcdGdhbWUuY2FtZXJhLmZvbGxvdyhsZXZlbC5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0pO1xuXHR9XG5cdGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5USFJFRSkucHJvY2Vzc0tleURvd24gPSBmdW5jdGlvbigpIHtcblx0XHRnYW1lLmdyYW5ueVBvaW50ZXIgPSAyO1xuXHRcdGdhbWUuY2FtZXJhLmZvbGxvdyhsZXZlbC5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0pO1xuXHR9XG5cdGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5GT1VSKS5wcm9jZXNzS2V5RG93biA9IGZ1bmN0aW9uKCkge1xuXHRcdGdhbWUuZ3Jhbm55UG9pbnRlciA9IDM7XG5cdFx0Z2FtZS5jYW1lcmEuZm9sbG93KGxldmVsLnBsYXllcnNbZ2FtZS5ncmFubnlQb2ludGVyXSk7XG5cdH1cbn1cblxuTGV2ZWwucHJvdG90eXBlLm1vdmVHYW1lQ2FtZXJhID0gZnVuY3Rpb24oKSB7XG5cdC8vIGNoZWNrIGlmIGNhbWVyYSBpcyBzZXQgdG8gZm9sbG93IGNoYXJhY3RlclxuXHRpZiAoZ2FtZS5jYW1lcmEuZm9sbG93aW5nID09IGZhbHNlKSB7XG5cdFx0Ly8gbW92ZSBjYW1lcmFcblx0XHRpZiAodGhpcy53YXNkLnVwLmlzRG93bikge1xuXHRcdFx0Z2FtZS5jYW1lcmEueSAtPSA0O1xuXHRcdH1cblx0XHRpZiAodGhpcy53YXNkLmRvd24uaXNEb3duKSB7XG5cdFx0XHRnYW1lLmNhbWVyYS55ICs9IDQ7XG5cdFx0fVxuXHRcdGlmICh0aGlzLndhc2QubGVmdC5pc0Rvd24pIHtcblx0XHRcdGdhbWUuY2FtZXJhLnggLT0gNDtcblx0XHR9XG5cdFx0aWYgKHRoaXMud2FzZC5yaWdodC5pc0Rvd24pIHtcblx0XHRcdGdhbWUuY2FtZXJhLnggKz0gNDtcblx0XHR9XG5cdH1cbn07XG4iLCJ2YXIgVGV4dENvbmZpZ3VyZXIgPSByZXF1aXJlKFwiLi4vdXRpbC90ZXh0X2NvbmZpZ3VyZXJcIilcblxudmFyIFByZWxvYWRlciA9IGZ1bmN0aW9uKCkge307XG5cbm1vZHVsZS5leHBvcnRzID0gUHJlbG9hZGVyO1xuXG5QcmVsb2FkZXIucHJvdG90eXBlID0ge1xuXHRwcmVsb2FkOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRpc3BsYXlMb2FkZXIoKTtcblx0XHR0aGlzLmxvYWQudGlsZW1hcChcIm1hcFwiLCBcImFzc2V0cy9tYXAvTGV2ZWxzL011bHRpLTEvTXVsdGktMS1tYXAuanNvblwiLCBudWxsLCBQaGFzZXIuVGlsZW1hcC5USUxFRF9KU09OKTtcblx0XHR0aGlzLmxvYWQuaW1hZ2UoXCJ0aWxlc1wiLCBcImFzc2V0cy90aWxlcy92b2xjYW5vLXRpbGVzZXQucG5nXCIpO1xuXHRcdHRoaXMubG9hZC5zcHJpdGVzaGVldChcImR1ZGVcIiwgXCJhc3NldHMvdGV4dHVyZXMvZW5lbXkucG5nXCIpO1xuXHRcdHRoaXMubG9hZC5zcHJpdGVzaGVldChcImVuZW15XCIsIFwiYXNzZXRzL3RleHR1cmVzL3pvbWJpZS5wbmdcIiwgMTU3LCAxMDIpO1xuXHRcdGdhbWUubG9hZFNwcml0ZXMgPSByZXF1aXJlKFwiLi4vLi4vLi4vYXNzZXRzL21hcC9MZXZlbHMvTXVsdGktMS9tdWx0aS0xLmpzb25cIik7XG5cblx0XHRjdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG5cdFx0bW91c2UgPSBnYW1lLmlucHV0Lm1vdXNlO1xuXHR9LFxuXG5cdGRpc3BsYXlMb2FkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudGV4dCA9IGdhbWUuYWRkLnRleHQoZ2FtZS5jYW1lcmEud2lkdGggLyAyLCAyNTAsIFwiTG9hZGluZy4uLiBcIik7XG4gICAgXHR0aGlzLnRleHQuYW5jaG9yLnNldFRvKC41LCAuNSk7XG5cdFx0VGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLnRleHQsIFwid2hpdGVcIiwgMzIpO1xuXG4gICAgXHR0aGlzLmxvYWQub25GaWxlQ29tcGxldGUuYWRkKGZ1bmN0aW9uKHByb2dyZXNzKSB7XG5cdCAgICAgICAgdGhpcy50ZXh0LnNldFRleHQoXCJMb2FkaW5nLi4uIFwiICsgcHJvZ3Jlc3MgKyBcIiVcIik7XG5cdCAgICB9LCB0aGlzKTtcblxuICAgIFx0dGhpcy5sb2FkLm9uTG9hZENvbXBsZXRlLmFkZChmdW5jdGlvbigpIHtcblx0XHRcdGdhbWUuc3RhdGUuc3RhcnQoXCJMZXZlbFwiKTtcblx0ICAgIH0pO1xuXHR9XG59ICIsImV4cG9ydHMuY29uZmlndXJlVGV4dCA9IGZ1bmN0aW9uKHRleHQsIGNvbG9yLCBzaXplKSB7XG5cdHRleHQuZm9udCA9IFwiQ2FydGVyIE9uZVwiO1xuXHR0ZXh0LmZpbGwgPSBjb2xvcjtcblx0dGV4dC5mb250U2l6ZSA9IHNpemU7XG59Iiwid2luZG93LmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoNjA4LCA2MDgsIFBoYXNlci5BVVRPLCAnJywgeyBjcmVhdGU6IGNyZWF0ZSB9KTtcblxuZnVuY3Rpb24gY3JlYXRlKCkge1xuXHQvKmVhc3lydGMuZW5hYmxlRGVidWcodHJ1ZSk7XG5cdGVhc3lydGMuY29ubmVjdChcImdhbWUuc2VydmVyXCIsXG5cdCBcdGZ1bmN0aW9uKGVhc3lydGNpZCwgcm9vbU93bmVyKSB7XG5cdCAgICBcdC8vY29ubmVjdGVkXG5cdCAgXHR9LFxuXHQgIFx0ZnVuY3Rpb24oZXJyb3JUZXh0KSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcImZhaWxlZCB0byBjb25uZWN0IFwiLCBlckZyVGV4dCk7XG5cdFx0fVxuXHQpO1xuXHRlYXN5cnRjLmVuYWJsZURhdGFDaGFubmVscyh0cnVlKTtcblxuXHRlYXN5cnRjLmpvaW5Sb29tKFxuXHRcdFwibG9iYnlcIixcblx0XHRudWxsLFxuXHRcdGZ1bmN0aW9uKCkge1xuXHRcdCBcdGVhc3lydGMuc2VuZFNlcnZlck1lc3NhZ2UoXCJoZWxsb1wiLCAge21lc3NhZ2U6J2hlbGxvJ30sXG5cdCAgICAgIFx0ZnVuY3Rpb24oYWNrbWVzc2FnZSl7XG5cdFx0ICAgICAgICBjb25zb2xlLmxvZyhhY2ttZXNzYWdlKTtcblx0XHQgICAgXHR9XG5cdFx0ICAgXHQpO1xuIFx0XHR9LFxuXHRcdGZ1bmN0aW9uKCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ2ZhaWxlZCB0byBqb2luJylcdFxuXHRcdH1cdFxuXHQpOyovXG5cblxuICAgIC8vaW5pdGlhbGl6ZSBhbGwgdGhlIGdhbWUgc3RhdGVzLlxuICAgIGdhbWUuc3RhdGUuYWRkKFwiQm9vdFwiLCByZXF1aXJlKFwiLi9nYW1lL3N0YXRlcy9ib290XCIpKTtcbiAgICBnYW1lLnN0YXRlLmFkZChcIlByZWxvYWRlclwiLCByZXF1aXJlKFwiLi9nYW1lL3N0YXRlcy9wcmVsb2FkZXJcIikpO1xuXHRnYW1lLnN0YXRlLmFkZChcIkxldmVsXCIsIHJlcXVpcmUoXCIuL2dhbWUvc3RhdGVzL2xldmVsXCIpKTtcbiAgICBnYW1lLnN0YXRlLnN0YXJ0KFwiQm9vdFwiKTtcbn07XG5cblxuXG5cblxuIl19
