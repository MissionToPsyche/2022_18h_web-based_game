//creating game config object
var config = {
    type: Phaser.AUTO, //sets renderer to use WebGL where available, and canvas for everything else.
    //setting game screen size
    width: 1024,
    height: 768,
    backgroundColor: '#12031d',
    physics: {
        //setting physics to "matter" an engine capable of a lot of body sim tools
        default: 'matter', 
        matter: {
            gravity: {
                //setting universal gravity in both x and y directions to 0
                scale: 0 
            }
        }
    },
    //defining game scenes
    scene: [MainMenu, Freeplay]
}

var game = new Phaser.Game(config);
