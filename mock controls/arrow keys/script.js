const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

const keys = [];

//Player
const playerLeft = new Image();
playerLeft.src = 'probe_left.png';

const playerRight = new Image();
playerRight.src = 'probe_right.png';

class Player{
    constructor(){
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
        this.speed = 5;
        this.moving = false;
    }
    update(){
        if(keys[38] && this.y > 0){
            this.y -= this.speed;
        }
        if(keys[37] && this.x > 0){
            this.x -= this.speed;
        }
        if(keys[40] && this.y < canvas.height - 61){
            this.y += this.speed;
        }
        if(keys[39] && this.x < canvas.width - 40){
            this.x += this.speed;
        }
    }
    
}
const player = new Player();

//Animation Loop
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerLeft,0,0,player.spriteWidth, player.spriteHeight, player.x, player.y, 40, 61);
    player.update();
    requestAnimationFrame(animate);
}

animate();

window.addEventListener("keydown", function(event){
    keys[event.keyCode] = true;
});

window.addEventListener("keyup", function(event){
    delete keys[event.keyCode];
});