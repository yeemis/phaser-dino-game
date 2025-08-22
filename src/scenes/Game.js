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
        this.load.image("dino-hurt","assets/dino-hurt.png");
        this.load.audio("jump","assets/jump.m4a");
        this.load.audio("hit","assets/hit.m4a");
    }

    create() {
        this.score = 0;
        this.highscore = 0;
        this.frameCounter = 0;
        this.isGameRunning = true;
        this.time = 0
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
                                                this.add.image(450,80,"cloud"),
                                                this.add.image(600,120,"cloud"),
                                                this.add.image(800,90,"cloud"),])
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
        this.scoreText = this.add.text(1000,0,"00000",{
            fontSize: 30,
            fontFamily: "Arial",
            color : "#535353" ,
            resolution: 5
        }).setOrigin(1,0);
        this.HighscoreText = this.add.text(900,0,"High score: 00000",{
            fontSize: 30,
            fontFamily: "Arial",
            color : "#535353" ,
            resolution: 5
        }).setOrigin(1,0).setAlpha(1);
        this.congratsText = this.add.text(0,0, "Congratulations!, a new high score!!!", {
            fontSize: 30,
            fontFamily: "Arial",
            color : "#ee25fcff" ,
            resolution: 5

        }).setOrigin(0).setAlpha(0);


    
    }

    update(time, delta) {
        this.time = time;
        if (time < 10000) {
            this.gameSpeed = 5;
        } else if (time < 20000) {
            this.gameSpeed = 6;
        } else if (time < 30000) {
            this.gameSpeed = 7;
        } else if (time < 40000) {
            this.gameSpeed = 8;
        } else if (time < 50000) {
            this.gameSpeed = 9;
        } else {
            this.gameSpeed = 10;
        }
        if (!this.isGameRunning) {return;}
        this.ground.tilePositionX += this.gameSpeed;
        this.timer += delta;
        console.log(this.timer);
        if (this.timer > 1000) {
            this.obstacleNum = Math.floor(Math.random() *6 )+1;
            this.obstacles.create(900, 250, `obstacle-${this.obstacleNum}`).setOrigin(0);
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
            this.player.setVelocityY(-1700);
            this.sound.play("jump");
        }
        this.restartText.on('pointerdown', () => {
            this.physics.resume();
            this.player.setVelocityY(0);
            this.obstacles.clear(true, true);
            this.gameOverContainer.setAlpha(0);
            this.congratsText.setAlpha(0);
            this.score = 0;
            this.frameCounter = 0;
            const formattedScore = String(Math.floor(this.score)).padStart(5, '0');
            this.scoreText.setText(formattedScore);
            this.isGameRunning = true;
            this.anims.resumeAll();
        })
        
        this.frameCounter++;
        if (this.frameCounter >1)
        {
            this.score += 1;
            const formattedScore = String(Math.floor(this.score)).padStart(5, '0');
            this.scoreText.setText(formattedScore) 
            this.frameCounter -= 1;
        }
        this.anims.create({
            key: 'dino-run',
            frames:this.anims.generateFrameNumbers('dino', {start:2, end:3}),
            frameRate: 10,
            repeat: -1

        })
        //if jumping, do not display dino run animation and display texture
        if (this.player.body.deltaAbsY()>4) {
            //temporarily stop runninng animation
            this.player.anims.stop();
            //set texture to first frame
            this.player.setTexture('dino', 0);
        }else{
            //otherwise, play running animation
            this.player.anims.play('dino-run', true);
        }

        

    }
    gameOver() {
        if (this.score > this.highscore) {
            this.highscore = this.score;
            const formattedHighscore = String(Math.floor(this.highscore)).padStart(5, '0');
            this.HighscoreText.setText(`High score: ${formattedHighscore}`);
            this.congratsText.setAlpha(1);
        }
        this.physics.pause();
        this.timer = 0;
        this.isGameRunning = false;
        this.gameOverContainer.setAlpha(1);
        this.anims.pauseAll();
        this.player.setTexture('dino-hurt');
        this.sound.play('hit');
    }
    
}
 
