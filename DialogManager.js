class DialogManager {
    constructor() {
        if (this instanceof DialogManager) {
            throw Error('A static class cannot be instantiated.');
        }
    }
    static mode;
    static tutorialLog = [
        "Welcome to the Tutorial!\n",
        "Press the shift button to get out of Orbit.",
        "Now that you know how to fly, find Psyche without crashing.",
        "You have found Psyche!\n",
        "Press the space key in order to take pictures of Psyche.",
        "Good job! You have finished the tutorial!",
        "You are orbiting the wrong planet.\n",
        "You are orbiting Earth again.\n",
        "Press and hold the up arrow key to go up.",
        "Press and hold the down arrow key to go down.",
        "Press and hold the left arrow key to go left.",
        "Press and hold the right arrow key to go right.",
        "The longer you press and hold on to the arrow keys the faster you fly.",
        "Press m to see the minimap.",
        "Seems like you are lost.\n",
        "Follow the orange arrow to find Psyche or press m for minimap!"
    ]

    static set(setMode){
        this.mode = setMode;
    }
    static get(getMode){
        return this.mode == getMode;
    }

    static getTutorialDial(index){
        return this.tutorialLog[index];
    }
}