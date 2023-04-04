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

        var logo = this.add.image(Constants.LOGO_X, Constants.LOGO_Y, 'logo').setScale(Constants.LOGO_SCALE);
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
        /*
        var journey = this.add.image(512, 24, 'title_journey').setScale(0.0);
        var to = this.add.image(512, 24, 'title_to').setScale(0.0);
        var psyche = this.add.image(515, 24, 'title_psyche').setScale(0.0);
        CameraManager.addUISprite(journey);
        CameraManager.addUISprite(to);
        CameraManager.addUISprite(psyche);
        */

        var title1 = this.add.text(Constants.TITLE_BEFORE_X, Constants.TITLE_BEFORE_Y, 'Tour', { fontFamily: 'CustomFont' })
            .setScale(Constants.TITLE_BEFORE_SCALE).setOrigin(Constants.TITLE_BEFORE_ORIGIN)
            .setFontSize(Constants.FIFTH_FONT_SIZE).setStroke(Constants.STR_ORANGE, Constants.TITLE_STROKE_WIDTH);
        var title2 = this.add.text(Constants.TITLE_BEFORE_X, Constants.TITLE_BEFORE_Y, 'de', { fontFamily: 'CustomFont' })
            .setScale(Constants.TITLE_BEFORE_SCALE).setOrigin(Constants.TITLE_BEFORE_ORIGIN)
            .setFontSize(Constants.FIFTH_FONT_SIZE).setStroke(Constants.STR_ORANGE, Constants.TITLE_STROKE_WIDTH);
        var title3 = this.add.text(Constants.TITLE_BEFORE_X, Constants.TITLE_BEFORE_Y, 'Space', { fontFamily: 'CustomFont' })
            .setScale(Constants.TITLE_BEFORE_SCALE).setOrigin(Constants.TITLE_BEFORE_ORIGIN)
            .setFontSize(Constants.FIFTH_FONT_SIZE).setStroke(Constants.STR_ORANGE, Constants.TITLE_STROKE_WIDTH);
        CameraManager.addUISprite(title1);
        CameraManager.addUISprite(title2);
        CameraManager.addUISprite(title3);

        this.tweens.add({
            targets: title1,
            scale: Constants.TITLE_AFTER_SCALE,
            y: Constants.TITLE1_Y,
            delay: Constants.TITLE1_DELAY,
            duration: Constants.TITLE1_DURATION,
            ease: "Sine.easeIn"
        });

        this.tweens.add({
            targets: title2,
            scale: Constants.TITLE_AFTER_SCALE,
            y: Constants.TITLE2_Y,
            delay: Constants.TITLE2_DELAY,
            duration: Constants.TITLE2_DURATION,
            ease: "Sine.easeIn"
        });

        this.tweens.add({
            targets: title3,
            scale: Constants.TITLE_AFTER_SCALE,
            y: Constants.TITLE3_Y,
            delay: Constants.TITLE3_DELAY,
            duration: Constants.TITLE3_DURATION,
            ease: "Sine.easeIn"
        });
    }

    createPlayButton() {
        this.playButton = this.add.image(Constants.PLAY_BUTTON_X, Constants.PLAY_BUTTON_Y, 'play');
        CameraManager.addUISprite(this.playButton);

        this.playButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.playButton.setTint(Constants.ORANGE);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.playButton.setTint(Constants.WHITE);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.playButton.setTint(Constants.ORANGE);
                var load_audio = this.sound.add('load');
                load_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.playButton.setTint(Constants.WHITE);
                this.intro_music.stop()
                this.scene.start('Freeplay');
            })
    }
}