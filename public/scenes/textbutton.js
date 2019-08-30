
export class TextButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, callback, xScale = 1, type="button") {
    super(scene);
    console.log(type)
    this.button = scene.add.sprite(x, y, type, 0).setDepth(0);
    this.button.scaleX = xScale;
    var text = scene.add.text(x,y ,text, { fontSize: '16px', fill: '#FFFFFF', align: 'right', fontFamily: 'Helvetica', fontStyle: 'bold' }).setDepth(1);
    text.setOrigin(0.5)
    this.add(this.button)
    this.add(text)

    this.button.setInteractive({ useHandCursor: true })
      .on('pointerover', () => (IS_TOUCH) ? ()=>{} : this.enterButtonHoverState() )
      .on('pointerout', () => this.enterButtonRestState() )
      .on('pointerdown', () =>  this.enterButtonActiveState() )
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