import {CST} from "../CST.js";
export class GameScene extends Phaser.Scene{
  constructor() {
    super({
      key: CST.SCENES.GAME
    })

    this.boardPositionsAndIndexes = [ [21,22,23,16,17,18,19,20],
    [12, 11, 10, 9, 8, 7, 6 ,5],
    [13, 14, 15, 0 ,1 ,2, 3, 4] ];
    //Geometry
    this.gridWidth = 60;

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

    this._this;
  }
  init() {

  }
  preload() {
    this.load.svg('black_token', 'assets/black_token.svg');
    this.load.svg('white_token', 'assets/white_token.svg');
    this.load.spritesheet('dice','assets/dice.png', {frameWidth: 100, frameHeight: 100});
    this.load.svg('rosette','assets/rosette2.svg');
  }
  create(){


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
    this.graphics.fillRoundedRect(this.gridWidth*4,this.gridWidth*1,this.gridWidth*1.5,this.gridWidth*1.5,16);
    this.graphics.fillRoundedRect(this.gridWidth*2.5,this.gridWidth*1,this.gridWidth*1.5,this.gridWidth*1.5,16);
    this.graphics.fillRoundedRect(this.gridWidth*2.5,this.gridWidth*2.5,this.gridWidth*1.5,this.gridWidth*1.5,16);
    this.graphics.fillRoundedRect(this.gridWidth*4,this.gridWidth*2.5,this.gridWidth*1.5,this.gridWidth*1.5,16);

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

    this.add.image(this.gridWidth*2.5,this.gridWidth*1.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*2.5,this.gridWidth*3.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*5.5,this.gridWidth*2.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*8.5,this.gridWidth*3.5,'rosette').setScale(0.2);
    this.add.image(this.gridWidth*8.5,this.gridWidth*1.5,'rosette').setScale(0.2);

    //initialising dice
    this.dice = this.add.group();
    this.dice.create(this.gridWidth*9.5,this.gridWidth*1.5,'dice').setScale(0.4);
    this.dice.create(this.gridWidth*9.5,this.gridWidth*2.5,'dice').setScale(0.4);
    this.dice.create(this.gridWidth*10.5,this.gridWidth*1.5,'dice').setScale(0.4);
    this.dice.create(this.gridWidth*10.5,this.gridWidth*2.5,'dice').setScale(0.4);
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
  

    this._this = this;
    let _this = this;
    console.log(this.ghostPieceWhite)
    this.ghostPieceWhite = this.add.image(0,0,"white_token").setAlpha(0);
    console.log(this.ghostPieceWhite)

    this.ghostPieceBlack = this.add.image(0,0,"black_token").setAlpha(0);
    
    //roll dice to start
    this.rollDice(_this)

    //action to take on pointer down
    this.input.on('pointerdown', function (pointer){ //eventually pointer over to see possible move
      _this.ghostPieceWhite.setAlpha(0);
      _this.ghostPieceBlack.setAlpha(0);
      workOutMove(pointer, true);    
    });

    this.hoveringOnPiece = -1
    this.input.on('pointermove', function (pointer){
      let newHoveringOnPiece = _this.mouseXYtoBoardPos(pointer.x,pointer.y);
      if(newHoveringOnPiece != this.hoveringOnPiece){ //only do this when pointer moves onto a new area of the board (new square, or off board)
        // console.log("removing")
        _this.ghostPieceWhite.setAlpha(0);
        _this.ghostPieceBlack.setAlpha(0);
        _this.hoveringOnPiece = newHoveringOnPiece

        // console.log("updating now")
        workOutMove(pointer, false)
      }
    })

    function workOutMove(pointer, takeAction) {
      var boardPos = _this.mouseXYtoBoardPos(pointer.x, pointer.y);

      if(boardPos >= 0 && _this.piecesInPos[boardPos].length > 0){ // on board and on some piece
        const colorOfPiece = _this.piecesInPos[boardPos][_this.piecesInPos[boardPos].length -1].texture.key;
        if(colorOfPiece != _this.turnPiece) return;
        // console.log("dice roll is", diceRoll);
        var possiblePos = _this.possibleMove(boardPos, _this.diceRoll, colorOfPiece);

        if(possiblePos.length > 0 ){ //there is a legal move
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
              newCoordinates = starCoords[6-finishedWhites].slice();
              newCoordinates[0] += 3*this.gridWidth;
              newCoordinates[1] += 3*this.gridWidth;
              if(takeAction) finishedWhites++;
              break;
            }
            case 23: {
              newCoordinates = starCoords[6-finishedBlacks].slice();
              newCoordinates[0] += 3*this.gridWidth;
              newCoordinates[1] += 1*this.gridWidth;
              if(takeAction) finishedBlacks++;
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
                onComplete: _this.rollDice(_this)
            });
            
            //Change the turn
            if( ![4,8,14,22,20].includes(newPos)){
              _this.switchTurn();
            }
          } else {
            console.log("adding ghost piece")
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
            
            return true;

          }
        }
      } else{ //we are not ( on board and on a piece)
        return false 
      }
    }
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
  
  
  
  
  rollDice(_this) {
    // rollAnim = _this.anims.create({
    //   key: 'roll',
    //   frames: _this.anims.generateFrameNumbers('dice'),
    //   frameRate: 20,
    //   duration: 200,
    // })
  
    
  
    let diceValues = [ Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),];
    let diceRoll = diceValues.reduce((a,b) => a+b,0);
  
  
    let diceTimeline = _this.tweens.createTimeline();
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
      diceSprite.setFrame(diceValues[i]);
      i++
    });
  
  
    diceTimeline.play()
    console.log("dice roll: ", diceRoll)
  
    if(diceRoll == 0){
      console.log("ROLLED A ZERO")
      _this.time.delayedCall(1000, function() {
        console.log("RE ROLLING");
        _this.switchTurn();
        _this.rollDice(_this)
      }, [], _this);
    }
  }
  
  switchTurn() {
    switch (this.turnPiece) {
      case "white_token": {this.turnPiece = "black_token"; break}
      case "black_token": {this.turnPiece = "white_token"; break}
    }
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
    }
    // console.log(`looking at position ${newPossPos}`);
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
    let x = Math.floor((pointx-this.gridWidth)/this.gridWidth);
    let y = Math.floor((pointy-this.gridWidth)/this.gridWidth);
  
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
  
    return [(x+1.5)*this.gridWidth,(y+1.5)*this.gridWidth];
  }
}
