/**
 * Class representing a menu
 * A menu is composed of its elements, such as images, text and interactive buttons
 */
class Menu {
	constructor(_scene) {
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

	addButton(_button) {
		this.elements.push(_button[0]);
		this.elements.push(_button[1]);
		CameraManager.addUISprite(_button[0]);
		CameraManager.addUISprite(_button[1]);
	}

	removeElement(_element) {
		// remove the specified element from this menu
	}

	moveElement(_element, _scale, _y, _delay, _duration, _ease) {
		// move the element
	}

	toggleMenu() {
		// set all elements in this menu to visible
		this.elements.forEach(function (element) {
			if (element.visible) {
				element.setVisible(false);
			} else {
				element.setVisible(true);
			}
		});
	}
}