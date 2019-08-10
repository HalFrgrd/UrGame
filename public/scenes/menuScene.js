import {TextButton} from "./textbutton.js";

export class MenuScene extends Phaser.Scene{
  constructor() {
    super({
      key: "MENU",
    })
  }
  init(data) {

  }
  preload() {
    this.load.spritesheet("button", "assets/button.png",{frameHeight: 48, frameWidth: 192});
    // this.cameras.main.setBackgroundColor('#000000');
  }
  create(){
    


    this.add.text(400, 100,  "Royal Game of Ur", { fontSize: '70px', fill: '#000', align: 'right', fontFamily: 'Open Sans', fontStyle: 'bold' }).setOrigin(0.5)

    
    let menuStructure = [
      
      ["Play",()=>{} , [
        ["Local play", ()=>{this.scene.launch("GAME", "LOCALPLAY")}, []],
        ["Against AI",  ()=>{this.scene.launch("GAME", "AIPLAY")} ,[] ],
        ["Online", ()=>{}, [
          ["Create game",()=>{this.scene.launch("CREATEGAME")} ,[]],
          ["Join a friend's game", ()=>{this.scene.launch("JOINFRIEND")},[]],
          ["Join a random game", ()=>{this.scene.launch("JOINRANDOM")},[]],
        ]]
      ]],
      ["How to play", ()=>{},[]],
      ["Dice throwing", ()=>{},[]],
    ]

    new MenuBuilder(this, menuStructure)

  }

  
}

class MenuBuilder {
  constructor (_this, menuStructure, parentGroup = null) {
    this.buttons = _this.add.group()
    var self = this
    for (var [i, butt] of menuStructure.entries()) {
      !function outer(iInside,bInside, selfInside) { //This resolves callback in loops problem
        selfInside.buttons.add(_this.add.existing(new TextButton(_this, 400, 300 + i*60, butt[0], 
          ()=>{
            console.log(iInside)
            bInside[1](); //do our custom function
            selfInside.buttons.toggleVisible()
            if(bInside[2].length > 0) { new MenuBuilder(_this, bInside[2], selfInside.buttons) }
          }
        )))
      }(i,butt, self)
    }

    if(parentGroup !== null){
      if(i === undefined) var i = -1 
      this.buttons.add(_this.add.existing(new TextButton(_this, 400, 300 + (i+1)*60, "Back ↩", ()=>{
        this.buttons.toggleVisible()
        parentGroup.toggleVisible()
      })))
    }
  }


  // hideButtons(this, mode){
  //   this.tweens.add({
  //     targets: this.buttons.getChildren(),
  //     x: 1000,
  //     duration: 300,
  //     ease: 'Sine',
  //     onComplete: () => {
  //       // this.scene.remove()
  //       this.scene.launch("GAME", mode)
  //     }
  //   })
    
  // }
}