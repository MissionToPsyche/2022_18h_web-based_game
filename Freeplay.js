/**
 * Class representing the Phaser 'Scene', which defines our game
 * @extends Phaser.Scene
 */
class Freeplay extends Simulation {
    constructor() {
        super("Freeplay", ["earth", "moon", "psyche"], "earth");

        this.pauseText;
    }

    /**
     * Assembles the game within the scene
     * - Using information from data/bodies.json, Generate all bodies and add them to the scene
     * - Initialize the menu and game cameras
     * - Set the player as the probe
     * - Subscribe the probe to every body in the scene
     * - Generate UI sprites and add them to the scene
     * - Create player controls
     */
    create() {
        super.create()

        this.createPauseButton();
        this.createOrbitToggle();
    }

    /** The scene's main update loop
     * - Disallows the probe from escaping the solar system or going to fast
     * - Applies dynamic gravity
     * - Enforces the pause feature, only allowing bodies to move if the game is not paused
     */
    update() {
        this.updatePauseButton();
        this.updateTakePhoto();

        super.update()
    }

    /**
     * Draw the hint around the Psyche. At first it's a gray circle around psyche, 
     * as the player taking photos, the sides taken by the player will become orange.
     */


    /** Creates the image objects and associated events for the 
     *  game's pause button 
     */
    createPauseButton() {
        this.pauseMenu = new Menu(this);

        this.pauseText = this.add.text(525, 300, 'Pause').setOrigin(0.5).setFontSize(120);

        this.restartButtonPosition = new Phaser.Geom.Point(520, 408);
        this.restartButton = new Button(this, this.restartButtonPosition, 'button', 'Restart');
        MenuManager.restartButtonListener(this, this.restartButton);

        this.exitButtonPosition = new Phaser.Geom.Point(520, 508);
        this.exitButton = new Button(this, this.exitButtonPosition, 'button', 'Exit');
        MenuManager.exitButtonListener(this, this.exitButton);

        this.playButton = this.add.image(964, 708, 'play').setScale(0.5)
        this.pauseButton = this.add.image(964, 708, 'pause').setScale(0.5)

        this.playButton.depth = 100;
        this.pauseButton.depth = 100;
        this.pauseText.depth = 100;

        // To darken screen
        const color1 = new Phaser.Display.Color(0, 0, 0);
        this.shadow = this.add.rectangle(0, 0, 2048, 2048, color1.color);
        this.shadow.setAlpha(0.5);

        this.pauseMenu.addElement(this.pauseText);
        this.pauseMenu.addButton(this.restartButton.getElements());
        this.pauseMenu.addButton(this.exitButton.getElements());
        this.pauseMenu.addElement(this.shadow);

        //create events for the play button
        this.playButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.updatePauseColor('hover');
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.updatePauseColor();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.updatePauseColor('pressed');
                var menu_audio = this.sound.add('menu');
                menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                // disable pause when in the taking photo page
                if (!this.takingPhoto) {
                    this.updatePauseColor();
                    this.togglePaused();
                }
            })

        //create events for the pause button
        this.pauseButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.updatePauseColor('hover');
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.updatePauseColor();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.updatePauseColor('pressed');
                var menu_audio = this.sound.add('menu');
                menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                // disable pause when in the taking photo page
                if (!this.takingPhoto) {
                    this.updatePauseColor();
                    this.paused = !this.paused;
                }
            });

        //add all the images to the UI camera.
        CameraManager.addUISprite(this.playButton);
        CameraManager.addUISprite(this.pauseButton);
    }

    /**
     * updates the color of the pause and play buttons based on the given state of the button
     * @param {string} state The state of the button. Can be: hover, pressed or no value for default color
     */
    updatePauseColor(state) {
        switch (state) {
            case 'hover':
                this.pauseButton.setTint(0xF9A000);
                this.playButton.setTint(0xF9A000);
                break;
            case 'pressed':
                this.pauseButton.setTint(0xF47D33);
                this.playButton.setTint(0xF47D33);
                break;
            default:
                this.pauseButton.setTint(0xFFFFFF);
                this.playButton.setTint(0xFFFFFF);
        }
    }

    /**
     * Toggles the pause state of the scene
     */
    togglePaused() {
        this.paused = !this.paused;
        this.controller.toggleMovementKeys();
    }

    /** Updates the state of the on-screen pause button
     *  based on the current state of Freeplay.paused.
     */
    updatePauseButton() {
        // if paused and not game over then we can show the pause text and allow the pause/play buttons to update
        if (this.paused && !this.gameOver && !this.gameSuccess) {
            this.pauseText.setVisible(true)
            this.playButton.setVisible(true)
            this.pauseButton.setVisible(false);
            this.pauseMenu.setVisible(true);
        } else {
            this.pauseButton.setVisible(true);
            this.playButton.setVisible(false);
            this.pauseMenu.setVisible(false);
        }

        // if game over then show the game over text
        if (this.gameOver) {
            //this.failText.setVisible(true)
            this.pauseText.setText("Game Over!");
            this.pauseMenu.setVisible(true);

            this.pauseButton.setTint(0x7f7f7f);
            this.playButton.setTint(0x7f7f7f);
            this.orbitButton.setTint(0x7f7f7f);
        } else if (this.gameSuccess) {
            this.pauseButton.setTint(0x7f7f7f);
            this.playButton.setTint(0x7f7f7f);
            this.orbitButton.setTint(0x7f7f7f);
        }

        // if paused or game over then we can show the restart and exit buttons
        if (this.paused || this.gameOver || this.gameSuccess) {
            this.restartButton.setVisible(true)
            this.exitButton.setVisible(true)
            this.shadow.setVisible(false)
        } else {
            this.restartButton.setVisible(false)
            this.exitButton.setVisible(false)
            this.shadow.setVisible(false)
        }

    }



    /** Creates the button, key, and associated events
     *  For the orbit lock functionality.
     */
    createOrbitToggle() {
        this.orbitButton = this.add.image(56, 708, 'orbit').setScale(0.5);
        this.orbitButton.setTint(0xF47D33);
        CameraManager.addUISprite(this.orbitButton);

        this.orbitButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.updateOrbitColor('hover');
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.updateOrbitColor(this.bodies[Constants.PROBE].orbitToggle ? 'on' : null);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.updateOrbitColor('on');
                var menu_audio = this.sound.add('menu');
                menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.updateOrbitColor(this.bodies[Constants.PROBE].orbitToggle ? 'on' : null);
                if (!this.gameOver && !this.gameSuccess) {
                    this.toggleOrbit();
                }
            });
    }

    /**
     * updates the color of the orbit button based on the given state of the button
     * @param {string} state The state of the button. Can be: 'hover', 'on', or no value for default
     */
    updateOrbitColor(state) {
        switch (state) {
            case 'hover':
                this.orbitButton.setTint(0xF9A000);
                break;
            case 'on':
                this.orbitButton.setTint(0xF47D33);
                break;
            default:
                this.orbitButton.setTint(0xFFFFFF);
        }
    }

    /**
     * Toggles the orbit state of the probe
     */
    toggleOrbit() {
        if (!this.player.orbitToggle) {
            this.bodies[Constants.PROBE].startOrbitLock(this.player.newTarget);
        } else {
            this.bodies[Constants.PROBE].stopOrbitLock();
        }
    }
}
