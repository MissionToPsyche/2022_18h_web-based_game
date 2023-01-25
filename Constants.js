/** Class of constants */
class Constants {

    /**
     * Manage constants, shouldn't be called
     * @constructor
     */
    constructor() {
        if (this instanceof Constants) {
            throw Error('A static class cannot be instantiated.');
        }
    }

    static const VIEW_R = 100;
}
