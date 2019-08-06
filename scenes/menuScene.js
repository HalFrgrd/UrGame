import {CST} from "../CST.js";
export class MenuScene extends Phaser.Scene{
  constructor() {
    super({
      key: CST.SCENES.MENU
    })
  }
  init(data) {
    
  }
  preload() {

  }
  create(){
    this.scene.start(CST.SCENES.MENU, "hello from menu")
  }
}