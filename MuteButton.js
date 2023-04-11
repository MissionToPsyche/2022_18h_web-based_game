class MuteButton {
	constructor(_scene, _type) {
		this.scene = _scene;
		this.type = _type;
		this.mutedButton = this.scene.add.image(Constants.MUTE_X, 
			Constants.MUTE_Y, 'muted').setScale(Constants.MUTE_SCALE);
		this.notmutedButton = this.scene.add.image(Constants.MUTE_X, 
        	Constants.MUTE_Y, 'notmuted').setScale(Constants.MUTE_SCALE);
		this.createMuteButton();
	}

	static isMuted = false;

	/**
     * create the mute button and related events.
     */
	createMuteButton() {
        this.mutedButton.depth = 100;
        this.notmutedButton.depth = 100;
        this.mutedButton.setVisible(false);

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
                this.scene.ingame_music.pause();
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
                let buttonSound = this.scene.sound.add('menu');
                buttonSound.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                // play background music
                this.scene.ingame_music.resume();
                MuteButton.isMuted = false;
                // switch button
                this.mutedButton.setVisible(false);
                this.notmutedButton.setVisible(true);
            });
	}

}