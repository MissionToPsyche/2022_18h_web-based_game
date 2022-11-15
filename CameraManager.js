/** Class in charge of managing the in-game camera */
class CameraManager {

    /**
     * Represents a camera manager
     * @constructor
     */
    constructor() {
        if (this instanceof CameraManager) {
            throw Error('A static class cannot be instantiated.');
        }
    }

    //class properties
    static cameraHeight = 2048;
    static cameraWidth = 2048;
    static mainZoom = 3; //main camera's zoom level
    static followSprite; //sprite main camera follows
    static mainCamera; //main game camera, containing most of the game's visuals
    static uiCamera; //camera representing the game's UI
    static gameSprites = []; //sprites to be shown in main game camera
    static uiSprites = []; //sprites for use in the UI

    /** 
     * Set the bounds of the camera
     * @param {number} width - The width of the camera's view
     * @param {number} height - The height of the camera's view
     */
    static setCameraBounds(width, height) {
        this.cameraWidth = width;
        this.cameraHeight = height;
        mainCamera.setBounds(0, 0, width, height);
        uiCamera.setBounds(0, 0, width, height);
    }

    /**
     * Add the ui camera to the scene with its current attributes
     * @param {Scene} scene - The scene to add this camera to
     */
    static initializeUICamera(scene) {
        this.uiCamera = scene.cameras.add(0, 0, 
            this.cameraWidth, this.cameraHeight);
        this.uiCamera.setName('ui');
        this.uiCamera.ignore(this.gameSprites);
    }

    /**
     * Add the main game camera to the scene with its current attributes
     * @param {Scene} scene - The scene to add this camera to
     */
    static initializeMainCamera(scene) {
        this.mainCamera = scene.cameras.main
        this.mainCamera.setBounds(0, 0, 
            this.cameraWidth, this.cameraHeight);
        this.mainCamera.setZoom(this.mainZoom);
        this.mainCamera.setName('main');
        this.mainCamera.centerOn(0, 0);
        this.mainCamera.ignore(this.uiSprites);
    }

    /**
     * Set the zoom of the main camera
     * @param {number} zoom - The new zoom value
     */
    static setCameraZoom(zoom) {
        this.mainZoom = zoom;
        this.mainCamera.setZoom(zoom);
    }

    /**
     * Add a new sprite to the collection of game sprites and tell the ui camera to ignore it
     * @param {Sprite} sprite - The new sprite to add
     */
    static addGameSprite(sprite) {
        this.gameSprites.push(sprite);
        this.uiCamera.ignore(this.gameSprites);
    }

    /**
     * Add a new sprite to the collection of ui sprites and tell the main camera to ignore it
     * @param {Sprite} sprite -  The new sprite to add
     */
    static addUISprite(sprite) {
        this.uiSprites.push(sprite);
        this.mainCamera.ignore(this.uiSprites);
    }

    /**
     * Add a new sprite to the collection of game sprites and tell the main camera to follow it
     * @param {Sprite} sprite - The new sprite to add
     */
    static setFollowSprite(sprite) {
        this.followSprite = sprite;
        this.mainCamera.startFollow(sprite, false);
    }

    /** Get the center coordinates of the camera */
    static getCenter() {
        return new Phaser.Geom.Point(this.cameraWidth/2, this.cameraHeight/2);
    }
}
