var Boot = function() {};

module.exports = Boot;

Boot.prototype = {
	create: function() {
		if (game.device.desktop) {
			game.stage.scale.pageAlignHorizontally = true;
		}
		else {
			alert("Desktop game only")
		}

		game.state.start("Preloader");
	}
}