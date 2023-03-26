class Button extends Phaser.GameObjects.Sprite {
	constructor(_scene, _pos, _id, _text, _frame) {
		super(_scene, _pos.x, _pos.y, _id, _frame);

		this.actionKey = '';
		this.id = _scene.add.image(_pos.x, _pos.y, _id)
			.setOrigin(0.5)
			.setScale(0.5)
			.setDepth(100)
			.setVisible(0);
		this.text = _scene.add.text(_pos.x, _pos.y, _text, { fontSize: '26px', color: '#000000' })
			.setOrigin(0.5)
			.setDepth(100)
			.setVisible(0);
		this.menu_audio = _scene.sound.add('menu');
		//MenuManager.testListener(this);
		//MenuManager.restartButtonListener(_scene, this);
	}

	/**
	 * Set the text that appears on this button
	 * @param {string} _text - The new text to be displayed on this button
	 */
	setText(_text) {
		this.text.setText(_text);
	}

	setKey(_key) {
		//todo
	}

	/**
	 * Set the position of this button
	 * @param {Phaser.Geom.Point} _pos - The new position this button will be moved to
	 */
	setPosition(_pos) {
		this.id = _pos.x;
		this.id = _pos.y;
		this.text = _pos.x;
		this.text = _pos.y;
	}

	/**
	 * Set the depth of this button in the scene
	 * @param {number} _depth - The new depth this button will be set to
	 */
	setDepth(_depth) {
		this.id = _depth;
		this.text = _depth + 1;
	}

	/**
	 * Get only the clickable button component of this button
	 */
	getButton() {
		return this.id;
	}

	/**
	 * Get only the text component of this button
	 */
	getText() {
		return this.text;
	}

	/**
	 * Get both the button and text components of this button in the form of an array
	 */
	getElements() {
		return [this.id, this.text];
	}
}