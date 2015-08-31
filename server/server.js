var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

app.use(express.static("client"));
http.listen(process.env.PORT || 8080);1

io.on("connection", function(client) {
	console.log("connected");
});