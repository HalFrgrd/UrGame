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
    this.load.spritesheet("buttonSmall", "assets/buttonSmall.png",{frameHeight: 32, frameWidth: 48});

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
    // for (let i = 0; i <5; i++){
    //   this.previousRollsText.add( this.add.text(400-20*i,400,"0", {fontSize: '20px', fill: '#666666'}) )
    // }
    

    this.pastRolls = []
    
    let _this = this

    this.keyObj = this.input.keyboard.addKey('SPACE')
    this.keyObj.on('down', function(event) {
      _this.rollDice(_this)
    })

    var rollButton = new TextButton(this, xDicePos+180, yDicePos+150, "Roll dice (or press space)", 
      ()=>{
        console.log("rolling")
        _this.rollDice(_this)
      },
      2
    )

    this.add.existing(rollButton)


    this.add.existing(new TextButton(this, 730, 100, "Menu", ()=>{this.scene.start("MENU")}, 1, "buttonSmall"))

    var newText = this.add.text(160,320,"Previous rolls: ", {fontSize: '32px', fill: '#666666'}) 


    this.allowRolling = true
    

  }

  animateDice(diceValues) {
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

  updatePastDice() {
    
    this.tweens.add({
      targets: this.previousRollsText.getChildren(),
      x: '+=30',
      duration: 200,  
    })

    

    var newText = this.add.text(460,320,this.diceRoll, {fontSize: '32px', fill: '#666666'}) 
    newText.setAlpha(0)

    this.previousRollsText.add(newText)

    var _this =this

    this.tweens.add({
      targets: newText,
      alpha: 1,
      duration: 200,
      offset: 100,
      onComplete: ()=>{
        _this.allowRolling = true
      }
    })

    if(this.previousRollsText.getChildren().length > 5){
      this.previousRollsText.getChildren()[0].destroy()
      this.pastRolls.shift()
    }

  }

  rollDice() { //only run for local plays
    if(this.allowRolling){
      this.allowRolling = false

      var diceValues = [ Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),Phaser.Math.Between(0,1),];
   
      this.diceRoll = diceValues.reduce((a,b) => a+b,0);
      // this.updatePastDice(_this)
    
      this.animateDice(diceValues)
      
      console.log("dice roll: ", this.diceRoll)
    
      this.pastRolls.push(this.diceRoll)
  
      console.log("past rolls", this.pastRolls)
  
      this.updatePastDice()
    }


  }

  
}
