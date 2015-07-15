var Level = function () {};

module.exports = Level;

Level.prototype = {
	create: function() {
		console.log("Level");

		this.initializeMap();
	},

	initializeMap: function() {	
	}
};