import {GameScene} from "/scenes/gameScene.js";
import {MenuScene} from "/scenes/menuScene.js";

let game = new Phaser.Game({
  width: 800,
  height: 600,
  scene: [
    MenuScene, GameScene
  ]
})

// console.log("hello world")