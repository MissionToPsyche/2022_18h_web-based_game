/** Class in charge of managing the game's various menus */
class MenuManager {
	constructor() {
		if (this instanceof MenuManager) {
			throw Error('A static class cannot be instantiated.');
		}
	}

    /**
     * Listener for the restart button, which belongs to the pause menu
     * @param {Phaser.Scene} _scene - The scene this button belongs to
     * @param {Phaser.Image} _button - The image that represents this button
     */
	static restartButtonListener(_scene, _button) {
		_button.id.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                _button.id.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                _button.id.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                _button.id.setTint(0xF47D33);
                _button.menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                _button.id.setTint(0xFFFFFF);
                _scene.ingame_music.stop();
                _scene.scene.restart();
                _scene.paused = false
                _scene.gameOver = false;
                _scene.backgroundTiles = [];
                // Make the direction icon show up again.
                _scene.direction = undefined;
                _scene.isMapVisible = false;
            });
	}

    /**
     * Listener for the exit button, which belongs to the pause menu
     * @param {Phaser.Scene} _scene - The scene this button belongs to
     * @param {Phaser.Image} _button - The image that represents this button
     */
	static exitButtonListener(_scene, _button) {
		_button.id.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                _button.id.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                _button.id.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                _button.id.setTint(0xF47D33);
                _button.menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                _button.id.setTint(0xFFFFFF);
                _scene.ingame_music.stop();
                _scene.scene.start('MainMenu');
                _scene.paused = false;
                _scene.gameOver = false;
                _scene.isMapVisible = false;
                _scene.backgroundTiles = [];
            });
	}

    /**
     * Listener for the play button, which is associated with the pause menu
     * @param {Phaser.Scene} _scene - The scene this button belongs to
     * @param {Phaser.Image} _button - The image that represents this button
     */
    static playButtonListener(_scene, _button) {
        _button.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.updatePauseColor(_scene, 'hover');
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.updatePauseColor(_scene);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.updatePauseColor(_scene, 'pressed');
                if (!_scene.gameOver) {
                    var menu_audio = _scene.sound.add('menu');
                    menu_audio.play();
                }
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                // disable pause when in the taking photo page
                if (!_scene.takingPhoto) {
                    this.updatePauseColor(_scene);
                    _scene.togglePaused();
                }
            });
    }

    /**
     * Listener for the pause button, which is associated with the pause menu
     * @param {Phaser.Scene} _scene - The scene this button belongs to
     * @param {Phaser.Image} _button - The image that represents this button
     */
    static pauseButtonListener(_scene, _button) {
        _button.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.updatePauseColor(_scene, 'hover');
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.updatePauseColor(_scene);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.updatePauseColor(_scene, 'pressed');
                if (!_scene.gameOver) {
                    var menu_audio = _scene.sound.add('menu');
                    menu_audio.play();
                }
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                // disable pause when in the taking photo page
                if (!_scene.takingPhoto) {
                    this.updatePauseColor(_scene);
                    _scene.togglePaused();
                }
            });
    }

    /**
     * Listener for the orbit button, which belongs to the heads-up display
     * @param {Phaser.Scene} _scene - The scene this button belongs to
     * @param {Phaser.Image} _button - The image that represents this button
     */
    static orbitButtonListener(_scene, _button) {
        _scene.orbitButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.updateOrbitColor(_scene, 'hover');
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.updateOrbitColor(_scene, _scene.bodies["psyche_probe"].orbitToggle ? 'on' : null);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.updateOrbitColor(_scene, 'on');
                if (!_scene.gameOver) {
                    var menu_audio = _scene.sound.add('menu');
                    menu_audio.play();
                }
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.updateOrbitColor(_scene, _scene.bodies["psyche_probe"].orbitToggle ? 'on' : null);
                if(!_scene.gameOver && !_scene.gameSuccess) {
                    _scene.toggleOrbit();
                }
            });
    }

    /**
     * Creates a pause menu in the Phaser scene specified by _scene
     * @param {Phaser.Scene} _scene - The scene this menu belongs to
     */
    static createPauseMenu(_scene) {
        _scene.pauseMenu = new Menu(_scene);

        _scene.pauseText = _scene.add.text(525, 300, 'Pause').setOrigin(0.5).setFontSize(120);

        _scene.restartButtonPosition = new Phaser.Geom.Point(520, 408);
        _scene.restartButton = new Button(_scene, _scene.restartButtonPosition, 'button', 'Restart');
        this.restartButtonListener(_scene, _scene.restartButton);

        _scene.exitButtonPosition = new Phaser.Geom.Point(520, 508);
        _scene.exitButton = new Button(_scene, _scene.exitButtonPosition, 'button', 'Exit');
        this.exitButtonListener(_scene, _scene.exitButton);

        _scene.playButton = _scene.add.image(964, 708, 'play').setScale(0.5)
        _scene.pauseButton = _scene.add.image(964, 708, 'pause').setScale(0.5)
        this.playButtonListener(_scene, _scene.playButton);
        this.pauseButtonListener(_scene, _scene.pauseButton);

        _scene.playButton.depth = 100;
        _scene.pauseButton.depth = 100;
        _scene.pauseText.depth = 100;

        // To darken screen
        const color1 = new Phaser.Display.Color(0, 0, 0);
        _scene.shadow = _scene.add.rectangle(0, 0,2048, 2048, color1.color);
        _scene.shadow.setAlpha(0.5);

        _scene.pauseMenu.addElement(_scene.pauseText);
        _scene.pauseMenu.addButton(_scene.restartButton.getElements());
        _scene.pauseMenu.addButton(_scene.exitButton.getElements());
        _scene.pauseMenu.addElement(_scene.shadow);

        // Since these buttons are not technically part a menu, we need to manually
        // add all them to the UI camera.
        CameraManager.addUISprite(_scene.playButton);
        CameraManager.addUISprite(_scene.pauseButton);
    }

    /**
     * Allows us to hide and show the pause menu depending on game state
     * @param {Phaser.Scene} _scene - The scene this menu belongs to
     */
    static updatePauseMenu(_scene) {
        // if paused and not game over then we can show the pause text and allow the pause/play buttons to update
        if (_scene.paused && !_scene.gameOver && !_scene.gameSuccess) {
            _scene.pauseText.setVisible(true)
            _scene.playButton.setVisible(true)
            _scene.pauseButton.setVisible(false);
            _scene.pauseMenu.setVisible(true);
            _scene.HUD.setVisible(false);
        } else {
            _scene.pauseButton.setVisible(true);
            _scene.playButton.setVisible(false);
            _scene.pauseMenu.setVisible(false);
            _scene.HUD.setVisible(true);
        }

        // if game over then show the game over text
        if (_scene.gameOver) {
            //this.failText.setVisible(true)
            _scene.pauseText.setText("Game Over!");
            _scene.playButton.setVisible(true);
            _scene.pauseButton.setVisible(false);
            _scene.pauseMenu.setVisible(true);
            _scene.HUD.setVisible(false);

            _scene.pauseButton.setTint(0x7f7f7f);
            _scene.playButton.setTint(0x7f7f7f);
            _scene.orbitButton.setTint(0x7f7f7f);
        } else if (_scene.gameSuccess) {
            _scene.pauseButton.setTint(0x7f7f7f);
            _scene.playButton.setTint(0x7f7f7f);
            _scene.orbitButton.setTint(0x7f7f7f);
        }

        // if paused or game over then we can show the restart and exit buttons
        if (_scene.paused || _scene.gameOver || _scene.gameSuccess) {
            _scene.restartButton.setVisible(true)
            _scene.exitButton.setVisible(true)
            _scene.shadow.setVisible(true)
        } else {
            _scene.restartButton.setVisible(false)
            _scene.exitButton.setVisible(false)
            _scene.shadow.setVisible(false)
        }
    }

    /**
     * Creates a heads-up display in the Phaser scene specified by _scene
     * @param {Phaser.Scene} _scene - The scene this menu belongs to
     */
    static createHeadsUpDisplay(_scene) {
        _scene.HUD = new Menu(_scene);

        _scene.logo = _scene.add.image(50,50,'logo').setScale(0.5);
        _scene.mapBorder = _scene.add.image(880,110,'minimap_border').setScale(0.35);
        _scene.orbitButton = _scene.add.image(56, 708, 'orbit').setScale(0.5);
        _scene.orbitButton.setTint(0xF47D33);

        _scene.HUD.addElement(_scene.logo);
        _scene.HUD.addElement(_scene.controller.controlText);
        _scene.HUD.addElement(CameraManager.miniCamera);
        _scene.HUD.addElement(_scene.mapBorder);
        _scene.HUD.addElement(_scene.orbitButton);

        this.orbitButtonListener(_scene, _scene.orbitButton);
    }

    /**
     * Updates the color of the pause and play buttons based on the given state of the button
     * @param (Phaser.Scene) _scene - The scene these buttons belong to
     * @param {string} _state - The state of the button. Can be: hover, pressed or no value for default color
     */
    static updatePauseColor(_scene, _state) {
        switch (_state) {
            case 'hover':
                _scene.pauseButton.setTint(0xF9A000);
                _scene.playButton.setTint(0xF9A000);
                break;
            case 'pressed':
                _scene.pauseButton.setTint(0xF47D33);
                _scene.playButton.setTint(0xF47D33);
                break;
            default:
                _scene.pauseButton.setTint(0xFFFFFF);
                _scene.playButton.setTint(0xFFFFFF);
        }
    }

    /**
     * Updates the color of the orbit button based on the given state of the button
     * @param (Phaser.Scene) _scene - The scene these buttons belong to
     * @param {string} _state - The state of the button. Can be: 'hover', 'on', or no value for default
     */
    static updateOrbitColor(_scene, _state) {
        switch (_state) {
            case 'hover':
                _scene.orbitButton.setTint(0xF9A000);
                break;
            case 'on':
                _scene.orbitButton.setTint(0xF47D33);
                break;
            default:
                _scene.orbitButton.setTint(0xFFFFFF);
        }
    }
}