class TutorialManager {

    /**
     * Represents a tutorial manager
     * @constructor
     */

    constructor() {
        if (this instanceof TutorialManager) {
            throw Error('A static class cannot be instantiated.');
        }
    }

    static setUp(_scene, _color) {
        this.scene = _scene;
        this.dialogShadow = this.scene.add.rectangle(525, 650,550, 125, _color)
        .setAlpha(0.85);
        this.dialogText = this.scene.add.text(300,625, "");
        this.movmentTutNum = 1;
        this.movementNotDone = true;
        this.msgNum = 0;
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
        "Follow the orange arrow to find Psyche."
    ]

    static activateTutorial(){
        this.mode = true;
    }
    static tutorialActivated(){
        return this.mode;
    }

    static loadMsg(num){
        switch(num){
            // When tutorial start.
            case 0:
                this.typewriteText(this.dialogText,this.tutorialLog[0], 0);
                this.scene.time.addEvent({
                    delay: 5000,
                    callback: ()=>{
                        if(this.msgNum == 0){
                            this.eraseDialogText();
                            this.typewriteText(this.dialogText,this.tutorialLog[1]);
                        }
                    },
                    loop: false
                })
                break;
            // When player gets out of orbit.
            case 1:
                this.msgNum = 1;
                this.eraseDialogText();
                if(this.msgNum == 1){
                    this.typewriteText(this.dialogText,this.tutorialLog[8]);
                }
                break;
            // When player done with movement tutorial.
            case 2:
                if(this.movmentTutNum == 4 && this.movementNotDone){
                    this.msgNum = 2;
                    this.dialogText.setVisible(false);
                    this.dialogText = this.scene.add.text(300,625, "");
                        this.typewriteText(this.dialogText,this.tutorialLog[12]);
                        this.scene.time.addEvent({
                            delay: 8500,
                            callback: ()=>{
                                if(this.msgNum == 2){
                                    this.eraseDialogText();
                                    this.typewriteText(this.dialogText,this.tutorialLog[2]);
                                }
                            },
                            loop: false
                        })
                        this.scene.time.addEvent({
                            delay: 17000,
                            callback: ()=>{
                                if(this.msgNum == 2){
                                    this.eraseDialogText();
                                    this.typewriteText(this.dialogText,this.tutorialLog[13]);
                                }
                            },
                            loop: false
                        })
                    this.movementNotDone = false;
                }
                break;
            // When player finds Psyche.
            case 3:
                this.msgNum = 3;
                this.eraseDialogText();
                    this.typewriteText(this.dialogText,this.tutorialLog[3]);
                    if(this.msgNum == 3){
                        this.createMsgDelay(4000, 4, 3);
                    }
                break;
            // When player done orbiting wrong planet.
            case 4:
                this.msgNum = 4;
                this.eraseDialogText();
                    this.typewriteText(this.dialogText,this.tutorialLog[13]);
                break;
            // When player take a picture of Psyche.
            case 5:
                this.msgNum = 5;
                this.eraseDialogText();
                this.typewriteText(this.dialogText,this.tutorialLog[5]);
                break;
            // When player orbit a different planet. 
            case 6:
                this.msgNum = 6;
                this.eraseDialogText();
                this.typewriteText(this.dialogText,this.tutorialLog[6]);
                this.createMsgDelay(4000, 1, 6);
                
                break;
            // When player orbit Earth again.
            case 7:
                this.msgNum = 7;
                this.eraseDialogText();
                this.typewriteText(this.dialogText,this.tutorialLog[7]);
                if(this.msgNum == 7){
                    this.createMsgDelay(4000, 1, 7);
                }
                break;
        }
    }

    static eraseDialogText(){
        this.dialogText.setVisible(false);
        this.dialogText = this.scene.add.text(300,625, "");
    }

    static createMsgDelay(delayNum, dialogNum, num){
        this.scene.time.addEvent({
            delay: delayNum,
            callback: ()=>{
                if(this.msgNum == num){
                    this.eraseDialogText();
                    this.typewriteText(this.dialogText,this.tutorialLog[dialogNum]);
                }
            },
            loop: false
        })
    }

    static movementTutor(phase){
        if(this.movmentTutNum == phase){
            this.movmentTutNum = this.movmentTutNum + 1;
            this.msgNum = this.movmentTutNum + 7;
            this.dialogText.setVisible(false);
            this.dialogText = this.scene.add.text(300,625, "");
            this.typewriteText(this.dialogText,this.tutorialLog[this.movmentTutNum + 7]);
        }
    }

    static msgVisibility(visibility){
        if(visibility){
            this.dialogShadow.setVisible(true);
            this.dialogText.setVisible(true);
        }else{
            this.dialogShadow.setVisible(false);
            this.dialogText.setVisible(false);
        }
    }

    static typewriteText(label,text){
	    const length = text.length
	    let i = 0
	    this.scene.time.addEvent({
		    callback: () => {
                    label.text += text[i];
                    ++i;
                    // Skip to new line if there are 46 characters.
                    if((i % 46) === 0){
                        label.text += "\n";
                        length + 1;
                    }
                
		    },
		    repeat: length - 1,
		    delay: 100
	    })
    }

    
}