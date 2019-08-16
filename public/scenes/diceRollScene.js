import {TextButton} from "./textbutton.js";

export class DiceRollScene extends Phaser.Scene{
  constructor() {
    super({
      key: "DICEROLL",
    })
  }
  init(data) {

  }
  preload() {
    this.load.spritesheet('dice','../assets/dice.png', {frameWidth: 100, frameHeight: 100});    
  }
  create(){
    console.log("here")
    this.dice = this.add.group();
    let xDicePos = 200
    let yDicePos = 250
    let xDiceStep = 120
    let diceScale = 1
    this.dice.create(xDicePos+ xDiceStep*0,yDicePos,'dice').setScale(diceScale);
    this.dice.create(xDicePos+ xDiceStep*1,yDicePos,'dice').setScale(diceScale);
    this.dice.create(xDicePos+ xDiceStep*2,yDicePos,'dice').setScale(diceScale);
    this.dice.create(xDicePos+ xDiceStep*3,yDicePos,'dice').setScale(diceScale);

    this.previousRollsText = this.add.group();
    for (let i = 0; i <5; i++){
      this.previousRollsText.add( this.add.text(400-20*i,400,"0", {fontSize: '20px', fill: '#666666'}) )
    }
    

    this.pastRolls = [0,0,0,0,0,0,0,0,0]
    
    let _this = this

    this.keyObj = this.input.keyboard.addKey('SPACE')
    this.keyObj.on('down', function(event) {
      _this.rollDice(_this)
    })

    this.add.existing(new TextButton(this, xDicePos+200, yDicePos+80, "Roll dice (or press space)", 
      ()=>{
        console.log("rolling")
        _this.rollDice(_this)
      },
      2
    ))
    

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

  updatePastDice(_this) {
    pastRolls.slice(-5)
    for (let i = 0; i < 5; i++) {
      const element = pastRolls[i];
      
    }
  }

  rollDice(_this) { //only run for local plays
    var diceValues = [ Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),];
 
    this.diceRoll = diceValues.reduce((a,b) => a+b,0);
    // this.updatePastDice(_this)
  
    this.animateDice(_this,diceValues)
    
    console.log("dice roll: ", this.diceRoll)
  
  

  }

  
}
