var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

var http = require('http');
var server = http.Server(app);

app.use(express.static('client'))

server.listen(HTTP_PORT, function() {
    console.log("running");
});

io.on('connection', function(socket) {
    socket.on('message', function(msg) {
      io.emit('message', msg);
    });
});

io.on()

