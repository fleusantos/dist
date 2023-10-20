class Button extends Phaser.GameObjects.Image {
  constructor(x, y, texture, callback, scene, noframes) {
    super(scene, x, y, texture, 0);
    this.setInteractive({ useHandCursor: true });

    this.on(
      "pointerup",
      function () {
        if (!noframes) {
          this.setFrame(1);
        }
      },
      this
    );

    this.on(
      "pointerdown",
      function () {
        if (!noframes) {
          this.setFrame(2);
        }
        callback.call(scene);
      },
      this
    );

    this.on(
      "pointerover",
      function () {
        if (!noframes) {
          this.setFrame(1);
        }
      },
      this
    );

    this.on(
      "pointerout",
      function () {
        if (!noframes) {
          this.setFrame(0);
        }
      },
      this
    );

    scene.add.existing(this);
  }
}
