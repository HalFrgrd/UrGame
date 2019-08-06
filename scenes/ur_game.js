



var config = {
    type: Phaser.AUTO,
    parent: 'game', //reference to index.html div
    width: 800,
    heigth: 600,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#FAF8EF',

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

//Geometry
var boardPolygon1;
var boardPolygon2;
var lines;
var rosettes;

const gridWidth = 60;

const hexWidth = gridWidth/2-10;
var starCoords = [];
var coordx = 0;
var coordy = hexWidth;
for (let i = 0; i < 6; i++) {
  starCoords[i] = [coordx, coordy].slice()
  const tempX = coordx
  coordx = coordx*0.5 - coordy*Math.sqrt(3)*0.5
  coordy = tempX*Math.sqrt(3)*0.5 + coordy*0.5
}
starCoords[6] = [0,0]
starCoords = starCoords.map( c =>  [c[0] + gridWidth/2, c[1] + gridWidth/2]);



var piecesInPos = Array(24); // piecesInPos[i] contains the piece(s) that are in position i in the board diagram.
for (let i = 0; i < piecesInPos.length; i++) { piecesInPos[i] = []; }
var finishedWhites = 0; //number of pieces that white has finished;
var finishedBlacks = 0;
var yetToStartWhites = 7;
var yetToStartBlacks = 7;
var diceRoll = 1;
var diceText;
var dice;
var dicePath;
var rollAnim;
var turnPiece = "white_token";
var turnText;
var ghostPieceWhite;
var ghostPieceBlack;
var hoveringOnPiece;

function preload ()
{
  this.load.svg('black_token', 'assets/black_token.svg');
  this.load.svg('white_token', 'assets/white_token.svg');
  this.load.spritesheet('dice','assets/dice.png', {frameWidth: 100, frameHeight: 100});
  this.load.svg('rosette','assets/rosette2.svg');


}

function create ()
{

  var circle = new Phaser.Geom.Circle(400,300,100);


  lines = [
    new Phaser.Geom.Line(gridWidth*1, gridWidth*2, gridWidth*9, gridWidth*2),
    new Phaser.Geom.Line(gridWidth*1, gridWidth*3, gridWidth*9, gridWidth*3),
    new Phaser.Geom.Line(gridWidth*2, gridWidth*1, gridWidth*2, gridWidth*4),
    new Phaser.Geom.Line(gridWidth*2, gridWidth*1, gridWidth*2, gridWidth*4),
    new Phaser.Geom.Line(gridWidth*4, gridWidth*2, gridWidth*4, gridWidth*3),
    new Phaser.Geom.Line(gridWidth*6, gridWidth*1, gridWidth*6, gridWidth*4),
    new Phaser.Geom.Line(gridWidth*7, gridWidth*1, gridWidth*7, gridWidth*4),
    new Phaser.Geom.Line(gridWidth*8, gridWidth*1, gridWidth*8, gridWidth*4),
  ]

  graphics = this.add.graphics({ lineStyle: { width: 7, color: 0xBBADA0 }, fillStyle: {color: 0xe0d2c5} });
  var r = graphics.fillRoundedRect(gridWidth*4,gridWidth*1,gridWidth*1.5,gridWidth*1.5,16);
  // r.setColor('0xFFFFFF');
  graphics.fillRoundedRect(gridWidth*2.5,gridWidth*1,gridWidth*1.5,gridWidth*1.5,16);
  graphics.fillRoundedRect(gridWidth*2.5,gridWidth*2.5,gridWidth*1.5,gridWidth*1.5,16);
  graphics.fillRoundedRect(gridWidth*4,gridWidth*2.5,gridWidth*1.5,gridWidth*1.5,16);

  graphics.fillStyle( 0xCDC0B4, 1);
  graphics.fillRoundedRect(gridWidth*1, gridWidth*1, gridWidth*2, gridWidth*3, 8);
  graphics.fillRoundedRect(gridWidth*5, gridWidth*1, gridWidth*4, gridWidth*3, 8);
  graphics.fillRect(gridWidth*3,gridWidth*2,gridWidth*2,gridWidth);
  graphics.fillStyle(0xBBADA0);

  graphics.strokeRoundedRect(gridWidth*1, gridWidth*1, gridWidth*2, gridWidth*3, 8);
  graphics.strokeRoundedRect(gridWidth*5, gridWidth*1, gridWidth*4, gridWidth*3, 8);
  // graphics.fillRect(48*3,gridWidth*2,48*2,gridWidth*1);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    graphics.strokeLineShape(line);
  }
  // graphics.strokeCircle(gridWidth*2.5, gridWidth*1.5, gridWidth/2.5)

  this.add.image(gridWidth*2.5,gridWidth*1.5,'rosette').setScale(0.2);
  this.add.image(gridWidth*2.5,gridWidth*3.5,'rosette').setScale(0.2);
  this.add.image(gridWidth*5.5,gridWidth*2.5,'rosette').setScale(0.2);
  this.add.image(gridWidth*8.5,gridWidth*3.5,'rosette').setScale(0.2);
  this.add.image(gridWidth*8.5,gridWidth*1.5,'rosette').setScale(0.2);

  //initialising dice
  dice = this.add.group();
  dice.create(gridWidth*9.5,gridWidth*1.5,'dice').setScale(0.4);
  dice.create(gridWidth*9.5,gridWidth*2.5,'dice').setScale(0.4);
  dice.create(gridWidth*10.5,gridWidth*1.5,'dice').setScale(0.4);
  dice.create(gridWidth*10.5,gridWidth*2.5,'dice').setScale(0.4);
  // diceText = this.add.text(12,gridWidth*4 ,diceRoll, { fontSize: '32px', fill: '#000' });

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
  // turnText = this.add.text(gridWidth, 300, `turn: ${turnPiece}`, { fontSize: '32px', fill: '#000' });

  //initilising title text
  const titleText = this.add.text(gridWidth, 20, `Royal Game of Ur`, {fontSize: '40px', fill: '#000'})

  //initialising pieces
  whitePieces = this.add.group();
  blackPieces = this.add.group();
  for (let i = 0; i < starCoords.length; i++) {
    const coord = starCoords[i].slice();
    var whiteCircle = 
    whitePieces.create(coord[0] + 4*gridWidth,coord[1] + 3*gridWidth, "white_token");
  }
  for (let i = 0; i < starCoords.length; i++) {
    const coord = starCoords[i].slice();
    blackPieces.create(coord[0] + 4*gridWidth,coord[1] + 1*gridWidth, "black_token");
  }
  Phaser.Actions.Call(whitePieces.getChildren(), function(sprite) {
    sprite.setScale(0.05);
  });
  Phaser.Actions.Call(blackPieces.getChildren(), function(sprite) {
    sprite.setScale(0.05);
  });

  piecesInPos[0]  = whitePieces.getChildren();
  piecesInPos[16] = blackPieces.getChildren();
  
  

  var _this = this;
  ghostPieceWhite = this.add.image(0,0,"white_token").setAlpha(0);
  ghostPieceBlack = this.add.image(0,0,"black_token").setAlpha(0);
  
  //roll dice to start
  rollDice(_this)

  //action to take on pointer down
  this.input.on('pointerdown', function (pointer){ //eventually pointer over to see possible move
    ghostPieceWhite.setAlpha(0);
    ghostPieceBlack.setAlpha(0);
    workOutMove(pointer, true);    
  });

  hoveringOnPiece = -1
  this.input.on('pointermove', function (pointer){
    var newHoveringOnPiece = mouseXYtoBoardPos(pointer.x,pointer.y);
    if(newHoveringOnPiece != hoveringOnPiece){ //only do this when pointer moves onto a new area of the board (new square, or off board)
      // console.log("removing")
      ghostPieceWhite.setAlpha(0);
      ghostPieceBlack.setAlpha(0);
      hoveringOnPiece = newHoveringOnPiece

      // console.log("updating now")
      workOutMove(pointer, false)
    }
  })

  function workOutMove(pointer, takeAction) {
    var boardPos = mouseXYtoBoardPos(pointer.x, pointer.y);

    if(boardPos >= 0 && piecesInPos[boardPos].length > 0){ // on board and on some piece
      const colorOfPiece = piecesInPos[boardPos][piecesInPos[boardPos].length -1].texture.key;
      if(colorOfPiece != turnPiece) return;
      // console.log("dice roll is", diceRoll);
      var possiblePos = possibleMove(boardPos, diceRoll, colorOfPiece);

      if(possiblePos.length > 0 ){ //there is a legal move
        const newPos = possiblePos[0]; //the legal move
        if(takeAction){
          if(boardPos ==  0) {yetToStartWhites -= 1}
          if(boardPos == 16) {yetToStartBlacks -= 1}

          //update our knowledge of where the piece is
          piecesInPos[newPos].push(piecesInPos[boardPos].pop());
        }

        //update the sprites position
        var newCoordinates;
        switch (newPos) { //special cases for when white or black are finishing
          case 15: { 
            newCoordinates = starCoords[6-finishedWhites].slice();
            newCoordinates[0] += 3*gridWidth;
            newCoordinates[1] += 3*gridWidth;
            if(takeAction) finishedWhites++;
            break;
          }
          case 23: {
            newCoordinates = starCoords[6-finishedBlacks].slice();
            newCoordinates[0] += 3*gridWidth;
            newCoordinates[1] += 1*gridWidth;
            if(takeAction) finishedBlacks++;
            break;
          }
          default: { //this is not a finishing move
            if(piecesInPos[newPos].length > 1 && takeAction){ //we are removing a piece of a different color
              removePiece(piecesInPos[newPos].shift(), _this);
            } 
            newCoordinates = boardPosToXY(newPos);
          }
        }

        if(takeAction){
          _this.tweens.add({
              targets: piecesInPos[newPos][piecesInPos[newPos].length-1],
              x: newCoordinates[0],
              y: newCoordinates[1],
              scaleX: ((newPos == 23 || newPos == 15) ? 0.05 :0.2),
              scaleY: ((newPos == 23 || newPos == 15) ? 0.05 :0.2),
              duration: 200,
              ease: 'Linear',
              onComplete: rollDice(_this)
          });
          
          //Change the turn
          if( ![4,8,14,22,20].includes(newPos)){
            switchTurn();
          }
        } else {
          console.log("adding ghost piece")
          switch (colorOfPiece) {
            case "white_token": {
              ghostPieceWhite.x = newCoordinates[0]
              ghostPieceWhite.y = newCoordinates[1]
              ghostPieceWhite.setScale(((newPos == 15) ? 0.05 :0.2)).setAlpha(0.6)
              break;
            }
            case "black_token": {
              ghostPieceBlack.x = newCoordinates[0]
              ghostPieceBlack.y = newCoordinates[1]
              ghostPieceBlack.setScale(((newPos == 23) ? 0.05 :0.2)).setAlpha(0.6)
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

function removePiece(pieceToRemove, _this) {
  switch (pieceToRemove.texture.key) {
    case "black_token": {
      piecesInPos[16].push(pieceToRemove);
      var newCoords = starCoords[yetToStartBlacks].slice();
      yetToStartBlacks++;
      newCoords[0] += 4*gridWidth;
      newCoords[1] += 1*gridWidth;
      break
    }
    case "white_token": {
      piecesInPos[0].push(pieceToRemove);
      var newCoords = starCoords[yetToStartWhites].slice();
      yetToStartWhites++;
      newCoords[0] += 4*gridWidth;
      newCoords[1] += 3*gridWidth;
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




function rollDice(_this) {
  // rollAnim = _this.anims.create({
  //   key: 'roll',
  //   frames: _this.anims.generateFrameNumbers('dice'),
  //   frameRate: 20,
  //   duration: 200,
  // })

  

  const diceValues = [ Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),];
  diceRoll = diceValues.reduce((a,b) => a+b,0);
  

  var diceTimeline = _this.tweens.createTimeline();
  const diceRollTime = 200;
  var i = 0
  dice.getChildren().forEach(diceSprite => {
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

  //,

  

  

  diceTimeline.play()





  if(diceRoll == 0){
    console.log("ROLLED A ZERO")
    _this.time.delayedCall(1000, function() {
      console.log("RE ROLLING");
      switchTurn();
      rollDice(_this)
    }, [], _this);
  }
}

function switchTurn() {
  switch (turnPiece) {
    case "white_token": {turnPiece = "black_token"; break}
    case "black_token": {turnPiece = "white_token"; break}
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

function possibleMove(bPos, diceRoll, colorOfToken) {
  var newPossPos = bPos;
  for (let i = 0; i < diceRoll; i++) {
    newPossPos = nextPosition(newPossPos,colorOfToken);
    if (newPossPos == -1) return [];
  }
  // console.log(`looking at position ${newPossPos}`);
  // console.log(`number of pieces in poss pos: ${piecesInPos[newPossPos].length }`)
  if (piecesInPos[newPossPos].length==0 || newPossPos == 15 || newPossPos == 23 || (piecesInPos[newPossPos][0].texture.key != colorOfToken && newPossPos != 8)) { // if we have found a new possible position
    return [newPossPos];
    
  }
  return []
}

function nextPosition(bPos, color) {
  if(bPos == 20) return 5;
  if(bPos == 12 && color=="black_token") return 21;
  if(bPos == 15 || bPos == 23) return -1;
  return bPos+1;
}

var boardPositionsAndIndexes = [ [21,22,23,16,17,18,19,20],
  [12, 11, 10, 9, 8, 7, 6 ,5],
  [13, 14, 15, 0 ,1 ,2, 3, 4] ];

function mouseXYtoBoardPos(pointx,pointy) {
  var x = Math.floor((pointx-gridWidth)/gridWidth);
  var y = Math.floor((pointy-gridWidth)/gridWidth);

  // console.log(boardPositionsAndIndexes[y][x]);
  if(0 <= x && x < 8 && 0 <= y && y < 3) {
    // console.log(boardPositionsAndIndexes[y][x]);
    return boardPositionsAndIndexes[y][x];
  } else{
    // console.log("clicked off board"); 
    return -1;
  }
}

function boardPosToXY(bPos) {
  var y = boardPositionsAndIndexes.findIndex( as => {return as.some( a => {return a == bPos}) });
  var x = boardPositionsAndIndexes[y].findIndex( a => {return a == bPos});

  return [(x+1.5)*gridWidth,(y+1.5)*gridWidth];
}

function update ()
{
  //dice.getChildren().forEach( d => console.log("t value is:", d.t))
}
