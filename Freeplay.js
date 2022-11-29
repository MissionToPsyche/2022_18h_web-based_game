/**
 * Class representing the Phaser 'Scene', which defines our game
 * @extends Phaser.Scene
 */
class Freeplay extends Phaser.Scene {
    //Variable used to contain the angle of the probe.
    angle = 0;
    constructor () {
        super({key:"Freeplay"});
        //creating body objects
        this.bodies = {};
        this.json;
        this.keyToggle = false //for testing only
        this.paused = false
        this.graphics;
        this.path;
        this.curve;
        this.points;
        this.graphics;
        this.direction;
        this.pauseText;
        this.takingPhoto = false;
        this.foundPsycheText; // should replace to photo of psyche
        this.quitPhotoPageButton;
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

        this.pauseText = this.add.text(340, 220, 'Pause');
        this.pauseText.setFontSize(120);

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
        // Make the main camera ignore the player icon.
        // CameraManager.addUISprite([this.bodies["psyche_probe_icon"]]);
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
        this.takePhoto();
    }

    /** The scene's main update loop
     * - Disallows the probe from escaping the solar system or going to fast
     * - Applies dynamic gravity
     * - Enforces the pause feature, only allowing bodies to move if the game is not paused
     */
    update () {
        //Probe controls
        //**TO DO: Wrap in a custom controler later.
        const moveUnit = 0.01

        this.updatePauseButton();
        this.updateTakePhoto();

        // only move if not paused and not taking photo
        if (this.paused || this.takingPhoto) {
            return
        } else {
            if (this.cursors.left.isDown) {
                this.bodies["psyche_probe"].vel.x -= moveUnit;
                //Either turn the probe left or right depending on its current angle.
                if(this.angle > -45){
                    this.bodies["psyche_probe"].angle -= 5;
                    this.icon.angle -= 5;
                    this.angle -=5; 
                } else if(this.angle < -45){
                    this.bodies["psyche_probe"].angle += 5;
                    this.icon.angle += 5;
                    this.angle +=5; 
                }         
                
            }
            else if (this.cursors.right.isDown)
            {
                this.bodies["psyche_probe"].vel.x += moveUnit;
    
                //Either turn the probe left or right depending on its current angle.
                // Set the value of the probe to 225 if it is currently facing down 
                //to make it turn the shortest distance.
                if(this.angle == -135){
                    this.angle = 225;
                } else if(this.angle < 135){
                    this.bodies["psyche_probe"].angle += 5;
                    this.icon.angle += 5;
                    this.angle +=5; 
    
                } else if(this.angle > 135){
                    this.bodies["psyche_probe"].angle -= 5;
                    this.icon.angle -= 5;
                    this.angle -=5; 
                }
            }
            if (this.cursors.up.isDown)
            {
                this.bodies["psyche_probe"].vel.y -= moveUnit;
    
                //Either turn the probe left or right depending on its current angle.
                if(this.angle > 45){
                    this.bodies["psyche_probe"].angle -= 5;
                    this.icon.angle -= 5;
                    this.angle -=5; 
                } else if(this.angle < 45){
                    this.bodies["psyche_probe"].angle += 5;
                    this.icon.angle += 5;
                    this.angle +=5; 
                }  
            }
            else if (this.cursors.down.isDown)
            {
                this.bodies["psyche_probe"].vel.y += moveUnit;
    
                //Either turn the probe left or right depending on its current angle.
                // Set the value of the probe to -225 if it is currently facing right 
                //to make it turn the shortest distance.
                if(this.angle == 135){
                    this.angle = -225;
                } else if(this.angle < -135){
                    this.bodies["psyche_probe"].angle += 5;
                    this.icon.angle += 5;
                    this.angle +=5; 
                } else if(this.angle > -135){
                    this.bodies["psyche_probe"].angle -= 5;
                    this.icon.angle -= 5;
                    this.angle -=5; 
                }
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

        // create probe's view
        let centerX = this.bodies["psyche_probe"].x;
        let centerY = this.bodies["psyche_probe"].y;
        let viewR = 100;
        this.graphics.fillStyle(0xFFFFFF, 0.3);

        let endRotation = this.bodies["psyche_probe"].rotation + Math.PI;
        if (endRotation > 2 * Math.PI) {
            endRotation -= (2 * Math.PI);
        }
        let startRotation = endRotation + Phaser.Math.DegToRad(90);
        if (startRotation > 2 * Math.PI) {
            startRotation -= (2 * Math.PI);
        }

        let probeView = this.graphics.slice(centerX, centerY, viewR, startRotation, endRotation, true);
        this.minimap.ignore(probeView);
        this.graphics.fillPath();
    }

    createPauseButton() {
        this.playButton = this.add.image(964, 708, 'play').setScale(0.5)
        this.pauseButton = this.add.image(964, 708, 'pause').setScale(0.5)
        this.restartButton = this.add.image(520, 408, 'restart').setScale(0.5)
        this.exitButton = this.add.image(520, 508, 'exit').setScale(0.5)

        this.input.keyboard
            .on('keydown-P', () => {
                this.playButton.setTint(0xF47D33);
                this.pauseButton.setTint(0xF47D33);
            }).on('keyup-P', () => {
                // disable pause when in the taking photo page
                if (!this.takingPhoto) {
                    this.playButton.setTint(0xFFFFFF);
                    this.pauseButton.setTint(0xFFFFFF);
                    this.paused = !this.paused;
                }
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
                // disable pause when in the taking photo page
                if (!this.takingPhoto) {
                    this.playButton.setTint(0xFFFFFF);
                    this.paused = !this.paused;
                }
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
                // disable pause when in the taking photo page
                if (!this.takingPhoto) {
                    this.pauseButton.setTint(0xFFFFFF);
                    this.paused = !this.paused;
                }
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
            });

        CameraManager.addUISprite(this.playButton);
        CameraManager.addUISprite(this.pauseButton);
        CameraManager.addUISprite(this.exitButton);
        CameraManager.addUISprite(this.restartButton);
        this.minimap.ignore(this.pauseButton);
        this.minimap.ignore(this.playButton);
        this.minimap.ignore(this.exitButton);
        this.minimap.ignore(this.restartButton);
    }

    updatePauseButton() {
        if (this.paused) {
            this.playButton.setVisible(true)
            this.pauseButton.setVisible(false)
            this.pauseText.setVisible(true)
            this.restartButton.setVisible(true)
            this.exitButton.setVisible(true)
        } else {
            this.pauseButton.setVisible(true)
            this.playButton.setVisible(false)
            this.pauseText.setVisible(false)
            this.restartButton.setVisible(false)
            this.exitButton.setVisible(false)
        }
    }

    updateTakePhoto() {
        if (!this.takingPhoto) {
            this.foundPsycheText.setVisible(false);  
             this.quitPhotoPageButton.setVisible(false);
        } else {
            this.quitPhotoPageButton.setVisible(true);
        }
    }
    
    createOrbitToggle() {
        this.orbitToggle = this.add.image(56, 708, 'orbit').setScale(0.5);
        CameraManager.addUISprite(this.orbitToggle);

        this.input.keyboard
            .on('keyup-SHIFT', () => {
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
                this.bodies["psyche_probe"].orbitToggle = !this.bodies["psyche_probe"].orbitToggle;
                this.orbitToggle.setTint(this.bodies["psyche_probe"].orbitToggle ? 0xF47D33 : 0xFFFFFF);
            });
    }

    takePhoto() {
        this.foundPsycheText = this.add.text(100, 300, 'You found Psyche!');
        this.foundPsycheText.setFontSize(80);
        this.minimap.ignore(this.foundPsycheText);
        this.input.keyboard
            .on('keyup-SPACE', () => {
                this.takingPhoto = !this.takingPhoto;

                let viewR = 100;
                let endRotation = this.bodies["psyche_probe"].rotation + Math.PI;
                if (endRotation > 2 * Math.PI) {
                    endRotation -= (2 * Math.PI);
                }
                let startRotation = endRotation + Phaser.Math.DegToRad(90);
                if (startRotation > 2 * Math.PI) {
                    startRotation -= (2 * Math.PI);
                }

                // check if pyche is in the view
                if (this.bodies["psyche_probe"].isInView("psyche", viewR, startRotation, endRotation)) {
                    this.foundPsycheText.setVisible(true);
                    console.log("psyche in view!");
                }
            });

        this.quitPhotoPageButton = this.add.text(300, 400, 'Back to game')
            .setFontSize(50)
            .setStyle({
                color: '#111',
                backgroundColor: '#fff',
            })
            .setPadding(10)
            .setInteractive({useHandCursor: true })
            .on('pointerdown', () => {
                this.takingPhoto = !this.takingPhoto;
                this.quitPhotoPageButton.setVisible(false);
                
            })
            .setVisible(false);
        this.minimap.ignore(this.quitPhotoPageButton);
    }
}
