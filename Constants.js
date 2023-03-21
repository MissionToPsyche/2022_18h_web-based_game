/** Constants */
const Constants = {
    // colors
    WHITE: 0xFFFFFF,
    RED: 0xFF0000,
    ORANGE: 0xF47D33,
    DARKBLUE: 0x12031D,

    // font sizes
    FIRST_FONT_SIZE: 80,
    SECOND_FONT_SIZE: 70,
    THIRD_FONT_SIZE: 50,
    FORTH_FONT_SIZE: 120,

    // taking photos
    VIEW_R: 100, // radius of probe's view

    MAX_PSYCHE_PHOTO_NUM: 4, // max number of psyche to show

    // position and scale of psyche photo
    PSYCHE_PHOTO_X: 500,
    PSYCHE_PHOTO_Y: 430,
    PSYCHE_PHOTO_SCALE: 10,

    // psyche photo background
    PHOTO_BACKGROUND_WIDTH: 600,
    PHOTO_BACKGROUND_HEIGHT: 400,
    PHOTO_BORDER: 10,

    // found psyche text
    FOUND_PSYCHE_TEXT_X: 100,
    FOUND_PSYCHE_TEXT_Y: 250,
    // nearest body text
    NEAREST_BODY_TEXT_X: 100,
    NEAREST_BODY_TEXT_Y: 250,
    // quit photo page (back to game) button
    QUIT_PHOTO_X: 300,
    QUIT_PHOTO_Y: 650,
    QUIT_PHOTO_PADDING: 10,

    LARGEST_SIDES: 360, // size of the array coverPsyche

    // array of angles that player choose to cover the psyche
    FOUR_SIDES: new Array(0, 90, 180, 270),

    ONE_PHOTO_ANGLE: 45, // one photo covers [angle - 45, angle + 45] of the psyche

    // hint circle style
    HINT_DISTANCE: 5,
    HINT_ALPHA_BEFORE: 0.1,
    HINT_ALPHA_AFTER: 0.8,
    HINT_WIDTH_BEFORE: 2,
    HINT_WIDTH_AFTER: 2,
}
