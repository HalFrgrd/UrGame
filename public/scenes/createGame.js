import {TextButton} from "./textbutton.js";

export class CreateGameScene extends Phaser.Scene{
  constructor() {
    super({
      key: "CREATEGAME",
    })
  }
  init(data) {

  }
  preload() {
    
  }
  create(){

    this.socket = io('/findgame');
    var self = this
    // self.add.dom(400, 360, 'div', 'text-align: center; width: 180px; height: 32px; font: 16px Arial; color: black;', 'Share code with friend');

    // this.add.text(280,230,'Share code with friend', {fontSize: '20px', fill: '#666666'})

    this.add.existing(new TextButton(this,400,300,'Share code with friend',()=>{}))


    this.socket.emit("gameCodeRequest", function (code) {
      console.log("we ave this code: ", code)
      self.add.dom(400, 355, 'div', 'text-align: center; width: 180px; height: 32px; font: 32px Arial; color: white;', code);
      self.add.existing(new TextButton(self, 400, 360 , '', 
      ()=>{
        console.log("trying to get inpout")
    

      } 
    ))
    })

    this.socket.on("friendJoined", function (roomKey) {
      console.log("startin game with friend in room: ", roomKey)
      self.scene.start("GAME", ["ONLINEPLAY", roomKey])
    }) 

  }

  
}
