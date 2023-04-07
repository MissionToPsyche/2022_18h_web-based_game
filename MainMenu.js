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

        this.load.audio('intro_music', 'assets/music/01_Intro.mp3');
        this.load.audio('load', 'assets/sfx/load.wav');
    }

    create() {
        this.graphics = this.add.graphics();

        CameraManager.initializeMainCamera(this);
        CameraManager.initializeUICamera(this);
        CameraManager.initializeMiniCamera(this);
        CameraManager.toggleCamera('mini');

        var logo = this.add.image(50, 50, 'logo').setScale(0.5);
        CameraManager.addUISprite(logo);

        this.intro_music = this.sound.add('intro_music');
        if (!this.intro_music.isPlaying) {
            this.intro_music.play({ loop: true });
        }

        this.createTitle();
        this.createPlayButton();
    }

    update() {
        // nothing happens here :)
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
                var load_audio = this.sound.add('load');
                load_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.playButton.setTint(0xFFFFFF);
                this.intro_music.stop()
                this.scene.start('PsycheMission');
            })
    }
}