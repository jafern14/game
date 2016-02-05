var express = require('express');
var io = require('socket.io');
var http = require('http');
//var easyrtc = require('easyrtc');

var app = express();

app.use(express.static('client'));
app.use('/scripts', express.static( __dirname + '/node_modules'));

var webServer = http.createServer(app).listen(8000);
var socketServer = io.listen(webServer);

/*var easyrtcServer = easyrtc.listen(
	app, 
	socketServer,
	{logLevel:"debug", logDateEnable:true},
    function(err, rtc) {
    	rtc.setOption("roomDefaultName", "lobby");
        rtc.createApp("game.server");

        rtc.events.on("hello", function(err, msg) {console.log(msg);})
        //rtc.getAppNames(function(err, apps) {console.log(apps)})	
    }
);*/
