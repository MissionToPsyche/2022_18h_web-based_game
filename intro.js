class Intro extends Phaser.Scene {
    constructor() {
        super({ key: "Intro" });
    }

    preload() {
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('border', 'img/icons/intro-border.png');
    }

    create() {
        this.graphics = this.add.graphics();

        CameraManager.initializeMainCamera(this);
        CameraManager.initializeUICamera(this);

        var logo = this.add.image(50, 50, 'logo').setScale(0.5);
        var intro_border = this.add.image(500,390,'border').setScale(.80);
        intro_border.depth = 100;
        CameraManager.addUISprite(logo);
        CameraManager.addUISprite(intro_border);

        const color1 = new Phaser.Display.Color(0, 0, 0);
        this.shadow = this.add.rectangle(500, 380 ,620, 650, color1.color);
        this.shadow.setAlpha(0.5);
        this.shadow.setVisible(true);
        CameraManager.addUISprite(this.shadow);
    }

    update() {
    }
}