import {GameScene} from "/scenes/gameScene.js";
import {MenuScene} from "/scenes/menuScene.js";
import {ResetScene} from "/scenes/resetScene.js";

let game = new Phaser.Game({
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: 'game', //reference to index.html div
  backgroundColor: '#FAF8EF',
  scene: [
    GameScene, MenuScene, ResetScene
  ],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // plugins: {
  //   global: [{
  //       key: 'rexRoundRectanglePlugin',
  //       plugin: rexroundrectangleplugin,
  //       start: true
  //   },
  //   ]
// }
})

// console.log("hello world")