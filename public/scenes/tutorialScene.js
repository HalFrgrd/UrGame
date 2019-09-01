import {TextButton} from "./textbutton.js";
import {DrawGraphics, AddPiecesAndDice} from "./gameScene.js"

export class TutorialScene extends Phaser.Scene{
  constructor() {
    super({
      key: "TUTORIAL",
    })
  }
  init(data) {

  }
  preload() {
    this.load.svg('tutorial','assets/gameBackgroundTutorial.svg');
    this.load.image("blurredBackground", "assets/gameBackgroundBlurred.png")
    this.load.svg('black_piece', 'assets/black_token2.svg');
    this.load.svg('white_piece', 'assets/white_token2.svg');
    this.load.spritesheet("buttonSmall", "assets/buttonSmall.png",{frameHeight: 32, frameWidth: 48});
    this.load.spritesheet('dice','assets/dice.png', {frameWidth: 100, frameHeight: 100});
    this.load.svg('rosette','assets/rosette4red.svg');

    this.load.plugin('rexroundrectangleplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/plugins/dist/rexroundrectangleplugin.min.js', true);      
  }
  create(){
    


    // var game_scene = this.scene.launch("GAME", "TUTORIAL")
    // this.scene.sendToBack(game_scene)
    this.backgroundImage = this.add.image(400,278,"blurredBackground")
    
    // var textX = 105
    // var textY = 400
    // var textYStep = 25
    this.add.image(405,282,'tutorial')
    // this.add.text(textX,textY+textYStep*0,"Move your pieces along the shown route.",  {fontSize: '20px', fill: '#000000',fontFamily: "Courier"})
    // this.add.text(textX,textY+textYStep*1,"The sum of the dice is how far to move your piece.",  {fontSize: '20px', fill: '#000000',fontFamily: "Courier"})
    // this.add.text(textX,textY+textYStep*2,"Land on your oppositions pieces to send them home.",  {fontSize: '20px', fill: '#000000',fontFamily: "Courier"})
    // this.add.text(textX,textY+textYStep*3,"Land on rosettes to have another turn.",  {fontSize: '20px', fill: '#000000',fontFamily: "Courier"})
    // this.add.text(textX,textY+textYStep*4,"Win by getting all your pieces off the board.",  {fontSize: '20px', fill: '#000000',fontFamily: "Courier"})


    this.add.text(110,170,"Look here for information as you play.",  {fontSize: '20px', fill: '#000000',fontFamily: "Courier"})
    this.add.text(600,190,"Look here \n\nfor the \n\ndice values.",  {fontSize: '20px', fill: '#000000',fontFamily: "Courier"})

    this.add.existing(new TextButton(this, 630, 470, "Menu", ()=>{this.scene.start("MENU")}, 1, "buttonSmall"))


    var textIndex = 0    
    
    
    var textToShow = [
      "Move your pieces along the shown route.",  
      "The sum of the dice is how far to move your piece.",
      "Land on your oppositions pieces to send them home.", 
      "Land on rosettes to have another turn.", 
      "Win by getting all your pieces off the board.",
     
    ]
    
    var tutorialText = this.add.text(104,400,textToShow[0],  {fontSize: '20px', fill: '#000000',fontFamily: "Courier"})
    

    function setText(newIndex) {
      tutorialText.text = textToShow[newIndex]
      textIndex = newIndex
    }

    this.add.existing(new TextButton(this, 300, 470 , "⇦  Previous Step", ()=>{
      if(textIndex>0){
        setText(textIndex-1)
      }
    }) )
    this.add.existing(new TextButton(this, 500, 470 , "Next Step  ⇨", ()=>{
      if(textIndex<textToShow.length-1){
        setText(textIndex+1)
      }
    }) )
    
    


    // this.add.text(400, 100,  "Royal Game of Ur", { fontSize: '70px', fill: '#000', align: 'right', fontFamily: 'Helvetica', fontStyle: 'bold' }).setOrigin(0.5)

   
    

  }


  
}

