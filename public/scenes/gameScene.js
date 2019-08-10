import {TextButton} from "./textbutton.js";

export class GameScene extends Phaser.Scene{
  constructor() {
    super({
      key: "GAME",
    })

  }
  init(gameMode) {
    console.log("GAME IS HERE, with game mode: ", gameMode)
    this.roomKey = gameMode[1]

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
    this.diceRoll = 1;
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

    this.socket;
    this.turnNumber;
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

    // this.blackTurnIndicators.add(this.add.rexRoundRectangle(10,10,100,100,0x000).setDepth(2))

    // this.blackTurnIndicators.getChildren().forEach( r => {
    //   r.fillStyle(0x000, 0)
    // })

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
    // this.graphics.lineStyle(1, 0xC2C2C2)
    // this.graphics.strokeRoundedRect(this.gridWidth*1.1,20,this.gridWidth*1.8,16,2)
    // this.graphics.strokeRoundedRect(this.gridWidth*3.1,20,this.gridWidth*1.8,16,2)
    // this.infoText = this.add.text(this.gridWidth*2.5+3,20+3,"White's turn", {fontSize: '10px', fill: '#666666'})

    this.add.image(this.gridWidth*2.5,this.gridWidth*1.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*2.5,this.gridWidth*3.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*5.5,this.gridWidth*2.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*8.5,this.gridWidth*3.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*8.5,this.gridWidth*1.5,'rosette').setScale(0.2);
  }

  addDiceAndPieces() {

    //initialising dice
    this.dice = this.add.group();
    this.dice.create(this.gridWidth*9.5,this.gridWidth*1,'dice').setScale(0.4);
    this.dice.create(this.gridWidth*9.5,this.gridWidth*2,'dice').setScale(0.4);
    this.dice.create(this.gridWidth*9.5,this.gridWidth*3,'dice').setScale(0.4);
    this.dice.create(this.gridWidth*9.5,this.gridWidth*4,'dice').setScale(0.4);
    // diceText = this.add.text(12,this.gridWidth*4 ,diceRoll, { fontSize: '32px', fill: '#000' });

    // dicePath1 = new Phaser.Curves.Path(24+48,24);
    // dicePath1.quadraticBezierTo(48*0.5,48*1.5,48*0.5,48*0.5,);
    // dicePath1.lineTo(24,48*2.5);
    // dice.add( this.add.follower(dicePath1, 0, 0,'dice').setScale(0.4));
    // // dicePath1.draw(graphics);

    // dicePath2 = new Phaser.Curves.Path(24,24);
    // dicePath2.lineTo(24,48*3.5);
    // dice.add( this.add.follower(dicePath2, 0, 0,'dice').setScale(0.4));

    // dicePath3 = new Phaser.Curves.Path(24,24+48);
    // dicePath3.lineTo(24,48*4.5);
    // dice.add( this.add.follower(dicePath3, 0, 0,'dice').setScale(0.4));

    // dicePath4 = new Phaser.Curves.Path(24,24+48*2);
    // dicePath4.lineTo(24,48*3.5)
    // dicePath4.quadraticBezierTo(48*1.5,48*4.5,48*0.5,48*4.5,);
    // dice.add( this.add.follower(dicePath4, 0, 0,'dice').setScale(0.4));
    // dicePath4.draw(graphics);

    //initialising text
    // turnText = this.add.text(this.gridWidth, 300, `turn: ${turnPiece}`, { fontSize: '32px', fill: '#000' });

    //initilising title text
    // const titleText = this.add.text(this.gridWidth, 20, `Royal Game of Ur`, {fontSize: '40px', fill: '#000'})

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

    this.piecesInPos[0]  = this.whitePieces.getChildren();
    this.piecesInPos[16] = this.blackPieces.getChildren();

    this.ghostPieceWhite = this.add.image(0,0,"white_token").setAlpha(0);

    this.ghostPieceBlack = this.add.image(0,0,"black_token").setAlpha(0);
    
  }

  create(){


    this.cameras.main.setPosition(this.shiftX,this.shiftY)
    this.freezeGame = true;


    this.drawGraphics()
    this.addDiceAndPieces()

    let _this = this;
    this.socket = io("/gameplay");
     //request to play with friend
    console.log("joining room: " , this.socket.emit("requestRoomJoin", this.roomKey, ()=>{console.log("callback says I joined successfully")}))

    // this.socket.on("newPlayer", function (newPlayer) {
    //   console.log("new player incoming: ", newPlayer.id, _this.socket.id)
    //   if (newPlayer.id === _this.socket.id) {
    //     _this.turnNumber = newPlayer.number
    //     console.log("my player id is: ", newPlayer.id)
    //     console.log("my number is ", newPlayer.number)
    //   }
    // });

    this.socket.on("startingGame", function (turnNumber) {
      console.log("starting game as player: ", turnNumber)
      _this.turnNumber = turnNumber //for later global reference
      if(turnNumber == 1) {//I shouldn't play
        _this.switchTurn()
        _this.freezeGame = true; 
      } else{
        console.log("I have unfrozen game")
        _this.freezeGame = false; 
      }
    });

    this.socket.on('disconnect', function(playerId) {
      if (playerId !== _this.socket.id){
        console.log("other player has disconnected")  
      }
    })

    this.socket.on("newDiceRoll", function(diceValues){
      console.log("received new dice vlaues: ", diceValues)
      _this.diceRoll = diceValues.reduce((a,b) => a+b,1);
      _this.rollDice(_this, diceValues)
    })

    this.socket.on("playerMoved", function (moveData){
      workOutMove(null,true,moveData[0],true) //move the piece
      // _this.freezeGame = false; // I can now play

      console.log("opposition moved to: ", moveData[1], [4,8,14,22,20].includes(moveData[1]))      
      if( [4,8,14,22,20].includes(moveData[1])){
        _this.freezeGame = true;
        console.log("keeping game frozen since other player moves again")
      } else {
        _this.freezeGame = false;
        console.log("my turn now")
      }

      // console.log("unfrozen because other person played")
      // console.log("someone played thisturn: ", moveData[1])
      // console.log("was it me: ", moveData[0] ,  _this.socket.id )
      // console.log("board pos; ", moveData[1])
    })

    
    //roll dice to start
    // this.rollDice(_this)

    //action to take on pointer down
    this.input.on('pointerdown', function (pointer){
      _this.ghostPieceWhite.setAlpha(0);
      _this.ghostPieceBlack.setAlpha(0);
      workOutMove(pointer, true);    
    });

    

    this.input.on('pointerup', () => {
      _this.sys.canvas.style.cursor = "initial"
    })

    this.hoveringOnPiece = -1
    this.input.on('pointermove', function (pointer){
      let newHoveringOnPiece = _this.mouseXYtoBoardPos(pointer.x,pointer.y);
      if(newHoveringOnPiece != this.hoveringOnPiece){ //only when pointer moves onto a new area (new square, or off board)
        _this.sys.canvas.style.cursor = "initial"

        _this.ghostPieceWhite.setAlpha(0);
        _this.ghostPieceBlack.setAlpha(0);
        _this.hoveringOnPiece = newHoveringOnPiece

        workOutMove(pointer, false)
      }
    })

    function workOutMove(pointer, takeAction, boardPos, forceMove = false) {
      if(boardPos === undefined){ //if it wasn't already defined,
        var boardPos = _this.mouseXYtoBoardPos(pointer.x, pointer.y);
      } else{
        console.log("given was: ", boardPos)
      }

        
      if(boardPos >= 0 && _this.piecesInPos[boardPos].length > 0 && (!_this.freezeGame || forceMove)){ // on board and on some piece
        
        const colorOfPiece = _this.piecesInPos[boardPos][_this.piecesInPos[boardPos].length -1].texture.key;

        var possiblePos = _this.possibleMove(boardPos, _this.diceRoll, colorOfPiece);
        
        if(colorOfPiece == _this.turnPiece && possiblePos.length > 0 ){ //there is a legal move
          _this.sys.canvas.style.cursor = "pointer"
          
          const newPos = possiblePos[0]; //the legal move
          if(takeAction){
            if(!_this.freezeGame){ //only say a someone moved if it was me.
              console.log("telling that I have played")
              _this.socket.emit('playedTurn',  [_this.mirrorMove(boardPos),newPos])
            }
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
                  if(_this.finishedBlacks == 1 || _this.finishedWhites == 1){
                    _this.finishGame(_this)
                  } else{
                    // _this.rollDice(_this)
                  }
                }
            });
            
            //Change the turn
            if( ![4,8,14,22,20].includes(newPos)){
              _this.switchTurn();
              _this.freezeGame = true;
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
  }

  finishGame(_this) {
    _this.freezeGame = true;
    let buttons = _this.add.group()
    buttons.add(this.add.existing(new TextButton(this, 400-_this.shiftX, 280-_this.shiftY, "Play Again", ()=>{

      _this.scene.restart("GAME")
 

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

  rollDice(_this, diceValues) {
    
    if (diceValues === undefined){
      var diceValues = [ Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),];
    }
    
    this.diceRoll = diceValues.reduce((a,b) => a+b,0);
  
    this.animateDice(_this,diceValues)
    
    // console.log("dice roll: ", this.diceRoll)
  
    // if(this.diceRoll == 0){
    //   // console.log("ROLLED A ZERO")
    //   _this.time.delayedCall(1000, function() {
    //     // console.log("RE ROLLING");
    //     _this.switchTurn();
    //     _this.rollDice(_this)
    //   }, [], _this);
    // }
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
  
  switchTurn() {
    var toActivate;
    var toDisactivate
    switch (this.turnPiece) {
      case "white_token": {
        this.turnPiece = "black_token"; 
        toActivate = this.blackTurnIndicators;
        toDisactivate = this.whiteTurnIndicators;
        break}
      case "black_token": {
        this.turnPiece = "white_token"; 
        toActivate = this.whiteTurnIndicators;
        toDisactivate = this.blackTurnIndicators;
        break}
    }

    // console.log(this.unactivatedColor)  
    toActivate.getChildren().forEach(r=>{
      this.tweenColor(r,this.unactivatedColor,this.activatedColor,300)
    })
    toDisactivate.getChildren().forEach(r=>{
      this.tweenColor(r,this.activatedColor,this.unactivatedColor,300)
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
    let i = 0;
    let c1 = Phaser.Display.Color.HexStringToColor('#ffffff'); // From no tint
    let c2 = Phaser.Display.Color.HexStringToColor('#ff0000'); // To RED
    let col = Phaser.Display.Color.Interpolate.ColorWithColor(c1, c2, 100, i);
    // console.log(col, i)
  }
}
