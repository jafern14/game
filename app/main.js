var game = new Phaser.Game(800, 384, Phaser.AUTO, '', { create: create });
console.log(game);
var boot = require("./game/states/boot")(game),
    preloader = require("./game/states/preloader")(game),
    gameState = require("./game/states/game-state")(game);

function create() {
    //initialize all the game states.
    game.state.add("Boot", boot);
    game.state.add("Preloader", preloader);
    game.state.add("GameState", gameState);
    game.state.start("Boot");
};