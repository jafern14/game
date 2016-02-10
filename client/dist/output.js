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

    //set bounding box
    this.body.collideWorldBounds = true;
    this.body.sourceHeight = 80;
    this.body.sourceWidth = 80;
    
    //initialize the "onclick" function
    game.input.onDown.add(this.move, this);

    //shrink character
    this.scale.set(.3,.3);

    //set the players position to the center of the sprite
    this.anchor.x = .45;
    this.anchor.y = .55;
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
    //game.debug.body(this, "rgba(0,255,0,100)", false);

    //if player is moving this will tell it when to stop
    this.checkLocation();    
};

Player.prototype.move = function(pointer) {
    //players destination is written according to world view. (not camera)
    this.destination = new Phaser.Point(game.camera.x + pointer.x, game.camera.y + pointer.y);

    //rotate sprite to face the direction it will be moving
    this.rotation = game.physics.arcade.angleToXY(this.body, this.destination.x, this.destination.y) + Math.PI;

    //move character to the point (player doesnt stop once it hits that point with this method - see checkLocation()) 
    game.physics.arcade.moveToXY(this, game.camera.x + pointer.x, game.camera.y + pointer.y, MAX_VELOCITY);
};

Player.prototype.checkLocation = function() {
    //check contact with rock walls
    game.physics.arcade.overlap(this, level.blockLayer);

    granny = this;
    //check contact with lava - add "die" callback if contact is made
    game.physics.arcade.overlap(this, level.deathLayer,
        function() {
            level.killGranny(granny)
        });

    //check for contact with enemies
    for (i = 0; i < level.enemies.length; i++) {
        //game.physics.arcade.overlap(this, level.enemies[i], level.killGranny)    
    }

    //check for contact with checkpoints
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

Level.prototype.create = function() { 
	game.grannyCounter = 1;
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
	
	this.initializeGameCamera();

	// setup keyboard input
	game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.wasd = {
		'up' : game.input.keyboard.addKey(Phaser.Keyboard.W),
		'down' : game.input.keyboard.addKey(Phaser.Keyboard.S),
		'left' : game.input.keyboard.addKey(Phaser.Keyboard.A),
		'right' :game.input.keyboard.addKey(Phaser.Keyboard.D)
	}

	// on keyboard input toggle camera
	game.input.keyboard.onDownCallback = this.toggleCamera;
	// add player to keyboard context
	game.input.keyboard.player = this.players[0];
};

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
	console.log(granny.id);
	granny.kill();

	console.log(this.players)
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
			game.camera.follow(level.players[0]);
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
	game.camera.follow(this.players[0]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92NC4yLjEvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiY2xpZW50L2Fzc2V0cy9tYXAvTGV2ZWxzL011bHRpLTEvbXVsdGktMS5qc29uIiwiY2xpZW50L3NyYy9nYW1lL2VudGl0aWVzL2NoZWNrcG9pbnQuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvZW5lbXkuanMiLCJjbGllbnQvc3JjL2dhbWUvZW50aXRpZXMvcGxheWVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9ib290LmpzIiwiY2xpZW50L3NyYy9nYW1lL3N0YXRlcy9sZXZlbC5qcyIsImNsaWVudC9zcmMvZ2FtZS9zdGF0ZXMvcHJlbG9hZGVyLmpzIiwiY2xpZW50L3NyYy9nYW1lL3V0aWwvdGV4dF9jb25maWd1cmVyLmpzIiwiY2xpZW50L3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9eyBcblx0XCJ6b21iaWVzXCIgOiBbXG5cdFx0e1xuXHRcdFx0XCJwb3NpdGlvblwiIDogW1xuXHRcdFx0XHR7XCJ4XCIgOiAyNTAsIFwieVwiIDogMjAwfSxcblx0XHRcdFx0e1wieFwiIDogMjUwLCBcInlcIiA6IDI1MH1cblx0XHRcdF0sXG5cdFx0XHRcInNwZWVkXCIgOiAxMDAgXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInBvc2l0aW9uXCIgOiBbXG5cdFx0XHRcdHtcInhcIiA6IDMwMCwgXCJ5XCIgOiAzMDB9LFxuXHRcdFx0XHR7XCJ4XCIgOiAzNTAsIFwieVwiIDogMzAwfSxcblx0XHRcdFx0e1wieFwiIDogMzI1LCBcInlcIiA6IDEwMH1cblx0XHRcdF0sXG5cdFx0XHRcInNwZWVkXCIgOiAxNTAgXG5cdFx0fVxuXHRdLFxuXHRcImNoZWNrcG9pbnRzXCIgOiBbXG5cdFx0e1xuXHRcdFx0XCJzcGF3bnBvaW50c1wiIDogW1xuXHRcdFx0XHR7XCJ4XCI6IDgwLCBcInlcIjogNzV9LFxuXHRcdFx0XHR7XCJ4XCI6IDgwLCBcInlcIjogMTU1fSxcblx0XHRcdFx0e1wieFwiOiA4MCwgXCJ5XCI6IDIzNX0sXG5cdFx0XHRcdHtcInhcIjogODAsIFwieVwiOiAzMTV9XG5cdFx0XHRdLCBcblx0XHRcdFwiZGltZW5zaW9uc1wiIDoge1wieDBcIiA6IDAsIFwid2lkdGhcIiA6IDEwLCBcInkwXCIgOiAwLCBcImhlaWdodFwiIDogMTB9XG5cdFx0fSxcblx0XHR7IFxuXHRcdFx0XCJzcGF3bnBvaW50c1wiIDogW1xuXHRcdFx0XHR7XCJ4XCI6IDAsIFwieVwiOiAwfSxcblx0XHRcdFx0e1wieFwiOiAwLCBcInlcIjogMX0sXG5cdFx0XHRcdHtcInhcIjogMCwgXCJ5XCI6IDJ9LFxuXHRcdFx0XHR7XCJ4XCI6IDAsIFwieVwiOiAzfVxuXHRcdFx0XSxcblx0XHRcdFwiZGltZW5zaW9uc1wiIDoge1wieDBcIiA6IDEwLCBcIndpZHRoXCIgOiAxMCwgXCJ5MFwiIDogMTAsIFwiaGVpZ2h0XCIgOiAxMH1cblx0XHR9XG5cdF1cbn1cbiIsInZhciBDaGVja3BvaW50ID0gZnVuY3Rpb24gKHgsIHksIHdpZHRoLCBoZWlnaHQsIGFjdGl2YXRlZCwgb3JkZXIsIGZpbmFsQ2hlY2twb2ludCkge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBudWxsKTtcblx0Z2FtZS5waHlzaWNzLmVuYWJsZSh0aGlzLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuXHR0aGlzLmJvZHkuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0LCAwLCAwKTtcblxuXHR0aGlzLmZpbmFsQ2hlY2twb2ludCA9IGZpbmFsQ2hlY2twb2ludDtcbiAgICB0aGlzLm9yZGVyID0gb3JkZXI7XG4gICAgdGhpcy5hY3RpdmF0ZWQgPSBhY3RpdmF0ZWQ7XG4gICAgLy9hZGQgc3ByaXRlIHRvIGdhbWVcbiAgICBnYW1lLmRlYnVnLmdlb20odGhpcyAsJ3JiZ2EoMCwgMCwgMjU1LCAxKScsIGZhbHNlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaGVja3BvaW50O1xuXG5DaGVja3BvaW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5DaGVja3BvaW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAvL2dhbWUuZGVidWcuYm9keSh0aGlzLCBcInJiZ2EoMCwgMCwgMjU1LCAxKVwiLCBmYWxzZSk7XG59IiwidmFyIEVuZW15ID0gZnVuY3Rpb24gKF9wb3NpdGlvbnMsIF92ZWxvY2l0eSkge1xuICAgIFxuICAgIHRoaXMucG9zaXRpb25zID0gX3Bvc2l0aW9ucztcbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuXG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIHRoaXMucG9zaXRpb25zWzBdLngsIHRoaXMucG9zaXRpb25zWzBdLnksIFwiZW5lbXlcIik7XG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcyk7XG5cbiAgICB0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuc291cmNlSGVpZ2h0ID0gMTAwO1xuICAgIHRoaXMuYm9keS5zb3VyY2VXaWR0aCA9IDEwMDtcblxuICAgIHRoaXMubWF4X3ZlbG9jaXR5ID0gX3ZlbG9jaXR5O1xuICAgIHRoaXMuZGVzdGluYXRpb24gPSBudWxsOyAgICBcbiAgICBcbiAgICB0aGlzLnNjYWxlLnNldCguMywuMyk7XG4gICAgdGhpcy5hbmNob3IueCA9IC41O1xuICAgIHRoaXMuYW5jaG9yLnkgPSAuNTtcbiAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG5cbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKFwid2Fsa1wiKTtcbiAgICB0aGlzLmFuaW1hdGlvbnMucGxheShcIndhbGtcIiwgNiwgdHJ1ZSk7XG5cbiAgICAvL3NldCBib3VuZGluZyBib3hcbiAgICB0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICBcbiAgICBnYW1lLmFkZC5leGlzdGluZyh0aGlzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmVteTtcblxuRW5lbXkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5cbkVuZW15LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAvL2dhbWUuZGVidWcuYm9keSh0aGlzLCBcInJnYmEoMjU1LDAsMCwyKVwiLCBmYWxzZSk7XG4gICAgdGhpcy5tb3ZlKCk7XG59XG5cbkVuZW15LnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmRlc3RpbmF0aW9uID09IG51bGwpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnBvc2l0aW9uc1t0aGlzLmNvdW50ZXIldGhpcy5wb3NpdGlvbnMuc2l6ZV0ueCk7XG4gICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBuZXcgUGhhc2VyLlBvaW50KHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5sZW5ndGhdLngsIHRoaXMucG9zaXRpb25zW3RoaXMuY291bnRlciV0aGlzLnBvc2l0aW9ucy5sZW5ndGhdLnkpO1xuICAgIFxuICAgICAgICAvL3JvdGF0ZSBzcHJpdGUgdG8gZmFjZSB0aGUgZGlyZWN0aW9uIGl0IHdpbGwgYmUgbW92aW5nXG4gICAgICAgIHRoaXMucm90YXRpb24gPSBnYW1lLnBoeXNpY3MuYXJjYWRlLmFuZ2xlVG9YWSh0aGlzLmJvZHksIHRoaXMuZGVzdGluYXRpb24ueCwgdGhpcy5kZXN0aW5hdGlvbi55KTtcblxuICAgICAgICAvL21vdmUgY2hhcmFjdGVyIHRvIHRoZSBwb2ludCAocGxheWVyIGRvZXNudCBzdG9wIG9uY2UgaXQgaGl0cyB0aGF0IHBvaW50IHdpdGggdGhpcyBtZXRob2QgLSBzZWUgY2hlY2tMb2NhdGlvbigpKSBcbiAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9YWSh0aGlzLCB0aGlzLnBvc2l0aW9uc1t0aGlzLmNvdW50ZXIldGhpcy5wb3NpdGlvbnMubGVuZ3RoXS54LCB0aGlzLnBvc2l0aW9uc1t0aGlzLmNvdW50ZXIldGhpcy5wb3NpdGlvbnMubGVuZ3RoXS55LCB0aGlzLm1heF92ZWxvY2l0eSk7XG5cbiAgICAgICAgdGhpcy5jb3VudGVyICsrO1xuICAgIH0gXG4gICAgdGhpcy5jaGVja0xvY2F0aW9uKCk7XG59XG5cbkVuZW15LnByb3RvdHlwZS5jaGVja0xvY2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgLy9pZiB0aGVyZSBpcyBubyBjb250YWN0LCBzdG9wIHRoZSBjaGFyYWN0ZXIgZnJvbSBtb3ZpbmcgYWZ0ZXIgdGhleSd2ZSByZWFjaGVkIHRoZWlyIGRlc3RpbmF0aW9uXG4gICAgLy9tYWRlIGl0IGFwcHJveGltYXRlIGRlc3RpbmF0aW9uIGJlY2F1c2UgaXRzIHVubGlrZWx5IGl0IHdpbGwgZW5kIG9uIHRoYXQgZXhhY3QgbG9jYXRpb25cbiAgICBpZiAodGhpcy5kZXN0aW5hdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIC8vb25jZSBpdCBnZXRzIGNsb3NlIGVub3VnaCB0byB0aGUgeCBkZXN0aW5hdGlvbiBsb3dlciB4IHZlbG9jaXR5XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnBvc2l0aW9uLnggLSB0aGlzLmRlc3RpbmF0aW9uLngpIDwgdGhpcy5tYXhfdmVsb2NpdHkvMTAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IC0odGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXN0aW5hdGlvbi54KTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgLy9vbmNlIGl0IGdldHMgY2xvc2UgZW5vdWdoIHRvIHRoZSB5IGRlc3RpbmF0aW9uIGxvd2VyIHkgdmVsb2NpdHlcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSkgPCB0aGlzLm1heF92ZWxvY2l0eS8xMDApIHtcbiAgICAgICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS55ID0gLSh0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLmRlc3RpbmF0aW9uLnkpO1xuICAgICAgICB9XG4gICAgICAgIC8vc3RvcCBtb3ZlbWVudCBjb21wbGV0ZWx5IC0gZGVzdGluYXRpb24gaGFzIGJlZW4gcmVhY2hlZC5cbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGVzdGluYXRpb24ueCkgPCA1ICYmIE1hdGguYWJzKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSkgPCA1KSB7XG4gICAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsInZhciBNQVhfVkVMT0NJVFkgPSAxNTA7XG52YXIgVGV4dENvbmZpZ3VyZXIgPSByZXF1aXJlKFwiLi4vdXRpbC90ZXh0X2NvbmZpZ3VyZXJcIilcblxuXG5cbnZhciBQbGF5ZXIgPSBmdW5jdGlvbiAoeCwgeSkge1xuXG4gICAgdGhpcy5pZCA9IGdhbWUuZ3Jhbm55Q291bnRlcisrO1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCBcImR1ZGVcIik7XG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5lbmFibGUodGhpcyk7XG5cbiAgICAvL3NldCBib3VuZGluZyBib3hcbiAgICB0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuc291cmNlSGVpZ2h0ID0gODA7XG4gICAgdGhpcy5ib2R5LnNvdXJjZVdpZHRoID0gODA7XG4gICAgXG4gICAgLy9pbml0aWFsaXplIHRoZSBcIm9uY2xpY2tcIiBmdW5jdGlvblxuICAgIGdhbWUuaW5wdXQub25Eb3duLmFkZCh0aGlzLm1vdmUsIHRoaXMpO1xuXG4gICAgLy9zaHJpbmsgY2hhcmFjdGVyXG4gICAgdGhpcy5zY2FsZS5zZXQoLjMsLjMpO1xuXG4gICAgLy9zZXQgdGhlIHBsYXllcnMgcG9zaXRpb24gdG8gdGhlIGNlbnRlciBvZiB0aGUgc3ByaXRlXG4gICAgdGhpcy5hbmNob3IueCA9IC40NTtcbiAgICB0aGlzLmFuY2hvci55ID0gLjU1O1xuICAgIC8vdHVybiBjaGFyYWN0ZXIgdGhlIG90aGVyIGRpcmVjdGlvblxuICAgIHRoaXMucm90YXRpb24gPSBNYXRoLlBJIDtcblxuICAgIC8vY3JlYXRlIHRoaXMgdmFsdWUgZm9yIHNvbWUgbnVsbCBjaGVja1xuICAgIHRoaXMuZGVzdGluYXRpb247XG5cbiAgICAvL2FkZCBzcHJpdGUgdG8gZ2FtZVxuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcblxuUGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vZGlzcGxheSBib3VuZGluZyBib3hcbiAgICAvL2dhbWUuZGVidWcuYm9keSh0aGlzLCBcInJnYmEoMCwyNTUsMCwxMDApXCIsIGZhbHNlKTtcblxuICAgIC8vaWYgcGxheWVyIGlzIG1vdmluZyB0aGlzIHdpbGwgdGVsbCBpdCB3aGVuIHRvIHN0b3BcbiAgICB0aGlzLmNoZWNrTG9jYXRpb24oKTsgICAgXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihwb2ludGVyKSB7XG4gICAgLy9wbGF5ZXJzIGRlc3RpbmF0aW9uIGlzIHdyaXR0ZW4gYWNjb3JkaW5nIHRvIHdvcmxkIHZpZXcuIChub3QgY2FtZXJhKVxuICAgIHRoaXMuZGVzdGluYXRpb24gPSBuZXcgUGhhc2VyLlBvaW50KGdhbWUuY2FtZXJhLnggKyBwb2ludGVyLngsIGdhbWUuY2FtZXJhLnkgKyBwb2ludGVyLnkpO1xuXG4gICAgLy9yb3RhdGUgc3ByaXRlIHRvIGZhY2UgdGhlIGRpcmVjdGlvbiBpdCB3aWxsIGJlIG1vdmluZ1xuICAgIHRoaXMucm90YXRpb24gPSBnYW1lLnBoeXNpY3MuYXJjYWRlLmFuZ2xlVG9YWSh0aGlzLmJvZHksIHRoaXMuZGVzdGluYXRpb24ueCwgdGhpcy5kZXN0aW5hdGlvbi55KSArIE1hdGguUEk7XG5cbiAgICAvL21vdmUgY2hhcmFjdGVyIHRvIHRoZSBwb2ludCAocGxheWVyIGRvZXNudCBzdG9wIG9uY2UgaXQgaGl0cyB0aGF0IHBvaW50IHdpdGggdGhpcyBtZXRob2QgLSBzZWUgY2hlY2tMb2NhdGlvbigpKSBcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1hZKHRoaXMsIGdhbWUuY2FtZXJhLnggKyBwb2ludGVyLngsIGdhbWUuY2FtZXJhLnkgKyBwb2ludGVyLnksIE1BWF9WRUxPQ0lUWSk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrTG9jYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAvL2NoZWNrIGNvbnRhY3Qgd2l0aCByb2NrIHdhbGxzXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMsIGxldmVsLmJsb2NrTGF5ZXIpO1xuXG4gICAgZ3Jhbm55ID0gdGhpcztcbiAgICAvL2NoZWNrIGNvbnRhY3Qgd2l0aCBsYXZhIC0gYWRkIFwiZGllXCIgY2FsbGJhY2sgaWYgY29udGFjdCBpcyBtYWRlXG4gICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMsIGxldmVsLmRlYXRoTGF5ZXIsXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV2ZWwua2lsbEdyYW5ueShncmFubnkpXG4gICAgICAgIH0pO1xuXG4gICAgLy9jaGVjayBmb3IgY29udGFjdCB3aXRoIGVuZW1pZXNcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGV2ZWwuZW5lbWllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvL2dhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLCBsZXZlbC5lbmVtaWVzW2ldLCBsZXZlbC5raWxsR3Jhbm55KSAgICBcbiAgICB9XG5cbiAgICAvL2NoZWNrIGZvciBjb250YWN0IHdpdGggY2hlY2twb2ludHNcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGV2ZWwuY2hlY2twb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZ2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMsIGxldmVsLmNoZWNrcG9pbnRzW2ldLCBmdW5jdGlvbigpIHsgXG4gICAgICAgICAgICBpZiAobGV2ZWwuY2hlY2twb2ludHNbaV0uYWN0aXZhdGVkID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsZXZlbC5jaGVja3BvaW50c1tpXS5maW5hbENoZWNrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2twb2ludFRleHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja3BvaW50VGV4dC5kZXN0cm95KCk7IFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2twb2ludFRleHQgPSBnYW1lLmFkZC50ZXh0KDIzMCwgMTAsIFwiQ2hlY2twb2ludCBSZWFjaGVkIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgVGV4dENvbmZpZ3VyZXIuY29uZmlndXJlVGV4dCh0aGlzLmNoZWNrcG9pbnRUZXh0LCBcIndoaXRlXCIsIDI0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja3BvaW50VGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBnYW1lLnRpbWUuZXZlbnRzLmFkZCgyMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuYWRkLnR3ZWVuKHRoaXMuY2hlY2twb2ludFRleHQpLnRvKHt5OiAwfSwgMTUwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmFkZC50d2Vlbih0aGlzLmNoZWNrcG9pbnRUZXh0KS50byh7YWxwaGE6IDB9LCAxNTAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy53aW5UZXh0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2luVGV4dC5kZXN0cm95KCk7IFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2luVGV4dCA9IGdhbWUuYWRkLnRleHQoMjMwLCAyNTAsIFwiWW91IFdpbiFcIik7XG4gICAgICAgICAgICAgICAgICAgIFRleHRDb25maWd1cmVyLmNvbmZpZ3VyZVRleHQodGhpcy53aW5UZXh0LCBcIndoaXRlXCIsIDQ4KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aW5UZXh0LmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGdhbWUudGltZS5ldmVudHMuYWRkKDUwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5zdGF0ZS5zdGFydChcIkxldmVsXCIpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV2ZWwuY2hlY2twb2ludHNbaV0uYWN0aXZhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gICBcbiAgICAgICAgfSk7XG4gICAgfSAgXG5cbiAgICAvL2lmIHRoZXJlIGlzIG5vIGNvbnRhY3QsIHN0b3AgdGhlIGNoYXJhY3RlciBmcm9tIG1vdmluZyBhZnRlciB0aGV5J3ZlIHJlYWNoZWQgdGhlaXIgZGVzdGluYXRpb25cbiAgICAvL21hZGUgaXQgYXBwcm94aW1hdGUgZGVzdGluYXRpb24gYmVjYXVzZSBpdHMgdW5saWtlbHkgaXQgd2lsbCBlbmQgb24gdGhhdCBleGFjdCBsb2NhdGlvblxuICAgIGlmICh0aGlzLmRlc3RpbmF0aW9uICE9IG51bGwpIHtcbiAgICAgICAgLy9vbmNlIGl0IGdldHMgY2xvc2UgZW5vdWdoIHRvIHRoZSB4IGRlc3RpbmF0aW9uIGxvd2VyIHggdmVsb2NpdHlcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueCAtIHRoaXMuZGVzdGluYXRpb24ueCkgPCBNQVhfVkVMT0NJVFkvMTAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueCA9IC0odGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kZXN0aW5hdGlvbi54KTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgLy9vbmNlIGl0IGdldHMgY2xvc2UgZW5vdWdoIHRvIHRoZSB5IGRlc3RpbmF0aW9uIGxvd2VyIHkgdmVsb2NpdHlcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMucG9zaXRpb24ueSAtIHRoaXMuZGVzdGluYXRpb24ueSkgPCBNQVhfVkVMT0NJVFkvMTAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvZHkudmVsb2NpdHkueSA9IC0odGhpcy5wb3NpdGlvbi55IC0gdGhpcy5kZXN0aW5hdGlvbi55KTtcbiAgICAgICAgfVxuICAgICAgICAvL3N0b3AgbW92ZW1lbnQgY29tcGxldGVseSAtIGRlc3RpbmF0aW9uIGhhcyBiZWVuIHJlYWNoZWQuXG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uLnggPT0gdGhpcy5kZXN0aW5hdGlvbi54ICYmIHRoaXMucG9zaXRpb24ueSA9PSB0aGlzLmRlc3RpbmF0aW9uLnkpIHtcbiAgICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufSIsInZhciBCb290ID0gZnVuY3Rpb24oKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBCb290O1xuXG5Cb290LnByb3RvdHlwZSA9IHtcblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblx0XHRnYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZTtcblx0XHRpZiAoZ2FtZS5kZXZpY2UuZGVza3RvcCkge1xuXHRcdFx0Z2FtZS5zdGFnZS5zY2FsZS5wYWdlQWxpZ25Ib3Jpem9udGFsbHkgPSB0cnVlO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGFsZXJ0KFwiRGVza3RvcCBnYW1lIG9ubHlcIilcblx0XHR9XG5cblx0XHRnYW1lLnN0YXRlLnN0YXJ0KFwiUHJlbG9hZGVyXCIpO1xuXHR9XG59IiwidmFyIFBsYXllciA9IHJlcXVpcmUoXCIuLi9lbnRpdGllcy9wbGF5ZXJcIik7XG52YXIgRW5lbXkgPSByZXF1aXJlKFwiLi4vZW50aXRpZXMvZW5lbXlcIik7XG52YXIgQ2hlY2twb2ludCA9IHJlcXVpcmUoXCIuLi9lbnRpdGllcy9jaGVja3BvaW50XCIpO1xudmFyIFRleHRDb25maWd1cmVyID0gcmVxdWlyZShcIi4uL3V0aWwvdGV4dF9jb25maWd1cmVyXCIpO1xuXG52YXIgTGV2ZWwgPSBmdW5jdGlvbiAoKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBMZXZlbDtcblxuTGV2ZWwucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkgeyBcblx0Z2FtZS5ncmFubnlDb3VudGVyID0gMTtcblx0Ly8gaW5pdGlhbGl6ZSB0aGluZ3Ncblx0bGV2ZWwgPSB0aGlzO1xuXHR0aGlzLmxpdmVzID0gMTA7XG5cdHRoaXMuZW5lbWllcyA9IFtdO1xuXHR0aGlzLnBsYXllcnMgPSBbXTtcblx0Z2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cdFxuXHR0aGlzLmluaXRpYWxpemVNYXAoKTtcblx0dGhpcy5pbml0aWFsaXplQ2hlY2twb2ludHMoKTtcblx0dGhpcy5pbml0aWFsaXplRW5lbWllcygpO1xuXHR0aGlzLmluaXRpYWxpemVQbGF5ZXIoKTtcblx0XG5cdHRoaXMuaW5pdGlhbGl6ZUdhbWVDYW1lcmEoKTtcblxuXHQvLyBzZXR1cCBrZXlib2FyZCBpbnB1dFxuXHRnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuXHR0aGlzLndhc2QgPSB7XG5cdFx0J3VwJyA6IGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5XKSxcblx0XHQnZG93bicgOiBnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUyksXG5cdFx0J2xlZnQnIDogZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkEpLFxuXHRcdCdyaWdodCcgOmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5EKVxuXHR9XG5cblx0Ly8gb24ga2V5Ym9hcmQgaW5wdXQgdG9nZ2xlIGNhbWVyYVxuXHRnYW1lLmlucHV0LmtleWJvYXJkLm9uRG93bkNhbGxiYWNrID0gdGhpcy50b2dnbGVDYW1lcmE7XG5cdC8vIGFkZCBwbGF5ZXIgdG8ga2V5Ym9hcmQgY29udGV4dFxuXHRnYW1lLmlucHV0LmtleWJvYXJkLnBsYXllciA9IHRoaXMucGxheWVyc1swXTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5hZGRIVUQgPSBmdW5jdGlvbiAoKSB7XG5cdGlmICh0aGlzLmxpdmVzVGV4dCAhPSBudWxsKSB7XG5cdFx0dGhpcy5saXZlc1RleHQuZGVzdHJveSgpOyBcblx0fVxuXG5cdHRoaXMubGl2ZXNUZXh0ID0gZ2FtZS5hZGQudGV4dCgxMCwgMTAsIFwiTGl2ZXM6IFwiICsgdGhpcy5saXZlcyk7XG5cdFRleHRDb25maWd1cmVyLmNvbmZpZ3VyZVRleHQodGhpcy5saXZlc1RleHQsIFwid2hpdGVcIiwgMzIpO1xuXHR0aGlzLmxpdmVzVGV4dC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuXHRpZiAodGhpcy5jYW1lcmFUZXh0ICE9IG51bGwpIHtcblx0XHR0aGlzLmNhbWVyYVRleHQuZGVzdHJveSgpOyBcblx0fVxuXHR0aGlzLmNhbWVyYVRleHQgPSBnYW1lLmFkZC50ZXh0KDEwLCA0OCwgXCJDYW1lcmE6IExvY2tlZFwiKVxuXHRUZXh0Q29uZmlndXJlci5jb25maWd1cmVUZXh0KHRoaXMuY2FtZXJhVGV4dCwgXCJ3aGl0ZVwiLCAxNik7XG5cdHRoaXMuY2FtZXJhVGV4dCAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG59XG5cbkxldmVsLnByb3RvdHlwZS5raWxsR3Jhbm55ID0gZnVuY3Rpb24oZ3Jhbm55KSB7XHRcblx0Y29uc29sZS5sb2coZ3Jhbm55LmlkKTtcblx0Z3Jhbm55LmtpbGwoKTtcblxuXHRjb25zb2xlLmxvZyh0aGlzLnBsYXllcnMpXG59XG5cbkxldmVsLnByb3RvdHlwZS50b2dnbGVDYW1lcmEgPSBmdW5jdGlvbigpIHtcblx0Ly8gaWYgc3BhY2ViYXIgd2FzIGhpdCwgdG9nZ2xlIGNhbWVyYVxuXHRpZiAoZ2FtZS5pbnB1dC5rZXlib2FyZC5pc0Rvd24oUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKSkge1xuXHRcdGlmIChnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPT09IHRydWUpIHtcblx0XHRcdC8vIHVuZm9sbG93XG5cdFx0XHRnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPSBmYWxzZTtcblx0XHRcdGdhbWUuY2FtZXJhLnVuZm9sbG93KCk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZm9sbG93IHBsYXllclxuXHRcdFx0Z2FtZS5jYW1lcmEuZm9sbG93aW5nID0gdHJ1ZTtcblx0XHRcdGdhbWUuY2FtZXJhLmZvbGxvdyhsZXZlbC5wbGF5ZXJzWzBdKTtcblx0XHR9XHRcblx0fVx0XG59O1xuXG5MZXZlbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG5cdC8vIGdhbWUgY2FtZXJhIHVwZGF0ZXNcblx0dGhpcy5tb3ZlR2FtZUNhbWVyYSgpO1xuXHRcblx0Ly8gZGlzcGx5IGNoZWNrcG9pbnRzIHNxdWFyZXNcblx0Zm9yIChpID0gMDsgaSA8IHRoaXMuY2hlY2twb2ludHMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLmNoZWNrcG9pbnRzW2ldLnVwZGF0ZSgpO1x0XG5cdH1cbn07XG5cbkxldmVsLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcblx0Ly8gU2hvdyBnYW1lIHN0YXRzIC0gZnBzLCBjYW1lcmEgbG9jYXRpb24sIHNwcml0ZSBsb2NhdGlvblxuXHQvL2dhbWUuZGVidWcuY2FtZXJhSW5mbyhnYW1lLmNhbWVyYSwgMzIsIDMyKTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5pbml0aWFsaXplR2FtZUNhbWVyYSA9IGZ1bmN0aW9uICgpIHtcblx0Ly8gc2V0IGNhbWFlcmEgdG8gZm9sbG93IGNoYXJhY3RlclxuXHRnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPSB0cnVlO1xuXHRnYW1lLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXJzWzBdKTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5pbml0aWFsaXplTWFwID0gZnVuY3Rpb24oKSB7XG5cdC8vIHJlYWQgZnJvbSB0aWxlbWFwIFwibWFwXCJcblx0dGhpcy5tYXAgPSBnYW1lLmFkZC50aWxlbWFwKFwibWFwXCIpO1xuXHQvL3RpbGVzZXQgPSB2b2xjYW5vLXNldCAoaW5zaWRlIExhdmEtMS5qc29uLCB0aWxlcyBpcyBmcm9tIHByZWxvYWRlZCBpbWFnZVxuXHR0aGlzLm1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJ2b2xjYW5vLXRpbGVzZXRcIiwgXCJ0aWxlc1wiLCAxNiwgMTYpO1xuXG5cdC8vIENyZWF0ZSBHcm91bmQgTGF5ZXJcblx0dGhpcy5ncm91bmRMYXllciA9IG5ldyBQaGFzZXIuVGlsZW1hcExheWVyKGdhbWUsIHRoaXMubWFwLCB0aGlzLm1hcC5nZXRMYXllckluZGV4KFwiR3JvdW5kXCIpLCBnYW1lLndpZHRoLCBnYW1lLmhlaWdodCk7XG5cdGdhbWUud29ybGQuYWRkQXQodGhpcy5ncm91bmRMYXllciwgMCk7XG5cdHRoaXMuZ3JvdW5kTGF5ZXIucmVzaXplV29ybGQoKTtcdFx0XG5cdFxuXHQvLyBDcmVhdGUgV2FsbCBMYXllciwgYWRkIGNvbGxpc2lvbiB0aWxlcywgZW5lYWJsZSBwaHlzaWNzLiBcblx0dGhpcy5ibG9ja0xheWVyID0gbmV3IFBoYXNlci5UaWxlbWFwTGF5ZXIoZ2FtZSwgdGhpcy5tYXAsIHRoaXMubWFwLmdldExheWVySW5kZXgoXCJXYWxsXCIpLCBnYW1lLndpZHRoLCBnYW1lLmhlaWdodCk7XG4gICAgZ2FtZS53b3JsZC5hZGRBdCh0aGlzLmJsb2NrTGF5ZXIsIDEpO1xuICAgIHRoaXMubWFwLnNldENvbGxpc2lvbihbMTYwLCAxNjEsIDE4OSwgMTkwLCAxOTEsIDE5MiwgMjIwLCAyMjEsIDIyMl0sIHRydWUsIFwiV2FsbFwiKTtcblx0dGhpcy5ibG9ja0xheWVyLnJlc2l6ZVdvcmxkKCk7IFxuXHRnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLmJsb2NrTGF5ZXIpO1xuXG5cdC8vIENyZWF0ZSBEZWF0aCBMYXllciwgYWRkIGNvbGxpc2lvbiB0aWxlcywgZW5hYmxlIHBoeXNpY3MuXG5cdHRoaXMuZGVhdGhMYXllciA9IG5ldyBQaGFzZXIuVGlsZW1hcExheWVyKGdhbWUsIHRoaXMubWFwLCB0aGlzLm1hcC5nZXRMYXllckluZGV4KFwiTGF2YVwiKSwgZ2FtZS53aWR0aCwgZ2FtZS5oZWlnaHQpO1xuICAgIGdhbWUud29ybGQuYWRkQXQodGhpcy5kZWF0aExheWVyLCAyKTtcbiAgICB0aGlzLm1hcC5zZXRDb2xsaXNpb24oWzEyMSwgMTI0LCAxNTIsIDE1NCwgMTg0LCAyMTEsIDIxMywgMjE0LCA0MDAsIDQwMSwgNDAyLCA0MzAsIDQzMSwgNDMyLCA0NjAsIDQ2MSwgNDYyXSwgdHJ1ZSwgXCJMYXZhXCIpO1x0XHRcbiAgICB0aGlzLmRlYXRoTGF5ZXIucmVzaXplV29ybGQoKTtcbiAgICBnYW1lLnBoeXNpY3MuYXJjYWRlLmVuYWJsZSh0aGlzLmRlYXRoTGF5ZXIpO1xufTtcblxuTGV2ZWwucHJvdG90eXBlLmluaXRpYWxpemVQbGF5ZXIgPSBmdW5jdGlvbigpIHtcblx0dmFyIGkgPSAwOyBcblx0Z2FtZS5sb2FkU3ByaXRlcy5jaGVja3BvaW50c1swXS5zcGF3bnBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKHNwYXducG9pbnQpIHtcblx0XHRsZXZlbC5wbGF5ZXJzW2krK10gPSBuZXcgUGxheWVyKHNwYXducG9pbnQueCwgc3Bhd25wb2ludC55KTtcblx0fSk7XG59O1xuXG5MZXZlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZUVuZW1pZXMgPSBmdW5jdGlvbigpIHtcblx0Z2FtZS5sb2FkU3ByaXRlcy56b21iaWVzLmZvckVhY2goZnVuY3Rpb24oem9tYmllKSB7XG5cdFx0bGV2ZWwuZW5lbWllcy5wdXNoKG5ldyBFbmVteSh6b21iaWUucG9zaXRpb24sIHpvbWJpZS5zcGVlZCkpO1xuXHR9KTtcbn07XG5cbkxldmVsLnByb3RvdHlwZS5pbml0aWFsaXplQ2hlY2twb2ludHMgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5jaGVja3BvaW50cyA9IFxuXHRbXG5cdFx0bmV3IENoZWNrcG9pbnQoMCwgODAsIDY0LCA4MCwgdHJ1ZSwgMSksXG5cdFx0bmV3IENoZWNrcG9pbnQoMzM2LCA1NDIsIDgwLCA2NCwgZmFsc2UsIDIpLFxuXHRcdG5ldyBDaGVja3BvaW50KDc1MCwgOTYsIDgwLCA0OCwgZmFsc2UsIDMpLFxuXHRcdG5ldyBDaGVja3BvaW50KDE1MDYsIDMzOCwgOTIsIDgwLCBmYWxzZSwgNCwgdHJ1ZSlcdFx0XG5cdF07XG59O1xuXG5MZXZlbC5wcm90b3R5cGUubW92ZUdhbWVDYW1lcmEgPSBmdW5jdGlvbigpIHtcblx0Ly8gY2hlY2sgaWYgY2FtZXJhIGlzIHNldCB0byBmb2xsb3cgY2hhcmFjdGVyXG5cdGlmIChnYW1lLmNhbWVyYS5mb2xsb3dpbmcgPT0gZmFsc2UpIHtcblx0XHQvLyBtb3ZlIGNhbWVyYVxuXHRcdGlmICh0aGlzLndhc2QudXAuaXNEb3duKSB7XG5cdFx0XHRnYW1lLmNhbWVyYS55IC09IDQ7XG5cdFx0fVxuXHRcdGlmICh0aGlzLndhc2QuZG93bi5pc0Rvd24pIHtcblx0XHRcdGdhbWUuY2FtZXJhLnkgKz0gNDtcblx0XHR9XG5cdFx0aWYgKHRoaXMud2FzZC5sZWZ0LmlzRG93bikge1xuXHRcdFx0Z2FtZS5jYW1lcmEueCAtPSA0O1xuXHRcdH1cblx0XHRpZiAodGhpcy53YXNkLnJpZ2h0LmlzRG93bikge1xuXHRcdFx0Z2FtZS5jYW1lcmEueCArPSA0O1xuXHRcdH1cblx0fVxufTtcbiIsInZhciBUZXh0Q29uZmlndXJlciA9IHJlcXVpcmUoXCIuLi91dGlsL3RleHRfY29uZmlndXJlclwiKVxuXG52YXIgUHJlbG9hZGVyID0gZnVuY3Rpb24oKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcmVsb2FkZXI7XG5cblByZWxvYWRlci5wcm90b3R5cGUgPSB7XG5cdHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZGlzcGxheUxvYWRlcigpO1xuXHRcdHRoaXMubG9hZC50aWxlbWFwKFwibWFwXCIsIFwiYXNzZXRzL21hcC9MZXZlbHMvTXVsdGktMS9NdWx0aS0xLW1hcC5qc29uXCIsIG51bGwsIFBoYXNlci5UaWxlbWFwLlRJTEVEX0pTT04pO1xuXHRcdHRoaXMubG9hZC5pbWFnZShcInRpbGVzXCIsIFwiYXNzZXRzL3RpbGVzL3ZvbGNhbm8tdGlsZXNldC5wbmdcIik7XG5cdFx0dGhpcy5sb2FkLnNwcml0ZXNoZWV0KFwiZHVkZVwiLCBcImFzc2V0cy90ZXh0dXJlcy9lbmVteS5wbmdcIik7XG5cdFx0dGhpcy5sb2FkLnNwcml0ZXNoZWV0KFwiZW5lbXlcIiwgXCJhc3NldHMvdGV4dHVyZXMvem9tYmllLnBuZ1wiLCAxNTcsIDEwMik7XG5cdFx0Z2FtZS5sb2FkU3ByaXRlcyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9hc3NldHMvbWFwL0xldmVscy9NdWx0aS0xL211bHRpLTEuanNvblwiKTtcblxuXHRcdGN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcblx0XHRtb3VzZSA9IGdhbWUuaW5wdXQubW91c2U7XG5cdH0sXG5cblx0ZGlzcGxheUxvYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50ZXh0ID0gZ2FtZS5hZGQudGV4dChnYW1lLmNhbWVyYS53aWR0aCAvIDIsIDI1MCwgXCJMb2FkaW5nLi4uIFwiKTtcbiAgICBcdHRoaXMudGV4dC5hbmNob3Iuc2V0VG8oLjUsIC41KTtcblx0XHRUZXh0Q29uZmlndXJlci5jb25maWd1cmVUZXh0KHRoaXMudGV4dCwgXCJ3aGl0ZVwiLCAzMik7XG5cbiAgICBcdHRoaXMubG9hZC5vbkZpbGVDb21wbGV0ZS5hZGQoZnVuY3Rpb24ocHJvZ3Jlc3MpIHtcblx0ICAgICAgICB0aGlzLnRleHQuc2V0VGV4dChcIkxvYWRpbmcuLi4gXCIgKyBwcm9ncmVzcyArIFwiJVwiKTtcblx0ICAgIH0sIHRoaXMpO1xuXG4gICAgXHR0aGlzLmxvYWQub25Mb2FkQ29tcGxldGUuYWRkKGZ1bmN0aW9uKCkge1xuXHRcdFx0Z2FtZS5zdGF0ZS5zdGFydChcIkxldmVsXCIpO1xuXHQgICAgfSk7XG5cdH1cbn0gIiwiZXhwb3J0cy5jb25maWd1cmVUZXh0ID0gZnVuY3Rpb24odGV4dCwgY29sb3IsIHNpemUpIHtcblx0dGV4dC5mb250ID0gXCJDYXJ0ZXIgT25lXCI7XG5cdHRleHQuZmlsbCA9IGNvbG9yO1xuXHR0ZXh0LmZvbnRTaXplID0gc2l6ZTtcbn0iLCJ3aW5kb3cuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg2MDgsIDYwOCwgUGhhc2VyLkFVVE8sICcnLCB7IGNyZWF0ZTogY3JlYXRlIH0pO1xuXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG5cdC8qZWFzeXJ0Yy5lbmFibGVEZWJ1Zyh0cnVlKTtcblx0ZWFzeXJ0Yy5jb25uZWN0KFwiZ2FtZS5zZXJ2ZXJcIixcblx0IFx0ZnVuY3Rpb24oZWFzeXJ0Y2lkLCByb29tT3duZXIpIHtcblx0ICAgIFx0Ly9jb25uZWN0ZWRcblx0ICBcdH0sXG5cdCAgXHRmdW5jdGlvbihlcnJvclRleHQpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiZmFpbGVkIHRvIGNvbm5lY3QgXCIsIGVyRnJUZXh0KTtcblx0XHR9XG5cdCk7XG5cdGVhc3lydGMuZW5hYmxlRGF0YUNoYW5uZWxzKHRydWUpO1xuXG5cdGVhc3lydGMuam9pblJvb20oXG5cdFx0XCJsb2JieVwiLFxuXHRcdG51bGwsXG5cdFx0ZnVuY3Rpb24oKSB7XG5cdFx0IFx0ZWFzeXJ0Yy5zZW5kU2VydmVyTWVzc2FnZShcImhlbGxvXCIsICB7bWVzc2FnZTonaGVsbG8nfSxcblx0ICAgICAgXHRmdW5jdGlvbihhY2ttZXNzYWdlKXtcblx0XHQgICAgICAgIGNvbnNvbGUubG9nKGFja21lc3NhZ2UpO1xuXHRcdCAgICBcdH1cblx0XHQgICBcdCk7XG4gXHRcdH0sXG5cdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnZmFpbGVkIHRvIGpvaW4nKVx0XG5cdFx0fVx0XG5cdCk7Ki9cblxuXG4gICAgLy9pbml0aWFsaXplIGFsbCB0aGUgZ2FtZSBzdGF0ZXMuXG4gICAgZ2FtZS5zdGF0ZS5hZGQoXCJCb290XCIsIHJlcXVpcmUoXCIuL2dhbWUvc3RhdGVzL2Jvb3RcIikpO1xuICAgIGdhbWUuc3RhdGUuYWRkKFwiUHJlbG9hZGVyXCIsIHJlcXVpcmUoXCIuL2dhbWUvc3RhdGVzL3ByZWxvYWRlclwiKSk7XG5cdGdhbWUuc3RhdGUuYWRkKFwiTGV2ZWxcIiwgcmVxdWlyZShcIi4vZ2FtZS9zdGF0ZXMvbGV2ZWxcIikpO1xuICAgIGdhbWUuc3RhdGUuc3RhcnQoXCJCb290XCIpO1xufTtcblxuXG5cblxuXG4iXX0=
