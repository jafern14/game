/*
var Player = require("../entites/player");

var Checkpoint = require("../entites/checkpoint");
var TextConfigurer = require("../util/text_configurer");
*/
var Zombie = require("../entities/zombie");
var Level = require("../entities/level");
var mapData = require("json!../../../assets/map/Levels/Multi-1/multi-1.json");

var GameState = function(_game) {
    var grannyCounter, players, zombies;
    var game = _game;

    function create() {
        grannyCounter = 0;
        players = [];
        zombies = [];

        Level.createMap(game);
        createZombies();
    }

    function generateZombieSprites(zombies) {
        zombies = zombies.map(function(zombie) {
            var positions = zombie.getPositions();
            zombie.sprite = game.add.sprite(positions[0].x, positions[0].y, zombie.name);
            return zombie;
        });
        zombies.forEach(function(zombie) {
            var sprite = zombie.sprite;
            sprite.max_speed = zombie.getSpeed();
            sprite.positions = zombie.getPositions();
            // sprite.positionCounter = 0;

            game.physics.arcade.enable(sprite);

            sprite.body.collideWorldBounds = true;
            sprite.body.sourceHeight = 100;
            sprite.body.sourceWidth = 100;

            sprite.destination = null;

            sprite.scale.set(.3, .3);
            sprite.anchor.x = .5;
            sprite.anchor.y = .5;
            sprite.rotation = Math.PI / 2;

            sprite.animations.add("walk");
            sprite.animations.play("walk", 6, true);

            //set bounding box
            sprite.body.collideWorldBounds = true;
        });
    }

    function createZombies() {

        var zombies = mapData.zombies.map(
            function(zombie) {
                return new Zombie(zombie);
            }
        );

        generateZombieSprites(zombies);
    }

    function update() {
        for (i = 0; i < zombies.length; i++) {
            console.log(zombies[i])
            zombies[i].update(game, zombies[i].sprite);
        }
    }

    return {
        create: create,
        update: update
    }
};

module.exports = GameState;