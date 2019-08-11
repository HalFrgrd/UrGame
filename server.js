var express = require('express');
var app = express();
var server = require('http').Server(app)
var io = require('socket.io').listen(server)
var fs = require("fs");




app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

var otherPlayer = {}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


var text = fs.readFileSync("./fiveletterwords.txt").toString('utf-8');;
var gameCodes = text.split("\n")


var waitingForFriends = {}

var gameFinding = io.of('/findgame').on('connection', function (socket){
  console.log("someone joined game finding")
  
  socket.on("gameCodeRequest", function( callBackFn){
    console.log("sending out a code")
    var i = 0
    while(i < gameCodes.length){
      var newCode = gameCodes[Math.floor(Math.random() * gameCodes.length)];
      if(waitingForFriends['newCode'] === undefined) break;
      i ++
    }
    if(i == gameCodes.length) {console.log("full") }
    else{
      callBackFn(newCode)
      waitingForFriends[newCode] = socket.id
    }
  })

  socket.on("joinFriendRequest", function(codeName, callBackFn){
    if(waitingForFriends[codeName] !== undefined) {
      console.log("a friend is waiting")

      let newRoomKey = codeName; //we use the game codes as room keys

      socket.to(waitingForFriends[codeName]).emit("friendJoined", newRoomKey)

      callBackFn(["friendAvailable",newRoomKey])
    }
    callBackFn(["notAvailable",null])
  })
})
  
var inRooms = {}

var gamePlaying = io.of('/gameplay').on('connection', function (socket) {
  console.log('someone joined game play');

  var ourRoomKey;
  socket.on("requestRoomJoin", function(roomKey, callBackFn){
    socket.join(roomKey)
    ourRoomKey = roomKey;
    callBackFn()
    
    if(inRooms[ourRoomKey] === undefined) {
      inRooms[ourRoomKey] = 1
    } else {
      inRooms[ourRoomKey] += 1
    }
    console.log("one person joined room: ", roomKey, inRooms[ourRoomKey])

    if(inRooms[ourRoomKey] == 2){
      
      socket.emit("startingGame", inRooms[ourRoomKey])
      socket.to(ourRoomKey).emit("startingGame", 1) //only the first person gets this
      rollAndSendDice(1)

    } else{
      //socket.emit("startingGame", inRooms[ourRoomKey])
    }

  })

  function rollAndSendDice(supposeToPlay) {

    let diceValues = [ getRandomInt(0,2) ,getRandomInt(0,2),getRandomInt(0,2),getRandomInt(0,2),];
    console.log("sending new dice values: ", diceValues);
    io.of('gameplay').to(ourRoomKey).emit("newDiceRoll", diceValues, supposeToPlay); //tell both clients of new dice values


  }

  // socket.on("tellOtherPersonToPlay", function() {
  //   rollAndSendDice()
  //   socket.in(ourRoomKey).emit("otherPlayerMoved", [-1,-1])
  // })

  socket.on("playedTurn", function (moves){
    console.log("someone moved: ", moves[0], " to ", moves[1])

    
    let squareThatWasMoved = moves[0]
    let squareNowOccupied = moves[1]
    let supposeToPlay = moves[2]
    // console.log(players[socket.id].number," moved from, ", squareThatWasMoved)
    socket.in(ourRoomKey).emit("otherPlayerMoved", [squareThatWasMoved,squareNowOccupied]) //alert otherplayer of this move
    
    rollAndSendDice(supposeToPlay);
    //sending dice
    // let diceValues = [ getRandomInt(0,2),getRandomInt(0,2),getRandomInt(0,2),getRandomInt(0,2),];
    // console.log("sending new dice values: ", diceValues);
    // io.of('gameplay').to(ourRoomKey).emit("newDiceRoll", diceValues); //tell both clients of new dice values

  
  })

  socket.on('disconnect', function () {
    console.log('user disconnected');
    //remove this player from our players object
    // delete players[socket.id];
    inRooms[ourRoomKey] -= 1
    // emit a message to all players to remove this player
    io.of('gameplay').to(ourRoomKey).emit('disconnect', socket.id);
  })

})

server.listen(8081, function() {
  console.log(`Listening on ${server.address().port}`);
});


