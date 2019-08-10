import {TextButton} from "./textbutton.js";


export class JoinFriendScene extends Phaser.Scene{
  constructor() {
    super({
      key: "JOINFRIEND",
    })
  }
  init(data) {

  }
  preload() {
    this.load.html('codeForm', '../assets/codeForm.html');
  }
  create(){
    // let inputCode = this.add.dom(400, 300, 'input', 'background-color: white; width: 186px; height: 48px; font: 32px Arial');
    var inputBox = this.add.dom(400, 300).createFromCache('codeForm');
    var self = this

    this.socket = io('/findgame');

    this.inputText;

    this.add.existing(new TextButton(this, 400, 360, "Enter code and join", ()=>{
      // console.log(self.getChildByName('codeForm').value)
      if(self.inputText !== undefined){ 
        console.log(self.inputText.value)
        
        self.socket.emit("joinFriendRequest", self.inputText.value, function (response) {
          console.log("server responded")
          // response is: [friend available or not, room to play in]
          if (response[0] === "friendAvailable"){
            self.scene.start("GAME", ["ONLINEPLAY", response[1]])
            console.log("could launch")
          } else{
            console.log("couldn't enter game")
          }
        }
        )

      }
      else {console.log("nothing in input box yet")}
    }))  

    inputBox.addListener('click');
    inputBox.on('click', function (event) {
      self.inputText = this.getChildByName('codeFormInput');
      // console.log("updating input text", self.inputText.value)
    })


  }

  
}
