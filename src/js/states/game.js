var Player = require("../entities/player");
var Enemy = require("../entities/enemy");
var Checkpoint = require("../entities/checkpoint");
var TextConfigurer = require("../util/text_configurer");

var Game = function () {};

module.exports = Game;

game.grannyPointer = 0;

Game.prototype.create = function() {
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

Game.prototype.moveGranny = function(point) {
	this.players[game.grannyPointer].move(point);
}

Game.prototype.addHUD = function () {
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

Game.prototype.killGranny = function(granny) {
	granny.kill();
}

Game.prototype.toggleCamera = function() {
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

Game.prototype.update = function() {
	// game camera updates
	this.moveGameCamera();
    this.checkContact(this);	
    // disply checkpoints squares
	for (i = 0; i < this.checkpoints.length; i++) {
		this.checkpoints[i].update();
	}
};

Game.prototype.render = function() {
	// Show game stats - fps, camera location, sprite location
	//game.debug.cameraInfo(game.camera, 32, 32);
};

Game.prototype.checkContact = function(game) {
    this.players.forEach(function(granny) {
        this.deathlayerContact(game, granny);
        this.enemyContact(game, granny, this.enemies);
    }, this);
}

Game.prototype.deathlayerContact = function(game, granny) {
    game.physics.arcade.overlap(granny, this.deathLayer, function() {
        game.killGranny(granny);
    });
}

Game.prototype.enemyContact = function(game, granny, enemies) {
    enemies.forEach(function(enemy) {
        game.physics.arcade.overlap(granny, enemy, function() {
                game.killGranny(granny);
            });
    }, this);
}

Game.prototype.initializeGameCamera = function () {
	// set camaera to follow character
	game.camera.following = true;
	game.camera.follow(this.players[game.grannyPointer]);
};

Game.prototype.initializeMap = function() {
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

Game.prototype.initializePlayer = function() {
	var i = 0;
	game.loadSprites.checkpoints[0].spawnpoints.forEach(function(spawnpoint) {
		level.players[i++] = new Player(spawnpoint.x, spawnpoint.y);
	});
};

Game.prototype.initializeEnemies = function() {
	game.loadSprites.zombies.forEach(function(zombie) {
		level.enemies.push(new Enemy(zombie.position, zombie.speed));
	});
};

Game.prototype.initializeCheckpoints = function() {
	this.checkpoints =
	[
		new Checkpoint(0, 80, 64, 80, true, 1),
		new Checkpoint(336, 542, 80, 64, false, 2),
		new Checkpoint(750, 96, 80, 48, false, 3),
		new Checkpoint(1506, 338, 92, 80, false, 4, true)
	];
};

Game.prototype.setupGrannyController = function() {
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

Game.prototype.moveGameCamera = function() {
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
