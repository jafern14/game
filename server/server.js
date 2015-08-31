var express = require('express');
var app = express();
var server = require('http').Server(app);

io = require("socket.io").listen(server)

app.use(express.static("client"));
server.listen(8000);

io.on("connection", function(client) {
	console.log("connected");
});