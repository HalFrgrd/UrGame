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

var rollsForStuck = [4,4,1,4,2,4,4,1,4,2,1,2,1,2,1,1]
var rollIndex = 0

var gamePlaying = io.of('/gameplay').on('connection', function (socket) {
  console.log('someone joined game play');

  var ourRoomKey;
  socket.on("requestRoomJoin", function(roomKey){
    socket.join(roomKey)
    ourRoomKey = roomKey;
    
    if(inRooms[ourRoomKey] === undefined) {
      inRooms[ourRoomKey] = 1
    } else {
      inRooms[ourRoomKey] += 1
    }
    // console.log("one person joined room: ", roomKey, inRooms[ourRoomKey])

    if(inRooms[ourRoomKey] == 2){ //we start the game
      
      socket.to(ourRoomKey).emit("startingGame", 1) //only the first person gets this
      socket.emit("startingGame", 2) //only second person gets this
      rollAndSendDice(1)
      // rollIndex = 0;


    }
  })

  function rollAndSendDice(supposeToPlay) {
    let diceValues = [rollsForStuck[rollIndex],0,0,0]//[ getRandomInt(0,2) ,getRandomInt(0,2),getRandomInt(0,2),getRandomInt(0,2),];
    // console.log("sending new dice values: ", diceValues);
    rollIndex++

    //tell both clients of new dice values
    io.of('gameplay').to(ourRoomKey).emit("newDiceRoll", diceValues, supposeToPlay); 
  }


  socket.on("playedTurn", function (squareThatWasMoved, squareNowOccupied, supposeToPlay ){
    console.log("someone moved: ", squareThatWasMoved, " to ", squareNowOccupied)
    
    //alert otherplayer of this move
    socket.in(ourRoomKey).emit("otherPlayerMoved", squareThatWasMoved,squareNowOccupied) 
    
    rollAndSendDice(supposeToPlay);
  
  })

  socket.on('disconnect', function () {
    console.log('user disconnected');

    inRooms[ourRoomKey] -= 1

    // emit a message to other player to remove this player
    io.of('gameplay').to(ourRoomKey).emit('disconnect', socket.id);
  })

})

server.listen(8081, function() {
  console.log(`Listening on ${server.address().port}`);
});


