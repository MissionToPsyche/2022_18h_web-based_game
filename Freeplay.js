/**
 * Class representing the Phaser 'Scene', which defines our game
 * @extends Phaser.Scene
 */
class Freeplay extends Simulation {
    constructor() {
        super("Freeplay");

        this.paused = false;
        this.direction;
        this.gameOver = false;
        this.gameSuccess = false;
        this.pauseText;

        this.takingPhoto = false;
        this.foundPsycheText;
        this.quitPhotoPageButton;
        this.psychePhotos;
        this.photoBackground;
        this.photoBorder;
        this.nearestBodyText;

        this.targetAngles; // array of target angles that the player need to take photo
        this.coverFlags; // array of flags that the player already took photo
    }

    preload() {
        super.preload()

        // load the photo of psyche
        this.load.image('psychePhoto1', "img/photos/psyche1.png");
        for (let i = 0; i < Constants.MAX_PSYCHE_PHOTO_NUM; i++) {
            let imageName = "psychePhoto" + i;
            let filePath = "img/photos/images/psyche_e_0" + (i + 1) + ".png";
            this.load.image(imageName, filePath);
        }
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
        this.takePhoto();
    }

    /** The scene's main update loop
     * - Disallows the probe from escaping the solar system or going to fast
     * - Applies dynamic gravity
     * - Enforces the pause feature, only allowing bodies to move if the game is not paused
     */
    update() {
        this.updatePauseButton();
        this.updateTakePhoto();

        // don't update bodies if paused, game over, or is taking photo
        if (this.paused || this.gameOver || this.gameSuccess || this.takingPhoto) {
            for (const body in this.bodies) {
                this.bodies[body].stop()
            }

            return
        }

        // check to see if the probe collided with anything
        // if there was a collision then trigger the failure state and stop the simulation
        if (this.bodies["psyche_probe"].collided && !this.gameOver) {
            this.gameOver = true;
            var fail_audio = this.sound.add('negative');
            fail_audio.play();
        }

        this.graphics.clear(); //clear previous itteration's graphics
        this.minigraphics.clear();

        //if the camera is changing it's follow target,
        //slowly move to the position of target before targeting it
        //to prevent sudded camera jerks.
        if (CameraManager.isCamChanging()) {
            CameraManager.checkDoneChanging();
        }

        //for probe's gravity lock functionality:
        if (this.player.findingTarget) {
            var target = this.player.newTarget;
            var path = new Phaser.Geom.Circle(target.x, target.y, target.r + 5).getPoints(false, 0.5);
            let ind = new Phaser.Curves.Spline(path);

            this.graphics.lineStyle(Constants.HINT_WIDTH_BEFORE, Constants.WHITE, Constants.HINT_ALPHA_BEFORE);
            ind.draw(this.graphics, 64);
            this.graphics.fillStyle(0xffffff, 1);
        }
        else if (this.bodies["psyche_probe"].orbitToggle && !this.bodies["psyche_probe"].inOrbit) {
            let ratio = this.bodies["psyche_probe"].maintainOrbit(this);
            let subRadius = ratio * this.player.orbitTarget.r + (5 * (1 - ratio));
            if (!subRadius) {
                subRadius = this.player.orbitTarget.r;
            }

            //creating orbit lock progress indicator
            var path = new Phaser.Geom.Circle(this.player.orbitTarget.x, this.player.orbitTarget.y, this.player.orbitTarget.r + subRadius).getPoints(false, 0.5); //path of the indicator.
            let ind = new Phaser.Curves.Spline(path);
            let subPoints = path.length * ratio;

            this.graphics.lineStyle(Constants.HINT_WIDTH_BEFORE, Constants.WHITE, Constants.HINT_ALPHA_BEFORE);
            ind.draw(this.graphics, 64);

            path.splice(Math.floor(subPoints));

            if (path.length > 0) {
                let prog = new Phaser.Curves.Spline(path);

                this.graphics.lineStyle(Constants.HINT_WIDTH_BEFORE, Constants.ORANGE, Constants.HINT_ALPHA_AFTER);
                prog.draw(this.graphics, 64);
                this.graphics.fillStyle(0x00ff00, 1);
            }
        } else if (this.bodies["psyche_probe"].inOrbit) {
            //draw the orbit boundries if probe is locked in an orbit
            this.graphics.lineStyle(1, 0xff0000, 0.5);
            this.bodies["psyche_probe"].getOrbitPath('new').draw(this.graphics, 64);
            this.graphics.fillStyle(0x00ff00, 1);

            this.graphics.lineStyle(1, 0x0000ff, 0.5);
            this.bodies["psyche_probe"].getOrbitPath('cur').draw(this.graphics, 64);
            this.graphics.fillStyle(0x00ff00, 1);
        }

        for (const body in this.bodies) {
            //apply dynamic gravity
            //NOTE: THIS IS A BAD PLACE TO DO THIS. MOVE THIS TO AN APPROPRIATE PLACE LATER!!
            this.bodies[body].notify()

            //draw paths
            var path = this.bodies[body].path;
            if (path && path.length > 0) {
                this.graphics.lineStyle(1, 0xffffff, 0.5);
                this.minigraphics.lineStyle(75, 0xffffff, 0.5);
                let curve = this.bodies[body].getPathCurve();
                curve.draw(this.graphics, 64);
                curve.draw(this.minigraphics, 64)

                this.graphics.fillStyle(0x00ff00, 1);
                this.minigraphics.fillStyle(0x00ff00, 1);
            }

            //update body positions
            this.bodies[body].updatePosition(this)

            if (body != "psyche_probe") {
                var p1 = new Phaser.Geom.Point(this.bodies["sun"].x, this.bodies["sun"].y);
                var p2 = new Phaser.Geom.Point(this.bodies[body].x, this.bodies[body].y);
                let sunAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                sunAngle = Phaser.Math.RadToDeg(sunAngle)

                if (sunAngle < 0) {
                    sunAngle += 360;
                } else if (sunAngle > 360) {
                    sunAngle -= 360;
                }
                for (const idx in Constants.SHADE_ANGLES) {
                    const angle = Constants.SHADE_ANGLES[idx]
                    if ((angle[0] < sunAngle && sunAngle <= angle[1]) || (angle[0] > angle[1] && (angle[0] < sunAngle || sunAngle <= angle[1]))) {
                        this.bodies[body].play(this.bodies[body].id + "-" + Constants.DIRECTIONS[idx], true);
                        break;
                    } else if (angle[0] > angle[1] && (angle[0] < sunAngle || sunAngle <= angle[1])) {
                        this.bodies[body].play(this.bodies[body].id + "-" + Constants.DIRECTIONS[idx], true);
                        break;
                    }
                }
            } else {
                const frame = 20;
                this.bodies[body].setFrame(frame);
            }
        }

        this.psyche_probe_fx.setRotation(this.bodies["psyche_probe"].rotation);
        this.psyche_probe_fx.setPosition(this.bodies["psyche_probe"].x, this.bodies["psyche_probe"].y);

        if (this.controller.up_pressed()) {
            this.psyche_probe_fx.setVisible(true);
            this.psyche_probe_fx.play("psyche_probe_fx-thrust", true);
        } else if ((this.controller.left_pressed() || this.controller.right_pressed() || this.controller.down_pressed()) && this.controller.controlMethod == ControlMethod.FourWay) {
            this.psyche_probe_fx.setVisible(true);
            this.psyche_probe_fx.play("psyche_probe_fx-thrust", true);
        } else if (this.controller.down_pressed() && this.controller.controlMethod == ControlMethod.Tank) {
            this.psyche_probe_fx.setVisible(true);
            this.psyche_probe_fx.play("psyche_probe_fx-brake", true);
        } else {
            this.psyche_probe_fx.setVisible(false);
            this.psyche_probe_fx.stop();
        }

        // find psyche
        let distance = this.bodies["psyche_probe"].getDistance("psyche");

        // the distance between pshche probe and the arrow
        let arrowDistance = 100;
        let width = 1024;
        let height = 768;
        let directionX = width / 2 + this.bodies["psyche_probe"].getPsycheDirectionX() * arrowDistance;
        let directionY = height / 2 + this.bodies["psyche_probe"].getPsycheDirectionY() * arrowDistance;

        // calculate the rotation of the arrow image
        let directionAngle = Math.asin(this.bodies["psyche_probe"].getPsycheDirectionY());
        if (this.bodies["psyche_probe"].getPsycheDirectionX() < 0) {
            directionAngle = Math.PI - directionAngle;
        }

        // add the image of the arrow if it not added
        if (typeof (this.direction) == "undefined") {
            this.direction = this.add.image(directionX, directionY, 'direction').setScale(0.3);
            CameraManager.addUISprite(this.direction);
            // make the direction indicator not on top of other page such as pause menu
            this.direction.depth = -1;
        }

        if (this.bodies["psyche_probe"].orbitToggle) {

            // earth is not the center, edit direction
            let centerX = CameraManager.getCameraCenter().x;
            let centerY = CameraManager.getCameraCenter().y;

            let offsetX = centerX - this.bodies["psyche_probe"].x;
            let offsetY = centerY - this.bodies["psyche_probe"].y;

            let zoom = CameraManager.getMainCameraZoom();

            offsetX *= zoom;
            offsetY *= zoom;

            directionX -= offsetX;
            directionY -= offsetY;
        }

        // set the correct position and angle of the arrow to point to psyche
        this.direction.setPosition(directionX, directionY);
        this.direction.rotation = directionAngle;

        // decrease opacity when near psyche
        if (distance < 90) {
            this.direction.alpha = (distance - 50) / 50;
        } else {
            this.direction.alpha = 0.8;
        }

        // create probe's view
        let centerX = this.bodies["psyche_probe"].x;
        let centerY = this.bodies["psyche_probe"].y;
        let viewR = 100;
        this.graphics.fillStyle(0xFFFFFF, 0.3);

        let endRotation = this.bodies["psyche_probe"].rotation + (3 * Math.PI / 4);
        if (endRotation > 2 * Math.PI) {
            endRotation -= (2 * Math.PI);
        }
        let startRotation = endRotation + (Math.PI / 2);
        if (startRotation > 2 * Math.PI) {
            startRotation -= (2 * Math.PI);
        }

        let probeView = this.graphics.slice(centerX, centerY, viewR, startRotation, endRotation, true);

        this.graphics.fillPath();

        this.drawHint();
    }

    /**
     * Draw the hint around the Psyche. At first it's a gray circle around psyche, 
     * as the player taking photos, the sides taken by the player will become orange.
     */
    drawHint() {
        // a dashed line around psyche
        let psycheX = this.bodies["psyche"].x;
        let psycheY = this.bodies["psyche"].y;
        let strokeSize = this.bodies["psyche"].r + Constants.HINT_DISTANCE;
        this.graphics.lineStyle(Constants.HINT_WIDTH_BEFORE, Constants.WHITE, Constants.HINT_ALPHA_BEFORE);

        const segments = 32;
        const angleStep = (2 * Math.PI) / segments;

        for (let i = 0; i < segments; i += 2) {
            let startX = Math.cos(i * angleStep) * strokeSize + psycheX;
            let startY = Math.sin(i * angleStep) * strokeSize + psycheY;
            let endX = Math.cos((i + 1) * angleStep) * strokeSize + psycheX;
            let endY = Math.sin((i + 1) * angleStep) * strokeSize + psycheY;

            this.graphics.lineStyle(Constants.HINT_WIDTH_BEFORE, Constants.WHITE, Constants.HINT_ALPHA_BEFORE);
            this.graphics.lineBetween(startX, startY, endX, endY);
        }

        // draw arcs for the covered target angles
        if (typeof (this.targetAngles) != "undefined") {
            let arcSize = 180 / this.targetAngles.length;
            for (let i = 0; i < this.targetAngles.length; i++) {
                if (this.coverFlags[i] == 1) {
                    GraphicsUtils.arcAround(psycheX, psycheY, strokeSize, this.targetAngles[i], arcSize);
                }
            }
        }
    }

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

    updateTakePhoto() {
        if (!this.takingPhoto) {
            this.foundPsycheText.setVisible(false);
            this.quitPhotoPageButton.setVisible(false);
            this.hidePsychePhotos();
            this.nearestBodyText.setVisible(false);
        } else if (this.gameSuccess) {
            this.foundPsycheText.setVisible(true);
            this.quitPhotoPageButton.setVisible(false);
            this.nearestBodyText.setVisible(false);
        } else {
            this.quitPhotoPageButton.setVisible(true);
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
                this.updateOrbitColor(this.bodies["psyche_probe"].orbitToggle ? 'on' : null);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.updateOrbitColor('on');
                var menu_audio = this.sound.add('menu');
                menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.updateOrbitColor(this.bodies["psyche_probe"].orbitToggle ? 'on' : null);
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
            this.bodies["psyche_probe"].startOrbitLock(this.player.newTarget);
            this.bodies["psyche_probe"].orbitToggle = true;
        } else {
            this.bodies["psyche_probe"].stopOrbitLock();
            this.bodies["psyche_probe"].orbitToggle = false;
        }
    }

    takePhoto() {
        this.photoBorder = this.add.rectangle(Constants.PSYCHE_PHOTO_X,
            Constants.PSYCHE_PHOTO_Y, Constants.PHOTO_BACKGROUND_WIDTH + Constants.PHOTO_BORDER,
            Constants.PHOTO_BACKGROUND_HEIGHT + Constants.PHOTO_BORDER, Constants.WHITE);
        this.photoBackground = this.add.rectangle(Constants.PSYCHE_PHOTO_X,
            Constants.PSYCHE_PHOTO_Y, Constants.PHOTO_BACKGROUND_WIDTH,
            Constants.PHOTO_BACKGROUND_HEIGHT, Constants.DARKBLUE);

        CameraManager.addUISprite(this.photoBorder);
        CameraManager.addUISprite(this.photoBackground);

        this.psychePhotos = new Array(Constants.MAX_PSYCHE_PHOTO_NUM);
        for (let i = 0; i < Constants.MAX_PSYCHE_PHOTO_NUM; i++) {
            let imageName = "psychePhoto" + i;
            this.psychePhotos[i] = this.add.image(Constants.PSYCHE_PHOTO_X,
                Constants.PSYCHE_PHOTO_Y, imageName)
                .setScale(Constants.PSYCHE_PHOTO_SCALE);
            CameraManager.addUISprite(this.psychePhotos[i]);

        }

        this.hidePsychePhotos();

        this.foundPsycheText = this.add.text(Constants.FOUND_PSYCHE_TEXT_X, Constants.FOUND_PSYCHE_TEXT_Y, 'You found Psyche!');
        this.foundPsycheText.setFontSize(Constants.THIRD_FONT_SIZE);
        this.foundPsycheText.depth = 1000; // larger than 100
        this.nearestBodyText = this.add.text(Constants.NEAREST_BODY_TEXT_X, Constants.NEAREST_BODY_TEXT_Y, ' ');
        this.nearestBodyText.setFontSize(Constants.SECOND_FONT_SIZE);
        CameraManager.addUISprite(this.foundPsycheText);

        // TODO: can let the player to choose difficulty
        // here default is to take photo of the psyche from four sides
        this.targetAngles = Constants.FOUR_SIDES;
        this.coverFlags = new Array(this.targetAngles.length).fill(0);

        this.quitPhotoPageButton = this.add.text(Constants.QUIT_PHOTO_X, Constants.QUIT_PHOTO_Y, 'Back to game')
            .setFontSize(Constants.THIRD_FONT_SIZE)
            .setStyle({
                color: '#111',
                backgroundColor: '#fff',
            })
            .setPadding(Constants.QUIT_PHOTO_PADDING)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.takingPhoto = !this.takingPhoto;
                this.quitPhotoPageButton.setVisible(false);

            })
            .setVisible(false);
        CameraManager.addUISprite(this.quitPhotoPageButton);
    }

    /**
     * Event for when the photo key is pressed
     */
    photoKeyEvent() {
        // disable spacebar take photo when paused
        if ((!this.paused) && (!this.gameOver) && (!this.gameSuccess)) {
            this.takingPhoto = !this.takingPhoto;

            let viewR = Constants.VIEW_R;
            let endRotation = this.bodies["psyche_probe"].rotation + Math.PI;
            if (endRotation > 2 * Math.PI) {
                endRotation -= (2 * Math.PI);
            }
            let startRotation = endRotation + Phaser.Math.DegToRad(90);
            if (startRotation > 2 * Math.PI) {
                startRotation -= (2 * Math.PI);
            }

            // check if pyche is in the view
            if (this.bodies["psyche_probe"].isInView("psyche", viewR, startRotation, endRotation)) {
                this.foundPsycheText.setVisible(true);

                // Psyche is in the view, check the side
                let psycheAngle = Math.asin(this.bodies["psyche_probe"].getPsycheDirectionY());
                if (this.bodies["psyche_probe"].getPsycheDirectionX() < 0) {
                    psycheAngle = Math.PI - psycheAngle;
                }
                psycheAngle = Phaser.Math.RadToDeg(psycheAngle);

                if (psycheAngle < 0) {
                    psycheAngle += 360;
                }

                if (psycheAngle > 360) {
                    psycheAngle -= 360;
                }

                // now psycheAngle is a positive degree number between 0 and 360
                // check if psycheAngle covers target angle
                for (let i = 0; i < this.targetAngles.length; i++) {
                    if ((Math.abs(psycheAngle - this.targetAngles[i]) <= Constants.ONE_PHOTO_ANGLE)
                        || (Math.abs(psycheAngle - this.targetAngles[i] + 360) <= Constants.ONE_PHOTO_ANGLE)
                        || (Math.abs(psycheAngle - this.targetAngles[i] - 360) <= Constants.ONE_PHOTO_ANGLE)) {
                        this.showPsychePhoto(i);
                        // this photo covers the target angle targetAngles[i], set the flag
                        if (this.coverFlags[i] == 1) {
                            this.foundPsycheText.setText("You have already taken\nphoto of this side, please\ntake photo of other sides.");
                        } else {
                            // taking photo, play positive sfx
                            var positive_audio = this.sound.add('positive');
                            positive_audio.play();
                            this.coverFlags[i] = 1;
                            this.foundPsycheText.setText("Good job! You just took\nphoto of a new Psyche side!");
                        }
                    }
                }

                // check sides covered
                let sidesCovered = 0;
                for (let i = 0; i < this.coverFlags.length; i++) {
                    if (this.coverFlags[i] == 1) {
                        sidesCovered++;
                    }
                }
                console.log("now " + sidesCovered + " of " + this.coverFlags.length + " sides covered");

                if (sidesCovered == this.coverFlags.length) {
                    // covered all sides
                    this.gameSuccess = true;
                    this.foundPsycheText.setText("Good job! You successfully\ncovered all Psyche sides!");
                    this.quitPhotoPageButton.setVisible(false);
                }

            } else {
                // check which body is in the view and choose the nearest one
                let currentDistance = 1000; // random big number
                let nearestBody = null;
                for (var body in this.bodies) {
                    if (this.bodies["psyche_probe"].isInView(body, viewR, startRotation, endRotation)) {
                        // this body is in probe's view, keep the distance
                        let thisBodyDistance = this.bodies["psyche_probe"].getDistance(body);
                        if (thisBodyDistance < currentDistance) {
                            currentDistance = thisBodyDistance;
                            nearestBody = body;
                        }
                    }
                }

                let nearestInfo = "";
                if (nearestBody != null) {
                    nearestInfo = "You found the ";
                    nearestInfo += nearestBody.charAt(0).toUpperCase();
                    nearestInfo += nearestBody.slice(1);
                    nearestInfo += ", \nbut you should try \nto find the Psyche.";
                }

                this.nearestBodyText.setText(nearestInfo);
                this.nearestBodyText.setVisible(true);
            }
        }
    }

    /**
     * hide all the psyche photos.
     */
    hidePsychePhotos() {
        this.photoBorder.setVisible(false);
        this.photoBackground.setVisible(false);
        for (let i = 0; i < Constants.MAX_PSYCHE_PHOTO_NUM; i++) {
            if (typeof (this.psychePhotos[i]) != "undefined") {
                this.psychePhotos[i].setVisible(false);
            }
        }
    }

    /**
     * show the psyche photo at a specific index. 
     * @param {number} idx - index of the psyche photo.
     */
    showPsychePhoto(idx) {
        this.photoBorder.setVisible(true);
        this.photoBackground.setVisible(true);
        for (let i = 0; i < Constants.MAX_PSYCHE_PHOTO_NUM; i++) {
            if (typeof (this.psychePhotos[i]) != "undefined") {
                if (i == idx) {
                    this.psychePhotos[i].setVisible(true);
                } else {
                    this.psychePhotos[i].setVisible(false);
                }
            }
        }
    }
}
