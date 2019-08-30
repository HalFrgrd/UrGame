export class GameModel{

  // +------+-------+              +------+-------+------+------+
  // |      |       |              |      |       |      |      |
  // |  21  |   22  |  23     16   |  17  |  18   |  19  |  20  |
  // |      |       |              |      |       |      |      |
  // +---------------------+------------------------------------+
  // |      |       |      |       |      |       |      |      |
  // |   12 |   11  |  10  |   9   |  8   |   7   |  6   |  5   |
  // |      |       |      |       |      |       |      |      |
  // +---------------------+------------------------------------+
  // |      |       |              |      |       |      |      |
  // |  13  |   14  |   15     0   |   1  |   2   |   3  |   4  |
  // |      |       |              |      |       |      |      |
  // +------+-------+              +------+-------+------+------+

  constructor(
    switchTurnCallback, 
    turnFinishCallBack,
    updatePiecesCallback,
    sendMainClickCallback,
    letAiLookCallback,
    rolledDiceCallback,
    playAgainCallback,
    rolledZeroCallback,
    noValidMovesCallback,
    gameFinishCallback,
    whitePiecesObjects,
    blackPiecesObjects,
    selfRoll,
    startingColor = "white",
    gameState = undefined ){

    this.switchTurnCallback = switchTurnCallback
    this.turnFinishCallBack = turnFinishCallBack;
    this.updatePieceCallback = updatePiecesCallback
    this.sendMainClickCallback = sendMainClickCallback
    this.letAiLookCallback = letAiLookCallback
    this.rolledDiceCallback = rolledDiceCallback;
    this.playAgainCallback = playAgainCallback
    this.rolledZeroCallback = rolledZeroCallback;
    this.noValidMovesCallback = noValidMovesCallback;
    this.gameFinishedCallback = gameFinishCallback;

    this.selfRoll = selfRoll;

    // console.log("starting and: ", gameState)
    if(gameState != undefined) {
      this.piecesInPos = gameState['board']
      this.currentPlayer = gameState['currentPlayer']
      // console.log("starting and making THIS DICEROLL: ",  gameState['diceRoll'])
      this.diceRoll = gameState['diceRoll']
    } else {

      this.piecesInPos = Array(24); // piecesInPos[i] contains the pieces that are in position i in the board diagram.
      for (let i = 0; i < this.piecesInPos.length; i++) { this.piecesInPos[i] = []; }
  
      for (let i = 0; i < 7; i++) {
        this.piecesInPos[0].push({color: 'white', object: whitePiecesObjects[i]})
        this.piecesInPos[16].push({color: 'black', object: blackPiecesObjects[i]})
      }
  
      this.currentPlayer = "white"; //be changed later if needed
      this.diceRoll;
    }

    this.startingColor = startingColor;

    this.acceptInput = false;

    // this.diceRolls = [4,4,4,4,0,3,0,4,2,2,1,1]
    // this.diceIndex = 0


  }

  beginGame(){
    this.acceptInput = true;

    if(this.startingColor == "black") this.switchTurn()

    this.finishTurn(false)
  }

  checkIfPlayShouldProceedNormally() {
    console.log("checking if play should proceed normally for: ", this.currentPlayer)

    if (this.diceRoll == 0){
    
      this.rolledZeroCallback() //update visually

      var _this = this

      setTimeout(function() { 
        console.log("redoing the dice for rolled a zero")
        if(_this.currentPlayer == "white") _this.sendMainClickCallback(-1)
        _this.finishTurn(true) //tell server we are ready for new dice
      }, 3000); 
      
    }

    else if( !this.thereIsAValidMove(this.currentPlayer) ) {
      console.log("starting calling a no valid moves callback")
      this.noValidMovesCallback()
      console.log("finished calling a no valid moves callback")

      var _this = this

      setTimeout(function() { 
        console.log("redoing the dice for no valid move")
        if(_this.currentPlayer == "white") _this.sendMainClickCallback(-1)
        _this.finishTurn(true)
      }, 3000); 

    }else {
      var _this = this

      setTimeout(()=>{
        console.log("should play, letting ai look: ", _this.currentPlayer)
        _this.letAiLookCallback()
      }, (IS_TOUCH)? 200: 0)


      
      
    }

    console.log("waiting here")
    
    

  }

  thereIsAValidMove(whoIsPlaying) {
    // does whoIsPlaying have a valid move

    // console.log("checking this board state for a valid move: ",JSON.parse(JSON.stringify(this.piecesInPos)) )
    // console.log("current player: ", JSON.parse(JSON.stringify(this.currentPlayer.toString())))
    // console.log("checking against: ", whoIsPlaying.toString())

    // setTimeout(console.log("finished timeout"),100);
    // console.log("this should be after the timeout")


    for (let i = 0; i < 24; i++) {
      // there is a whoIsPlaying piece in pos i
      // there is a valid move
      
      // console.log(i,this.piecesInPos[i].toString(),  this.piecesInPos[i].length > 0, this.piecesInPos,
        // ( this.piecesInPos[i].length > 0) ? this.piecesInPos[i][this.piecesInPos[i].length -1]['color'] === whoIsPlaying : undefined,
        // this.possibleMove(i,this.diceRoll,whoIsPlaying).length > 0)

      if(
        this.piecesInPos[i].length > 0 && 
        this.piecesInPos[i][this.piecesInPos[i].length -1]['color'] === whoIsPlaying &&
        this.possibleMove(i,this.diceRoll,whoIsPlaying).length > 0
        ) {
          console.log("returning true")
          return true
        }
    }
    console.log("returning false")
    return false
  }

  allPossibleMoves(whoIsPlaying){
    var possMoves = []

    // console.log(this.piecesInPos)
    // console.log("who is playing, ", whoIsPlaying, this.diceRoll)

    for (let i = 0; i < 24; i++) {
      // there is a whoIsPlaying piece in pos i
      // there is a valid move
      // console.log(i,this.piecesInPos[i],  this.piecesInPos[i].length > 0,
      //   ( this.piecesInPos[i].length > 0) ? this.piecesInPos[i][this.piecesInPos[i].length -1]['color'] === whoIsPlaying : undefined,
      //   this.possibleMove(i,this.diceRoll,whoIsPlaying).length > 0)

      if(
        this.piecesInPos[i].length > 0 && 
        this.piecesInPos[i][this.piecesInPos[i].length -1]['color'] === whoIsPlaying &&
        this.possibleMove(i,this.diceRoll,whoIsPlaying).length > 0
        ) {
          possMoves.push(i)
        }
    }
    return possMoves
  }

  exportGameState(){

    console.log("exporting game state")
    return {
      // board: this.piecesInPos.map(pos =>  pos.map(piece => {
      //     // console.log(piece['color'])
      //     return piece['color']
      //   })), 
      board: this.piecesInPos,
      diceRoll: this.diceRoll,
      currentPlayer: this.currentPlayer
    }
  }

  workOutMove(boardPos, whoPlayed, takeAction, sendInfoToHuman = true) {
    var _this = this

    if(
      boardPos >= 0 && 
      this.piecesInPos[boardPos].length > 0 && 
      (whoPlayed == this.currentPlayer || whoPlayed == "UNSURE") &&
      this.acceptInput
      ){

      
        // console.log("got in here")
    
      
      var colorOfPiece = _this.piecesInPos[boardPos][_this.piecesInPos[boardPos].length -1]["color"];
      
      var possiblePos = _this.possibleMove(boardPos, this.diceRoll, colorOfPiece);

      if(colorOfPiece == _this.currentPlayer && possiblePos.length > 0 ){ //there is a legal move

        const newPos = possiblePos[0]; //the legal move

        var changes = [];

        if(takeAction){
          if(this.currentPlayer == 'white') this.sendMainClickCallback(boardPos) //send to server

          //update our knowledge of where the piece is
          this.piecesInPos[newPos].push(this.piecesInPos[boardPos].pop());
          
      
        } 

        var changeType =  (takeAction) ? "permanent_change" : "temporary_change"
        var piecePos = (takeAction) ? newPos : boardPos

        changes.push( {
          object: this.piecesInPos[piecePos][this.piecesInPos[piecePos].length -1]['object'], 
          from: boardPos, 
          to: newPos, 
          type: changeType 
        }) 

        //check if we are removing captured as well piece
        if(_this.piecesInPos[newPos].length > 0 && _this.piecesInPos[newPos][0]["color"] != colorOfPiece){
          var removedPiece = (takeAction) ? _this.piecesInPos[newPos].shift() : _this.piecesInPos[newPos][0]
          changes.push( {
            object: removedPiece['object'], 
            from: newPos, 
            to: (removedPiece['color'] == "white") ? 0 : 16 , 
            type: changeType})
          if(takeAction) _this.piecesInPos[(removedPiece['color'] == "white") ? 0 : 16 ].push(removedPiece)
        }

        if(takeAction){
          if( [15,23].includes(newPos) &&  this.piecesInPos[newPos].length == 7){
            this.acceptInput = false;
            this.gameFinishedCallback();
          } else {
            //Change the turn
            if([4,8,14,22,20].includes(newPos)) this.playAgainCallback()
            this.finishTurn(![4,8,14,22,20].includes(newPos)) // finish the turn and maybe switch turn
          }
        }

        if(sendInfoToHuman) this.updatePieceCallback(changes) //Just visuals pretty much
        return changes

      }
    }
  }

  setDice(diceValues){ //set by server via the client
    this.rolledDiceCallback(diceValues)

    this.diceRoll = diceValues.reduce((a,b) => a+b,0);
    // console.log("setting new dice: ", this.diceRoll)
    
    this.checkIfPlayShouldProceedNormally()
  }

  rollDice() { //only run for local plays
    var diceValues = [ Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),];
    
    // var diceValues = [this.diceRolls[this.diceIndex],0,0,0]
    // this.diceIndex++

    console.log("starting rolled dice callback")

    this.rolledDiceCallback(diceValues)
    console.log("finished rolled dice callback")


    this.diceRoll = diceValues.reduce((a,b) => a+b,0);
    // console.log(this.diceRoll)

    this.checkIfPlayShouldProceedNormally()
    
  }

  switchTurn(){
    console.log("--------------- Switching turns ------------------")

    var tempOldCurrentPlayer = this.currentPlayer
    
    switch (this.currentPlayer) {
      case "white": { this.currentPlayer = "black"; break }
      case "black": { this.currentPlayer = "white"; break }
    }

    console.log("starting switch turn callback")
    this.switchTurnCallback(tempOldCurrentPlayer)
    console.log("finished switch turn callback")


  }

  finishTurn(andSwitchTurn){
    console.log("finsihed turn, and switch turn ", andSwitchTurn )
    if(andSwitchTurn) this.switchTurn()

    // console.log("player as off end of turn callback: ", this.currentPlayer)
    console.log("calling finished turn callback")
    this.turnFinishCallBack()
    console.log("finished turnfinish callback")
    if(this.selfRoll) {
      console.log("rolling because of self roll")
      this.rollDice()
    }
  }

  finishedPieces(color){
    return this.piecesInPos[ (color == "white") ? 15 : 23 ].length
  }

  yetToStartPieces(color){
    return this.piecesInPos[ (color == "white") ? 0 : 16 ].length
  }

  possibleMove(bPos, diceRoll, colorOfPiece) {
    //outputs [newPos] if the piece can move to newPos given the dice roll, and [] otherwise
    var newPossPos = bPos;

    // console.log("finding possible move for: ", bPos, diceRoll, colorOfPiece)
  
    for (let i = 0; i < diceRoll; i++) {
      newPossPos = this.nextPosition(newPossPos,colorOfPiece);
      if (newPossPos == -1) return [];
    }


    // console.log(this.piecesInPos[newPossPos].length==0, newPossPos == 15, newPossPos == 23, (this.piecesInPos[newPossPos].length==0) ? undefined : (this.piecesInPos[newPossPos][0]['color'] != colorOfPiece && newPossPos != 8) )

    if (this.piecesInPos[newPossPos].length==0 || newPossPos == 15 || newPossPos == 23 || (this.piecesInPos[newPossPos][0]['color'] != colorOfPiece && newPossPos != 8)) { // if we have found a new possible position
      return [newPossPos];
    } else return []
  }
  
  nextPosition(bPos, pieceColor) {
    if(bPos == 20) return 5;
    if(bPos == 12 && pieceColor=="black") return 21;
    if(bPos == 15 || bPos == 23) return -1;
    return bPos+1;
  }

}