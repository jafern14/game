window.game = new Phaser.Game(800, 608, Phaser.AUTO, 'granny-volcano-game', { create: create });

function create() {
    //initialize all the game states.
    game.state.add("Boot", require("./states/boot"));
    //game.state.add('Splash', require('./states/splash'));
    game.state.add("Preloader", require("./states/preloader"));
	//game.state.add('Menu', require('./states/menu'));
    game.state.add('Game', require('./states/game'));
    game.state.start("Boot");
};
