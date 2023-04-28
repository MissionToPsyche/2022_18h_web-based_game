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
        this.load.image('exit', 'img/icons/exit.png'); // an exit button
        // Key icons for control menu
        this.load.image('down', 'img/icons/downkey.png'); 
        this.load.image('right', 'img/icons/rightkey.png'); 
        this.load.image('left', 'img/icons/leftkey.png'); 
        this.load.image('up', 'img/icons/upkey.png'); 
        this.load.image('space', 'img/icons/space.png'); 
        this.load.image('p', 'img/icons/p.png'); 
        this.load.image('shift', 'img/icons/shift.png'); 

        this.load.audio('intro_music', 'assets/music/01_Psychemission_Menu.wav');
        this.load.audio('load', 'assets/sfx/load.wav');
        this.load.audio('menu', 'assets/sfx/misc_menu_4.wav');
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
        this.createControlButton();
    }

    update() {
    }

    createTitle() {
        var title1 = this.add.text(Constants.TITLE_BEFORE_X, Constants.TITLE_BEFORE_Y, 'Tour', { fontFamily: 'CustomFont' })
            .setScale(Constants.TITLE_BEFORE_SCALE).setOrigin(Constants.TITLE_BEFORE_ORIGIN)
            .setFontSize(Constants.FIFTH_FONT_SIZE).setStroke(Constants.STR_ORANGE, Constants.TITLE_STROKE_WIDTH)
            .setShadow(Constants.TITLE_SHADOW_OFFSET, Constants.TITLE_SHADOW_OFFSET, Constants.STR_DARKGRAY, Constants.TITLE_SHADOW_BLUR, true, true);
        var title2 = this.add.text(Constants.TITLE_BEFORE_X, Constants.TITLE_BEFORE_Y, 'de', { fontFamily: 'CustomFont' })
            .setScale(Constants.TITLE_BEFORE_SCALE).setOrigin(Constants.TITLE_BEFORE_ORIGIN)
            .setFontSize(Constants.FIFTH_FONT_SIZE).setStroke(Constants.STR_ORANGE, Constants.TITLE_STROKE_WIDTH)
            .setShadow(Constants.TITLE_SHADOW_OFFSET, Constants.TITLE_SHADOW_OFFSET, Constants.STR_DARKGRAY, Constants.TITLE_SHADOW_BLUR, true, true);
        var title3 = this.add.text(Constants.TITLE_BEFORE_X, Constants.TITLE_BEFORE_Y, 'Space', { fontFamily: 'CustomFont' })
            .setScale(Constants.TITLE_BEFORE_SCALE).setOrigin(Constants.TITLE_BEFORE_ORIGIN)
            .setFontSize(Constants.FIFTH_FONT_SIZE).setStroke(Constants.STR_ORANGE, Constants.TITLE_STROKE_WIDTH)
            .setShadow(Constants.TITLE_SHADOW_OFFSET, Constants.TITLE_SHADOW_OFFSET, Constants.STR_DARKGRAY, Constants.TITLE_SHADOW_BLUR, true, true);
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
                this.playButton.setTint(0xFFFFFF);
                this.scene.start('Intro');
                this.playButton.setTint(Constants.WHITE);
                this.intro_music.stop()
            })
    }

    createControlButton() {
        this.controlButton = this.add.image(520,618, 'control').setScale(0.5);
        CameraManager.addUISprite(this.controlButton);

        // To darken screen
        const color1 = new Phaser.Display.Color(0, 0, 0);
        this.shadow = this.add.rectangle(0, 0,2048, 2048, color1.color);
        this.shadow.setAlpha(0.85);
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
                var menu_audio = this.sound.add('menu');
                menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.controlButton.setTint(0xFFFFFF);
                this.shadow.setVisible(true);
                this.createControlMenu();
            })
    }

    createControlMenu() {
        //Control menu
        this.controlText = this.add.text(525, 100, 'CONTROLS',{ fontFamily: 'CustomFont'}).setOrigin(0.5).setFontSize(100);
        this.exitButton = this.add.image(520, 618, 'exit').setScale(0.5);
        // Storage for title of control.
        const controls = ['Move Forward', 'Move Backward', 'Move Left', 'Move Right', 'Pause Game', 'Take Picture', 'Toggle Orbit'];
        // Storage for icon images. 
        const icons = ['up', 'down', 'left', 'right', 'p', 'space', 'shift'];
        // Storage of all the titles and object created. 
        const objects = [];

        let row = 200;
        let col = 220;

        //Go through the list of icons and controls and make them appear. 
        for(let i = 0; i < controls.length; i++){
            this.icon = this.add.image(col, row + 10, icons[i]).setOrigin(0,0.5).setScale(0.2);
            objects.push(this.icon);
            this.title = this.add.text(col - 150 , row, controls[i], { fontFamily: 'CustomFont2'}).setFontSize(15);
            objects.push(this.title);
            row = row + 100;
            CameraManager.addUISprite(this.icon);
            CameraManager.addUISprite(this.title);
            // Keep 4 rows in each columns. 
            if(row == 600){
                row = 200;
                col = col + 300;
            }
        }

        // Disable button interactions. 
        this.playButton.disableInteractive();
        this.controlButton.disableInteractive();

        CameraManager.addUISprite(this.controlText);
        this.exitButton.setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
            this.exitButton.setTint(0xF9A000);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
            this.exitButton.setTint(0xFFFFFF);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            this.exitButton.setTint(0xF47D33);
            var menu_audio = this.sound.add('menu');
            menu_audio.play();
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            this.exitButton.setTint(0xFFFFFF);
            this.shadow.setVisible(false);
            this.exitButton.setVisible(false);
            this.controlText.setVisible(false);

            //Make all the objects that were created invisible. 
            while(objects.length > 0){
                objects.pop().setVisible(false);
            }

            this.createPlayButton();
            this.createControlButton();
        });
    }
}