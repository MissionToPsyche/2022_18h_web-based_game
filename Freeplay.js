class Freeplay extends Phaser.Scene {
    constructor () {
        super({key:"Freeplay"});
        //creating body objects
        this.bodies = {};
        this.json;
        this.keyToggle = false //for testing only
        this.paused = false
        this.graphics;
        this.gravText;
        this.path;
        this.curve;
        this.points;
        this.graphics;
        this.pauseIndicator;
        this.direction;
    }

    preload () {
        this.load.json('bodies', 'data/bodies.json');

        //loading in all image assets
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('play', 'img/icons/play-circle.svg'); //asset for psyche logo
        this.load.image('pause', 'img/icons/pause-circle.svg'); //asset for psyche logo
        this.load.image('direction', 'img/icons/direction.png'); // an arrow

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
        this.load.image('saturn', "img/icons/saturn.svg");
        this.load.image('sol', "img/icons/sol.svg");
        this.load.image('uranus', "img/icons/uranus.svg");
        this.load.image('venus', "img/icons/venus.svg");
    }

    create () {
        this.graphics = this.add.graphics();

        this.path = { t: 0, vec: new Phaser.Math.Vector2() };

        this.curve = new Phaser.Curves.Spline(this.points);

        //Solar system is 2048x2048
        this.matter.world.setBounds(0, 0, 2048, 2048);

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
        CameraManager.addGameSprite(this.graphics); //adding graphics to game sprites so that it doesn't show up in UI.

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
        var logo = this.add.image(50,50,'logo').setScale(0.5);
        this.gravText = this.add.text(4, 90, '0')
        this.gravText.setText("Gravity: ON")
        this.playIndicator = this.add.image(964, 708, 'play').setScale(0.5)
        this.pauseIndicator = this.add.image(964, 708, 'pause').setScale(0.5)

        //adding to UIsprites so main camera ignores them
        CameraManager.addUISprite(logo);
        CameraManager.addUISprite(this.gravText);
        CameraManager.addUISprite(this.playIndicator);
        CameraManager.addUISprite(this.pauseIndicator);

        //creating control keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        this.input.on("pointerdown", function (pointer){
            if ((pointer.x > 934) && (pointer.x < 994) && (pointer.y > 678) &&(pointer.y < 738)) {
                this.paused = !this.paused;
            }
        }, this);
        console.log(Phaser.Input.Keyboard.SPACEBAR)
    }

    //this is the scene's main update loop
    update () {
        //Probe controls
        //**TO DO: Wrap in a custom controler later.
        const moveUnit = 0.01

        // update pause/play indicator
        if (this.paused) {
            this.playIndicator.setVisible(false)
            this.pauseIndicator.setVisible(true)
        } else {
            this.pauseIndicator.setVisible(false)
            this.playIndicator.setVisible(true)
        }

        // only move if not paused
        if (!this.paused) {
            if (this.cursors.left.isDown) {
                this.bodies["psyche_probe"].vel.x -= moveUnit;
            }
            else if (this.cursors.right.isDown) {
                this.bodies["psyche_probe"].vel.x += moveUnit;
            }

            if (this.cursors.up.isDown) {
                this.bodies["psyche_probe"].vel.y -= moveUnit;
            }
            else if (this.cursors.down.isDown) {
                this.bodies["psyche_probe"].vel.y += moveUnit;
            }
        }

        if (this.spaceKey.isDown) {
            this.bodies["psyche_probe"].gravityToggle = !this.keyToggle ? !this.bodies["psyche_probe"].gravityToggle : this.bodies["psyche_probe"].gravityToggle
            this.gravText.setText("Gravity: " + (this.bodies["psyche_probe"].gravityToggle ? "ON" : "OFF"))
            this.keyToggle = true
        } else if (this.pauseKey.isDown) {
            this.paused = !this.keyToggle ? !this.paused : this.paused
            this.keyToggle = true
        } else {
            this.keyToggle = false
        }

        //prevent psyche from going too far out for now
	    //note: FOR TESTING ONLY, THIS IS A BAD WAY OF DOING THIS
        if (this.bodies["psyche_probe"].x >= 650 + 1024) {
            this.bodies["psyche_probe"].vel.x = 0
            this.bodies["psyche_probe"].x = 649 + 1024
        } if (this.bodies["psyche_probe"].y >= 650 + 1024) {
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
        if (this.paused) {
            return
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

        // create probe's view
        let centerX = this.bodies["psyche_probe"].x;
        let centerY = this.bodies["psyche_probe"].y;
        let viewR = 100;
        this.graphics.fillStyle(0xFFFFFF, 0.5);

        const viewPath = new Phaser.Curves.Path();
        // start from the position of the probe
        viewPath.moveTo(centerX, centerY);

        viewPath.lineTo(centerX - viewR * Math.cos(Math.PI / 4), centerY - viewR * Math.sin(Math.PI / 4));
        viewPath.lineTo(centerX + viewR * Math.cos(Math.PI / 4), centerY - viewR * Math.sin(Math.PI / 4));
        //viewPath.ellipseTo(viewPath, viewPath, 0, 90, true, 225);
        viewPath.lineTo(centerX, centerY);
        viewPath.closePath();
        this.graphics.fillPoints(viewPath.getPoints());
    }
}