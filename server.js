var express = require('express');
var http = require('http');

var app = express();

app.use(express.static('app'));
app.use('/scripts', express.static( __dirname + '/node_modules'));

var webServer = http.createServer(app).listen(8000);