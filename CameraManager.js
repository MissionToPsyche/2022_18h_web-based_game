class CameraManager {
    constructor() {
        if (this instanceof CameraManager) {
            throw Error('A static class cannot be instantiated.');
        }
    }

    //class properties
    static cameraHeight = 4096;
    static cameraWidth = 4096;
    static mainZoom = 3; //main camera's zoom level
    static followSprite; //sprite main camera follows
    static mainCamera; //main game camera, containing most of the game's visuals
    static uiCamera; //camera representing the game's UI
    static gameSprites = []; //sprites to be shown in main game camera
    static uiSprites = []; //sprites for use in the UI
    static cameraChanging = false;

    //class methods
    static setCameraBounds(width, height) {
        this.cameraWidth = width;
        this.cameraHeight = height;
        mainCamera.setBounds(0, 0, width, height);
        uiCamera.setBounds(0, 0, width, height);
    }

    static initializeUICamera(scene) {
        this.uiCamera = scene.cameras.add(0, 0, 
            this.cameraWidth, this.cameraHeight);
        this.uiCamera.setName('ui');
        this.uiCamera.ignore(this.gameSprites);
    }

    static initializeMainCamera(scene) {
        this.mainCamera = scene.cameras.main;
        this.mainCamera.setBounds(0, 0, 
            this.cameraWidth, this.cameraHeight);
        this.mainCamera.setZoom(this.mainZoom);
        this.mainCamera.setName('main');
        this.mainCamera.centerOn(0, 0);
        this.mainCamera.ignore(this.uiSprites);
    }

    static setCameraZoom(zoom) {
        this.mainZoom = zoom;
        this.mainCamera.zoomTo(zoom);
    }

    static zoomToSize(size) {
        //since zoom level is a decimal from 1-0, we
        //need to find what the fraction of the zoom
        //is based on the camera's viewport size
        console.log(this.mainCamera.height + " / " + size);
        var zoom = this.mainCamera.height / size;
        console.log(zoom);
        this.mainCamera.zoomTo(zoom);
    }

    static returnToSetZoom() {
        this.mainCamera.zoomTo(this.mainZoom);
    }

    static addGameSprite(sprite) {
        this.gameSprites.push(sprite);
        this.uiCamera.ignore(this.gameSprites);
    }

    static addUISprite(sprite) {
        this.uiSprites.push(sprite);
        this.mainCamera.ignore(this.uiSprites);
    }

    static setFollowSprite(sprite) {
        this.followSprite = sprite;
        this.mainCamera.startFollow(sprite, false);
    }

    static getCenter() {
        return new Phaser.Geom.Point(this.cameraWidth/2, this.cameraHeight/2);
    }

    static changeCamTarget(target) {
        this.cameraChanging = true;
        this.mainCamera.setLerp(0.01, 0.01);
        this.setFollowSprite(target);
    }

    static checkDoneChanging() {
        var cam = this.mainCamera;
        if (cam.x == this.followSprite.x && cam.y == this.followSprite.y) {
            this.cameraChanging == false;
            this.mainCamera.setLerp(1, 1);
        }
    }

    static isCamChanging() {
        return this.cameraChanging;
    }
}