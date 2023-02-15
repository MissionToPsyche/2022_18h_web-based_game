class PreloadManager {
    constructor() {
        if (this instanceof PreloadManager) {
            throw Error('A static class cannot be instantiated.');
        }
    }
    static check;

    static set(){
        this.check = true;
    }
    static get(){
        return this.check;
    }
}