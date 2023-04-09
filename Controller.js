/**
 * Class defining functionality for controling the probe
 */

const ControlMethod = {
    FourWay: Symbol("four_way"),
    Tank: Symbol("tank")
}


class Controller {
    constructor(_scene, _player) {
        this.scene = _scene;
        this.player = _player;

        this.controlMethod = ControlMethod.FourWay;

        this.pauseKey_setting = 'P';
        this.orbitKey_setting = 'SHIFT';
        this.pictureKey_setting = 'SPACE';
        this.d_up_setting = 'UP';
        this.d_down_setting = 'DOWN';
        this.d_left_setting = 'LEFT';
        this.d_right_setting = 'RIGHT';
        this.controlToggleKey_setting = 'C';
        this.mapKey_setting = 'm';

        this.keyboard = this.scene.input.keyboard;

        //default key settings
        this.pauseKey = this.keyboard.addKey(this.pauseKey_setting);
        this.orbitKey = this.keyboard.addKey(this.orbitKey_setting);
        this.pictureKey = this.keyboard.addKey(this.pictureKey_setting);
        this.d_up = this.keyboard.addKey(this.d_up_setting, true, true);
        this.d_down = this.keyboard.addKey(this.d_down_setting, true, true);
        this.d_left = this.keyboard.addKey(this.d_left_setting, true, true);
        this.d_right = this.keyboard.addKey(this.d_right_setting, true, true);
        this.controlToggleKey = this.keyboard.addKey(this.controlToggleKey_setting);

        this.maxAcc = 0.02;
        this.APT = 0.02;
        this.yAcc = 0;
        this.xAcc = 0;
        this.rotation = 0;
        this.totalRotation = 0;
        this.totalAcc = 0;

        this.orbitTarget = this.scene.bodies["earth"];

        this.updateKeyEvents();

        //temp just to view control changes. Remove later when we have an options menu for this.
        this.controlText = this.scene.add.text(4, 90, '0');
        this.controlText.setText("Controls: 4-Way");
        CameraManager.addUISprite(this.controlText);
    }

    /**
     * Updates the events for all keys in controller
     */
    updateKeyEvents() {
        //updating key settings in case of change
        this.pauseKey = this.keyboard.addKey(this.pauseKey_setting);
        this.orbitKey = this.keyboard.addKey(this.orbitKey_setting);
        this.pictureKey = this.keyboard.addKey(this.pictureKey_setting);
        this.mapKey = this.keyboard.addKey(this.mapKey_setting);

        this.d_up = this.keyboard.addKey(this.d_up_setting, true, true);
        this.d_down = this.keyboard.addKey(this.d_down_setting, true, true);
        this.d_left = this.keyboard.addKey(this.d_left_setting, true, true);
        this.d_right = this.keyboard.addKey(this.d_right_setting, true, true);

        this.pauseKey
            .on('down', () => {
                this.scene.updatePauseColor('pressed');
            }).on('up', () => {
                // disable pause when in the taking photo page
                if (!this.scene.takingPhoto) {
                    this.scene.togglePaused();
                    this.scene.resumeMap();
                }
                this.scene.updatePauseColor();
            });
        this.mapKey
            .on('up', () => {
                this.scene.updateMap();
            });

        this.orbitKey
            .on('down', () => {
                console.log("finding closest body...");
                if (!this.player.orbitToggle) {
                    this.player.findingTarget = true;
                }
            })
            .on('up', () => {
                this.player.findingTarget = false;
                this.scene.toggleOrbit();
                MenuManager.updateOrbitColor(this.scene, this.player.orbitToggle ? 'on' : null);
            });
        this.pictureKey
            .on('up', () => {
                this.scene.photoKeyEvent();
            });
        this.controlToggleKey
            .on('up', () => {
                if (this.controlMethod == ControlMethod.FourWay) {
                    this.controlMethod = ControlMethod.Tank;
                    this.controlText.setText("Controls: Tank in Space");
                }
                else {
                    this.controlMethod = ControlMethod.FourWay;
                    this.controlText.setText("Controls: 4-Way");
                }
            });
        this.d_up
            .on('down', () => {
                if (this.player.inOrbit && !this.player.isOrbitChanging()) {
                    this.player.addToOrbit(10);
                } else {
                    this.yAcc = -this.APT;
                    this.totalAcc = -this.APT;
                }
                if(TutorialManager.tutorialActivated() && this.scene.earthDone == true){
                    TutorialManager.movementTutor(1);
                }
            }).on('up', () => {
                this.yAcc = 0;
                this.totalAcc = 0;
            });
        this.d_down
            .on('down', () => {
                if (this.player.inOrbit && !this.player.isOrbitChanging()) {
                    this.player.addToOrbit(-10);
                } else {
                    this.yAcc = this.APT;
                    this.totalAcc = this.APT;
                }
                if(TutorialManager.tutorialActivated()){
                    TutorialManager.movementTutor(2);
                }
            }).on('up', () => {
                this.yAcc = 0;
                this.totalAcc = 0;
            });
        this.d_left
            .on('down', () => {
                if (this.player.inOrbit) {
                    this.rotation = -0.02;
                } else if (this.controlMethod == ControlMethod.Tank) {
                    this.rotation = -0.04;
                } else {
                    this.xAcc = -this.APT;
                }
                if(TutorialManager.tutorialActivated()){
                    TutorialManager.movementTutor(3);
                }
            }).on('up', () => {
                this.xAcc = 0;
                this.rotation = 0;
            });
        this.d_right
            .on('down', () => {
                if (this.player.inOrbit) {
                    this.rotation = 0.02;
                } else if (this.controlMethod == ControlMethod.Tank) {
                    this.rotation = 0.04;
                } else {
                    this.xAcc = this.APT;
                }
                if(TutorialManager.tutorialActivated()){
                    TutorialManager.loadMsg(2);
                }
            }).on('up', () => {
                this.xAcc = 0;
                this.rotation = 0;
            });
    }

    /** 
     * toggles the use of movement keys
     */
    toggleMovementKeys() {
        this.d_up.enabled = !this.d_up.enabled;
        this.d_down.enabled = !this.d_down.enabled;
        this.d_left.enabled = !this.d_left.enabled;
        this.d_right.enabled = !this.d_right.enabled;
    }

    /**
     * Gets the acceleration from player input
     * @returns {Phaser.Math.Vector2} The acceleration vector from player input
     */
    getAccelerationVector() {
        if (this.controlMethod == ControlMethod.Tank) {
            let accVector = new Phaser.Math.Vector2(1, 1).setLength(this.totalAcc).rotate(Phaser.Math.Angle.Wrap(this.totalRotation));
            return accVector;
        } else {
            let accVector = new Phaser.Math.Vector2(this.xAcc, this.yAcc);
            if (accVector.length() > this.maxAcc) { accVector.setLength(this.maxAcc) }
            return accVector;
        }
    }

    /**
     * Gets the control method currently being used by the game controller.
     * @returns {number} number representing control method.
     */
    getControlMethod() {
        return this.controlMethod
    }

    /**
     * Gets the current rotation from controller input
     * @returns {number} the rotation in degrees
     */
    getRotation() {
        this.totalRotation = this.totalRotation + this.rotation;
        if (this.controlMethod == ControlMethod.Tank && !this.player.inOrbit) {
            return this.totalRotation;
        } else {
            return this.rotation;
        }
    }

    up_pressed() {
        return this.d_up.isDown;
    }

    down_pressed() {
        return this.d_down.isDown;
    }

    left_pressed() {
        return this.d_left.isDown;
    }

    right_pressed() {
        return this.d_right.isDown;
    }
}