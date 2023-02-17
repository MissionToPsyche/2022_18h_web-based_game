/**
 * Class representing the Phaser 'Scene', which defines our game
 * @extends Phaser.Scene
 */
class Freeplay extends Phaser.Scene {
    constructor () {
        super({key:"Freeplay"});
        //creating body objects
        this.bodies = {};
        this.json;
        this.keyToggle = false //for testing only
        this.paused = false
        this.path;
        this.curve;
        this.points;
        this.direction;
        this.gameOver = false;
        this.pauseText;
        this.failText;
        this.restart;
    }

    /** Loads all necessary assets for the scene before the simulation runs */
    preload () {
        this.load.json('bodies', 'data/bodies.json');

        //loading in all image assets
        this.load.image('minimap_border', 'img/icons/minimap-border.png'); //border for minimap
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('play', 'img/icons/play-circle.svg');
        this.load.image('pause', 'img/icons/pause-circle.svg');
        this.load.image('orbit', 'img/icons/orbit.svg');
        this.load.image('direction', 'img/icons/direction.png'); // an arrow
        this.load.image('exit', 'img/icons/exit.png'); // an exit button
        this.load.image('restart', 'img/icons/restart.png'); // a restart button

        //staticly loading all the individual assets for now
        //**TO DO: change to a more general method of preloading images
        this.load.image('earth', "img/icons/earth.svg");
        this.load.image('jupiter', "img/icons/jupiter.svg");
        this.load.image('luna', "img/icons/luna.svg");
        this.load.image('mars', "img/icons/mars.svg");
        this.load.image('mercury', "img/icons/mercury.svg");
        this.load.image('neptune', "img/icons/neptune.svg");
        this.load.image('pluto', "img/icons/pluto.svg");
        this.load.image('psyche', "img/icons/psyche.svg");
        this.load.image('psyche_probe', "img/icons/psyche_probe.svg");
        this.load.image('psyche_probe_icon', "img/icons/arrow.png");
        this.load.image('saturn', "img/icons/saturn.svg");
        this.load.image('sol', "img/icons/sol.svg");
        this.load.image('uranus', "img/icons/uranus.svg");
        this.load.image('venus', "img/icons/venus.svg");
        this.restart = false;
    }

    /**
     * Assembles the game within the scene
     * - Using information from data/bodies.json, Generate all bodies and add them to the scene
     * - Initialize the menu and game cameras
     * - Set the player as the probe
     * - Subscribe the probe to every body in the scene
     * - Generate UI sprites and add them to the scene
     * - Create player controls
     */
    create () {
        this.graphics = this.add.graphics();

        this.path = { t: 0, vec: new Phaser.Math.Vector2() };

        this.curve = new Phaser.Curves.Spline(this.points);

        //Solar system is 2048x2048
        this.matter.world.setBounds(0, 0, 2048, 2048);

        //Minimap
        this.minimap = this.cameras.add(745, 10, 300, 205).setZoom(0.15).setName('mini');
        this.minimap.setBackgroundColor("Black");
        this.minimap.scrollX = 900;
        this.minimap.scrollY = 900;
        
        
        var map_border = this.add.image(880,110,'minimap_border').setScale(0.35);

        //Pause menu
        this.pauseText = this.add.text(525, 300, 'Pause').setOrigin(0.5).setFontSize(120);

        //Game over
        this.failText = this.add.text(525, 300, 'Game Over!').setOrigin(0.5).setFontSize(120);

        //initializing cameras
        CameraManager.initializeMainCamera(this);
        CameraManager.initializeUICamera(this);

        //creating Body objects
        this.json = this.cache.json.get('bodies');
        for (var type in this.json) {
            if (type != "moons") {
                for (var body of this.json[type]) {
                    let id = body['id'];
                    let mass = body['mass']['value'];
                    let diameter = body['diameter']['value'];

                    //objects in group 1 (in this case Satellites) will not collide with each other
                    let collisionGroup1 = this.matter.world.nextGroup(true);
                    let collisionGroup2 = this.matter.world.nextGroup();

                    if(type != "probes"){
                        let parent = this.bodies[body['orbits']];
                        let angle = body['angle'];
                        let orbit_distance = body['orbit_distance']['value'];
                        this.bodies[id] = new Satellite(this, id, mass, diameter, parent, angle, orbit_distance);
                    } else {
                        this.bodies[id] = new Probe(this, id, mass, diameter);
                    }
                }
            } else {
                // create satellites such as luna
                for (var body of this.json[type]) {
                    let id = body['id'];
                    let mass = body['mass']['value'];
                    let diameter = body['diameter']['value'];
                    let parent = this.bodies[body['orbits']];
                    let angle = body['angle'];
                    let orbit_distance = body['orbit_distance']['value'];
                    this.bodies[id] = new Moon(this, id, mass, diameter, parent, angle, orbit_distance);
                }
            }
        }

        for (const body in this.bodies) {
            //add each body to the scene
            this.add.existing(this.bodies[body]);
            //add bodies to game sprites so that they don't
            //appear on UI camera
            CameraManager.addGameSprite(this.bodies[body]);
        }

        CameraManager.addGameSprite(this.graphics);
        //adding graphics to game sprites so that it doesn't show up in UI.

        //subscribe probe to all other bodies.
        //NOTE** hard coded to psyche probe for now
        for (const body in this.bodies) {
            if(this.bodies[body].id != "psyche_probe"){
                this.bodies[body].subscribe(this.bodies["psyche_probe"]);
            }
        }
        this.bodies["earth"].subscribe(this.bodies["luna"]);
        //setting probe as the player
        this.player = this.bodies["psyche_probe"];
        CameraManager.setFollowSprite(this.player);

        //creating UISprites
        var logo = this.add.image(50, 50, 'logo').setScale(0.5);
        this.icon = this.add.image(50,50,"psyche_probe_icon").setScale(0.5);

        //adding to UIsprites so main camera ignores them
        CameraManager.addUISprite(logo);
        CameraManager.addUISprite(map_border);
        CameraManager.addMinimapSprite(this.icon);

        //creating control keys
        this.cursors = this.input.keyboard.createCursorKeys();

        this.createPauseButton();
        this.createOrbitToggle();

        // Check if its tutorial mode.
        if(DialogManager.get("tutorial") == true){
            // Create a shaded dialog box
            const color1 = new Phaser.Display.Color(0, 0, 0);
            this.dialogShadow = this.add.rectangle(525, 650,550, 125, color1.color);
            this.dialogShadow.setAlpha(0.85);
            this.dialogText = this.add.text(300,625, DialogManager.getTutorialDial(0));
            CameraManager.addUISprite(this.dialogShadow);
            CameraManager.addUISprite(this.dialogText);
            this.minimap.ignore(this.dialogText);
        }
    }

    /** The scene's main update loop
     * - Disallows the probe from escaping the solar system or going to fast
     * - Applies dynamic gravity
     * - Enforces the pause feature, only allowing bodies to move if the game is not paused
     */
    update () {
        //Probe controls
        //**TO DO: Wrap in a custom controler later.
        const moveUnit = 1;
        const rotationOffset = -2.4958208303518727;
        // Stops the Pause button from updating before delayed restart from tutorial.
        if(!this.restart){
        this.updatePauseButton();
        }

        // only move if not paused or in game over
        if (!this.paused) {
            if (this.cursors.left.isDown) {
                this.bodies["psyche_probe"].angle -= 1;             
            }
            else if (this.cursors.right.isDown)
            {
                this.bodies["psyche_probe"].angle += 1;
            }
            if (this.cursors.up.isDown)
            {
                this.bodies["psyche_probe"].vel.x = Math.cos(this.bodies["psyche_probe"].rotation + rotationOffset) * moveUnit
                this.bodies["psyche_probe"].vel.y = Math.sin(this.bodies["psyche_probe"].rotation + rotationOffset) * moveUnit
    
            }
            else if (this.cursors.down.isDown)
            {
                this.bodies["psyche_probe"].vel.x = Math.cos(this.bodies["psyche_probe"].rotation + rotationOffset) * -moveUnit
                this.bodies["psyche_probe"].vel.y = Math.sin(this.bodies["psyche_probe"].rotation + rotationOffset) * -moveUnit
            }
        }

        //prevent psyche from going too far out for now
	    //note: FOR TESTING ONLY, THIS IS A BAD WAY OF DOING THIS
        if (this.bodies["psyche_probe"].x >= 650 + 1024) {
            this.bodies["psyche_probe"].vel.x = 0
            this.bodies["psyche_probe"].x = 649 + 1024
        } if (this.bodies["psyche_probe"].y >= 650 + 1024) {
            this.bodies["psyche_probe"].x = 649 + 1024
            this.bodies["psyche_probe"].vel.y = 0
            this.bodies["psyche_probe"].y = 649 + 1024
        } if (this.bodies["psyche_probe"].x <= -650 + 1024) {
            this.bodies["psyche_probe"].vel.x = 0
            this.bodies["psyche_probe"].x = -649 + 1024
        } if (this.bodies["psyche_probe"].y <= -650 + 1024) {
            this.bodies["psyche_probe"].vel.y = 0
            this.bodies["psyche_probe"].y = -649 + 1024
        }

        // don't update bodies if paused
        if (this.paused || this.gameOver) {
            return
        }

        // check to see if the probe collided with anything
        // if there was a collision then trigger the failure state and stop the simulation
        if (this.bodies["psyche_probe"].collided && !this.gameOver) {
            this.gameOver = true;
            CameraManager.addUISprite(this.failText);
            this.minimap.ignore(this.failText);
        }

        this.graphics.clear(); //clear previous itteration's graphics

        for (const body in this.bodies) {
            //apply dynamic gravity
            //NOTE: THIS IS A BAD PLACE TO DO THIS. MOVE THIS TO AN APPROPRIATE PLACE LATER!!
            this.bodies[body].notify()

            //draw paths
            var path = this.bodies[body].path;
            if(path && path.length > 0){
                this.graphics.lineStyle(1, 0xffffff, 0.5);
                this.bodies[body].getPathCurve().draw(this.graphics, 64);
        
                this.graphics.fillStyle(0x00ff00, 1);
            }
    
            //update body positions
            this.bodies[body].updatePosition(this)

            // find psyche
            let distance = this.bodies["psyche_probe"].getPsycheDistance();

            // the distance between pshche probe and the arrow
            let arrowDistance = 50;
            let width = 1024;
            let height = 768;
            let directionX = width / 2 + this.bodies["psyche_probe"].getPsycheDirectionX() * arrowDistance;
            let directionY = height / 2 + this.bodies["psyche_probe"].getPsycheDirectionY() * arrowDistance;
            
            // calculate the rotation of the arrow image
            let directionAngle = Math.asin(this.bodies["psyche_probe"].getPsycheDirectionY());
            if (this.bodies["psyche_probe"].getPsycheDirectionX() < 0) {
                directionAngle = Math.PI - directionAngle;
            }

            // add the image of the arrow if it not added
             if (typeof(this.direction) == "undefined") {
                this.direction = this.add.image(directionX, directionY, 'direction').setScale(0.2);
                CameraManager.addUISprite(this.direction);
                //Make the minimap ignore the icon.
                this.minimap.ignore(this.direction);
             }

            // set the correct position and angle of the arrow to point to psyche
            this.direction.setPosition(directionX, directionY);
            this.direction.rotation = directionAngle;

            // decrease opacity when near psyche
            if (distance < 90) {
                this.direction.alpha = (distance - 50)/50;
            } else {
                this.direction.alpha = 0.8;
            }
        }

                // Make the minimap icon have the same location as the player.
                this.icon.y = this.bodies["psyche_probe"].y;
                this.icon.x = this.bodies["psyche_probe"].x;
                // Make the minimap icon have the same angle as the player.
                this.icon.angle = this.bodies["psyche_probe"].angle;
    }

    createPauseButton() {
        this.playButton = this.add.image(964, 708, 'play').setScale(0.5)
        this.pauseButton = this.add.image(964, 708, 'pause').setScale(0.5)
        this.restartButton = this.add.image(520, 408, 'restart').setScale(0.5)
        this.exitButton = this.add.image(520, 508, 'exit').setScale(0.5)
        this.playButton.setVisible(false);
        // Made sure the buttons and label is on top of everything.
        this.restartButton.depth = 100;
        this.playButton.depth = 100;
        this.pauseButton.depth = 100;
        this.exitButton.depth = 100;
        this.pauseText.depth = 100;

        // To darken screen
        const color1 = new Phaser.Display.Color(0, 0, 0);
        this.shadow = this.add.rectangle(0, 0,2048, 2048, color1.color);
        this.shadow.setAlpha(0.5);

        this.input.keyboard
            .on('keydown-P', () => {
                this.playButton.setTint(0xF47D33);
                this.pauseButton.setTint(0xF47D33);
            }).on('keyup-P', () => {
                this.playButton.setTint(0xFFFFFF);
                this.pauseButton.setTint(0xFFFFFF);
                this.paused = !this.paused
            });

        this.playButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.playButton.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.playButton.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.playButton.setTint(0xF47D33);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.playButton.setTint(0xFFFFFF);
                this.paused = !this.paused
            })

        this.pauseButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.pauseButton.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.pauseButton.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.pauseButton.setTint(0xF47D33);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.pauseButton.setTint(0xFFFFFF);
                this.paused = !this.paused
            });

        this.restartButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.restartButton.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.restartButton.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.restartButton.setTint(0xF47D33);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.restartButton.setTint(0xFFFFFF);
                this.scene.restart();
                this.paused = false
                this.gameOver = false;
                // Make the direction icon show up again.
                this.direction = undefined;
            });

            this.exitButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.exitButton.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.exitButton.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.exitButton.setTint(0xF47D33);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.exitButton.setTint(0xFFFFFF);
                this.scene.start('MainMenu');
                this.paused = false;
                this.gameOver = false;
            });

        CameraManager.addUISprite(this.playButton);
        CameraManager.addUISprite(this.pauseButton);
        CameraManager.addUISprite(this.exitButton);
        CameraManager.addUISprite(this.restartButton);
        CameraManager.addUISprite(this.shadow);
        this.minimap.ignore(this.pauseButton);
        this.minimap.ignore(this.playButton);
        this.minimap.ignore(this.exitButton);
        this.minimap.ignore(this.restartButton);
        this.minimap.ignore(this.shadow);
        this.minimap.ignore(this.pauseText);
    }

    updatePauseButton() {
        // if paused and not game over then we can show the pause text and allow the pause/play buttons to update
        if (this.paused && !this.gameOver) {
            this.pauseText.setVisible(true)
            this.playButton.setVisible(true)
            this.pauseButton.setVisible(false)
            this.restartButton.setVisible(true)
            this.exitButton.setVisible(true)
            this.shadow.setVisible(true)
        } else {
            this.pauseButton.setVisible(true)
            this.playButton.setVisible(false)
            this.pauseText.setVisible(false)
            this.shadow.setVisible(false)
        }

        if(DialogManager.get("tutorial") == true && this.gameOver){
            this.failText.setVisible(true)
            this.showDialog(false);
            this.time.addEvent({
                delay: 1000,
                callback: ()=>{
                    this.scene.restart();
                    this.paused = false
                    this.gameOver = false;
                    // Make the direction icon show up again.
                    this.direction = undefined;
                },
                loop: false
            })
            this.restart = true;
        }
        // if game over then show the game over text when not in tutorial mode.
        if (this.gameOver && DialogManager.get("tutorial") == false) {
        this.failText.setVisible(true)
        this.pauseButton.setTint(0x7f7f7f);
        this.playButton.setTint(0x7f7f7f);
        this.orbitToggle.setTint(0x7f7f7f);
        } else if(this.gameOver == false){
        this.failText.setVisible(false)
        }

        // if paused or game over then we can show the restart and exit buttons.
        if (!this.restart && (this.paused || this.gameOver)) {
            this.restartButton.setVisible(true)
            this.exitButton.setVisible(true)
            this.shadow.setVisible(true)
            this.showDialog(false);
        } else{
            this.restartButton.setVisible(false)
            this.exitButton.setVisible(false)
            this.shadow.setVisible(false)
            if(DialogManager.get("tutorial") == false){
                this.showDialog(true);
            } else if(DialogManager.get("tutorial") == true && !this.restart){
                this.showDialog(true);
            }
            }
        
            
    }
    
    
    createOrbitToggle() {
        this.orbitToggle = this.add.image(56, 708, 'orbit').setScale(0.5);
        CameraManager.addUISprite(this.orbitToggle);

        this.input.keyboard
            .on('keyup-SPACE', () => {
                this.bodies["psyche_probe"].orbitToggle = !this.bodies["psyche_probe"].orbitToggle;
                this.orbitToggle.setTint(this.bodies["psyche_probe"].orbitToggle ? 0xF47D33 : 0xFFFFFF);
            });

        this.orbitToggle.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.orbitToggle.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.orbitToggle.setTint(this.bodies["psyche_probe"].orbitToggle ? 0xF47D33 : 0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.orbitToggle.setTint(0xF47D33);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                if(!this.gameOver) {
                    this.bodies["psyche_probe"].orbitToggle = !this.bodies["psyche_probe"].orbitToggle;
                    this.orbitToggle.setTint(this.bodies["psyche_probe"].orbitToggle ? 0xF47D33 : 0xFFFFFF);
                }
            });
    }

    showDialog(show){
            if(show == true){
                this.dialogShadow.setVisible(true);
                this.dialogText.setVisible(true);
            } else{
                this.dialogText.setVisible(false);
                this.dialogShadow.setVisible(false);
            }
    }

}



