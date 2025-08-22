import { Scene } from 'phaser';

const WIDTH = 1024;
const HEIGHT = 768;


export class Game extends Scene {
    constructor() {
        super('Game');
        this.player = null;
        this.ground = null;
        this.clouds = null;
        
        
    }
        
    preload() {
        
        this.load.spritesheet("dino","assets/dino-run.png",{frameWidth:88,frameHeight:94})
        this.load.image("ground","assets/ground.png");
        this.load.image("cloud","assets/cloud.png");
        for(let i = 0; i < 100; i++) {
            const cactusNum = i + 1;
            this.load.image(`obstacle-${cactusNum}`,`assets/cactuses_${cactusNum}.png`);
            console.log(`loaded`)
        }
        this.load.image("game-over","assets/game-over.png");
        this.load.image("restart","assets/restart.png");
    }

    create() {
        this.isGameRunning = true;

        this.gameSpeed = 5;
        this.timer = 0;
        this.player = this.physics.add.sprite(50 ,200,"dino")
            .setOrigin(0,1)
            .setGravityY(5000)
            .setCollideWorldBounds(true)
            .setBodySize(44,92)
        this.ground = this.add
            .tileSprite(0,300,1000,30,"ground")
            .setOrigin(0,1)
        this.groundCollider = this.physics.add.staticSprite(0,300,"ground").setOrigin(0,1);
        this.groundCollider.body.setSize(1000,30);
        this.physics.add.collider(this.player, this.groundCollider);
        this.clouds = this.add.group();
        this.clouds = this.clouds.addMultiple([
                                                this.add.image(200,100,"cloud"),
                                                this.add.image(300,130,"cloud"),
                                                this.add.image(450,80,"cloud")])
        this.obstacles = this.physics.add.group({
            allowGravity: false,
        })
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.add.collider(this.obstacles,this.player,this.gameOver,null,this);
        this.gameOverText = this.add.image(0,0,"game-over");
        this.restartText = this.add.image(0,80,"restart").setInteractive();
            this.gameOverContainer = this.add
                .container(1024/2,(300/2) - 50)
                .add([this.gameOverText, this.restartText])
                .setAlpha(0); //transparency


    
    }

    update(time, delta) {
        if (!this.isGameRunning) {return;}
        this.ground.tilePositionX += this.gameSpeed;
        this.timer += delta;
        console.log(this.timer);
        if (this.timer > 1000) {
            this.obstacleNum = Math.floor(Math.random() *6 )+1;
            this.obstacles.create(750, 220, `obstacle-${this.obstacleNum}`).setOrigin(0);
            this.timer -= 1000;
        }
        Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);
        this.obstacles.getChildren().forEach(obstacle =>{
            if (obstacle.getBounds().right < 0) {
               this.obstacles.remove(obstacle);
                obstacle.destroy();
            }
        })
        const {space, up} = this.cursors;
        if (Phaser.Input.Keyboard.JustDown(space) || Phaser.Input.Keyboard.JustDown(up)&& this.player.body.onFloor()) {
            this.player.setVelocityY(-1600);
        }
        this.restartText.on('pointerdown', () => {
            this.physics.resume();
            this.player.setVelocityY(0);
            this.obstacles.clear(true, true);
            this.gameOverContainer.setAlpha(0);
            this.isGameRunning = true;
        })
        this.scoreText
    }
    gameOver() {
        this.physics.pause();
        this.timer = 0;
        this.isGameRunning = false;
        this.gameOverContainer.setAlpha(1);
    }
    
}
 
