/** Constants */
const Constants = {
    // colors
    WHITE: 0xFFFFFF,
    RED: 0xFF0000,
    ORANGE: 0xF47D33,
    DARKBLUE: 0x12031D,

    STR_ORANGE: "#F47D33",
    STR_DARKGRAY: "#333333",

    // font sizes
    FIRST_FONT_SIZE: 80,
    SECOND_FONT_SIZE: 70,
    THIRD_FONT_SIZE: 50,
    FORTH_FONT_SIZE: 120,
    FIFTH_FONT_SIZE: 100,

    // taking photos
    VIEW_R: 100, // radius of probe's view

    MAX_PSYCHE_PHOTO_NUM: 4, // max number of psyche to show

    // position and scale of logo
    LOGO_X: 50,
    LOGO_Y: 50,
    LOGO_SCALE: 0.5,

    // position of play button
    PLAY_BUTTON_X: 512,
    PLAY_BUTTON_Y: 464,

    // title before and after animation
    TITLE_BEFORE_X: 512,
    TITLE_BEFORE_Y: 24, 
    TITLE_BEFORE_SCALE: 0.0,
    TITLE_BEFORE_ORIGIN: 0.5,
    TITLE_STROKE_WIDTH: 16,
    TITLE_AFTER_SCALE: 1.0,
    TITLE1_DELAY: 500,
    TITLE1_DURATION: 350,
    TITLE1_Y: 82,
    TITLE2_DELAY: 850,
    TITLE2_DURATION: 400,
    TITLE2_Y: 192,
    TITLE3_DELAY: 1250, 
    TITLE3_DURATION: 450,
    TITLE3_Y: 302,
    TITLE_SHADOW_OFFSET: 2,
    TITLE_SHADOW_BLUR: 2,

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

    // mute button size
    MUTE_X: 964,
    MUTE_Y: 620,
    MUTE_SCALE: 0.5,

    // parallax background
    PARALLAX_TILE_WIDTH: 512,
    PARALLAX_TILE_HEIGHT: 384,
    PARALLAX_TILE_REPEAT_X: 38,
    PARALLAX_TILE_REPEAT_Y: 42,
    PARALLAX_TILE_LAYER_ONE_SCROLL_RATE: 0.0625,
    PARALLAX_TILE_LAYER_TWO_SCROLL_RATE: 0.125,
    PARALLAX_TILE_LAYER_THREE_SCROLL_RATE: 0.25,

    //standard offsets
    ROTATION_OFFSET: (3/4)*Math.PI
}
