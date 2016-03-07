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
		},
		{
			"position" : [
				{"x" : 100, "y" : 100},
				{"x" : 200, "y" : 200},
				{"x" : 300, "y" : 300}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92NC4yLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiY2xpZW50L2Fzc2V0cy9tYXAvTGV2ZWxzL011bHRpLTEvbXVsdGktMS5qc29uIiwiY2xpZW50L3NyYy9nYW1lL2VudGl0aWVzL2NoZWNrcG9pbnQuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvZW5lbXkuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvcGxheWVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9ib290LmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9sZXZlbC5qcyIsImNsaWVudC9zcmMvZ2FtZS9zdGF0ZXMvcHJlbG9hZGVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3V0aWwvdGV4dF9jb25maWd1cmVyLmpzIiwiY2xpZW50L3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17IFxuXHRcInpvbWJpZXNcIiA6IFtcblx0XHR7XG5cdFx0XHRcInBvc2l0aW9uXCIgOiBbXG5cdFx0XHRcdHtcInhcIiA6IDI1MCwgXCJ5XCIgOiAyMDB9LFxuXHRcdFx0XHR7XCJ4XCIgOiAyNTAsIFwieVwiIDogMjUwfVxuXHRcdFx0XSxcblx0XHRcdFwic3BlZWRcIiA6IDEwMCBcblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicG9zaXRpb25cIiA6IFtcblx0XHRcdFx0e1wieFwiIDogMzAwLCBcInlcIiA6IDMwMH0sXG5cdFx0XHRcdHtcInhcIiA6IDM1MCwgXCJ5XCIgOiAzMDB9LFxuXHRcdFx0XHR7XCJ4XCIgOiAzMjUsIFwieVwiIDogMTAwfVxuXHRcdFx0XSxcblx0XHRcdFwic3BlZWRcIiA6IDE1MCBcblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicG9zaXRpb25cIiA6IFtcblx0XHRcdFx0e1wieFwiIDogMTAwLCBcInlcIiA6IDEwMH0sXG5cdFx0XHRcdHtcInhcIiA6IDIwMCwgXCJ5XCIgOiAyMDB9LFxuXHRcdFx0XHR7XCJ4XCIgOiAzMDAsIFwieVwiIDogMzAwfVxuXHRcdFx0XSxcblx0XHRcdFwic3BlZWRcIiA6IDE1MCBcblx0XHR9XG5cdF0sXG5cdFwiY2hlY2twb2ludHNcIiA6IFtcblx0XHR7XG5cdFx0XHRcInNwYXducG9pbnRzXCIgOiBbXG5cdFx0XHRcdHtcInhcIjogODAsIFwieVwiOiA3NX0sXG5cdFx0XHRcdHtcInhcIjogODAsIFwieVwiOiAxNTV9LFxuXHRcdFx0XHR7XCJ4XCI6IDgwLCBcInlcIjogMjM1fSxcblx0XHRcdFx0e1wieFwiOiA4MCwgXCJ5XCI6IDMxNX1cblx0XHRcdF0sIFxuXHRcdFx0XCJkaW1lbnNpb25zXCIgOiB7XCJ4MFwiIDogMCwgXCJ3aWR0aFwiIDogMTAsIFwieTBcIiA6IDAsIFwiaGVpZ2h0XCIgOiAxMH1cblx0XHR9LFxuXHRcdHsgXG5cdFx0XHRcInNwYXducG9pbnRzXCIgOiBbXG5cdFx0XHRcdHtcInhcIjogMCwgXCJ5XCI6IDB9LFxuXHRcdFx0XHR7XCJ4XCI6IDAsIFwieVwiOiAxfSxcblx0XHRcdFx0e1wieFwiOiAwLCBcInlcIjogMn0sXG5cdFx0XHRcdHtcInhcIjogMCwgXCJ5XCI6IDN9XG5cdFx0XHRdLFxuXHRcdFx0XCJkaW1lbnNpb25zXCIgOiB7XCJ4MFwiIDogMTAsIFwid2lkdGhcIiA6IDEwLCBcInkwXCIgOiAxMCwgXCJoZWlnaHRcIiA6IDEwfVxuXHRcdH1cblx0XVxufVxuIiwidmFyIENoZWNrcG9pbnQgPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCwgYWN0aXZhdGVkLCBvcmRlciwgZmluYWxDaGVja3BvaW50KSB7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIG51bGwpO1xuXHRnYW1lLnBoeXNpY3MuZW5hYmxlKHRoaXMsIFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cdHRoaXMuYm9keS5zZXRTaXplKHdpZHRoLCBoZWlnaHQsIDAsIDApO1xuXG5cdHRoaXMuZmluYWxDaGVja3BvaW50ID0gZmluYWxDaGVja3BvaW50O1xuICAgIHRoaXMub3JkZXIgPSBvcmRlcjtcbiAgICB0aGlzLmFjdGl2YXRlZCA9IGFjdGl2YXRlZDtcbiAgICAvL2FkZCBzcHJpdGUgdG8gZ2FtZVxuICAgIGdhbWUuZGVidWcuZ2VvbSh0aGlzICwncmJnYSgwLCAwLCAyNTUsIDEpJywgZmFsc2UpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoZWNrcG9pbnQ7XG5cbkNoZWNrcG9pbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5cbkNoZWNrcG9pbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vZ2FtZS5kZWJ1Zy5ib2R5KHRoaXMsIFwicmJnYSgwLCAwLCAyNTUsIDEpXCIsIGZhbHNlKTtcbn0iLCJ2YXIgRW5lbXkgPSBmdW5jdGlvbiAoX3Bvc2l0aW9ucywgX3ZlbG9jaXR5KSB7XG4gICAgXG4gICAgdGhpcy5wb3NpdGlvbnMgPSBfcG9zaXRpb25zO1xuICAgIHRoaXMuY291bnRlciA9IDA7XG5cbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgdGhpcy5wb3NpdGlvbnNbMF0ueCwgdGhpcy5wb3NpdGlvbnNbMF0ueSwgXCJlbmVteVwiKTtcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzKTtcblxuICAgIHRoaXMuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuICAgIHRoaXMuYm9keS5zb3VyY2VIZWlnaHQgPSAxMDA7XG4gICAgdGhpcy5ib2R5LnNvdXJjZVdpZHRoID0gMTAwO1xuXG4gICAgdGhpcy5tYXhfdmVsb2NpdHkgPSBfdmVsb2NpdHk7XG4gICAgdGhpcy5kZXN0aW5hdGlvbiA9IG51bGw7ICAgIFxuICAgIFxuICAgIHRoaXMuc2NhbGUuc2V0KC4zLC4zKTtcbiAgICB0aGlzLmFuY2hvci54ID0gLjU7XG4gICAgdGhpcy5hbmNob3IueSA9IC41O1xuICAgIHRoaXMucm90YXRpb24gPSBNYXRoLlBJIC8gMjtcblxuICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoXCJ3YWxrXCIpO1xuICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KFwid2Fsa1wiLCA2LCB0cnVlKTtcblxuICAgIC8vc2V0IGJvdW5kaW5nIGJveFxuICAgIHRoaXMuYm9keS5jb2xsaWRlV29ybGRCb3VuZHMgPSB0cnVlO1xuICAgIFxuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVuZW15O1xuXG5FbmVteS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblxuRW5lbXkucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vZ2FtZS5kZWJ1Zy5ib2R5KHRoaXMsIFwicmdiYSgyNTUsMCwwLDIpXCIsIGZhbHNlKTtcbiAgICB0aGlzLm1vdmUoKTtcbn1cblxuRW5lbXkucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZGVzdGluYXRpb24gPT0gbnVsbCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5zaXplXS54KTtcbiAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IG5ldyBQaGFzZXIuUG9pbnQodGhpcy5wb3NpdGlvbnNbdGhpcy5jb3VudGVyJXRoaXMucG9zaXRpb25zLmxlbmd0aF0ueCwgdGhpcy5wb3NpdGlvbnNbdGhpcy5jb3VudGVyJXRoaXMucG9zaXRpb25zLmxlbmd0aF0ueSk7XG4gICAgXG4gICAgICAgIC8vcm90YXRlIHNwcml0ZSB0byBmYWNlIHRoZSBkaXJlY3Rpb24gaXQgd2lsbCBiZSBtb3ZpbmdcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IGdhbWUucGh5c2ljcy5hcmNhZGUuYW5nbGVUb1hZKHRoaXMuYm9keSwgdGhpcy5kZXN0aW5hdGlvbi54LCB0aGlzLmRlc3RpbmF0aW9uLnkpO1xuXG4gICAgICAgIC8vbW92ZSBjaGFyYWN0ZXIgdG8gdGhlIHBvaW50IChwbGF5ZXIgZG9lc250IHN0b3Agb25jZSBpdCBoaXRzIHRoYXQgcG9pbnQgd2l0aCB0aGlzIG1ldGhvZCAtIHNlZSBjaGVja0xvY2F0aW9uKCkpIFxuICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1hZKHRoaXMsIHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5sZW5ndGhdLngsIHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5sZW5ndGhdLnksIHRoaXMubWF4X3ZlbG9jaXR5KTtcblxuICAgICAgICB0aGlzLmNvdW50ZXIgKys7XG4gICAgfSBcbiAgICB0aGlzLmNoZWNrTG9jYXRpb24oKTtcbn1cblxuRW5lbXkucHJvdG90eXBlLmNoZWNrTG9jYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAvL2lmIHRoZXJlIGlzIG5vIGNvbnRhY3QsIHN0b3AgdGhlIGNoYXJhY3RlciBmcm9tIG1vdmluZyBhZnRlciB0aGV5J3ZlIHJlYWNoZWQgdGhlaXIgZGVzdGluYXRpb25cbiAgICAvL21hZGUgaXQgYXBwcm94aW1hdGUgZGVzdGluYXRpb24gYmVjYXVzZSBpdHMgdW5saWtlbHkgaXQgd2lsbCBlbmQgb24gdGhhdCBleGFjdCBsb2NhdGlvblxuICAgIGlmICh0aGlzLmRlc3RpbmF0aW9uICE9IG51bGwpIHtcbiAgICAgICAgLy9vbmNlIGl0IGdldHMgY2xvc2UgZW5vdWdoIHRvIHRoZSB4IGRlc3RpbmF0aW9uIGxvd2VyIHggdmVsb2NpdHlcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGVzdGluYXRpb24ueCkgPCB0aGlzLm1heF92ZWxvY2l0eS8xMDApIHtcbiAgICAgICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gLSh0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRlc3RpbmF0aW9uLngpOyAgICBcbiAgICAgICAgfVxuICAgICAgICAvL29uY2UgaXQgZ2V0cyBjbG9zZSBlbm91Z2ggdG8gdGhlIHkgZGVzdGluYXRpb24gbG93ZXIgeSB2ZWxvY2l0eVxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5wb3NpdGlvbi55IC0gdGhpcy5kZXN0aW5hdGlvbi55KSA8IHRoaXMubWF4X3ZlbG9jaXR5LzEwMCkge1xuICAgICAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnkgPSAtKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9zdG9wIG1vdmVtZW50IGNvbXBsZXRlbHkgLSBkZXN0aW5hdGlvbiBoYXMgYmVlbiByZWFjaGVkLlxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXN0aW5hdGlvbi54KSA8IDUgJiYgTWF0aC5hYnModGhpcy5wb3NpdGlvbi55IC0gdGhpcy5kZXN0aW5hdGlvbi55KSA8IDUpIHtcbiAgICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIiwidmFyIE1BWF9WRUxPQ0lUWSA9IDE1MDtcbnZhciBUZXh0Q29uZmlndXJlciA9IHJlcXVpcmUoXCIuLi91dGlsL3RleHRfY29uZmlndXJlclwiKVxuXG52YXIgUGxheWVyID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICB0aGlzLmlkID0gZ2FtZS5ncmFubnlDb3VudGVyKys7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIFwiZHVkZVwiKTtcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzKTtcblxuICAgIC8vIHNldCBib3VuZGluZyBib3hcbiAgICB0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuc291cmNlSGVpZ2h0ID0gODA7XG4gICAgdGhpcy5ib2R5LnNvdXJjZVdpZHRoID0gODA7XG4gICAgXG4gICAgLy8gc2hyaW5rIGNoYXJhY3RlclxuICAgIHRoaXMuc2NhbGUuc2V0KC4zLC4zKTtcblxuICAgIC8vIHNldCB0aGUgcGxheWVycyBwb3NpdGlvbiB0byB0aGUgY2VudGVyIG9mIHRoZSBzcHJpdGVcbiAgICB0aGlzLmFuY2hvci54ID0gLjQ1O1xuICAgIHRoaXMuYW5jaG9yLnkgPSAuNTU7XG4gICAgLy8gdHVybiBjaGFyYWN0ZXIgdGhlIG90aGVyIGRpcmVjdGlvblxuICAgIHRoaXMucm90YXRpb24gPSBNYXRoLlBJIDtcblxuICAgIC8vIGNyZWF0ZSB0aGlzIHZhbHVlIGZvciBzb21lIG51bGwgY2hlY2tcbiAgICB0aGlzLmRlc3RpbmF0aW9uO1xuXG4gICAgLy8gYWRkIHNwcml0ZSB0byBnYW1lXG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodGhpcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xuXG5QbGF5ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gZGlzcGxheSBib3VuZGluZyBib3hcbiAgICAvLyBnYW1lLmRlYnVnLmJvZHkodGhpcywgXCJyZ2JhKDAsMjU1LDAsMTAwKVwiLCBmYWxzZSk7XG5cbiAgICAvLyBpZiBwbGF5ZXIgaXMgbW92aW5nIHRoaXMgd2lsbCB0ZWxsIGl0IHdoZW4gdG8gc3RvcFxuICAgIHRoaXMuY2hlY2tMb2NhdGlvbigpOyAgICBcbn07XG5cblBsYXllci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHBvaW50ZXIpIHtcbiAgICAvLyBwbGF5ZXJzIGRlc3RpbmF0aW9uIGlzIHdyaXR0ZW4gYWNjb3JkaW5nIHRvIHdvcmxkIHZpZXcuIChub3QgY2FtZXJhKVxuICAgIHRoaXMuZGVzdGluYXRpb24gPSBuZXcgUGhhc2VyLlBvaW50KGdhbWUuY2FtZXJhLnggKyBwb2ludGVyLngsIGdhbWUuY2FtZXJhLnkgKyBwb2ludGVyLnkpO1xuXG4gICAgLy8gcm90YXRlIHNwcml0ZSB0byBmYWNlIHRoZSBkaXJlY3Rpb24gaXQgd2lsbCBiZSBtb3ZpbmdcbiAgICB0aGlzLnJvdGF0aW9uID0gZ2FtZS5waHlzaWNzLmFyY2FkZS5hbmdsZVRvWFkodGhpcy5ib2R5LCB0aGlzLmRlc3RpbmF0aW9uLngsIHRoaXMuZGVzdGluYXRpb24ueSkgKyBNYXRoLlBJO1xuXG4gICAgLy8gbW92ZSBjaGFyYWN0ZXIgdG8gdGhlIHBvaW50IChwbGF5ZXIgZG9lc250IHN0b3Agb25jZSBpdCBoaXRzIHRoYXQgcG9pbnQgd2l0aCB0aGlzIG1ldGhvZCAtIHNlZSBjaGVja0xvY2F0aW9uKCkpIFxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvWFkodGhpcywgZ2FtZS5jYW1lcmEueCArIHBvaW50ZXIueCwgZ2FtZS5jYW1lcmEueSArIHBvaW50ZXIueSwgTUFYX1ZFTE9DSVRZKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuY2hlY2tMb2NhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGNoZWNrIGNvbnRhY3Qgd2l0aCByb2NrIHdhbGxzXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMsIGxldmVsLmJsb2NrTGF5ZXIpO1xuXG4gICAgZ3Jhbm55ID0gdGhpcztcbiAgICAvLyBjaGVjayBjb250YWN0IHdpdGggbGF2YSAtIGFkZCBcImRpZVwiIGNhbGxiYWNrIGlmIGNvbnRhY3QgaXMgbWFkZVxuICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLCBsZXZlbC5kZWF0aExheWVyLFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldmVsLmtpbGxHcmFubnkoZ3Jhbm55KVxuICAgICAgICB9KTtcblxuICAgIC8vIGNoZWNrIGZvciBjb250YWN0IHdpdGggZW5lbWllc1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZXZlbC5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLCBsZXZlbC5lbmVtaWVzW2ldLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldmVsLmtpbGxHcmFubnkoZ3Jhbm55KVxuICAgICAgICB9KTsgICAgXG4gICAgfVxuXG4gICAgLy8gY2hlY2sgZm9yIGNvbnRhY3Qgd2l0aCBjaGVja3BvaW50c1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZXZlbC5jaGVja3BvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcywgbGV2ZWwuY2hlY2twb2ludHNbaV0sIGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgICAgIGlmIChsZXZlbC5jaGVja3BvaW50c1tpXS5hY3RpdmF0ZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxldmVsLmNoZWNrcG9pbnRzW2ldLmZpbmFsQ2hlY2twb2ludCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja3BvaW50VGV4dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrcG9pbnRUZXh0LmRlc3Ryb3koKTsgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja3BvaW50VGV4dCA9IGdhbWUuYWRkLnRleHQoMjMwLCAxMCwgXCJDaGVja3BvaW50IFJlYWNoZWQhXCIpO1xuICAgICAgICAgICAgICAgICAgICBUZXh0Q29uZmlndXJlci5jb25maWd1cmVUZXh0KHRoaXMuY2hlY2twb2ludFRleHQsIFwid2hpdGVcIiwgMjQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrcG9pbnRUZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGdhbWUudGltZS5ldmVudHMuYWRkKDIwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5hZGQudHdlZW4odGhpcy5jaGVja3BvaW50VGV4dCkudG8oe3k6IDB9LCAxNTAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuYWRkLnR3ZWVuKHRoaXMuY2hlY2twb2ludFRleHQpLnRvKHthbHBoYTogMH0sIDE1MDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLndpblRleHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53aW5UZXh0LmRlc3Ryb3koKTsgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aW5UZXh0ID0gZ2FtZS5hZGQudGV4dCgyMzAsIDI1MCwgXCJZb3UgV2luIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgVGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLndpblRleHQsIFwid2hpdGVcIiwgNDgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndpblRleHQuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgZ2FtZS50aW1lLmV2ZW50cy5hZGQoNTAwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnN0YXRlLnN0YXJ0KFwiTGV2ZWxcIik7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXZlbC5jaGVja3BvaW50c1tpXS5hY3RpdmF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSAgIFxuICAgICAgICB9KTtcbiAgICB9ICBcblxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIGNvbnRhY3QsIHN0b3AgdGhlIGNoYXJhY3RlciBmcm9tIG1vdmluZyBhZnRlciB0aGV5J3ZlIHJlYWNoZWQgdGhlaXIgZGVzdGluYXRpb25cbiAgICAvLyBtYWRlIGl0IGFwcHJveGltYXRlIGRlc3RpbmF0aW9uIGJlY2F1c2UgaXRzIHVubGlrZWx5IGl0IHdpbGwgZW5kIG9uIHRoYXQgZXhhY3QgbG9jYXRpb25cbiAgICBpZiAodGhpcy5kZXN0aW5hdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIC8vIG9uY2UgaXQgZ2V0cyBjbG9zZSBlbm91Z2ggdG8gdGhlIHggZGVzdGluYXRpb24gbG93ZXIgeCB2ZWxvY2l0eVxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXN0aW5hdGlvbi54KSA8IE1BWF9WRUxPQ0lUWS8xMDApIHtcbiAgICAgICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gLSh0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRlc3RpbmF0aW9uLngpOyAgICBcbiAgICAgICAgfVxuICAgICAgICAvLyBvbmNlIGl0IGdldHMgY2xvc2UgZW5vdWdoIHRvIHRoZSB5IGRlc3RpbmF0aW9uIGxvd2VyIHkgdmVsb2NpdHlcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSkgPCBNQVhfVkVMT0NJVFkvMTAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueSA9IC0odGhpcy5wb3NpdGlvbi55IC0gdGhpcy5kZXN0aW5hdGlvbi55KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdG9wIG1vdmVtZW50IGNvbXBsZXRlbHkgLSBkZXN0aW5hdGlvbiBoYXMgYmVlbiByZWFjaGVkLlxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54ID09IHRoaXMuZGVzdGluYXRpb24ueCAmJiB0aGlzLnBvc2l0aW9uLnkgPT0gdGhpcy5kZXN0aW5hdGlvbi55KSB7XG4gICAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJ2YXIgQm9vdCA9IGZ1bmN0aW9uKCkge307XG5cbm1vZHVsZS5leHBvcnRzID0gQm9vdDtcblxuQm9vdC5wcm90b3R5cGUgPSB7XG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0Z2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG5cdFx0aWYgKGdhbWUuZGV2aWNlLmRlc2t0b3ApIHtcblx0XHRcdGdhbWUuc3RhZ2Uuc2NhbGUucGFnZUFsaWduSG9yaXpvbnRhbGx5ID0gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRhbGVydChcIkRlc2t0b3AgZ2FtZSBvbmx5XCIpXG5cdFx0fVxuXG5cdFx0Z2FtZS5zdGF0ZS5zdGFydChcIlByZWxvYWRlclwiKTtcblx0fVxufSIsInZhciBQbGF5ZXIgPSByZXF1aXJlKFwiLi4vZW50aXRpZXMvcGxheWVyXCIpO1xudmFyIEVuZW15ID0gcmVxdWlyZShcIi4uL2VudGl0aWVzL2VuZW15XCIpO1xudmFyIENoZWNrcG9pbnQgPSByZXF1aXJlKFwiLi4vZW50aXRpZXMvY2hlY2twb2ludFwiKTtcbnZhciBUZXh0Q29uZmlndXJlciA9IHJlcXVpcmUoXCIuLi91dGlsL3RleHRfY29uZmlndXJlclwiKTtcblxudmFyIExldmVsID0gZnVuY3Rpb24gKCkge307XG5cbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7XG5cbmdhbWUuZ3Jhbm55UG9pbnRlciA9IDA7XG5cdFxuXG5MZXZlbC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7IFxuXHRnYW1lLmdyYW5ueUNvdW50ZXIgPSAwO1xuXHQvLyBpbml0aWFsaXplIHRoaW5nc1xuXHRsZXZlbCA9IHRoaXM7XG5cdHRoaXMubGl2ZXMgPSAxMDtcblx0dGhpcy5lbmVtaWVzID0gW107XG5cdHRoaXMucGxheWVycyA9IFtdO1xuXHRnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcblx0XG5cdHRoaXMuaW5pdGlhbGl6ZU1hcCgpO1xuXHR0aGlzLmluaXRpYWxpemVDaGVja3BvaW50cygpO1xuXHR0aGlzLmluaXRpYWxpemVFbmVtaWVzKCk7XG5cdHRoaXMuaW5pdGlhbGl6ZVBsYXllcigpO1xuXHR0aGlzLnNldHVwR3Jhbm55Q29udHJvbGxlcigpO1xuXHRcblx0dGhpcy5pbml0aWFsaXplR2FtZUNhbWVyYSgpO1xuXG5cdC8vIGluaXRpYWxpemUgdGhlIFwib25jbGlja1wiIGZ1bmN0aW9uXG5cdGdhbWUuaW5wdXQub25Eb3duLmFkZCh0aGlzLm1vdmVHcmFubnksIHRoaXMpO1xuXG5cdC8vIHNldHVwIGtleWJvYXJkIGlucHV0XG5cdHNwYWNlYmFyID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcblx0XG5cdHRoaXMud2FzZCA9IHtcblx0XHQndXAnIDogZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlcpLFxuXHRcdCdkb3duJyA6IGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5TKSxcblx0XHQnbGVmdCcgOiBnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuQSksXG5cdFx0J3JpZ2h0JyA6Z2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkQpXG5cdH07XG5cblx0Ly8gb24ga2V5Ym9hcmQgaW5wdXQgdG9nZ2xlIGNhbWVyYVxuXHRnYW1lLmlucHV0LmtleWJvYXJkLm9uRG93bkNhbGxiYWNrID0gdGhpcy50b2dnbGVDYW1lcmE7XG59O1xuXG5MZXZlbC5wcm90b3R5cGUubW92ZUdyYW5ueSA9IGZ1bmN0aW9uKHBvaW50KSB7XG5cdHRoaXMucGxheWVyc1tnYW1lLmdyYW5ueVBvaW50ZXJdLm1vdmUocG9pbnQpO1xufVxuXG5MZXZlbC5wcm90b3R5cGUuYWRkSFVEID0gZnVuY3Rpb24gKCkge1xuXHRpZiAodGhpcy5saXZlc1RleHQgIT0gbnVsbCkge1xuXHRcdHRoaXMubGl2ZXNUZXh0LmRlc3Ryb3koKTsgXG5cdH1cblxuXHR0aGlzLmxpdmVzVGV4dCA9IGdhbWUuYWRkLnRleHQoMTAsIDEwLCBcIkxpdmVzOiBcIiArIHRoaXMubGl2ZXMpO1xuXHRUZXh0Q29uZmlndXJlci5jb25maWd1cmVUZXh0KHRoaXMubGl2ZXNUZXh0LCBcIndoaXRlXCIsIDMyKTtcblx0dGhpcy5saXZlc1RleHQuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cblx0aWYgKHRoaXMuY2FtZXJhVGV4dCAhPSBudWxsKSB7XG5cdFx0dGhpcy5jYW1lcmFUZXh0LmRlc3Ryb3koKTsgXG5cdH1cblx0dGhpcy5jYW1lcmFUZXh0ID0gZ2FtZS5hZGQudGV4dCgxMCwgNDgsIFwiQ2FtZXJhOiBMb2NrZWRcIilcblx0VGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLmNhbWVyYVRleHQsIFwid2hpdGVcIiwgMTYpO1xuXHR0aGlzLmNhbWVyYVRleHQgLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xufVxuXG5MZXZlbC5wcm90b3R5cGUua2lsbEdyYW5ueSA9IGZ1bmN0aW9uKGdyYW5ueSkge1x0XG5cdGdyYW5ueS5raWxsKCk7XG59XG5cbkxldmVsLnByb3RvdHlwZS50b2dnbGVDYW1lcmEgPSBmdW5jdGlvbigpIHtcblx0Ly8gaWYgc3BhY2ViYXIgd2FzIGhpdCwgdG9nZ2xlIGNhbWVyYVxuXHRpZiAoZ2FtZS5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKSkge1xuXHRcdGlmIChnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPT09IHRydWUpIHtcblx0XHRcdC8vIHVuZm9sbG93XG5cdFx0XHRnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPSBmYWxzZTtcblx0XHRcdGdhbWUuY2FtZXJhLnVuZm9sbG93KCk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZm9sbG93IHBsYXllclxuXHRcdFx0Z2FtZS5jYW1lcmEuZm9sbG93aW5nID0gdHJ1ZTtcblx0XHRcdGdhbWUuY2FtZXJhLmZvbGxvdyhsZXZlbC5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0pO1xuXHRcdH1cdFxuXHR9XHRcbn07XG5cbkxldmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcblx0Ly8gZ2FtZSBjYW1lcmEgdXBkYXRlc1xuXHR0aGlzLm1vdmVHYW1lQ2FtZXJhKCk7XG5cdFxuXHQvLyBkaXNwbHkgY2hlY2twb2ludHMgc3F1YXJlc1xuXHRmb3IgKGkgPSAwOyBpIDwgdGhpcy5jaGVja3BvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdHRoaXMuY2hlY2twb2ludHNbaV0udXBkYXRlKCk7XHRcblx0fVxufTtcblxuTGV2ZWwucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuXHQvLyBTaG93IGdhbWUgc3RhdHMgLSBmcHMsIGNhbWVyYSBsb2NhdGlvbiwgc3ByaXRlIGxvY2F0aW9uXG5cdC8vZ2FtZS5kZWJ1Zy5jYW1lcmFJbmZvKGdhbWUuY2FtZXJhLCAzMiwgMzIpO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLmluaXRpYWxpemVHYW1lQ2FtZXJhID0gZnVuY3Rpb24gKCkge1xuXHQvLyBzZXQgY2FtYWVyYSB0byBmb2xsb3cgY2hhcmFjdGVyXG5cdGdhbWUuY2FtZXJhLmZvbGxvd2luZyA9IHRydWU7XG5cdGdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcnNbZ2FtZS5ncmFubnlQb2ludGVyXSk7XG59O1xuXG5MZXZlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZU1hcCA9IGZ1bmN0aW9uKCkge1xuXHQvLyByZWFkIGZyb20gdGlsZW1hcCBcIm1hcFwiXG5cdHRoaXMubWFwID0gZ2FtZS5hZGQudGlsZW1hcChcIm1hcFwiKTtcblx0Ly90aWxlc2V0ID0gdm9sY2Fuby1zZXQgKGluc2lkZSBMYXZhLTEuanNvbiwgdGlsZXMgaXMgZnJvbSBwcmVsb2FkZWQgaW1hZ2Vcblx0dGhpcy5tYXAuYWRkVGlsZXNldEltYWdlKFwidm9sY2Fuby10aWxlc2V0XCIsIFwidGlsZXNcIiwgMTYsIDE2KTtcblxuXHQvLyBDcmVhdGUgR3JvdW5kIExheWVyXG5cdHRoaXMuZ3JvdW5kTGF5ZXIgPSBuZXcgUGhhc2VyLlRpbGVtYXBMYXllcihnYW1lLCB0aGlzLm1hcCwgdGhpcy5tYXAuZ2V0TGF5ZXJJbmRleChcIkdyb3VuZFwiKSwgZ2FtZS53aWR0aCwgZ2FtZS5oZWlnaHQpO1xuXHRnYW1lLndvcmxkLmFkZEF0KHRoaXMuZ3JvdW5kTGF5ZXIsIDApO1xuXHR0aGlzLmdyb3VuZExheWVyLnJlc2l6ZVdvcmxkKCk7XHRcdFxuXHRcblx0Ly8gQ3JlYXRlIFdhbGwgTGF5ZXIsIGFkZCBjb2xsaXNpb24gdGlsZXMsIGVuZWFibGUgcGh5c2ljcy4gXG5cdHRoaXMuYmxvY2tMYXllciA9IG5ldyBQaGFzZXIuVGlsZW1hcExheWVyKGdhbWUsIHRoaXMubWFwLCB0aGlzLm1hcC5nZXRMYXllckluZGV4KFwiV2FsbFwiKSwgZ2FtZS53aWR0aCwgZ2FtZS5oZWlnaHQpO1xuICAgIGdhbWUud29ybGQuYWRkQXQodGhpcy5ibG9ja0xheWVyLCAxKTtcbiAgICB0aGlzLm1hcC5zZXRDb2xsaXNpb24oWzE2MCwgMTYxLCAxODksIDE5MCwgMTkxLCAxOTIsIDIyMCwgMjIxLCAyMjJdLCB0cnVlLCBcIldhbGxcIik7XG5cdHRoaXMuYmxvY2tMYXllci5yZXNpemVXb3JsZCgpOyBcblx0Z2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5ibG9ja0xheWVyKTtcblxuXHQvLyBDcmVhdGUgRGVhdGggTGF5ZXIsIGFkZCBjb2xsaXNpb24gdGlsZXMsIGVuYWJsZSBwaHlzaWNzLlxuXHR0aGlzLmRlYXRoTGF5ZXIgPSBuZXcgUGhhc2VyLlRpbGVtYXBMYXllcihnYW1lLCB0aGlzLm1hcCwgdGhpcy5tYXAuZ2V0TGF5ZXJJbmRleChcIkxhdmFcIiksIGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0KTtcbiAgICBnYW1lLndvcmxkLmFkZEF0KHRoaXMuZGVhdGhMYXllciwgMik7XG4gICAgdGhpcy5tYXAuc2V0Q29sbGlzaW9uKFsxMjEsIDEyNCwgMTUyLCAxNTQsIDE4NCwgMjExLCAyMTMsIDIxNCwgNDAwLCA0MDEsIDQwMiwgNDMwLCA0MzEsIDQzMiwgNDYwLCA0NjEsIDQ2Ml0sIHRydWUsIFwiTGF2YVwiKTtcdFx0XG4gICAgdGhpcy5kZWF0aExheWVyLnJlc2l6ZVdvcmxkKCk7XG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcy5kZWF0aExheWVyKTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5pbml0aWFsaXplUGxheWVyID0gZnVuY3Rpb24oKSB7XG5cdHZhciBpID0gMDsgXG5cdGdhbWUubG9hZFNwcml0ZXMuY2hlY2twb2ludHNbMF0uc3Bhd25wb2ludHMuZm9yRWFjaChmdW5jdGlvbihzcGF3bnBvaW50KSB7XG5cdFx0bGV2ZWwucGxheWVyc1tpKytdID0gbmV3IFBsYXllcihzcGF3bnBvaW50LngsIHNwYXducG9pbnQueSk7XG5cdH0pO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLmluaXRpYWxpemVFbmVtaWVzID0gZnVuY3Rpb24oKSB7XG5cdGdhbWUubG9hZFNwcml0ZXMuem9tYmllcy5mb3JFYWNoKGZ1bmN0aW9uKHpvbWJpZSkge1xuXHRcdGxldmVsLmVuZW1pZXMucHVzaChuZXcgRW5lbXkoem9tYmllLnBvc2l0aW9uLCB6b21iaWUuc3BlZWQpKTtcblx0fSk7XG59O1xuXG5MZXZlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZUNoZWNrcG9pbnRzID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuY2hlY2twb2ludHMgPSBcblx0W1xuXHRcdG5ldyBDaGVja3BvaW50KDAsIDgwLCA2NCwgODAsIHRydWUsIDEpLFxuXHRcdG5ldyBDaGVja3BvaW50KDMzNiwgNTQyLCA4MCwgNjQsIGZhbHNlLCAyKSxcblx0XHRuZXcgQ2hlY2twb2ludCg3NTAsIDk2LCA4MCwgNDgsIGZhbHNlLCAzKSxcblx0XHRuZXcgQ2hlY2twb2ludCgxNTA2LCAzMzgsIDkyLCA4MCwgZmFsc2UsIDQsIHRydWUpXHRcdFxuXHRdO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLnNldHVwR3Jhbm55Q29udHJvbGxlciA9IGZ1bmN0aW9uKCkge1xuXHRnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuT05FKS5wcm9jZXNzS2V5RG93biA9IGZ1bmN0aW9uKCkge1xuXHRcdGdhbWUuZ3Jhbm55UG9pbnRlciA9IDA7XG5cdFx0Ly9pZiAoKVxuXHRcdGdhbWUuY2FtZXJhLmZvbGxvdyhsZXZlbC5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0pO1xuXHR9XG5cdGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5UV08pLnByb2Nlc3NLZXlEb3duID0gZnVuY3Rpb24oKSB7XG5cdFx0Z2FtZS5ncmFubnlQb2ludGVyID0gMTtcblx0XHRnYW1lLmNhbWVyYS5mb2xsb3cobGV2ZWwucGxheWVyc1tnYW1lLmdyYW5ueVBvaW50ZXJdKTtcblx0fVxuXHRnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVEhSRUUpLnByb2Nlc3NLZXlEb3duID0gZnVuY3Rpb24oKSB7XG5cdFx0Z2FtZS5ncmFubnlQb2ludGVyID0gMjtcblx0XHRnYW1lLmNhbWVyYS5mb2xsb3cobGV2ZWwucGxheWVyc1tnYW1lLmdyYW5ueVBvaW50ZXJdKTtcblx0fVxuXHRnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRk9VUikucHJvY2Vzc0tleURvd24gPSBmdW5jdGlvbigpIHtcblx0XHRnYW1lLmdyYW5ueVBvaW50ZXIgPSAzO1xuXHRcdGdhbWUuY2FtZXJhLmZvbGxvdyhsZXZlbC5wbGF5ZXJzW2dhbWUuZ3Jhbm55UG9pbnRlcl0pO1xuXHR9XG59XG5cbkxldmVsLnByb3RvdHlwZS5tb3ZlR2FtZUNhbWVyYSA9IGZ1bmN0aW9uKCkge1xuXHQvLyBjaGVjayBpZiBjYW1lcmEgaXMgc2V0IHRvIGZvbGxvdyBjaGFyYWN0ZXJcblx0aWYgKGdhbWUuY2FtZXJhLmZvbGxvd2luZyA9PSBmYWxzZSkge1xuXHRcdC8vIG1vdmUgY2FtZXJhXG5cdFx0aWYgKHRoaXMud2FzZC51cC5pc0Rvd24pIHtcblx0XHRcdGdhbWUuY2FtZXJhLnkgLT0gNDtcblx0XHR9XG5cdFx0aWYgKHRoaXMud2FzZC5kb3duLmlzRG93bikge1xuXHRcdFx0Z2FtZS5jYW1lcmEueSArPSA0O1xuXHRcdH1cblx0XHRpZiAodGhpcy53YXNkLmxlZnQuaXNEb3duKSB7XG5cdFx0XHRnYW1lLmNhbWVyYS54IC09IDQ7XG5cdFx0fVxuXHRcdGlmICh0aGlzLndhc2QucmlnaHQuaXNEb3duKSB7XG5cdFx0XHRnYW1lLmNhbWVyYS54ICs9IDQ7XG5cdFx0fVxuXHR9XG59O1xuIiwidmFyIFRleHRDb25maWd1cmVyID0gcmVxdWlyZShcIi4uL3V0aWwvdGV4dF9jb25maWd1cmVyXCIpXG5cbnZhciBQcmVsb2FkZXIgPSBmdW5jdGlvbigpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByZWxvYWRlcjtcblxuUHJlbG9hZGVyLnByb3RvdHlwZSA9IHtcblx0cHJlbG9hZDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5kaXNwbGF5TG9hZGVyKCk7XG5cdFx0dGhpcy5sb2FkLnRpbGVtYXAoXCJtYXBcIiwgXCJhc3NldHMvbWFwL0xldmVscy9NdWx0aS0xL011bHRpLTEtbWFwLmpzb25cIiwgbnVsbCwgUGhhc2VyLlRpbGVtYXAuVElMRURfSlNPTik7XG5cdFx0dGhpcy5sb2FkLmltYWdlKFwidGlsZXNcIiwgXCJhc3NldHMvdGlsZXMvdm9sY2Fuby10aWxlc2V0LnBuZ1wiKTtcblx0XHR0aGlzLmxvYWQuc3ByaXRlc2hlZXQoXCJkdWRlXCIsIFwiYXNzZXRzL3RleHR1cmVzL2VuZW15LnBuZ1wiKTtcblx0XHR0aGlzLmxvYWQuc3ByaXRlc2hlZXQoXCJlbmVteVwiLCBcImFzc2V0cy90ZXh0dXJlcy96b21iaWUucG5nXCIsIDE1NywgMTAyKTtcblx0XHRnYW1lLmxvYWRTcHJpdGVzID0gcmVxdWlyZShcIi4uLy4uLy4uL2Fzc2V0cy9tYXAvTGV2ZWxzL011bHRpLTEvbXVsdGktMS5qc29uXCIpO1xuXG5cdFx0Y3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuXHRcdG1vdXNlID0gZ2FtZS5pbnB1dC5tb3VzZTtcblx0fSxcblxuXHRkaXNwbGF5TG9hZGVyOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRleHQgPSBnYW1lLmFkZC50ZXh0KGdhbWUuY2FtZXJhLndpZHRoIC8gMiwgMjUwLCBcIkxvYWRpbmcuLi4gXCIpO1xuICAgIFx0dGhpcy50ZXh0LmFuY2hvci5zZXRUbyguNSwgLjUpO1xuXHRcdFRleHRDb25maWd1cmVyLmNvbmZpZ3VyZVRleHQodGhpcy50ZXh0LCBcIndoaXRlXCIsIDMyKTtcblxuICAgIFx0dGhpcy5sb2FkLm9uRmlsZUNvbXBsZXRlLmFkZChmdW5jdGlvbihwcm9ncmVzcykge1xuXHQgICAgICAgIHRoaXMudGV4dC5zZXRUZXh0KFwiTG9hZGluZy4uLiBcIiArIHByb2dyZXNzICsgXCIlXCIpO1xuXHQgICAgfSwgdGhpcyk7XG5cbiAgICBcdHRoaXMubG9hZC5vbkxvYWRDb21wbGV0ZS5hZGQoZnVuY3Rpb24oKSB7XG5cdFx0XHRnYW1lLnN0YXRlLnN0YXJ0KFwiTGV2ZWxcIik7XG5cdCAgICB9KTtcblx0fVxufSAiLCJleHBvcnRzLmNvbmZpZ3VyZVRleHQgPSBmdW5jdGlvbih0ZXh0LCBjb2xvciwgc2l6ZSkge1xuXHR0ZXh0LmZvbnQgPSBcIkNhcnRlciBPbmVcIjtcblx0dGV4dC5maWxsID0gY29sb3I7XG5cdHRleHQuZm9udFNpemUgPSBzaXplO1xufSIsIndpbmRvdy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKDYwOCwgNjA4LCBQaGFzZXIuQVVUTywgJycsIHsgY3JlYXRlOiBjcmVhdGUgfSk7XG5cbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcblx0LyplYXN5cnRjLmVuYWJsZURlYnVnKHRydWUpO1xuXHRlYXN5cnRjLmNvbm5lY3QoXCJnYW1lLnNlcnZlclwiLFxuXHQgXHRmdW5jdGlvbihlYXN5cnRjaWQsIHJvb21Pd25lcikge1xuXHQgICAgXHQvL2Nvbm5lY3RlZFxuXHQgIFx0fSxcblx0ICBcdGZ1bmN0aW9uKGVycm9yVGV4dCkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJmYWlsZWQgdG8gY29ubmVjdCBcIiwgZXJGclRleHQpO1xuXHRcdH1cblx0KTtcblx0ZWFzeXJ0Yy5lbmFibGVEYXRhQ2hhbm5lbHModHJ1ZSk7XG5cblx0ZWFzeXJ0Yy5qb2luUm9vbShcblx0XHRcImxvYmJ5XCIsXG5cdFx0bnVsbCxcblx0XHRmdW5jdGlvbigpIHtcblx0XHQgXHRlYXN5cnRjLnNlbmRTZXJ2ZXJNZXNzYWdlKFwiaGVsbG9cIiwgIHttZXNzYWdlOidoZWxsbyd9LFxuXHQgICAgICBcdGZ1bmN0aW9uKGFja21lc3NhZ2Upe1xuXHRcdCAgICAgICAgY29uc29sZS5sb2coYWNrbWVzc2FnZSk7XG5cdFx0ICAgIFx0fVxuXHRcdCAgIFx0KTtcbiBcdFx0fSxcblx0XHRmdW5jdGlvbigpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gam9pbicpXHRcblx0XHR9XHRcblx0KTsqL1xuXG5cbiAgICAvL2luaXRpYWxpemUgYWxsIHRoZSBnYW1lIHN0YXRlcy5cbiAgICBnYW1lLnN0YXRlLmFkZChcIkJvb3RcIiwgcmVxdWlyZShcIi4vZ2FtZS9zdGF0ZXMvYm9vdFwiKSk7XG4gICAgZ2FtZS5zdGF0ZS5hZGQoXCJQcmVsb2FkZXJcIiwgcmVxdWlyZShcIi4vZ2FtZS9zdGF0ZXMvcHJlbG9hZGVyXCIpKTtcblx0Z2FtZS5zdGF0ZS5hZGQoXCJMZXZlbFwiLCByZXF1aXJlKFwiLi9nYW1lL3N0YXRlcy9sZXZlbFwiKSk7XG4gICAgZ2FtZS5zdGF0ZS5zdGFydChcIkJvb3RcIik7XG59O1xuXG5cblxuXG5cbiJdfQ==
