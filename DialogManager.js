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
        "Use the arrow keys to move the probe and find Psyche without crashing.",
        "You have found Psyche!\n",
        "Press the space key in order to take pictures of Psyche.",
        "Good job! You have finished the tutorial!",
        "You are orbiting the wrong planet.\n",
        "You are orbiting Earth again.\n"
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