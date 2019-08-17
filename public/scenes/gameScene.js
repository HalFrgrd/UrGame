import {TextButton} from "./textbutton.js";
import {GameModel} from "./gameModel.js"

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

    console.log(this.starCoords)


    this.diceRoll;
    this.diceText;
    this.dice;
    this.dicePath;
    this.rollAnim;
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


    this.urGame;

    this.diceIndex = 0;
    this.diceRollsForStuck = [4,4,1,4,4,1,1,1]

  }
  preload() {
    this.load.svg('black_piece', 'assets/black_token.svg');
    this.load.svg('white_piece', 'assets/white_token.svg');
    this.load.spritesheet('dice','assets/dice.png', {frameWidth: 100, frameHeight: 100});
    this.load.svg('rosette','assets/rosette2.svg');

    this.load.plugin('rexroundrectangleplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/plugins/dist/rexroundrectangleplugin.min.js', true);      
    
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
      this.whitePieces.create(coord[0] + 4*this.gridWidth,coord[1] + 3*this.gridWidth, "white_piece");
      this.blackPieces.create(coord[0] + 4*this.gridWidth,coord[1] + 1*this.gridWidth, "black_piece");
    }

    this.whitePieces.getChildren().forEach( s => s.setScale(0.05))
    this.blackPieces.getChildren().forEach( s => s.setScale(0.05))


    //used when hovering mouse over
    this.ghostPieceWhite = this.add.image(0,0,"white_piece").setAlpha(0);
    this.ghostPieceBlack = this.add.image(0,0,"black_piece").setAlpha(0);
    
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

  onlineFunctions() {
    var _this = this
    this.socket = io("/gameplay");

    //request to play with friend
    this.socket.emit("requestRoomJoin", _this.roomKey)
    
    this.socket.on("startingGame", function (turnNumber) {

      console.log("staring up game")
      _this.turnNumber = turnNumber
      switch (turnNumber) {
        case 1: {
          _this.changeInfoText("Your turn")
          break
        }
        case 2: { //I shouldn't play, I was second in the room
          _this.changeInfoText("Other player's turn")
          break;
        }
      }
      _this.initaliseGameModel()
      _this.urGame.beginGame()
      //set up for reactions on mouse movement and clicks
      _this.mouseActionFunctions();
    });

    this.socket.on("newDiceRoll", function(diceValues){
      console.log("received new dice: ", diceValues)
      _this.urGame.setDice(diceValues)

      
    })
    
    this.socket.on("otherPlayerMoved", function (squareThatWasMoved){
      console.log("other player moved: ", squareThatWasMoved)
      _this.urGame.workOutMove(squareThatWasMoved, "black" ,true) //move the piece
      
    })

    this.socket.on('disconnect', function(playerId) {
      if (playerId !== _this.socket.id){
        _this.changeInfoText("Other player has disconnected")
        
        console.log("other player has disconnected")  
      } else {
        _this.changeInfoText("Lost connection")
        console.log("Lost connection")
      }
      _this.urGame.acceptInput = false;
    })
  }

  mouseActionFunctions() {
    var _this = this

    //action to take on pointer down
    this.input.on('pointerdown', function (pointer){
      
      _this.ghostPieceWhite.setAlpha(0);
      _this.ghostPieceBlack.setAlpha(0);
      let whoPlayed = (_this.gameMode == "ONLINEPLAY" ) ? "white" : "UNSURE"
      let boardPos = _this.mouseXYtoBoardPos(pointer.x, pointer.y)
      // console.log("who played mouse: ", whoPlayed)

      _this.urGame.workOutMove( boardPos , whoPlayed, true )  
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

        
        let whoPlayed = (_this.gameMode == "ONLINEPLAY" ) ? "white" : "UNSURE"
        // console.log("who played mouse: ", whoPlayed)
        let boardPos = _this.mouseXYtoBoardPos(pointer.x, pointer.y)

        _this.urGame.workOutMove( boardPos , whoPlayed, false )  
      }
    })
  }

  movePiecesFromChanges(changes) {
    changes.forEach(change => {

      //update the sprite's position
      var newCoordinates;
      var indexOffset = (change['type'] == 'permanent_change')? 1: 0
      switch (change['to']) { //special cases for when white or black are finishing or returning home
        case 15: {
          newCoordinates = this.starCoords[6-this.urGame.finishedPieces("white") +indexOffset].slice();
          newCoordinates[0] += 3*this.gridWidth;
          newCoordinates[1] += 3*this.gridWidth;
          break;
        }
        case 23: {
          newCoordinates = this.starCoords[6-this.urGame.finishedPieces("black")+indexOffset].slice();
          newCoordinates[0] += 3*this.gridWidth;
          newCoordinates[1] += 1*this.gridWidth;
          break;
        }
        case 0: {
          newCoordinates = this.starCoords[this.urGame.yetToStartPieces("white") - indexOffset].slice();
          newCoordinates[0] += 4*this.gridWidth;
          newCoordinates[1] += 3*this.gridWidth;
          break
        }
        case 16 :{
          newCoordinates = this.starCoords[this.urGame.yetToStartPieces("black") - indexOffset].slice();
          newCoordinates[0] += 4*this.gridWidth;
          newCoordinates[1] += 1*this.gridWidth;
          break
        }
        default: { //this is not a finishing move
          newCoordinates = this.boardPosToXY(change['to']);
        }
      }

      switch (change['type']) {
        case "permanent_change": {
          // console.log([0,15,16,23].includeinclude[ change['to'] ], change['to'])
          this.tweens.add({
            targets: change['object'],
            x: newCoordinates[0],
            y: newCoordinates[1],
            scaleX: (([0,15,16,23].includes( change['to'] )) ? 0.05 :0.2),
            scaleY: (([0,15,16,23].includes( change['to'] )) ? 0.05 :0.2),
            duration: 200,
            ease: 'Linear',
          });
          break;
        }
        case "temporary_change": {
          switch (change['object'].texture.key) {
            case "white_piece": {
              this.ghostPieceWhite.x = newCoordinates[0]
              this.ghostPieceWhite.y = newCoordinates[1]
              this.ghostPieceWhite.setScale((([0,15].includes(change['to']) ) ? 0.05 :0.2)).setAlpha(0.6)
              break;
            }
            case "black_piece": {
              this.ghostPieceBlack.x = newCoordinates[0]
              this.ghostPieceBlack.y = newCoordinates[1]
              this.ghostPieceBlack.setScale((([16,23].includes(change['to'])) ? 0.05 :0.2)).setAlpha(0.6)
              break;
            }
          }
          break;
        }
      }
        


    })
  }

  sendMoveToServer(boardPos){
    console.log("sending to server")
    this.socket.emit("playedTurn", this.mirrorMove(boardPos))
  }

  onTurnFinish(){
    console.log("finishing turn, saying read for new dice")
    this.socket.emit("readyForDice")
  }

  initaliseGameModel(){
    switch (this.gameMode){
      case "LOCALPLAY": {
        this.urGame = new GameModel(
          this.switchTurn.bind(this),
          ()=>{},
          this.movePiecesFromChanges.bind(this),
          ()=>{},
          this.animateDice.bind(this),
          this.rolledZeroUpdate.bind(this),
          this.noValidMovesUpdate.bind(this),
          this.finishGame.bind(this),
          this.whitePieces.getChildren(),
          this.blackPieces.getChildren(),
          true,
          'white'
          )
        break;
      }
      case "ONLINEPLAY": {
        console.log("trying to initialise as: ", (this.turnNumber == 1) ? "white" : "black")
        this.urGame = new GameModel(
          this.switchTurn.bind(this),
          this.onTurnFinish.bind(this),
          this.movePiecesFromChanges.bind(this),
          this.sendMoveToServer.bind(this),
          this.animateDice.bind(this),
          this.rolledZeroUpdate.bind(this),
          this.noValidMovesUpdate.bind(this),
          this.finishGame.bind(this),
          this.whitePieces.getChildren(),
          this.blackPieces.getChildren(),
          false,
          (this.turnNumber == 1) ? "white" : "black"
          )
          break;
      }
    }
  }

  create(){

    this.cameras.main.setPosition(this.shiftX,this.shiftY)
    
    //Add graphics and sprites
    this.drawGraphics()
    this.addDiceAndPieces()

    
    

    //set up for server communication and game starting
    if(this.gameMode === "ONLINEPLAY" ){
      this.onlineFunctions();
    } 

    if(this.gameMode === "LOCALPLAY"){
      this.initaliseGameModel();

      this.urGame.beginGame();

      //set up for reactions on mouse movement and clicks
      this.mouseActionFunctions();
    }

    

    

  }



  finishGame() {

    if(this.gameMode == "ONLINEPLAY"){
      if(this.urGame.currentPlayer == "white") this.changeInfoText("You won!")
      else this.changeInfoText("You lost")
    }

    if(this.gameMode == "LOCALPLAY"){
      if(this.urGame.currentPlayer == "white") this.changeInfoText("White won!")
      else this.changeInfoText("Black won!")
    }

    let buttons = this.add.group()
    buttons.add(this.add.existing(new TextButton(this, 400-this.shiftX, 280-this.shiftY, "Play Again", ()=>{

      this.socket.disconnect()
      this.scene.restart([this.gameMode,this.roomKey])
 

    })).setAlpha(0))
    buttons.add(this.add.existing(new TextButton(this, 400-this.shiftX, 340-this.shiftY, "Menu", ()=>{
      this.scene.start("MENU")
    
    })).setAlpha(0))
    this.tweens.add({
      targets: buttons.getChildren(),
      duration: 2000,
      alpha: 1,
      ease: 'Quad.easeInOut'
    })
  }
  
  mirrorMove(move) {
    if (move == -1) return -1
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
  
  animateDice( diceValues) {
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

  rolledZeroUpdate(){
    if(this.gameMode == "ONLINEPLAY") {
      if(this.urGame.currentPlayer === "white") {
        this.changeInfoText("You rolled a zero")
      }
      else this.changeInfoText("Other player rolled a zero")
    }
    if(this.gameMode == "LOCALPLAY"){
      if(this.urGame.currentPlayer === "white") this.changeInfoText("White rolled a zero")
      else this.changeInfoText("Black rolled a zero")
    }
    
  }

  noValidMovesUpdate() {

    if(this.gameMode == "ONLINEPLAY") {
      if(this.urGame.currentPlayer === "white") {
        this.changeInfoText("You have no valid moves")
      }
      else this.changeInfoText("Other player has no valid moves")
    }

    if(this.gameMode == "LOCALPLAY"){
      if(this.urGame.currentPlayer === "white") this.changeInfoText("White has no valid moves")
      else this.changeInfoText("Black has no valid moves")
    }
    
  }

  switchTurn(duration = 300) {
    console.log("Switching turns")
    var toActivate;
    var toDisactivate
    switch (this.urGame.currentPlayer ) {
      case "white": {
        console.log("Switching from white to blakc")
        if(this.gameMode === "LOCALPLAY") this.changeInfoText("Black's turn")
        if(this.gameMode === "ONLINEPLAY") this.changeInfoText("Other player's turn")
        toActivate = this.blackTurnIndicators;
        toDisactivate = this.whiteTurnIndicators;
        break}
      case "black": {
        console.log("Switching from black to white")
        if(this.gameMode === "LOCALPLAY") this.changeInfoText("White's turn")
        if(this.gameMode === "ONLINEPLAY") this.changeInfoText("Your turn")
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

  }

  getColor(colString) {
    let fillColor1 = Phaser.Display.Color.HexStringToColor(colString);
    return Phaser.Display.Color.GetColor(fillColor1.r, fillColor1.g, fillColor1.b)
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
