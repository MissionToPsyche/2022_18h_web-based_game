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

    // font sizes
    static FIRST_FONT_SIZE = 80;
    static SECOND_FONT_SIZE = 70;
    static THIRD_FONT_SIZE = 50; 

    // taking photos
    static VIEW_R = 100; // radius of probe's view
    // position and scale of psyche photo 1
    static PSYCHE_PHOTO_1X = 500;
    static PSYCHE_PHOTO_1Y = 400;
    static PSYCHE_PHOTO_1SCALE = 0.8;
    // found psyche text
    static FOUND_PSYCHE_TEXT_X = 100;
    static FOUND_PSYCHE_TEXT_Y = 100;
    // nearest body text
    static NEAREST_BODY_TEXT_X = 100;
    static NEAREST_BODY_TEXT_Y = 250;
    // quit photo page (back to game) button
    static QUIT_PHOTO_X = 300;
    static QUIT_PHOTO_Y = 650;
    static QUIT_PHOTO_PADDING = 10;

    static LARGEST_SIDES = 360; // size of the array coverPsyche

}
