var Player = require("../entities/player");
var Enemy = require("../entities/enemy");
var Checkpoint = require("../entities/checkpoint");
var TextConfigurer = require("../util/text_configurer");

var Level = function () {};

module.exports = Level;

Level.prototype.create = function() { 
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
	this.cursors = game.input.keyboard.createCursorKeys();
	game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.wasd = {
		'up' : game.input.keyboard.addKey(Phaser.Keyboard.W),
		'down' : game.input.keyboard.addKey(Phaser.Keyboard.S),
		'left' : game.input.keyboard.addKey(Phaser.Keyboard.A),
		'right' :game.input.keyboard.addKey(Phaser.Keyboard.D)
	}
	//on keyboard input toggle camera
	game.input.keyboard.onDownCallback = this.toggleCamera;
	// add player to keyboard context
	game.input.keyboard.player = this.players[0];

	this.addHUD();	
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

Level.prototype.killGranny = function() {	
	if (level.lives > 0) {
		level.lives--;
		level.players[0].kill();
		level.players = level.initializePlayer();
		level.initializeGameCamera();
		level.livesText.destroy();
		level.addHUD();
	} 
	else {
		if (this.loseText != null) {
            this.loseText.destroy(); 
        }
        this.loseText = game.add.text(230, 250, "You Lose!");
        TextConfigurer.configureText(this.loseText, "white", 48);
        this.loseText.fixedToCamera = true;

        game.time.events.add(5000, function() {
            game.state.start("Level");
        }, this);
	}
}

Level.prototype.toggleCamera = function() {
	//if spacebar was hit, toggle camera
	if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
		if (game.camera.following === true) {
			//unfollow
			game.camera.following = false;
			game.camera.unfollow();

			level.cameraText.destroy();
			level.cameraText = game.add.text(10, 48, "Camera: Free")
			TextConfigurer.configureText(level.cameraText, "white", 16);
			level.cameraText.fixedToCamera = true;
		} else {
			//follow player
			game.camera.following = true;
			game.camera.follow(level.players[0]);

			level.cameraText.destroy();
			level.cameraText = game.add.text(10, 48, "Camera: Locked")
			TextConfigurer.configureText(level.cameraText, "white", 16);
			level.cameraText.fixedToCamera = true;
		}	
	}	
};

Level.prototype.update = function() {
	//game camera updates
	this.moveGameCamera();
	
	//disply checkpoints squares
	for (i = 0; i < this.checkpoints.length; i++) {
		this.checkpoints[i].update();	
	}
};

Level.prototype.render = function() {
	//Show game stats - fps, camera location, sprite location
	//game.debug.cameraInfo(game.camera, 32, 32);
};

Level.prototype.initializeGameCamera = function () {
	//set camaera to follow character
	game.camera.following = true;
	game.camera.follow(this.players[0]);
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
	game.loadSprites.checkpoints[0].spawnpoints.forEach(function(spawnpoint) {
		level.players.push(new Player(spawnpoint.x, spawnpoint.y));
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
