
export class TextButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, callback) {
    super(scene);
    this.button = scene.add.sprite(x, y, "button",0).setDepth(0);
    var text = scene.add.text(x,y ,text, { fontSize: '16px', fill: '#FFFFFF', align: 'right', fontFamily: 'Open Sans', fontStyle: 'bold' }).setDepth(1);
    text.setOrigin(0.5)
    this.add(this.button)
    this.add(text)

    this.button.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.enterButtonHoverState() )
      .on('pointerout', () => this.enterButtonRestState() )
      .on('pointerdown', () => this.enterButtonActiveState() )
      .on('pointerup', () => {
        this.enterButtonHoverState();
        callback();
        
      });
  }

  applyTween() {

  }

  enterButtonHoverState() {
    this.button.setFrame(1);
  }

  enterButtonRestState() {
    this.button.setFrame(0);
  }

  enterButtonActiveState() {
    this.button.setFrame(1);
  }
}