
export class ResetScene extends Phaser.Scene{
  constructor() {
    super({
      key: "RESET",
    })
  }
  init() {
    console.log("resetting...");
    this.scene.stop("GAME")
    console.log("starting game fro mresets scene")
  }
  preload() {
    
  }
  create(){
    this.scene.start("GAME");
    
  }

  
}
