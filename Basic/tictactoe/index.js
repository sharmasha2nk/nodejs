var express = require('express');
var app = express();
var port = 3700;

app.set('views', __dirname + '/app/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function (req, res) {
  res.render("board");
});

app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));

var Game = require('./app/models/game');

var game = new Game();

io.sockets.on('connection', function (socket) {
  game.connect(socket);

  socket.on('disconnect', function () {
    game.disconnect(socket);
  });

  socket.on('click', function (data) {
    game.click(socket, data);
  });
});

console.log("Listening on port " + port);
