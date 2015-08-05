window.game = new Phaser.Game(300, 300, Phaser.AUTO, '');

startGame();

function startGame() {
	//initialize all the game states.
	game.state.add("Boot", require("./game/states/boot"));
	game.state.add("Preloader", require("./game/states/preloader"));
    game.state.add("Level", require("./game/states/level"));
	game.state.start("Boot");
};3