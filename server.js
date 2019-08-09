var express = require('express');
var app = express();
var server = require('http').Server(app)
var io = require('socket.io').listen(server)

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

var players = {};

io.on('connection', function (socket) {
  console.log('a user connected');

  players[socket.id] = {
    id: socket.id,
    number: Object.keys(players).length
  };

  //Alert other player (and new player) of new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("playedTurn", function (squareThatWasMoved){
    let diceValues = [ Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),];
    socket.broadcast.emit("playerMoved", [socket.id,squareThatWasMoved]) //alert otherplayer of this move
    socket.broadcast.emit("newDiceRoll", diceValues); //tell both clients of new dice values
  })

  socket.on('disconnect', function () {
    console.log('user disconnected');
    //remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  })

})

server.listen(8081, function() {
  console.log(`Listening on ${server.address().port}`);
});


