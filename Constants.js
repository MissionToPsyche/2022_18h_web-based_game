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

    // colors
    static WHITE = 0xFFFFFF;
    static ORANGE = 0xF47D33;

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

    // array of angles that player choose to cover the psyche
    static FOUR_SIDES = new Array(0, 90, 180, 270);

    static ONE_PHOTO_ANGLE = 45; // one photo covers [angle - 45, angle + 45] of the psyche

    // hint circle style
    static HINT_DISTANCE = 5;
    static HINT_ALPHA_BEFORE = 0.1;
    static HINT_ALPHA_AFTER = 0.8;
    static HINT_WIDTH_BEFORE = 2;
    static HINT_WIDTH_AFTER = 4;


}
