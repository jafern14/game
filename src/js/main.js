/*
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'granny-volcano-game');

window.Utils = require('./utils');
window.playerState = {
    currentLevel: 'Game'
}

game.state.add('Boot', require('./states/boot'));
game.state.add('Splash', require('./states/splash'));
game.state.add('Preloader', require('./states/preloader'));
game.state.add('Menu', require('./states/menu'));
game.state.add('Game', require('./states/game'));

game.state.start('Boot');
*/


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
    game.state.add("Boot", require("./states/boot"));
    ////
    game.state.add('Splash', require('./states/splash'));
    ////  
    game.state.add("Preloader", require("./states/preloader"));
	game.state.add("Level", require("./states/level"));
    ////
    game.state.add('Menu', require('./states/menu'));
    game.state.add('Game', require('./states/game'));
    ////
    game.state.start("Boot");
};
