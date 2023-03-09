class tutorialManager {

    /**
     * Represents a camera manager
     * @constructor
     */
    constructor(_scene, _color) {
        this.scene = _scene;
        this.dialogShadow = this.scene.add.rectangle(525, 650,550, 125, _color)
        .setAlpha(0.85);
        this.dialogText = this.scene.add.text(300,625, "");
        this.movmentTutNum = 1;
        this.movementNotDone = true;
    }

    loadMsg(num){
        switch(num){
            // When tutorial start.
            case 0:
                this.typewriteText(this.dialogText,DialogManager.getTutorialDial(0));
                this.scene.time.addEvent({
                    delay: 5000,
                    callback: ()=>{
                        this.typewriteText(this.dialogText,DialogManager.getTutorialDial(1));
                    },
                    loop: false
                })
                break;
            // When player gets out of orbit.
            case 1:
                this.dialogText.setVisible(false);
                this.dialogText = this.scene.add.text(300,625, "");
                this.typewriteText(this.dialogText,DialogManager.getTutorialDial(8));
                break;
            // When player done with movement tutorial.
            case 2:
                if(this.movmentTutNum == 4 && this.movementNotDone){
                    this.dialogText.setVisible(false);
                    this.dialogText = this.scene.add.text(300,625, "");
                        this.typewriteText(this.dialogText,DialogManager.getTutorialDial(12));
                        this.scene.time.addEvent({
                            delay: 8500,
                            callback: ()=>{
                                this.dialogText.setVisible(false);
                                this.dialogText = this.scene.add.text(300,625, "");
                                this.typewriteText(this.dialogText,DialogManager.getTutorialDial(2));
                            },
                            loop: false
                        })
                    this.movementNotDone = false;
                }
                break;
            // When player finds Psyche.
            case 3:
                this.dialogText.setVisible(false);
                this.dialogText = this.scene.add.text(300,625, "");
                    this.typewriteText(this.dialogText,DialogManager.getTutorialDial(3));
                    this.scene.time.addEvent({
                        delay: 4000,
                        callback: ()=>{
                            this.typewriteText(this.dialogText,DialogManager.getTutorialDial(4));
                        },
                        loop: false
                    })
                break;
            // When player take a picture of Psyche.
            case 5:
                this.dialogText.setVisible(false);
                this.dialogText = this.scene.add.text(300,625, "");
                this.typewriteText(this.dialogText,DialogManager.getTutorialDial(5));
                break;
            // When player obit a different planet. 
            case 6:
                this.dialogText.setVisible(false);
                this.dialogText = this.scene.add.text(300,625, "");
                this.typewriteText(this.dialogText,DialogManager.getTutorialDial(6));
                this.scene.time.addEvent({
                    delay: 4000,
                    callback: ()=>{
                        this.typewriteText(this.dialogText,DialogManager.getTutorialDial(1));
                    },
                    loop: false
                })
                break;
            // When player orbit Earth again.
            case 7:
                this.dialogText.setVisible(false);
                this.dialogText = this.scene.add.text(300,625, "");
                this.typewriteText(this.dialogText,DialogManager.getTutorialDial(7));
                this.scene.time.addEvent({
                    delay: 4000,
                    callback: ()=>{
                        this.typewriteText(this.dialogText,DialogManager.getTutorialDial(1));
                    },
                    loop: false
                })
                break;
        }
    }

    movementTutor(phase){
        if(this.movmentTutNum == phase){
            this.movmentTutNum = this.movmentTutNum + 1;
            this.dialogText.setVisible(false);
            this.dialogText = this.scene.add.text(300,625, "");
            this.typewriteText(this.dialogText,DialogManager.getTutorialDial(this.movmentTutNum + 7));
        }
    }

    msgVisibility(visibility){
        if(visibility){
            this.dialogShadow.setVisible(true);
            this.dialogText.setVisible(true);
        } else{
            this.dialogShadow.setVisible(false);
            this.dialogText.setVisible(false);
        }
    }

    typewriteText(label,text){
	    const length = text.length
	    let i = 0
	    this.scene.time.addEvent({
		    callback: () => {
			    label.text += text[i];
			    ++i;
                // Skip t onew line if there are 46 characters.
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