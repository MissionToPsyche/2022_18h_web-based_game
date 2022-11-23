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
        this.keyToggle = false; //for testing only
        this.paused = false;
        this.path;
        this.curve;
        this.points;
        this.graphics;
        this.minigraphics;
        this.direction;
        this.pauseText;
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
        this.minigraphics = this.add.graphics();

        this.path = { t: 0, vec: new Phaser.Math.Vector2() };

        this.curve = new Phaser.Curves.Spline(this.points);

        //Solar system is 6144x6144
        this.matter.world.setBounds(0, 0, 20480, 20480);

        //initializing cameras
        CameraManager.initializeMainCamera(this);
        CameraManager.initializeUICamera(this);
        CameraManager.initializeMiniCamera(this);

        var map_border = this.add.image(880,110,'minimap_border').setScale(0.35);

        this.pauseText = this.add.text(340, 220, 'Pause');
        this.pauseText.setFontSize(120);

        //creating Body objects
        this.json = this.cache.json.get('bodies');
        for (var type in this.json) {
            for (var body of this.json[type]) {
                let id = body['id'];
                let mass = body['mass']['value'];
                let diameter = body['diameter']['value'];
                let orbit_distance = body['orbit_distance']['value'];

                let collisionGroup1 = this.matter.world.nextGroup(true);
                let collisionGroup2 = this.matter.world.nextGroup();

                if(type != "probes"){
                    let parent = this.bodies[body['orbits']];
                    let angle = body['angle'];
                    this.bodies[id] = new Satellite(this, id, mass, diameter, parent, angle, orbit_distance);
                } else {
                    this.bodies[id] = new Probe(this, id, mass, diameter);
                }
            }
        }

        CameraManager.addGameSprite(this.graphics);
        CameraManager.addMinimapSprite(this.minigraphics);
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
        this.newCamTarget = this.bodies["earth"];
        CameraManager.setFollowSprite(this.bodies["earth"]);

        //creating UISprites
        var logo = this.add.image(50,50,'logo').setScale(0.5);
        this.gravText = this.add.text(4, 90, '0')
        this.gravText.setText("Gravity: ON")
        this.lockText = this.add.text(4, 120, '0')
        this.lockText.setText("Orbit Lock: ON")
        this.playIndicator = this.add.image(964, 708, 'play').setScale(0.5)
        this.pauseIndicator = this.add.image(964, 708, 'pause').setScale(0.5)

        //adding to UIsprites so main camera ignores them
        CameraManager.addUISprite(logo);
        CameraManager.addUISprite(this.lockText);
        CameraManager.addUISprite(map_border);

        //creating control keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.gravKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.createPauseButton();
        this.createOrbitToggle();

        this.input.on("pointerdown", function (pointer){
            if ((pointer.x > 934) && (pointer.x < 994) && (pointer.y > 678) &&(pointer.y < 738)) {
                this.paused = !this.paused;
            }
        }, this);
        var logo = this.add.image(50, 50, 'logo').setScale(0.5);
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

        // only move if not paused
        if (this.paused) {
            return
        } else {
            if (this.cursors.left.isDown) {
                this.bodies["psyche_probe"].vel.x -= moveUnit;
                //Either turn the probe left or right depending on its current angle.
                if(this.angle > -45){
                    this.bodies["psyche_probe"].angle -= 5;
                    this.bodies["psyche_probe"].minimap_icon.angle -= 5;
                    this.angle -=5; 
                } else if(this.angle < -45){
                    this.bodies["psyche_probe"].angle += 5;
                    this.bodies["psyche_probe"].minimap_icon.angle += 5;
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
                    this.bodies["psyche_probe"].minimap_icon.angle += 5;
                    this.angle +=5; 
    
                } else if(this.angle > 135){
                    this.bodies["psyche_probe"].angle -= 5;
                    this.bodies["psyche_probe"].minimap_icon.angle -= 5;
                    this.angle -=5; 
                }
            }
            if (this.cursors.up.isDown)
            {
                this.bodies["psyche_probe"].vel.y -= moveUnit;
    
                //Either turn the probe left or right depending on its current angle.
                if(this.angle > 45){
                    this.bodies["psyche_probe"].angle -= 5;
                    this.bodies["psyche_probe"].minimap_icon.angle -= 5;
                    this.angle -=5; 
                } else if(this.angle < 45){
                    this.bodies["psyche_probe"].angle += 5;
                    this.bodies["psyche_probe"].minimap_icon.angle += 5;
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
                    this.bodies["psyche_probe"].minimap_icon.angle += 5;
                    this.angle +=5; 
                } else if(this.angle > -135){
                    this.bodies["psyche_probe"].angle -= 5;
                    this.bodies["psyche_probe"].minimap_icon.angle -= 5;
                    this.angle -=5; 
                }
            }
        }

        // don't update bodies if paused
        if (this.paused) {
            return
        }

        if (this.gravKey.isDown) {
            this.bodies["psyche_probe"].gravityToggle = !this.keyToggle ? !this.bodies["psyche_probe"].gravityToggle : this.bodies["psyche_probe"].gravityToggle
            this.gravText.setText("Gravity: " + (this.bodies["psyche_probe"].gravityToggle ? "ON" : "OFF"))
            this.keyToggle = true
        /*
        } else if (this.lockKey.isDown) {
            if (this.bodies["psyche_probe"].lockToggle && !this.keyToggle) {
                this.bodies["psyche_probe"].stopOrbitLock();
            } else if (!this.keyToggle) {
                this.bodies["psyche_probe"].startOrbitLock(this);
            }
            this.lockText.setText("Orbit Lock: " + (this.bodies["psyche_probe"].lockToggle ? "ON" : "OFF"));
            this.keyToggle = true;
        */
        } else {
            this.keyToggle = false
        }

        /*
        //prevent psyche from going too far out for now
	    //note: FOR TESTING ONLY, THIS IS A BAD WAY OF DOING THIS
        if (this.bodies["psyche_probe"].x >= 5400 + 12288) {
            this.bodies["psyche_probe"].vel.x = 0
            this.bodies["psyche_probe"].x = 5399 + 12288
        } if (this.bodies["psyche_probe"].y >= 5400 + 12288) {
            this.bodies["psyche_probe"].vel.y = 0
            this.bodies["psyche_probe"].y = 5399 + 12288
        } if (this.bodies["psyche_probe"].x <= -5400 + 12288) {
            this.bodies["psyche_probe"].vel.x = 0
            this.bodies["psyche_probe"].x = -5399 + 12288
        } if (this.bodies["psyche_probe"].y <= -5400 + 12288) {
            this.bodies["psyche_probe"].vel.y = 0
            this.bodies["psyche_probe"].y = -5399 + 12288
        }
        */

        this.graphics.clear(); //clear previous itteration's graphics
        this.minigraphics.clear();

        //if the camera is changing it's follow target,
        //slowly move to the position of target before targeting it
        //to prevent sudded camera jerks.
        if (CameraManager.isCamChanging()) {
            CameraManager.checkDoneChanging();
        }

        //for probe's gravity lock functionality:
        if (this.bodies["psyche_probe"].orbitToggle && !this.bodies["psyche_probe"].inOrbit) {
            this.bodies["psyche_probe"].maintainOrbit();
        } else if (this.bodies["psyche_probe"].inOrbit){
            //draw the orbit boundries if probe is locked in an orbit
            this.graphics.lineStyle(1, 0xff0000, 0.5);
            this.bodies["psyche_probe"].getOrbitPath('min').draw(this.graphics, 64);
            this.graphics.fillStyle(0x00ff00, 1);

            this.graphics.lineStyle(1, 0x0000ff, 0.5);
            this.bodies["psyche_probe"].getOrbitPath('max').draw(this.graphics, 64);
            this.graphics.fillStyle(0x00ff00, 1);
        }

        for (const body in this.bodies) {
            //apply dynamic gravity
            //NOTE: THIS IS A BAD PLACE TO DO THIS. MOVE THIS TO AN APPROPRIATE PLACE LATER!!
            this.bodies[body].notify() 

            //draw paths
            var path = this.bodies[body].path;
            if(path && path.length > 0){
                this.graphics.lineStyle(1, 0xffffff, 0.5);
                this.minigraphics.lineStyle(75, 0xffffff, 0.5);
                let curve = this.bodies[body].getPathCurve();
                curve.draw(this.graphics, 64);
                curve.draw(this.minigraphics, 64)
        
                this.graphics.fillStyle(0x00ff00, 1);
                this.minigraphics.fillStyle(0x00ff00, 1);
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
                CameraManager.addMinimapSprite(this.direction);
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
        CameraManager.addMinimapSprite(this.pauseButton);
        CameraManager.addMinimapSprite(this.playButton);
        CameraManager.addMinimapSprite(this.exitButton);
        CameraManager.addMinimapSprite(this.restartButton);
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
    
    createOrbitToggle() {
        this.orbitButton = this.add.image(56, 708, 'orbit').setScale(0.5);
        this.orbitButton.setTint(0xF47D33);
        CameraManager.addUISprite(this.orbitButton);

        this.input.keyboard
            .on('keyup-SPACE', () => {
                if (!this.bodies["psyche_probe"].orbitToggle) { 
                    this.bodies["psyche_probe"].startOrbitLock(this);
                } else {
                    this.bodies["psyche_probe"].stopOrbitLock();
                }
                this.orbitButton.setTint(this.bodies["psyche_probe"].orbitToggle ? 0xF47D33 : 0xFFFFFF);
            });

        this.orbitButton.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.orbitButton.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.orbitButton.setTint(this.bodies["psyche_probe"].orbitToggle ? 0xF47D33 : 0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.orbitButton.setTint(0xF47D33);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.orbitButton.setTint(this.bodies["psyche_probe"].orbitToggle ? 0xF47D33 : 0xFFFFFF);
                if (!this.bodies["psyche_probe"].orbitToggle) { 
                    this.bodies["psyche_probe"].startOrbitLock(this);
                } else {
                    this.bodies["psyche_probe"].stopOrbitLock();
                }
            });
    }
}
