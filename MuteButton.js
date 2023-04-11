class MuteButton {
	constructor(_scene, _music, _type) {
		this.scene = _scene;
		this.music = _music;
		if (_type == Constants.MUTE_FREEPLAY) {
			this.mutedButton = this.scene.add.image(Constants.MUTE_X, 
				Constants.MUTE_Y, 'muted').setScale(Constants.MUTE_SCALE);
			this.notmutedButton = this.scene.add.image(Constants.MUTE_X, 
	        	Constants.MUTE_Y, 'notmuted').setScale(Constants.MUTE_SCALE);
		} else {
			this.mutedButton = this.scene.add.image(Constants.MUTE_X2, 
				Constants.MUTE_Y2, 'muted');
			this.notmutedButton = this.scene.add.image(Constants.MUTE_X2, 
	        	Constants.MUTE_Y2, 'notmuted');
		}
		this.createMuteButton();

			
	}

	static isMuted = false;

	/**
     * create the mute button and related events.
     */
	createMuteButton() {
        this.mutedButton.depth = 100;
        this.notmutedButton.depth = 100;
        if (MuteButton.isMuted) {
        	this.mutedButton.setVisible(true);
        	this.notmutedButton.setVisible(false);
        	this.music.pause();
        } else {
        	this.mutedButton.setVisible(false);
        	this.notmutedButton.setVisible(true);
        }

        CameraManager.addUISprite(this.mutedButton);
        CameraManager.addUISprite(this.notmutedButton);

        // events of not muted button
        this.notmutedButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                // set color to orange
                this.notmutedButton.setTint(Constants.ORANGE);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                // set color to white
                this.notmutedButton.setTint(Constants.WHITE);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                // set color to orange and play sound
                this.notmutedButton.setTint(Constants.ORANGE);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                // pause background music
                this.music.pause();
                MuteButton.isMuted = true;
                // switch button
                this.notmutedButton.setVisible(false);
                this.mutedButton.setVisible(true);
            });

        // events of muted button
        this.mutedButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                // set color to orange
                this.mutedButton.setTint(Constants.ORANGE);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                // set color to white
                this.mutedButton.setTint(Constants.WHITE);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                // set color to orange and play sound
                this.mutedButton.setTint(Constants.ORANGE);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                // play background music
                this.music.resume();
                MuteButton.isMuted = false;
                // switch button
                this.mutedButton.setVisible(false);
                this.notmutedButton.setVisible(true);
            });
	}

}