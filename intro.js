class intro extends Phaser.Scene {
    constructor() {
        super({ key: "intro" });
    }

    preload() {
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
    }

    create() {
        this.graphics = this.add.graphics();

        CameraManager.initializeMainCamera(this);
        CameraManager.initializeUICamera(this);

        var logo = this.add.image(50, 50, 'logo').setScale(1);
        CameraManager.addUISprite(logo);

        const color1 = new Phaser.Display.Color(0, 0, 0);
        this.shadow = this.add.rectangle(0, 0,2048, 2048, color1.color);
        this.shadow.setAlpha(0.85);
    }

    update() {
    }

}