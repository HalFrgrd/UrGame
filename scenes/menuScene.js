import {CST} from "../CST.js";
export class MenuScene extends Phaser.Scene{
  constructor() {
    super({
      key: CST.SCENES.MENU,
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
    this.scene.launch(CST.SCENES.GAME, "hello from menu")


    this.add.text(400, 100,  "Royal Game of Ur", { fontSize: '70px', fill: '#000', align: 'right', fontFamily: 'Open Sans', fontStyle: 'bold' }).setOrigin(0.5)

    this.add.existing(new TextButton(this, 400, 300, "Play one player", ()=>{console.log("here")}))
    this.add.existing(new TextButton(this, 400, 360, "Play two player", ()=>{console.log("here")}))
    this.add.existing(new TextButton(this, 400, 420, "How to play", ()=>{console.log("here")}))
    this.add.existing(new TextButton(this, 400, 480, "Dice throwing", ()=>{console.log("here")}))


  }
}

class TextButton extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, text, callback) {
    super(scene, x, y, "button",0).setDepth(0);
    var text = scene.add.text(x,y ,text, { fontSize: '16px', fill: '#FFFFFF', align: 'right', fontFamily: 'Open Sans', fontStyle: 'bold' }).setDepth(1);
    text.setOrigin(0.5)

    this.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.enterButtonHoverState() )
      .on('pointerout', () => this.enterButtonRestState() )
      .on('pointerdown', () => this.enterButtonActiveState() )
      .on('pointerup', () => {
        this.enterButtonHoverState();
        callback();
      });
  }

  enterButtonHoverState() {
    this.setFrame(1);
  }

  enterButtonRestState() {
    this.setFrame(0);
  }

  enterButtonActiveState() {
    this.setFrame(1);
  }
}