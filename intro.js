class Intro extends Phaser.Scene {
    constructor() {
        super({ key: "Intro" });
        this.page;
        this.nextButton;
        this.introText;
        this.contentText;
        this.startButton;
        this.tutorialButton;
        this.done;
        this.doneTyping;
    }

    preload() {
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('border', 'img/icons/intro-border.png');
        this.load.image('start', 'img/icons/start.png'); // a start button
        this.load.image('tutorial', 'img/icons/tutorial.png'); // a tutorial button
        // typing sfx
        this.load.audio('key1', 'assets/sfx/key1.wav');
        this.load.audio('key2', 'assets/sfx/key2.wav');
        this.load.audio('key3', 'assets/sfx/key3.wav');
        this.load.audio('key4', 'assets/sfx/key4.wav');
        this.load.audio('key5', 'assets/sfx/key5.wav');

        this.load.audio('menu', 'assets/sfx/misc_menu_4.wav');
        this.load.audio('load', 'assets/sfx/load.wav');

        this.page = 1;
        this.done = false;
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

        // Shadow for the page. 
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
                // Stop from creating the page over and over.
                if(!this.done){
                    this.createPTwo();
                }
                break;
        }
 
    }

    createPage() {
        // Button to flip the page.
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
            var menu_audio = this.sound.add('menu');
            menu_audio.play();
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            this.page = this.page + 1;
        });

        // Start and tutorial button for the last page of the intro.
        this.startButton = this.add.image(620,618, 'start').setScale(0.4);
        this.tutorialButton = this.add.image(360,618, 'tutorial').setScale(0.4);
        CameraManager.addUISprite(this.startButton);
        CameraManager.addUISprite(this.tutorialButton);

        this.startButton.setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
            this.startButton.setTint(0xF9A000);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
            this.startButton.setTint(0xFFFFFF);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            this.startButton.setTint(0xF47D33);
            var load_audio = this.sound.add('load');
            load_audio.play();
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            this.startButton.setTint(0xFFFFFF);
            this.scene.start('Freeplay');
        });

        this.tutorialButton.setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
            this.tutorialButton.setTint(0xF9A000);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
            this.tutorialButton.setTint(0xFFFFFF);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            this.tutorialButton.setTint(0xF47D33);
            var load_audio = this.sound.add('load');
            load_audio.play();
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            this.tutorialButton.setTint(0xFFFFFF);
            DialogManager.set("tutorial");
            this.scene.start('Freeplay');
        })

        this.startButton.setVisible(false);
        this.tutorialButton.setVisible(false);
    }

createPTwo(){
        this.introText.setVisible(false);
        // Texts for last page of the intro.
        var content = "1. Find Psyche in the solar system.\n"
        + "2. Take pictures of Psyche.\n3. Get back to Earth.";

        var content2 = "Do not crash into other planets!";
        this.introText = this.add.text(325, 100, 'Mission Task:').setFontSize(50);
        CameraManager.addUISprite(this.introText);
        this.contentText = this.add.text(325,200, '');
        this.typewriteText(this.contentText, content);
        CameraManager.addUISprite(this.contentText);
        this.introText = this.add.text(325, 400, '').setFontSize(50);
        // Time delay for typewriter affect.
        this.time.addEvent({
            delay: 9000,
            callback: ()=>{
                this.typewriteText(this.introText,'Warning:');
            },
            loop: false
        })
        // Make the text red.
        this.introText.setFill('#F10A0A');
        this.contentText = this.add.text(325,450, '');

        this.time.addEvent({
            delay: 10500,
            callback: ()=>{
                this.typewriteText(this.contentText,content2);
            },
            loop: false
        })
        this.contentText.setFill('#F10A0A');
        CameraManager.addUISprite(this.contentText);
        CameraManager.addUISprite(this.introText);

        this.nextButton.setVisible(false);
        this.startButton.setVisible(true);
        this.tutorialButton.setVisible(true);
        this.done = true;
    }

    typewriteText(label,text){
	    const length = text.length
	    let i = 0
	    this.time.addEvent({
		    callback: () => {
			    label.text += text[i];
                if(text[i] != "\n" || text[i] != " "){
                    this.playTypefx();
                }
			    ++i;
		    },
		    repeat: length - 1,
		    delay: 100
	    })
    }

    playTypefx(){
        // Storage for sound keys. 
        const soundKeys = ['key1', 'key2', 'key3', 'key4', 'key5'];
        var rand = this.getRandomInt(5)
        var key_audio = this.sound.add(soundKeys[rand]);
        key_audio.play();
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}