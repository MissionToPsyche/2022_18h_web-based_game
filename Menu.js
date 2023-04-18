/**
 * Class representing a menu
 * A menu is composed of its elements, such as images, text and interactive buttons
 */
class Menu {
	constructor(_scene) {
		this.isVisible = false;
		this.scene = _scene;
		this.elements = [];
	}

	/**
	 * Allows you to add any element to this menu, such as an image or text
	 * @param {object} _element - An element that will belong to this menu
	 */
	addElement(_element) {
		_element.setVisible(false);
		this.elements.push(_element);
		CameraManager.addUISprite(_element);
	}

	/**
	 * Allows you to add a button to this menu
	 * @param {array} _button - An array containing the text and image of the button to add
	 */
	addButton(_button) {
		this.elements.push(_button[0]);
		this.elements.push(_button[1]);
		CameraManager.addUISprite(_button[0]);
		CameraManager.addUISprite(_button[1]);
	}

	/**
	 * Remove the specified element from this menu
	 * @param {object} _element - The element to remove
	 */
	removeElement(_element) {
		// todo
	}

	moveElement(_element, _scale, _y, _delay, _duration, _ease) {
		// move the element
		// todo
	}

	/**
	 * Set the visibility of this menu
	 * @param {boolean} _bool - Decides the visibility of this menu
	 */
	setVisible(_bool) {
		this.isVisible = _bool;
		this.elements.forEach(function (element) {
				element.setVisible(_bool);
		});
	}

	/**
	 * Toggle the visibility of this menu. If this menu is visible, it will be hidden.
	 * If this menu is hidden, it will become visible.
	 */
	toggleMenu() {
		this.elements.forEach(function (element) {
			if (element.visible) {
				element.setVisible(false);
			} else {
				element.setVisible(true);
			}
		});
	}
}