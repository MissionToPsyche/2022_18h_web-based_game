class Intro extends Phaser.Scene {
    constructor() {
        super({ key: "Intro" });
        this.page;
        this.nextButton;
        this.introText;
    }

    preload() {
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('border', 'img/icons/intro-border.png');
        this.page = 1;
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
        this.createPage();
    }

    update() {
        this.updatePage();
    }

    updatePage() {

        switch(this.page){
            case 2:
                this.introText.setVisible(false);
                this.introText = this.add.text(325, 100, 'Page 2').setOrigin(0.5).setFontSize(50);
                break;
            case 3:
                this.introText.setVisible(false);
                this.introText = this.add.text(325, 100, 'Page 3').setOrigin(0.5).setFontSize(50);
                this.nextButton.setVisible(false);
                break;
        }

        CameraManager.addUISprite(this.introText);
    }

    createPage() {
        this.nextButton = this.add.triangle(700, 650, 0, 128, 64, 0, 128, 128, 0x6666ff).setScale(0.35);
        this.nextButton.angle = 90
        this.introText = this.add.text(325, 100, 'Page 1').setOrigin(0.5).setFontSize(50);
        CameraManager.addUISprite(this.nextButton);
        CameraManager.addUISprite(this.introText);
        this.nextButton.setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
            this.nextButton.setFillStyle(0xF9A000);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
            this.nextButton.setFillStyle(0x6666ff);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            this.nextButton.setFillStyle(0xF47D33);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            this.page = this.page + 1;
        });
    }

}