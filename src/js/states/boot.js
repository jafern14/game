var Boot = function() {};

module.exports = Boot;

Boot.prototype = {
	create: function() {
		window.game.stage.disableVisibilityChange = true;
		if (game.device.desktop) {
			window.game.stage.scale.pageAlignHorizontally = true;
		}
		else {
			alert("Desktop game only")
		}
        
		game.state.start("Preloader");
	}
}
