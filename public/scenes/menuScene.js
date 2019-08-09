import {TextButton} from "./textbutton.js";

export class MenuScene extends Phaser.Scene{
  constructor() {
    super({
      key: "MENU",
    })
  }
  init(data) {
    console.log("on menu scene");
  }
  preload() {
    this.load.spritesheet("button", "assets/button.png",{frameHeight: 48, frameWidth: 192});
    // this.cameras.main.setBackgroundColor('#000000');
  }
  create(){
    


    this.add.text(400, 100,  "Royal Game of Ur", { fontSize: '70px', fill: '#000', align: 'right', fontFamily: 'Open Sans', fontStyle: 'bold' }).setOrigin(0.5)

    var buttons = this.add.group();
    buttons.add(this.add.existing(new TextButton(this, 400, 300, "Play one player", ()=>{ hideButtons(this, "SINGLEPLAYER") })))
    buttons.add(this.add.existing(new TextButton(this, 400, 360, "Play two player", ()=>{hideButtons(this, "TWOPLAYER")})))
    buttons.add(this.add.existing(new TextButton(this, 400, 420, "How to play", ()=>{hideButtons(this, "HOWTOPLAY")})))
    buttons.add(this.add.existing(new TextButton(this, 400, 480, "Dice throwing", ()=>{hideButtons(this, "DICETHROWING")})))

    
    function hideButtons(_this, mode){
      _this.tweens.add({
        targets: buttons.getChildren(),
        x: 1000,
        duration: 300,
        ease: 'Sine',
        onComplete: () => {
          // _this.scene.remove()
          _this.scene.launch("GAME", mode)
        }
      })
      
    }


  }

  
}
