class DialogManager {
    constructor() {
        if (this instanceof DialogManager) {
            throw Error('A static class cannot be instantiated.');
        }
    }
    static mode;
    static tutorialLog = [
        "Use the arrow keys to move the probe and find Psyche without crashing.",
        "You have found Psyche! Now press the shift key to orbit around Psyche.",
        "Your mission is to take pictures of all angles of Psyche.",
        "Press the space bar to take pictures of Psyche.",
        "You have finished the tutorial!"
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