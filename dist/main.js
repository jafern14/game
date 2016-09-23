/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var boot = __webpack_require__(1),
	    preloader = __webpack_require__(2),
	    level = __webpack_require__(5);

	window.game = new Phaser.Game(608, 608, Phaser.AUTO, '', { create: create });

	function create() {
	    //initialize all the game states.
	    game.state.add("Boot", boot);
	    game.state.add("Preloader", preloader);
		game.state.add("Level", level);
	    game.state.start("Boot");
	};


/***/ },
/* 1 */
/***/ function(module, exports) {

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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var TextConfigurer = __webpack_require__(3);
	var loadedSprites = __webpack_require__(4);

	var Preloader = function() {};

	module.exports = Preloader;

	Preloader.prototype = {
		preload: function() {
			this.displayLoader();
			this.load.tilemap("map", "assets/map/Levels/Multi-1/Multi-1-map.json", null, Phaser.Tilemap.TILED_JSON);
			this.load.image("tiles", "assets/tiles/volcano-tileset.png");
			this.load.spritesheet("granny", "assets/textures/granny.png");
			this.load.spritesheet("enemy", "assets/textures/zombie.png", 157, 102);
			game.loadSprites = loadedSprites;

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


/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.configureText = function(text, color, size) {
		text.font = "Carter One";
		text.fill = color;
		text.fontSize = size;
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = {
		"zombies": [
			{
				"position": [
					{
						"x": 250,
						"y": 200
					},
					{
						"x": 250,
						"y": 250
					}
				],
				"speed": 100
			},
			{
				"position": [
					{
						"x": 300,
						"y": 300
					},
					{
						"x": 350,
						"y": 300
					},
					{
						"x": 325,
						"y": 100
					}
				],
				"speed": 150
			}
		],
		"checkpoints": [
			{
				"spawnpoints": [
					{
						"x": 80,
						"y": 75
					},
					{
						"x": 80,
						"y": 155
					},
					{
						"x": 80,
						"y": 235
					},
					{
						"x": 80,
						"y": 315
					}
				],
				"dimensions": {
					"x0": 0,
					"width": 10,
					"y0": 0,
					"height": 10
				}
			},
			{
				"spawnpoints": [
					{
						"x": 0,
						"y": 0
					},
					{
						"x": 0,
						"y": 1
					},
					{
						"x": 0,
						"y": 2
					},
					{
						"x": 0,
						"y": 3
					}
				],
				"dimensions": {
					"x0": 10,
					"width": 10,
					"y0": 10,
					"height": 10
				}
			}
		]
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Player = __webpack_require__(6);
	var Enemy = __webpack_require__(7);
	var Checkpoint = __webpack_require__(8);
	var TextConfigurer = __webpack_require__(3);

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


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var MAX_VELOCITY = 150;
	var TextConfigurer = __webpack_require__(3)

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


/***/ },
/* 7 */
/***/ function(module, exports) {

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


/***/ },
/* 8 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);