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
    static cameraHeight = 20480;
    static cameraWidth = 20480;
    static mainZoom = 3; //main camera's zoom level
    static followSprite; //sprite main camera follows
    static mainCamera; //main game camera, containing most of the game's visuals
    static uiCamera; //camera representing the game's UI
    static miniCamera;
    static gameSprites = []; //sprites to be shown in main game camera
    static uiSprites = []; //sprites for use in the UI
    static cameraChanging = false;
    static minimapSprites = []; //sprites for use in the minimap.

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
        this.uiCamera.ignore(this.minimapSprites);
    }

    /**
     * Add the main game camera to the scene with its current attributes
     * @param {Scene} scene - The scene to add this camera to
     */
    static initializeMainCamera(scene) {
        this.mainCamera = scene.cameras.main;
        this.mainCamera.setBounds(0, 0, 
            this.cameraWidth, this.cameraHeight);
        this.mainCamera.setZoom(this.mainZoom);
        this.mainCamera.setName('main');
        this.mainCamera.centerOn(0, 0);
        this.mainCamera.ignore(this.uiSprites);
        this.mainCamera.ignore(this.minimapSprites);
    }

     /**
     * Add the minimap camera to the scene with its current attributes
     * @param {Scene} scene - The scene to add this camera to
     */
    static initializeMiniCamera(scene) {
        this.miniCamera = scene.cameras.add(745, 10, 300, 205)
            .setZoom(0.018)
            .setName('mini')
            .setBackgroundColor("Black")
            .setBounds(0, 0, this.cameraWidth, this.cameraHeight, true)
            .ignore(this.uiSprites)
            .ignore(this.gameSprites);
    }

    /**
     * Set the zoom of the main camera
     * @param {number} zoom - The new zoom value
     */
    static setCameraZoom(zoom) {
        this.mainZoom = zoom;
        this.mainCamera.zoomTo(zoom);
    }

    /**
     * sets the camera zoom based on the camera's view size in pixels
     * Does not change the camera's set zoom value
     * @param {number} size - value of the camera's size along the shortest axis
     */
    static zoomToSize(size) {
        //since zoom level is a decimal from 1-0, we
        //need to find what the fraction of the zoom
        //is based on the camera's viewport size
        var zoom = this.mainCamera.height / size;
        this.mainCamera.zoomTo(zoom);
    }

    /**
     * returns the main camera to it's set zoom value.
     */
    static returnToSetZoom() {
        this.mainCamera.zoomTo(this.mainZoom);
    }

    /**
     * Add a new sprite to the collection of game sprites and tell the ui camera to ignore it
     * @param {Sprite} sprite - The new sprite to add
     */
    static addGameSprite(sprite) {
        this.gameSprites.push(sprite);
        this.uiCamera.ignore(this.gameSprites);
        this.miniCamera.ignore(this.gameSprites);
    }

    /**
     * Add a new sprite to the collection of ui sprites and tell the other cameras to ignore it
     * @param {Sprite} sprite -  The new sprite to add
     */
    static addUISprite(sprite) {
        this.uiSprites.push(sprite);
        this.mainCamera.ignore(this.uiSprites);
        this.miniCamera.ignore(this.uiSprites);
    }

    /**
     * Add a new sprite to the collection of game sprites and tell the other cameras to follow it
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

    /**
     * Changes the focus target of the game camera and puts
     * the camera into a changing target state, making the camera
     * pan to it's new target.
     * @param {Phaser.GameObject} target - The new target of the camera
     */
    static changeCamTarget(target) {
        this.cameraChanging = true;
        this.mainCamera.setLerp(0.000001, 0.000001);
        this.setFollowSprite(target);
    }

    /**
     * Checks to see if the camera has caught up to its new target.
     * If it has, the camera exits the changing state.
     */
    static checkDoneChanging() {
        var cam = this.mainCamera;
        if (cam.x == this.followSprite.x && cam.y == this.followSprite.y) {
            this.cameraChanging = false;
            this.mainCamera.setLerp(1, 1);
        }
    }

    /**
     * Checks to see if the camera is in the changing state.
     */
    static isCamChanging() {
        return this.cameraChanging;
    }

    /**
     * Add a new sprite to the collection of minimap sprites and tell the other cameras to ignore it
     * @param {Sprite} sprite -  The new sprite to add
     */
    static addMinimapSprite(sprite){
        this.minimapSprites.push(sprite)
        this.uiCamera.ignore(this.minimapSprites);
        this.mainCamera.ignore(this.minimapSprites);
    }
}
