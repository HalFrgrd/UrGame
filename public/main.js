import {GameScene} from "/scenes/gameScene.js";
import {MenuScene} from "/scenes/menuScene.js";
import {JoinFriendScene} from "/scenes/joinFriendScene.js";
import {JoinRandomScene} from "/scenes/joinRandomScene.js";
import { CreateGameScene } from "./scenes/createGame.js";
import { DiceRollScene } from "./scenes/diceRollScene.js";
import { TutorialScene } from "./scenes/tutorialScene.js";



let game = new Phaser.Game({
  width: 800,
  height: 750,
  type: Phaser.AUTO,
  parent: 'game', //reference to index.html div
  backgroundColor: '#FAF8EF',
  // pixelArt: true,
  scene: [
    MenuScene, GameScene, JoinFriendScene, JoinRandomScene, CreateGameScene, DiceRollScene, TutorialScene
  ],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  dom: {
    createContainer: true
  }

})

// console.log("hello world")