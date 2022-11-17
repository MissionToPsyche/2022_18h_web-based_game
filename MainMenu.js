class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: "MainMenu" });
    }

    preload() {
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('play', 'img/icons/play-circle.svg');
    }

    create() {
        this.graphics = this.add.graphics();

        CameraManager.initializeMainCamera(this);
        CameraManager.initializeUICamera(this);

        var logo = this.add.image(50, 50, 'logo').setScale(0.5);
        CameraManager.addUISprite(logo);

        this.createPlayButton();
    }

    update() {

    }

    createPlayButton() {
        this.playButton = this.add.image(400, 300, 'play').setScale(2.0);
        CameraManager.addUISprite(this.playButton);
    }
}