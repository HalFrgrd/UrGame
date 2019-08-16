import {TextButton} from "./textbutton.js";

export class GameScene extends Phaser.Scene{
  constructor() {
    super({
      key: "GAME",
    })

  }
  init(gameMode) {
    console.log("Game scene started with game mode: ", gameMode)

    this.gameMode;
    switch(gameMode){
      case "LOCALPLAY": {this.gameMode = gameMode; break;}
      case "AIPLAY": {this.gameMode = gameMode; break;}
      default: {
        this.gameMode = gameMode[0]; 
        this.roomKey = gameMode[1];
        this.socket;
        this.turnNumber;
        break;
      }
    }
    

    this.boardPositionsAndIndexes = [ [21,22,23,16,17,18,19,20],
    [12, 11, 10, 9, 8, 7, 6 ,5],
    [13, 14, 15, 0 ,1 ,2, 3, 4] ];
    //Geometry
    this.gridWidth = 60;

    this.shiftX = 400-(this.gridWidth*10)/2;
    this.shiftY = 150;



    this.hexWidth = this.gridWidth/2-10;
    this.starCoords = [];
    let coordx = 0;
    let coordy = this.hexWidth;
    for (let i = 0; i < 6; i++) {
      this.starCoords[i] = [coordx, coordy].slice()
      let tempX = coordx
      coordx = coordx*0.5 - coordy*Math.sqrt(3)*0.5
      coordy = tempX*Math.sqrt(3)*0.5 + coordy*0.5
    }
    this.starCoords[6] = [0,0]
    this.starCoords = this.starCoords.map( c =>  [c[0] + this.gridWidth/2, c[1] + this.gridWidth/2]);



    this.piecesInPos = Array(24); // piecesInPos[i] contains the piece(s) that are in position i in the board diagram.
    for (let i = 0; i < this.piecesInPos.length; i++) { this.piecesInPos[i] = []; }
    this.finishedWhites = 0; //number of pieces that white has finished;
    this.finishedBlacks = 0;
    this.yetToStartWhites = 7;
    this.yetToStartBlacks = 7;
    this.diceRoll;
    this.diceText;
    this.dice;
    this.dicePath;
    this.rollAnim;
    this.turnPiece = "white_token";
    this.turnText;
    this.ghostPieceWhite;
    this.ghostPieceBlack;
    this.hoveringOnPiece;

    this.blackTurnIndicators;
    this.whiteTurnIndicators;

    this.activatedColor = '0xCE93D8';
    this.unactivatedColor = '0x904CAA';

    this.infoText;

    this._this;

    this.freezeGame;

  }
  preload() {
    this.load.svg('black_token', 'assets/black_token.svg');
    this.load.svg('white_token', 'assets/white_token.svg');
    this.load.spritesheet('dice','assets/dice.png', {frameWidth: 100, frameHeight: 100});
    this.load.svg('rosette','assets/rosette2.svg');

    this.load.plugin('rexroundrectangleplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/plugins/dist/rexroundrectangleplugin.min.js', true);      
    
  }
  getColor(colString) {
    let fillColor1 = Phaser.Display.Color.HexStringToColor(colString);
    return Phaser.Display.Color.GetColor(fillColor1.r, fillColor1.g, fillColor1.b)
  }

  drawGraphics() {
    this.lines = [
      new Phaser.Geom.Line(this.gridWidth*1, this.gridWidth*2, this.gridWidth*9, this.gridWidth*2),
      new Phaser.Geom.Line(this.gridWidth*1, this.gridWidth*3, this.gridWidth*9, this.gridWidth*3),
      new Phaser.Geom.Line(this.gridWidth*2, this.gridWidth*1, this.gridWidth*2, this.gridWidth*4),
      new Phaser.Geom.Line(this.gridWidth*2, this.gridWidth*1, this.gridWidth*2, this.gridWidth*4),
      new Phaser.Geom.Line(this.gridWidth*4, this.gridWidth*2, this.gridWidth*4, this.gridWidth*3),
      new Phaser.Geom.Line(this.gridWidth*6, this.gridWidth*1, this.gridWidth*6, this.gridWidth*4),
      new Phaser.Geom.Line(this.gridWidth*7, this.gridWidth*1, this.gridWidth*7, this.gridWidth*4),
      new Phaser.Geom.Line(this.gridWidth*8, this.gridWidth*1, this.gridWidth*8, this.gridWidth*4),
    ]

    this.graphics = this.add.graphics({ lineStyle: { width: 7, color: 0xBBADA0 }, fillStyle: {color: 0xe0d2c5} });
    this.blackTurnIndicators = this.add.group()
    this.whiteTurnIndicators = this.add.group()

    
    this.blackTurnIndicators.add(this.add.rexRoundRectangle(this.gridWidth*5,this.gridWidth*2,this.gridWidth*2,this.gridWidth*2,16,this.getColor(this.unactivatedColor)).setDepth(-1));
    this.blackTurnIndicators.add(this.add.rexRoundRectangle(this.gridWidth*3,this.gridWidth*2,this.gridWidth*2,this.gridWidth*2,16,this.getColor(this.unactivatedColor)).setDepth(-1));

    this.whiteTurnIndicators.add(this.add.rexRoundRectangle(this.gridWidth*3,this.gridWidth*3,this.gridWidth*2,this.gridWidth*2,16,this.getColor(this.activatedColor)).setDepth(-1));
    this.whiteTurnIndicators.add(this.add.rexRoundRectangle(this.gridWidth*5,this.gridWidth*3,this.gridWidth*2,this.gridWidth*2,16,this.getColor(this.activatedColor)).setDepth(-1));

    this.graphics.fillStyle( 0xCDC0B4, 1);
    this.graphics.fillRoundedRect(this.gridWidth*1, this.gridWidth*1, this.gridWidth*2, this.gridWidth*3, 8);
    this.graphics.fillRoundedRect(this.gridWidth*5, this.gridWidth*1, this.gridWidth*4, this.gridWidth*3, 8);
    this.graphics.fillRect(this.gridWidth*3,this.gridWidth*2,this.gridWidth*2,this.gridWidth);
    this.graphics.fillStyle(0xBBADA0);

    this.graphics.strokeRoundedRect(this.gridWidth*1, this.gridWidth*1, this.gridWidth*2, this.gridWidth*3, 8);
    this.graphics.strokeRoundedRect(this.gridWidth*5, this.gridWidth*1, this.gridWidth*4, this.gridWidth*3, 8);
    // graphics.fillRect(48*3,this.gridWidth*2,48*2,this.gridWidth*1);

    for (let i = 0; i < this.lines.length; i++) {
      let line = this.lines[i];
      this.graphics.strokeLineShape(line);
    }
    // graphics.strokeCircle(this.gridWidth*2.5, this.gridWidth*1.5, this.gridWidth/2.5)

    //infor rectangles
    this.graphics.lineStyle(1, 0xC2C2C2)
    this.graphics.strokeRoundedRect(this.gridWidth*1,20,this.gridWidth*8,32,4)
    this.graphics.strokeRoundedRect(this.gridWidth*9,20,this.gridWidth*1,32,4)
    this.infoText = this.add.text(this.gridWidth*1+6+3,20+6,"", {fontSize: '20px', fill: '#666666'})
    if(this.gameMode === "LOCALPLAY") this.changeInfoText("White's turn", 0)

    this.add.image(this.gridWidth*2.5,this.gridWidth*1.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*2.5,this.gridWidth*3.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*5.5,this.gridWidth*2.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*8.5,this.gridWidth*3.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*8.5,this.gridWidth*1.5,'rosette').setScale(0.2);
  }

  addDiceAndPieces() {

    //initialising dice
    this.dice = this.add.group();
    let xDicePos = this.gridWidth*9.6
    let yDicePos = this.gridWidth*1.4
    let yDiceStep = this.gridWidth*1
    this.dice.create(xDicePos,yDicePos + yDiceStep*0,'dice').setScale(0.4);
    this.dice.create(xDicePos,yDicePos + yDiceStep*1,'dice').setScale(0.4);
    this.dice.create(xDicePos,yDicePos + yDiceStep*2,'dice').setScale(0.4);
    this.dice.create(xDicePos,yDicePos + yDiceStep*3,'dice').setScale(0.4);


    //initialising pieces
    this.whitePieces = this.add.group();
    this.blackPieces = this.add.group();
    for (let i = 0; i < this.starCoords.length; i++) {
      let coord = this.starCoords[i].slice();
      this.whitePieces.create(coord[0] + 4*this.gridWidth,coord[1] + 3*this.gridWidth, "white_token");
      this.blackPieces.create(coord[0] + 4*this.gridWidth,coord[1] + 1*this.gridWidth, "black_token");
    }

    this.whitePieces.getChildren().forEach( s => s.setScale(0.05))
    this.blackPieces.getChildren().forEach( s => s.setScale(0.05))

    //putting pieces in starting positions
    this.piecesInPos[0]  = this.whitePieces.getChildren();
    this.piecesInPos[16] = this.blackPieces.getChildren();

    //used when hovering mouse over
    this.ghostPieceWhite = this.add.image(0,0,"white_token").setAlpha(0);
    this.ghostPieceBlack = this.add.image(0,0,"black_token").setAlpha(0);
    
  }

  changeInfoText(newText, duration = 300) {
    // console.log(this.infoText.text)
    var timeline = this.tweens.createTimeline();
    let _this = this
    timeline.add({
      targets: _this.infoText,
      alpha: 0,
      duration: duration,
      onComplete: ()=>{
        _this.infoText.text = newText
      }
    })
    timeline.add({
      targets: _this.infoText,
      alpha: 1,
      duration: duration,
      offset: duration,
    })
    timeline.play();
  } 

  onlineFunctions(_this) {
    _this.socket = io("/gameplay");
    //request to play with friend
    _this.socket.emit("requestRoomJoin", _this.roomKey)
    
     _this.socket.on("startingGame", function (turnNumber) {
      _this.turnNumber = turnNumber

      switch (turnNumber) {
        case 1: {
          _this.freezeGame = false; 
          _this.piecesInPos;
          _this.changeInfoText("Your turn")
          break
        }
        case 2: { //I shouldn't play, I was second in the room
          _this.switchTurn(0)
          _this.freezeGame = true; 
          _this.changeInfoText("Other player's turn")



          break;
        }
      }
    });

    _this.socket.on("newDiceRoll", function(diceValues, supposedToPlay){
      _this.diceRoll = diceValues.reduce((a,b) => a+b,0);
      _this.animateDice(_this, diceValues)
      
      console.log("new dice value: ", _this.diceRoll)

      if(_this.diceRoll == 0){
        //I am supposed to play, but will have to forefit since I can't move
        console.log("A zero was rolled by somone")
        if(supposedToPlay === _this.turnNumber) { 
          _this.changeInfoText("You rolled a zero")
          console.log("I was supposed to play, but can't")
          _this.freezeGame = true; // I will no longer play
          //like I played a pointless turn
          setTimeout(function() { 
            _this.socket.emit('playedTurn',  -1,-1, _this.turnNumber*-1 + 3); 
          }, 3000);  
        } else {
          _this.changeInfoText("Other player rolled a zero")
        }

        setTimeout(function() { 
          _this.changeInfoText("Other player's turn now")
          _this.switchTurn()
        }, 3000); 

      } else {
          if(_this.noValidMove("white_token") && supposedToPlay === _this.turnNumber) {
          console.log("I can't move and was supposed to play")
          _this.changeInfoText("You don't have a valid move")

          _this.freezeGame = true;
          setTimeout(function() { 
            _this.socket.emit('playedTurn',  -1,-1, _this.turnNumber*-1 + 3); 
            _this.changeInfoText("Other player plays now")
            _this.switchTurn()
          }, 3000); 
          } else if(_this.noValidMove("black_token") && supposedToPlay !== _this.turnNumber) {
            console.log("Other person was supposed to play but has no valid moves")
            _this.changeInfoText("Other person has no valid moves")

            setTimeout(function() { 
              _this.switchTurn()
            }, 3000); 
        }
      }
      

       
      
    })
    
    _this.socket.on("otherPlayerMoved", function (squareThatWasMoved,squareNowOccupied){
      console.log("other player moved: ", squareThatWasMoved, squareNowOccupied)
      _this.workOutMove(_this,null,true,squareThatWasMoved,true) //move the piece

      if( [4,8,14,22,20].includes(squareNowOccupied)){
        _this.freezeGame = true;
        console.log("keeping game frozen since other player moves again")
        _this.changeInfoText("Other player plays again")

      } else {
        _this.freezeGame = false;
        console.log("my turn now")
        _this.changeInfoText("Your turn")

      }
      
    })

    _this.socket.on('disconnect', function(playerId) {
      if (playerId !== _this.socket.id){
        _this.changeInfoText("Other player has disconnected")
        _this.freezeGame = true;
        console.log("other player has disconnected")  
      }
    })
  }

  noValidMove(tokenColor) {
    var listOfPositions;
    switch(tokenColor){
      case "white_token": {
        for (let i = 0; i < 16; i++) {
          // there is a white piece in pos i
          // there is a valid move 
          if(
            this.piecesInPos[i].length > 0 && 
            this.piecesInPos[i][this.piecesInPos[i].length -1].texture.key === "white_token" &&
            this.possibleMove(i,this.diceRoll,"white_token").length > 0
            ) {
              return false
            }
    
        }
    
        return true

        
      }
      case "black_token": {
        let blackPositions = [16,17,18,19,20,5,6,7,8,9,10,11,12,21,22,23]
        for(let index = 0; index < blackPositions.length; index ++ ) {
          // there is a white piece in pos i
          // there is a valid move 
          let i = blackPositions[index]
          if(
            this.piecesInPos[i].length > 0 && 
            this.piecesInPos[i][this.piecesInPos[i].length -1].texture.key === "black_token" &&
            this.possibleMove(i,this.diceRoll,"black_token").length > 0
            ) {
              return false
            }
    
        }
    
        return true
      } 
      default:
      {
        console.log("Something went wrong")
      }
    }
    
  }

  mouseActionFunctions(_this) {
    //action to take on pointer down
    _this.input.on('pointerdown', function (pointer){
      _this.ghostPieceWhite.setAlpha(0);
      _this.ghostPieceBlack.setAlpha(0);
      _this.workOutMove(_this, pointer, true);    
    });



    _this.input.on('pointerup', () => {
      _this.sys.canvas.style.cursor = "initial"
    })

    _this.hoveringOnPiece = -1
    _this.input.on('pointermove', function (pointer){
      let newHoveringOnPiece = _this.mouseXYtoBoardPos(pointer.x,pointer.y);
      if(newHoveringOnPiece != this.hoveringOnPiece){ //only when pointer moves onto a new area (new square, or off board)
        _this.sys.canvas.style.cursor = "initial"

        _this.ghostPieceWhite.setAlpha(0);
        _this.ghostPieceBlack.setAlpha(0);
        _this.hoveringOnPiece = newHoveringOnPiece

        _this.workOutMove(_this, pointer, false)
      }
    })
  }

  create(){

    this.cameras.main.setPosition(this.shiftX,this.shiftY)
    this.freezeGame = true;

    this.drawGraphics()
    this.addDiceAndPieces()

    let _this = this;
    
    //set up for reactions on mouse movement and clicks
    this.mouseActionFunctions(_this);
    
    //set up for server communication and game starting
    if(this.gameMode === "ONLINEPLAY" ) this.onlineFunctions(_this);

    if(this.gameMode === "LOCALPLAY"){
      //roll dice to start
      this.rollDice(_this)
      this.freezeGame = false;
    }

  }

  workOutMove(_this, pointer, takeAction, boardPos, forceMove = false) {
    if(boardPos === undefined){ //if it wasn't already defined,
      var boardPos = _this.mouseXYtoBoardPos(pointer.x, pointer.y);
    } 

    if(boardPos >= 0 && _this.piecesInPos[boardPos].length > 0 && (!_this.freezeGame || forceMove)){ // on board and on some piece
      
      const colorOfPiece = _this.piecesInPos[boardPos][_this.piecesInPos[boardPos].length -1].texture.key;
      
      var possiblePos = _this.possibleMove(boardPos, _this.diceRoll, colorOfPiece);
      
      if(colorOfPiece == _this.turnPiece && possiblePos.length > 0 ){ //there is a legal move
        _this.sys.canvas.style.cursor = "pointer"        
        
        const newPos = possiblePos[0]; //the legal move
        if(takeAction){
          
          if(boardPos ==  0) {_this.yetToStartWhites -= 1}
          if(boardPos == 16) {_this.yetToStartBlacks -= 1}

          //update our knowledge of where the piece is
          _this.piecesInPos[newPos].push(_this.piecesInPos[boardPos].pop());
        }

        //update the sprites position
        var newCoordinates;
        switch (newPos) { //special cases for when white or black are finishing
          case 15: { 
            newCoordinates = _this.starCoords[6-_this.finishedWhites].slice();
            newCoordinates[0] += 3*_this.gridWidth;
            newCoordinates[1] += 3*_this.gridWidth;
            if(takeAction) _this.finishedWhites++;
            break;
          }
          case 23: {
            newCoordinates = _this.starCoords[6-_this.finishedBlacks].slice();
            newCoordinates[0] += 3*_this.gridWidth;
            newCoordinates[1] += 1*_this.gridWidth;
            if(takeAction) _this.finishedBlacks++;
            break;
          }
          default: { //this is not a finishing move
            if(_this.piecesInPos[newPos].length > 1 && takeAction){ //we are removing a piece of a different color
              _this.removePiece(_this.piecesInPos[newPos].shift(), _this);
            } 
            newCoordinates = _this.boardPosToXY(newPos);
          }
        }

        if(takeAction){
          _this.tweens.add({
              targets: _this.piecesInPos[newPos][_this.piecesInPos[newPos].length-1],
              x: newCoordinates[0],
              y: newCoordinates[1],
              scaleX: ((newPos == 23 || newPos == 15) ? 0.05 :0.2),
              scaleY: ((newPos == 23 || newPos == 15) ? 0.05 :0.2),
              duration: 200,
              ease: 'Linear',
              onComplete: () => {
                if(_this.finishedBlacks == 7 || _this.finishedWhites == 7){
                  if(_this.freezeGame){
                    if(_this.gameMode === "ONLINEPLAY") _this.changeInfoText("You lost")
                    
                  } else {
                    if(_this.gameMode === "ONLINEPLAY") _this.changeInfoText("You won!")
                  }
                  if(_this.gameMode === "LOCALPLAY"){
                    if(_this.finishedBlacks > _this.finishedWhites) _this.changeInfoText("Black wins!")
                    else _this.changeInfoText("White wins!")
                  }
                  _this.finishGame(_this)
                } else{
                  if(_this.gameMode === "LOCALPLAY") _this.rollDice(_this)
                }
              }
          });
          
          //Change the turn
          if( ![4,8,14,22,20].includes(newPos)){
            _this.switchTurn();
            if(_this.gameMode === "ONLINEPLAY") {
              if(takeAction && !_this.freezeGame && _this.gameMode === "ONLINEPLAY" ){ //only say a someone moved if it was me.
                console.log("telling that I have played")
                _this.changeInfoText("Other player plays now")

                _this.socket.emit('playedTurn',  _this.mirrorMove(boardPos),newPos, _this.turnNumber*-1 + 3)
                _this.freezeGame = true;
              }

            }
            
          } else {
            if(takeAction && !_this.freezeGame && _this.gameMode === "ONLINEPLAY" ){ //only say a someone moved if it was me.
              console.log("telling that I have played, and should play again")
              _this.changeInfoText("You have another turn")

              _this.socket.emit('playedTurn',  _this.mirrorMove(boardPos),newPos, _this.turnNumber)
              // _this.freezeGame = false;
            }
            if(_this.gameMode === "LOCALPLAY"){
              // console.log("hello")
              if(_this.turnPiece === "white_token") _this.changeInfoText("White plays again")
              else _this.changeInfoText("Black plays again")
            }
          }

        } else {
          // console.log("adding ghost piece")
          switch (colorOfPiece) {
            case "white_token": {
              _this.ghostPieceWhite.x = newCoordinates[0]
              _this.ghostPieceWhite.y = newCoordinates[1]
              _this.ghostPieceWhite.setScale(((newPos == 15) ? 0.05 :0.2)).setAlpha(0.6)
              break;
            }
            case "black_token": {
              _this.ghostPieceBlack.x = newCoordinates[0]
              _this.ghostPieceBlack.y = newCoordinates[1]
              _this.ghostPieceBlack.setScale(((newPos == 23) ? 0.05 :0.2)).setAlpha(0.6)
              break;
            }
          }
        }



      } else {
        _this.sys.canvas.style.cursor = "not-allowed"
      }
    } else{ //we are not ( on board and on a piece)
      _this.sys.canvas.style.cursor = "initial"
    }
  }

  finishGame(_this) {
    _this.freezeGame = true;
    let buttons = _this.add.group()
    buttons.add(this.add.existing(new TextButton(this, 400-_this.shiftX, 280-_this.shiftY, "Play Again", ()=>{

      _this.scene.restart(this.gameMode)
 

    })).setAlpha(0))
    buttons.add(this.add.existing(new TextButton(this, 400-_this.shiftX, 340-_this.shiftY, "Menu", ()=>{
      _this.scene.start("MENU")
    
    })).setAlpha(0))
    _this.tweens.add({
      targets: buttons.getChildren(),
      duration: 2000,
      alpha: 1,
      ease: 'Quad.easeInOut'
    })
  }
  
  removePiece(pieceToRemove, _this) {
    var newCoords;
    switch (pieceToRemove.texture.key) {
      case "black_token": {
        this.piecesInPos[16].push(pieceToRemove);
        newCoords = this.starCoords[this.yetToStartBlacks].slice();
        this.yetToStartBlacks++;
        newCoords[0] += 4*this.gridWidth;
        newCoords[1] += 1*this.gridWidth;
        break
      }
      case "white_token": {
        this.piecesInPos[0].push(pieceToRemove);
        newCoords = this.starCoords[this.yetToStartWhites].slice();
        this.yetToStartWhites++;
        newCoords[0] += 4*this.gridWidth;
        newCoords[1] += 3*this.gridWidth;
        break
      }
    }
    // console.log("going to ", newCoords)
    _this.tweens.add({
    targets: pieceToRemove,
        x: newCoords[0],
        y: newCoords[1],
        scaleX: 0.05,
        scaleY: 0.05,
        duration: 200,
        ease: 'Linear',
    });
  }
  
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
  
  mirrorMove(move) {
    if(move >= 5 && move <= 12) return move
    let mirroredMoves = {
      4: 20,
      3: 19,
      2: 18,
      1: 17,
      0: 16,
      15: 23,
      14: 22,
      13: 21,
      20: 4,
      19: 3,
      18: 2,
      17: 1,
      16: 0,
      23: 15,
      22: 14,
      21: 13,
    } 
    return mirroredMoves[move]
  }
  
  animateDice(_this, diceValues) {
    let diceTimeline = this.tweens.createTimeline();
    const diceRollTime = 200;
    let i = 0
    this.dice.getChildren().forEach(diceSprite => {
      diceTimeline.add({
        targets: diceSprite,
        rotation: Phaser.Math.Between(-5,5)*1/3*Math.PI,
        duration: diceRollTime,
        ease: 'Linear',
        offset: -diceRollTime,
        // onComplete: function() {diceText.setText(diceRoll)} //this is called 4 times BAD
      });
      diceSprite.setFrame(diceValues[i]*-1 + 1);
      i++
    });
    diceTimeline.play()
  }

  rollDice(_this) { //only run for local plays
    var diceValues = [ Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),];
 
    this.diceRoll = diceValues.reduce((a,b) => a+b,0);
  
    this.animateDice(_this,diceValues)
    
    // console.log("dice roll: ", this.diceRoll)
  
    if(this.diceRoll == 0){
      console.log("ROLLED A ZERO")
      if(_this.turnPiece === "white_token") _this.changeInfoText("White rolled a zero")
      else _this.changeInfoText("Black rolled a zero")

      _this.time.delayedCall(3000, function() {
        // console.log("RE ROLLING");
        _this.switchTurn();
        _this.rollDice(_this)
      }, [], _this);
    } else if(this.noValidMove(this.turnPiece)){
      if(this.turnPiece === "white_token") this.changeInfoText("White has no valid moves")
      else this.changeInfoText("Black has no valid moves")
      setTimeout(function() { 
        _this.switchTurn()
      }, 3000); 
    }

  }

  tweenColor(shapeToTween, startColor, endColor, duration) {

    let c1 = Phaser.Display.Color.HexStringToColor(startColor); // From no tint
    let c2 = Phaser.Display.Color.HexStringToColor(endColor); // To RED

    this.tweenStep = 0;
    
    this.tweens.add({
        targets: this,
        tweenStep: 100, //tweenStep is the variable that we make just before, and it belongs to "this", so we target "this"
        onUpdate: ()=>{
          let col = Phaser.Display.Color.Interpolate.ColorWithColor(c1, c2, 100, this.tweenStep);
          let colourInt = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
          // console.log(this.tweenStep)
          shapeToTween.setFillStyle(colourInt, 1);
        },
        duration: duration,
    })
      


  };
  
  switchTurn(duration = 300) {
    var toActivate;
    var toDisactivate
    switch (this.turnPiece) {
      case "white_token": {
        if(this.gameMode === "LOCALPLAY") this.changeInfoText("Black's turn")
        this.turnPiece = "black_token"; 
        toActivate = this.blackTurnIndicators;
        toDisactivate = this.whiteTurnIndicators;
        break}
      case "black_token": {
        if(this.gameMode === "LOCALPLAY") this.changeInfoText("White's turn")

        this.turnPiece = "white_token"; 
        toActivate = this.whiteTurnIndicators;
        toDisactivate = this.blackTurnIndicators;
        break}
    }

    // console.log(this.unactivatedColor)  
    toActivate.getChildren().forEach(r=>{
      this.tweenColor(r,this.unactivatedColor,this.activatedColor,duration)
    })
    toDisactivate.getChildren().forEach(r=>{
      this.tweenColor(r,this.activatedColor,this.unactivatedColor,duration)
    })


    // dice.getChildren().forEach( d => d.startFollow({
    //   positionOnPath: true,
    //   duration: 1000,
    //   yoyo: false,
    //   repeat: -1,
    //   onComplete: function() {console.log("finished")},
    //   rotateToPath: true,
    //   verticalAdjust: true,
    // })
    //)
  
    // turnText.setText("turn: " + turnPiece)
  }
  
  possibleMove(bPos, diceRoll, colorOfToken) {
    var newPossPos = bPos;
  
    for (let i = 0; i < diceRoll; i++) {
      newPossPos = this.nextPosition(newPossPos,colorOfToken);
      if (newPossPos == -1) return [];
      // console.log(newPossPos, i)
    }
    // console.log(`looking at position ${newPossPos}`, diceRoll);
    // console.log(`number of pieces in poss pos: ${piecesInPos[newPossPos].length }`)
    if (this.piecesInPos[newPossPos].length==0 || newPossPos == 15 || newPossPos == 23 || (this.piecesInPos[newPossPos][0].texture.key != colorOfToken && newPossPos != 8)) { // if we have found a new possible position
      return [newPossPos];
      
    }
    return []
  }
  
  nextPosition(bPos, color) {
    if(bPos == 20) return 5;
    if(bPos == 12 && color=="black_token") return 21;
    if(bPos == 15 || bPos == 23) return -1;
    return bPos+1;
  }
  
  mouseXYtoBoardPos(pointx,pointy) {
    let x = Math.floor(((pointx-this.shiftX)-this.gridWidth)/this.gridWidth);
    let y = Math.floor(((pointy-this.shiftY)-this.gridWidth)/this.gridWidth);
  
    // console.log(boardPositionsAndIndexes[y][x]);
    if(0 <= x && x < 8 && 0 <= y && y < 3) {
      // console.log(boardPositionsAndIndexes[y][x]);
      return this.boardPositionsAndIndexes[y][x];
    } else{
      // console.log("clicked off board"); 
      return -1;
    }
  }
  
  boardPosToXY(bPos) {
    let y = this.boardPositionsAndIndexes.findIndex( as => {return as.some( a => {return a == bPos}) });
    let x = this.boardPositionsAndIndexes[y].findIndex( a => {return a == bPos});
  
    return [(x+1.5)*this.gridWidth ,(y+1.5)*this.gridWidth];
  }

  update() {
    
  }
}
