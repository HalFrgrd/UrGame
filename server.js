var express = require('express');
var app = express();
var server = require('http').Server(app)
var io = require('socket.io').listen(server)

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

var players = {};
var otherPlayer = {}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


io.on('connection', function (socket) {
  console.log('a user connected');

  players[socket.id] = {
    id: socket.id,
    number: Object.keys(players).length
  };

  //Alert other player (and new player) of new player
  // socket.broadcast.emit("newPlayer", players[socket.id]);
  // socket.emit("newPlayer", players[socket.id]);

  if(Object.keys(players).length == 2){
    console.log("starting game")
    Object.keys(players).forEach( key => {
      let p = players[key]
      console.log(p.id, p.number)
      io.to(p.id).emit("startingGame", p.number)
    })
    let diceValues = [ getRandomInt(0,2),getRandomInt(0,2),getRandomInt(0,2),getRandomInt(0,2),];
    console.log("sending new dice values: ", diceValues);
    io.emit("newDiceRoll", diceValues); //tell both clients of new dice values
  
  }

  socket.on("playedTurn", function (moves){
    let squareThatWasMoved = moves[0]
    let squareNowOccupied = moves[1]
    console.log(players[socket.id].number," moved from, ", squareThatWasMoved)
    socket.broadcast.emit("playerMoved", [socket.id,squareThatWasMoved,squareNowOccupied]) //alert otherplayer of this move

    //sending dice
    let diceValues = [ getRandomInt(0,2),getRandomInt(0,2),getRandomInt(0,2),getRandomInt(0,2),];
    console.log("sending new dice values: ", diceValues);
    io.emit("newDiceRoll", diceValues); //tell both clients of new dice values
  
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


