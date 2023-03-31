class Simulation extends Phaser.Scene {
    constructor(gamemode, targets, starting) {
        super({ key: gamemode });

        this.bodies = {};
        this.valid_targets = targets;
        this.starting = starting;
        this.indicators = {};
        this.graphics = null;
        this.minigraphics = null;

        this.player = null;
        this.controller = null;
        this.exitPhotoButton = null;

        this.paused = false;
        this.gameOver = false;
        this.gameSuccess = false;
        this.takingPhoto = false;
        this.target_photos = {};
        this.covered_angles = {};

        this.psyche_probe_fx = null;
        this.photoBackground = null;
        this.photoBorder = null;
        this.foundTargetText = null;
        this.nearestBodyText = null;
    }

    active() {
        return !(this.paused || this.gameOver || this.gameSuccess || this.takingPhoto);
    }

    /** Loads all necessary assets for the scene before the simulation runs */
    preload() {
        this.load.json('bodies', 'data/bodies.json');

        //loading in all image assets
        this.load.image('minimap_border', 'img/icons/minimap-border.png'); //border for minimap
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('play', 'img/icons/play-circle.svg');
        this.load.image('pause', 'img/icons/pause-circle.svg');
        this.load.image('button', "img/icons/button.png"); // a default button with no text
        this.load.image('orbit', 'img/icons/orbit.svg');
        this.load.image('direction', 'img/icons/direction.png'); // an arrow
        this.load.image('exit', 'img/icons/exit.png'); // an exit button
        this.load.image('restart', 'img/icons/restart.png'); // a restart button

        //staticly loading all the individual assets for now
        //**TO DO: change to a more general method of preloading images 
        this.load.spritesheet('sun', "img/sprites/sun_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('mercury', "img/sprites/mercury_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('venus', "img/sprites/venus_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('earth', "img/sprites/earth_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('moon', "img/sprites/moon_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('mars', "img/sprites/mars_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('jupiter', "img/sprites/jupiter_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('saturn', "img/sprites/saturn_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('uranus', "img/sprites/uranus_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('neptune', "img/sprites/neptune_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('pluto', "img/sprites/pluto_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('psyche', "img/sprites/psyche_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('psyche_probe', "img/sprites/probe_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('psyche_probe_fx', "img/sprites/fx_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image('psyche_probe_icon', "img/icons/arrow.png");

        // button sfx
        this.load.audio('menu', 'assets/sfx/misc_menu_4.wav');
        this.load.audio('negative', 'assets/sfx/negative.wav');
        this.load.audio('positive', 'assets/sfx/positive.wav');

        this.load.audio('ingame_music', 'assets/music/02_Ingame.mp3');

        for (let i = 0; i < Constants.BODY_FRAMES - 2; i++) {
            let imageName = "psyche_photo_" + i;
            let filePath = "img/photos/images/psyche_" + i + ".png";
            this.load.image(imageName, filePath);
        }
    }

    create() {
        this.initializeGraphics();
        this.initializeMusic();
        this.initializeBodies();
        this.initializeProbe();
        this.initializePhotos();
    }

    update() {
        // stop the body animations and movement if game is over or paused
        if (!this.active()) {
            for (var _body in this.bodies) {
                const body = this.bodies[_body];
                body.stop()
            }
        } else {
            // fail if collided
            if (this.bodies[Constants.PROBE].collided && !this.gameOver) {
                this.gameOver = true;
                var fail_audio = this.sound.add('negative');
                fail_audio.play();
            }

            // clear previous iteration's graphics
            this.graphics.clear();
            this.minigraphics.clear();

            // prevent sudded camera jerks
            if (CameraManager.isCamChanging()) {
                CameraManager.checkDoneChanging();
            }

            this.updateOrbit();
            this.updateBodies();
            this.updateProbe();

            for (var target of this.valid_targets) {
                this.updateTargetIndicator(target);
                this.drawHint(target);
            }
        }

        return this.active();
    }

    initializeGraphics() {
        this.graphics = this.add.graphics();
        this.minigraphics = this.add.graphics();
        var logo = this.add.image(50, 50, 'logo').setScale(0.5);
        var map_border = this.add.image(880, 110, 'minimap_border').setScale(0.35);

        this.matter.world.setBounds(0, 0, 20480, 20480);

        CameraManager.initializeMainCamera(this);
        CameraManager.initializeUICamera(this);
        CameraManager.initializeMiniCamera(this);
        CameraManager.addGameSprite(this.graphics);
        CameraManager.addMinimapSprite(this.minigraphics);
        CameraManager.addUISprite(map_border);
        CameraManager.addUISprite(logo);
    }

    initializeMusic() {
        this.ingame_music = this.sound.add('ingame_music');
        if (!this.ingame_music.isPlaying) {
            this.ingame_music.play({ loop: true });
        }
    }

    initializeBodies() {
        const bodies_json = this.cache.json.get('bodies');
        for (var type in bodies_json) {
            for (var body of bodies_json[type]) {
                let id = body['id'];
                let mass = body['mass']['value'];
                let diameter = body['diameter']['value'];
                let orbit_distance = body['orbit_distance']['value'];

                if (type == "probes") {
                    this.bodies[id] = new Probe(this, id, mass, diameter);
                } else {
                    let parent = this.bodies[body['orbits']];
                    let angle = body['angle'];
                    let day_length = body['day_length']['value'];

                    this.bodies[id] = new Satellite(this, id, mass, diameter, parent, angle, orbit_distance, day_length);
                }

                this.createAnimations(id);
            }
        }

        this.bodies["earth"].subscribe(this.bodies["moon"]);
        CameraManager.setFollowSprite(this.bodies[this.starting]);
    }

    initializeProbe() {
        const fx = ["thrust", "brake"]
        this.psyche_probe_fx = this.add.sprite(this.bodies[Constants.PROBE].x, this.bodies[Constants.PROBE].y, "psyche_probe_fx")
        this.psyche_probe_fx.setDisplaySize(this.bodies[Constants.PROBE].r * 2, this.bodies[Constants.PROBE].r * 2)
            .setSize(this.bodies[Constants.PROBE].r * 2, this.bodies[Constants.PROBE].r * 2);
        this.psyche_probe_fx.setDisplayOrigin(7, 5)
        for (let i = 0; i < 2; i++) {
            const offset = 6 * i
            this.psyche_probe_fx.anims.create({
                key: "psyche_probe_fx-" + fx[i],
                frames: this.anims.generateFrameNumbers("psyche_probe_fx", { start: offset, end: offset + 5 }),
                framerate: 12,
                repeat: -1
            })
        }

        this.psyche_probe_fx.setTexture("psyche_probe_fx", 0);
        CameraManager.addGameSprite(this.psyche_probe_fx);

        for (var _body in this.bodies) {
            const body = this.bodies[_body];
            if (body.id != Constants.PROBE) {
                body.subscribe(this.bodies[Constants.PROBE]);
            }
        }

        this.player = this.bodies[Constants.PROBE];
        this.player.orbitTarget = this.bodies[this.starting];
        this.player.newTarget = this.bodies[this.starting];
        this.controller = new Controller(this, this.player);
        this.player.setController(this.controller);
    }

    initializePhotos() {
        this.photoBorder = this.add.rectangle(Constants.PHOTO_X,
            Constants.PHOTO_Y, Constants.PHOTO_BACKGROUND_WIDTH + Constants.PHOTO_BORDER,
            Constants.PHOTO_BACKGROUND_HEIGHT + Constants.PHOTO_BORDER, Constants.WHITE);
        this.photoBackground = this.add.rectangle(Constants.PHOTO_X,
            Constants.PHOTO_Y, Constants.PHOTO_BACKGROUND_WIDTH,
            Constants.PHOTO_BACKGROUND_HEIGHT, Constants.DARKBLUE);

        CameraManager.addUISprite(this.photoBorder);
        CameraManager.addUISprite(this.photoBackground);

        for (var idx in this.valid_targets) {
            var target = this.valid_targets[idx]
            this.target_photos[target] = new Array(Constants.BODY_FRAMES);
            for (var i = 0; i < Constants.BODY_FRAMES; i++) {
                let imageName = target + "_photo_" + i;
                let image = this.add.image(Constants.PHOTO_X, Constants.PHOTO_Y, imageName)
                    .setScale(Constants.PHOTO_SCALE);
                this.target_photos[target][i] = image;
                CameraManager.addUISprite(image);
            }
        }

        this.foundTargetText = this.add.text(Constants.FOUND_TARGET_TEXT_X, Constants.FOUND_TARGET_TEXT_Y, 'You found Psyche!');
        this.foundTargetText.setFontSize(Constants.THIRD_FONT_SIZE);
        this.foundTargetText.depth = 1000; // larger than 100
        this.nearestBodyText = this.add.text(Constants.NEAREST_BODY_TEXT_X, Constants.NEAREST_BODY_TEXT_Y, ' ');
        this.nearestBodyText.setFontSize(Constants.SECOND_FONT_SIZE);
        CameraManager.addUISprite(this.foundTargetText);
        CameraManager.addUISprite(this.nearestBodyText);

        // TODO: can let the player to choose difficulty
        // here default is to take photo of the psyche from four sides
        const targetAngles = Constants.FOUR_SIDES;

        this.valid_targets.forEach(target => {
            this.covered_angles[target] = Array.from({ length: targetAngles.length }, () => false);
        });

        this.exitButtonPosition = new Phaser.Geom.Point(Constants.QUIT_PHOTO_X, Constants.QUIT_PHOTO_Y);
        this.exitPhotoButton = new Button(this, { x: Constants.QUIT_PHOTO_X, y: Constants.QUIT_PHOTO_Y }, "button", "Back to Game")
        MenuManager.exitPhotoListener(this, this.exitPhotoButton);
        CameraManager.addUISprite(this.exitPhotoButton);

        this.hideTargetPhotos();
    }

    /**
     * hide all the psyche photos.
     */
    hideTargetPhotos() {
        this.photoBorder.setVisible(false);
        this.photoBackground.setVisible(false);
        this.exitPhotoButton.setVisible(false);
        this.foundTargetText.setVisible(false);
        this.nearestBodyText.setVisible(false);

        for (var _target in this.target_photos) {
            var target = this.target_photos[_target]
            for (var idx in target) {
                if (typeof (target[idx]) != "undefined") {
                    target[idx].setVisible(false);
                }
            }
        }
    }

    /**
     * show the psyche photo at a specific index. 
     * @param {number} idx - index of the psyche photo.
     */
    showTargetPhoto(target, idx) {
        this.photoBorder.setVisible(true);
        this.photoBackground.setVisible(true);

        this.target_photos[target][idx].setVisible(true);
    }

    updateTakePhoto() {
        if (!this.takingPhoto) {
            this.foundTargetText.setVisible(false);
            this.exitPhotoButton.setVisible(false);
            this.hideTargetPhotos();
            this.nearestBodyText.setVisible(false);
        } else if (this.gameSuccess) {
            this.foundTargetText.setVisible(true);
            this.exitPhotoButton.setVisible(false);
            this.nearestBodyText.setVisible(false);
        } else {
            this.exitPhotoButton.setVisible(true);
        }
    }

    createAnimations(id) {
        for (const dir of Constants.DIRECTIONS) {
            const offset = (id == Constants.PROBE ? 14 : 16) * Constants.DIRECTIONS.indexOf(dir)
            this.anims.create({
                key: id + "-" + dir,
                frames: this.anims.generateFrameNumbers(id, {
                    start: offset,
                    end: offset + (id == Constants.PROBE ? 7 : 9)
                }),
                frameRate: 12,
                repeat: -1
            });
        }

        this.bodies[id].setTexture(id, 0);
    }

    drawOrbitIndicator(path, line_width, color, alpha) {
        if (!path) {
            return
        }

        const indicator = new Phaser.Curves.Spline(path);

        this.graphics.lineStyle(line_width, color, alpha);
        indicator.draw(this.graphics, 64);
    }

    updateOrbit() {
        if (this.player.findingTarget && this.player.newTarget) {
            var target = this.player.newTarget;
            var path = new Phaser.Geom.Circle(target.x, target.y, target.r + 5).getPoints(false, 0.5);
            this.drawOrbitIndicator(path, Constants.HINT_WIDTH_BEFORE, Constants.WHITE, Constants.HINT_ALPHA_BEFORE);
        } else if (this.bodies[Constants.PROBE].orbitToggle && !this.bodies[Constants.PROBE].inOrbit) {
            const ratio = this.bodies[Constants.PROBE].maintainOrbit(this);
            let subRadius = ratio * this.player.orbitTarget.r + (5 * (1 - ratio));
            if (!subRadius) {
                subRadius = this.player.orbitTarget.r;
            }

            //creating orbit lock progress indicator
            var path = new Phaser.Geom.Circle(this.player.orbitTarget.x, this.player.orbitTarget.y, this.player.orbitTarget.r + subRadius).getPoints(false, 0.5); //path of the indicator.
            this.drawOrbitIndicator(path, Constants.HINT_WIDTH_BEFORE, Constants.WHITE, Constants.HINT_ALPHA_BEFORE);
            let subPoints = path.length * ratio;
            path.splice(Math.floor(subPoints));

            if (path.length > 0) {
                this.drawOrbitIndicator(path, Constants.HINT_WIDTH_AFTER, Constants.ORANGE, Constants.HINT_ALPHA_AFTER);
            }
        } else if (this.bodies[Constants.PROBE].inOrbit) {
            var path = this.bodies[Constants.PROBE].getOrbitPath('cur').getPoints(false, 0.5);
            this.drawOrbitIndicator(path, 1, Constants.WHITE, Constants.HINT_ALPHA_AFTER);
        }
    }

    drawOrbitPath(body) {
        const path = body.path;
        if (path && path.length > 0) {
            this.graphics.lineStyle(1, 0xffffff, 0.5);
            this.minigraphics.lineStyle(75, 0xffffff, 0.5);
            const curve = body.getPathCurve();
            curve.draw(this.graphics, 64);
            curve.draw(this.minigraphics, 64)
        }
    }

    updateBodies() {
        for (var _body in this.bodies) {
            const body = this.bodies[_body];

            // apply gravity
            body.notify()

            // draw orbit path
            this.drawOrbitPath(body)

            // update body positions
            body.updatePosition(this)

            if (body.id != Constants.PROBE) {
                var p1 = new Phaser.Geom.Point(this.bodies["sun"].x, this.bodies["sun"].y);
                var p2 = new Phaser.Geom.Point(body.x, body.y);
                let sunAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                sunAngle = Phaser.Math.RadToDeg(sunAngle)

                if (sunAngle < 0) {
                    sunAngle += 360;
                } else if (sunAngle > 360) {
                    sunAngle -= 360;
                }

                for (const idx in Constants.SHADE_ANGLES) {
                    const angle = Constants.SHADE_ANGLES[idx]
                    if ((angle[0] < sunAngle && sunAngle <= angle[1]) || (angle[0] > angle[1] && (angle[0] < sunAngle || sunAngle <= angle[1]))) {
                        body.play(body.id + "-" + Constants.DIRECTIONS[idx], true);
                        break;
                    }
                }
            } else {
                const frame = 20;
                body.setFrame(frame);
            }
        }
    }

    updateProbe() {
        const controller = this.player.getController();

        this.psyche_probe_fx.setRotation(this.bodies[Constants.PROBE].rotation);
        this.psyche_probe_fx.setPosition(this.bodies[Constants.PROBE].x, this.bodies[Constants.PROBE].y);

        if (controller.up_pressed()) {
            this.psyche_probe_fx.setVisible(true);
            this.psyche_probe_fx.play("psyche_probe_fx-thrust", true);
        } else if ((controller.left_pressed() || controller.right_pressed() || controller.down_pressed()) && controller.controlMethod == ControlMethod.FourWay) {
            this.psyche_probe_fx.setVisible(true);
            this.psyche_probe_fx.play("psyche_probe_fx-thrust", true);
        } else if (controller.down_pressed() && controller.controlMethod == ControlMethod.Tank) {
            this.psyche_probe_fx.setVisible(true);
            this.psyche_probe_fx.play("psyche_probe_fx-brake", true);
        } else {
            this.psyche_probe_fx.setVisible(false);
            this.psyche_probe_fx.stop();
        }

        let centerX = this.bodies[Constants.PROBE].x;
        let centerY = this.bodies[Constants.PROBE].y;
        let viewR = 100;
        this.graphics.fillStyle(0xFFFFFF, 0.3);

        let endRotation = this.bodies[Constants.PROBE].rotation + (3 * Math.PI / 4);
        if (endRotation > 2 * Math.PI) {
            endRotation -= (2 * Math.PI);
        }
        let startRotation = endRotation + (Math.PI / 2);
        if (startRotation > 2 * Math.PI) {
            startRotation -= (2 * Math.PI);
        }

        this.graphics.slice(centerX, centerY, viewR, startRotation, endRotation, true);
        this.graphics.fillPath();
    }

    updateTargetIndicator(target) {
        const probe = this.bodies[Constants.PROBE]
        let distance = probe.getDistance(target);

        let arrowDistance = 100;
        let width = 1024;
        let height = 768;
        let targetX = (this.bodies[target].x - probe.x) / distance;
        let targetY = (this.bodies[target].y - probe.y) / distance;

        let directionX = width / 2 + targetX * arrowDistance;
        let directionY = height / 2 + targetY * arrowDistance;

        // calculate the rotation of the arrow image
        let directionAngle = Math.asin(targetY);
        if (targetX < 0) {
            directionAngle = Math.PI - directionAngle;
        }

        let indicator = this.indicators[target]
        if (typeof (indicator) == "undefined") {
            indicator = this.add.image(directionX, directionY, 'direction').setScale(0.3);
            CameraManager.addUISprite(indicator);
            // make the direction indicator not on top of other page such as pause menu
            indicator.depth = -1;
            this.indicators[target] = indicator;
        }

        if (probe.orbitToggle) {
            // earth is not the center, edit direction
            let centerX = CameraManager.getCameraCenter().x;
            let centerY = CameraManager.getCameraCenter().y;

            let offsetX = centerX - probe.x;
            let offsetY = centerY - probe.y;

            let zoom = CameraManager.getMainCameraZoom();

            offsetX *= zoom;
            offsetY *= zoom;

            directionX -= offsetX;
            directionY -= offsetY;
        }

        // set the correct position and angle of the arrow to point to psyche
        indicator.setPosition(directionX, directionY);
        indicator.rotation = directionAngle;

        // decrease opacity when near psyche
        if (distance < 90) {
            indicator.alpha = (distance - 50) / 50;
        } else {
            indicator.alpha = 0.8;
        }
    }

    drawHint(target) {
        const body = this.bodies[target]
        if (typeof (body) == "undefined") {
            return;
        }

        let targetX = body.x;
        let targetY = body.y;
        let strokeSize = body.r + Constants.HINT_DISTANCE;
        this.graphics.lineStyle(Constants.HINT_WIDTH_BEFORE, Constants.WHITE, Constants.HINT_ALPHA_BEFORE);

        const segments = 32;
        const angleStep = (2 * Math.PI) / segments;

        for (let i = 0; i < segments; i += 2) {
            let startX = Math.cos(i * angleStep) * strokeSize + targetX;
            let startY = Math.sin(i * angleStep) * strokeSize + targetY;
            let endX = Math.cos((i + 1) * angleStep) * strokeSize + targetX;
            let endY = Math.sin((i + 1) * angleStep) * strokeSize + targetY;

            this.graphics.lineStyle(Constants.HINT_WIDTH_BEFORE, Constants.WHITE, Constants.HINT_ALPHA_BEFORE);
            this.graphics.lineBetween(startX, startY, endX, endY);
        }

        // draw arcs for the covered target angles
        const angles = this.covered_angles[body.id]
        if (typeof (angles) != "undefined") {
            let arcSize = 180 / angles.length;
            for (let i = 0; i < angles.length; i++) {
                if (angles[i]) {
                    arcAround(targetX, targetY, strokeSize, Constants.FOUR_SIDES[i], arcSize, this.graphics);
                }
            }
        }
    }



    /**
     * Event for when the photo key is pressed
     */
    photoKeyEvent() {
        // disable spacebar take photo when paused
        if ((!this.paused) && (!this.gameOver) && (!this.gameSuccess)) {
            this.takingPhoto = !this.takingPhoto;

            let viewR = Constants.VIEW_R;

            let target_in_view = false;
            for (var _target in this.valid_targets) {
                var target = this.valid_targets[_target];
                const viewAngle = this.bodies[Constants.PROBE].viewAngle(target, viewR);

                let targetAngle = viewAngle;
                if (viewAngle != -1) {
                    target_in_view = true;
                    this.foundTargetText.setVisible(true);
                    targetAngle = Phaser.Math.RadToDeg(viewAngle);

                    if (targetAngle < 0) {
                        targetAngle += 360;
                    } else if (targetAngle > 360) {
                        targetAngle -= 360;
                    }
                } else {
                    continue;
                }

                let angles = this.covered_angles[target];
                for (let i = 0; i < angles.length; i++) {
                    if ((Math.abs(targetAngle - Constants.FOUR_SIDES[i]) <= Constants.ONE_PHOTO_ANGLE)
                        || (Math.abs(targetAngle - Constants.FOUR_SIDES[i] + 360) <= Constants.ONE_PHOTO_ANGLE)
                        || (Math.abs(targetAngle - Constants.FOUR_SIDES[i] - 360) <= Constants.ONE_PHOTO_ANGLE)) {
                        this.showTargetPhoto(target, i);
                        // this photo covers the target angle targetAngles[i], set the flag
                        if (this.covered_angles[target][i]) {
                            this.foundTargetText.setText("You have already taken\nphoto of this side, please\ntake photo of other sides.");
                        } else {
                            // taking photo, play positive sfx
                            var positive_audio = this.sound.add('positive');
                            positive_audio.play();
                            this.covered_angles[target][i] = true;
                            this.foundTargetText.setText("Good job! You just took\nphoto of a new " + target + " side!");
                        }
                    }
                }

                // check sides covered
                let sidesCovered = 0;
                angles = this.covered_angles[target];
                for (let i = 0; i < angles.length; i++) {
                    if (angles[i]) {
                        sidesCovered++;
                    }
                }
                console.log("now " + sidesCovered + " of " + angles.length + " sides covered");

                if (sidesCovered == angles.length) {
                    this.foundTargetText.setText("Good job! You successfully\ncovered all " + target + " sides!");
                    this.exitPhotoButton.setVisible(false);
                }

                break;
            }

            if (!target_in_view) {
                let currentDistance = 10000; // random big number
                let nearestBody = null;
                for (var body in this.bodies) {
                    if (body == Constants.PROBE || this.valid_targets.includes(body)) {
                        continue;
                    }

                    let viewAngle = this.bodies[Constants.PROBE].viewAngle(body, viewR)
                    if (viewAngle != -1) {
                        // this body is in probe's view, keep the distance
                        let thisBodyDistance = this.bodies[Constants.PROBE].getDistance(body);
                        if (thisBodyDistance < currentDistance) {
                            currentDistance = thisBodyDistance;
                            nearestBody = body;
                        }
                    }
                }

                let nearestInfo = "";
                if (nearestBody != null) {
                    nearestInfo = "You found the ";
                    nearestInfo += toTitleCase(nearestBody);
                    nearestInfo += ", \nbut you should try \nto find one of your targets.";
                }

                this.nearestBodyText.setText(nearestInfo);
                this.nearestBodyText.setVisible(true);
            }
        }
    }
}

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}