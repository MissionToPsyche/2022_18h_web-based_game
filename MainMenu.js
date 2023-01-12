class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: "MainMenu" });
    }

    preload() {
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('play', 'img/icons/play-circle.svg');
        this.load.image('title_journey', 'img/journey.png');
        this.load.image('title_to', 'img/to.png');
        this.load.image('title_psyche', 'img/psyche.png');
        this.load.image('control', 'img/icons/control.png'); 
    }

    create() {
        this.graphics = this.add.graphics();

        CameraManager.initializeMainCamera(this);
        CameraManager.initializeUICamera(this);

        var logo = this.add.image(50, 50, 'logo').setScale(0.5);
        CameraManager.addUISprite(logo);

        this.createTitle();
        this.createPlayButton();
        this.createControlButton();
    }

    update() {
    }

    createTitle() {
        var journey = this.add.image(512, 24, 'title_journey').setScale(0.0);
        var to = this.add.image(512, 24, 'title_to').setScale(0.0);
        var psyche = this.add.image(515, 24, 'title_psyche').setScale(0.0);
        CameraManager.addUISprite(journey);
        CameraManager.addUISprite(to);
        CameraManager.addUISprite(psyche);

        const delay = 500;
        this.tweens.add({
            targets: journey,
            scale: 1,
            y: 82,
            delay: delay,
            duration: 350,
            ease: "Sine.easeIn"
        });

        this.tweens.add({
            targets: to,
            scale: 1,
            y: 168,
            delay: delay + 350,
            duration: 400,
            ease: "Sine.easeIn"
        });

        this.tweens.add({
            targets: psyche,
            scale: 1,
            y: 272,
            delay: delay + 750,
            duration: 450,
            ease: "Sine.easeIn"
        });
    }

    createPlayButton() {
        this.playButton = this.add.image(512, 464, 'play');
        CameraManager.addUISprite(this.playButton);

        this.playButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.playButton.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.playButton.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.playButton.setTint(0xF47D33);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.playButton.setTint(0xFFFFFF);
                this.scene.start('Freeplay');
            })
    }

    createControlButton() {
        this.controlButton = this.add.image(520,618, 'control').setScale(0.5);
        CameraManager.addUISprite(this.controlButton);

        // To darken screen
        const color1 = new Phaser.Display.Color(0, 0, 0);
        this.shadow = this.add.rectangle(0, 0,2048, 2048, color1.color);
        this.shadow.setAlpha(0.5);
        this.shadow.setVisible(false);

        this.controlButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.controlButton.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.controlButton.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.controlButton.setTint(0xF47D33);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.controlButton.setTint(0xFFFFFF);
                this.shadow.setVisible(true);
                this.createControlMenu();
            })
    }

    createControlMenu() {
        //Control menu
        this.controlText = this.add.text(525, 150, 'CONTROLS').setOrigin(0.5).setFontSize(120);
        CameraManager.addUISprite(this.controlText);
        this.playButton.disableInteractive();
        this.controlButton.disableInteractive();
    }
}