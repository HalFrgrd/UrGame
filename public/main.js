import {GameScene} from "/scenes/gameScene.js";
import {MenuScene} from "/scenes/menuScene.js";

let game = new Phaser.Game({
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: 'game', //reference to index.html div
  backgroundColor: '#FAF8EF',
  scene: [
    MenuScene, GameScene
  ],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

})

// console.log("hello world")