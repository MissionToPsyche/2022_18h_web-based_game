/**
 * Class in charge of managing the in-game menus.
 * - Our in-game menus require their own unique update loops, which can quickly become
 * large and verbose.
 * - We move our menus' update loops to their own class in order to keep the scene's code tidy.
 */
class MenuManager {

	/**
     * Represents a menu manager
     * @constructor
     */
	constructor() {
	}

    /** Updates the state of the on-screen pause button
     *  based on the current state of Freeplay.paused.
     */
    updatePauseButton(_scene) {
        // if paused and not game over then we can show the pause text and allow the pause/play buttons to update
        if (_scene.paused && !_scene.gameOver) {
            _scene.pauseText.setVisible(true)
            _scene.playButton.setVisible(true)
            _scene.pauseButton.setVisible(false)
            _scene.restartButton.setVisible(true)
            _scene.exitButton.setVisible(true)
            _scene.shadow.setVisible(true)
        } else {
            _scene.pauseButton.setVisible(true)
            _scene.playButton.setVisible(false)
            _scene.pauseText.setVisible(false)
        }

        // if game over then show the game over text
        if (_scene.gameOver) {
            _scene.failText.setVisible(true)

            _scene.pauseButton.setTint(0x7f7f7f);
            _scene.playButton.setTint(0x7f7f7f);
            _scene.orbitButton.setTint(0x7f7f7f);
        } else {
            _scene.failText.setVisible(false)
        }

        // if paused or game over then we can show the restart and exit buttons
        if (_scene.paused || _scene.gameOver) {
            _scene.restartButton.setVisible(true)
            _scene.exitButton.setVisible(true)
            _scene.shadow.setVisible(false)
        } else {
            _scene.restartButton.setVisible(false)
            _scene.exitButton.setVisible(false)
            _scene.shadow.setVisible(false)
        }
    }

    updateTakePhoto(_scene) {
        if (!_scene.takingPhoto) {
            _scene.foundPsycheText.setVisible(false);  
             _scene.quitPhotoPageButton.setVisible(false);
             _scene.psychePhoto1.setVisible(false);
             _scene.nearestBodyText.setVisible(false);
        } else {
            _scene.quitPhotoPageButton.setVisible(true);
        }
    }
}