/*MILESTONE 1 TO DO LIST:

- Fix ghost die animation
- Change sounds
- Fix movement input
- Fix fire bullet input
- Change background for main screen
- Change background for Game Over screen
- Add instructions for keyboard input
- Change cursor style

*/
// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

let sceneWidth, sceneHeight;

// aliases
let stage;
let assets;

// game variables
let startScene;
let gameScene, ship, scoreLabel, lifeLabel, shootSound, hitSound, fireballSound;
let gameOverScene;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 5;
let levelNum = 1;
let paused = true;

let gameOverScoreLabel;

// Load all assets
loadImages();

async function loadImages() {
    // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
    PIXI.Assets.addBundle("sprites", {
        spaceship: "images/main-char.png",
        ghost: "images/ghost.png",
        explosions: "images/explosions.png",
        move: "images/move.png",
        background: "images/Room-bg.png",
    });

    // The second argument is a callback function that is called whenever the loader makes progress.
    assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
        console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
    });

    setup();
}

async function setup() {
    await app.init({ width: 600, height: 600 });

    document.body.appendChild(app.canvas);

    stage = app.stage;
    sceneWidth = app.renderer.width;
    sceneHeight = app.renderer.height;

    // #1 - Create the `start` scene
    startScene = new PIXI.Container();

    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    function createLabelsAndButtons() {
        let buttonStyle = {
            fill: 0x8ee9e4,
            fontSize: 48,
            fontFamily: "Jersey 20",
        };

        // Make top start label
        let startLabel1 = new PIXI.Text("Haunted House\nHijinks", {
            fill: 0xffffff,
            fontSize: 72,
            fontFamily: "Jersey 20",
            stroke: 0x4d13b0,
            strokeThickness: 6,
            align: 'center',
        });
        startLabel1.x = (sceneWidth - startLabel1.width) / 2;
        startLabel1.y = 120;

        startScene.addChild(startLabel1);

        // Make middle start label
        let startLabel2 = new PIXI.Text("Escape the haunted house and chase\naway the mischievous ghosts that\nroam the halls...", {
            fill: 0xdfdddf,
            fontSize: 32,
            fontFamily: "Jersey 20",
            stroke: 0x4d13b0,
            strokeThickness: 6,
            align: 'center',
        });
        startLabel2.x = (sceneWidth - startLabel2.width) / 2;
        startLabel2.y = 300;
        startScene.addChild(startLabel2);

        // Make start game button
        let startButton = new PIXI.Text("Enter, if you dare!", buttonStyle);
        startButton.x = sceneWidth / 2 - startButton.width / 2;
        startButton.y = sceneHeight - 100;
        startButton.interactive = true;
        startButton.buttonMode = true;
        startButton.on("pointerup", startGame);
        startButton.on("pointerover", (e) => (e.target.alpha = 0.7));
        startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
        startScene.addChild(startButton);

        function startGame() {
            console.log("startGame called");
            startScene.visible = false;
            gameOverScene.visible = false;
            gameScene.visible = true;

            //add background
            let bg = PIXI.Sprite.from("images/Room-bg.png");
            bg.width = 600;
            bg.height = 600;
            bg.zIndex = -5;      
            bg.texture.source.scaleMode = 'nearest';      

            gameScene.addChild(bg);

            // app.view.onclick = fireBullet;
            
            document.querySelector("body").addEventListener("keydown", fireBullet);

            levelNum = 1;
            score = 0;
            life = 5;
            increaseScoreBy(0);
            decreaseLifeBy(0);
            ship.x = 300;
            ship.y = 550;
            loadLevel();

            setTimeout(() => {
                paused = false;
            }, 50);
        }

        // Set up gameScene
        let textStyle = {
            fill: 0xffffff,
            fontSize: 30,
            fontFamily: "Jersey 20",
            stroke: 0x4d13b0,
            strokeThickness: 4,
        };

        // Make score label
        scoreLabel = new PIXI.Text("", textStyle);
        scoreLabel.x = 5;
        scoreLabel.y = 5;
        gameScene.addChild(scoreLabel);
        increaseScoreBy(0);

        //Make life label
        lifeLabel = new PIXI.Text("", textStyle);
        lifeLabel.x = 5;
        lifeLabel.y = 26;
        gameScene.addChild(lifeLabel);
        decreaseLifeBy(0);

        // 3 - set up `gameOverScene`
        // 3A - make game over text
        let gameOverText = new PIXI.Text("Game Over!", {
            fill: 0xffffff,
            fontSize: 64,
            fontFamily: "Jersey 20",
            stroke: 0x4d13b0,
            strokeThickness: 6,
        });
        gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
        gameOverText.y = sceneHeight / 2 - 160;
        gameOverScene.addChild(gameOverText);

        // display final score
        gameOverScoreLabel = new PIXI.Text("Your final score: ", {
            fill: 0xffffff,
            fontSize: 32,
            fontFamily: "Jersey 20",
            stroke: 0x4d13b0,
            strokeThickness: 3,
        });
        gameOverScoreLabel.x = sceneWidth / 2 - gameOverScoreLabel.width / 2;
        gameOverScoreLabel.y = sceneHeight / 2 + 20;
        gameOverScene.addChild(gameOverScoreLabel);

        // 3B - make "play again?" button
        let playAgainButton = new PIXI.Text("Play Again?", buttonStyle);
        playAgainButton.x = sceneWidth / 2 - playAgainButton.width / 2;
        playAgainButton.y = sceneHeight - 100;
        playAgainButton.interactive = true;
        playAgainButton.buttonMode = true;
        playAgainButton.on("pointerup", startGame); // startGame is a function reference
        playAgainButton.on("pointerover", (e) => (e.target.alpha = 0.7)); // concise arrow function with no brackets
        playAgainButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0)); // ditto
        gameOverScene.addChild(playAgainButton);
    }

    function increaseScoreBy(value) {
        score += value;
        scoreLabel.text = `Score:   ${score}`;
    }

    function decreaseLifeBy(value) {
        life -= value;
        life = parseInt(life);
        lifeLabel.text = `Lives Left:     ${life}`;
    }

    // #5 - Create ship
    ship = new Ship(assets.spaceship);
    ship.texture.source.scaleMode = 'nearest';
    gameScene.addChild(ship);

    // #6 - Load Sounds
    shootSound = new Howl({
        src: ["sounds/shoot.wav"],
    });

    hitSound = new Howl({
        src: ["sounds/hit.mp3"],
    });

    fireballSound = new Howl({
        src: ["sounds/fireball.mp3"],
    });

    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();

    // #8 - Start update loop

    function loadLevel() {
        createCircles(levelNum * 2);
    }

    function createCircles(numCircles = 10) {
        for (let i = 0; i < numCircles; i++) {
            // create the ghost and give a random xy pos
            let g = new Ghost(assets.ghost);
            g.x = Math.random() * (sceneWidth - 50) + 25;
            g.y = Math.random() * (sceneHeight - 400) + 25;
            g.texture.source.scaleMode = 'nearest';
            circles.push(g);
            gameScene.addChild(g);
        }
    }

    function gameLoop() {
        if (paused) return;

        // #1 - Calculate "delta time"
        let dt = 1 / app.ticker.FPS;
        if (dt > 1 / 12) dt = 1 / 12;

        // #2 - Move Ship
        let mousePosition = app.renderer.events.pointer.global;
        // ship.position = mousePosition; <-- moves too fast + off screen

        let amt = 6 * dt;//at 60fps would move 10%/update

        //lerp
        let newX = lerp(ship.x, mousePosition.x, amt);
        let newY = lerp(ship.y, mousePosition.y, amt);

        //keep ship on screen
        let w2 = ship.width / 2;
        let h2 = ship.height / 2;

        ship.x = clamp(newX, 0 + w2, sceneWidth - w2);
        ship.y = clamp(newY, 0 + h2, sceneHeight - h2);

        // #3 - Move Circles
        for (let c of circles) {
            c.move(dt);
            if (c.x <= (c.width/3) || c.x >= sceneWidth - (c.width/3)) {
                c.reflectX();
                c.move(dt);
            }

            if (c.y <= (c.height/3) || c.y >= sceneHeight - (c.height/3)) {
                c.reflectY();
                c.move(dt);
            }
        }

        // #4 - Move Bullets
        for (let b of bullets) {
            b.move(dt);
        }

        // #5 - Check for Collisions
        for (let c of circles) {
            //circle and bullet collision
            for (let b of bullets) {
                if (rectsIntersect(c, b)) {
                    fireballSound.play();
                    createExplosion(c.x, c.y, 64, 64);
                    gameScene.removeChild(c);
                    c.isAlive = false;
                    gameScene.removeChild(b);
                    b.isAlive = false;
                    increaseScoreBy(1);
                    break;
                }
            }

            //circle and ship collision
            if (c.isAlive & rectsIntersect(c, ship)) {
                hitSound.play();
                gameScene.removeChild(c);
                c.isAlive = false;
                decreaseLifeBy(1);
            }
        }


        // #6 - Now do some clean up
        //Clean up bullets
        bullets = bullets.filter((b) => b.isAlive);

        // clean up circles
        circles = circles.filter((c) => c.isAlive);

        // clear explosions
        explosions = explosions.filter((e) => e.playing);

        // #7 - Is game over?
        if (life <= 0) {
            end();
            return; // return here so we skip #8 below
        }

        // #8 - Load next level
        if (circles.length == 0) {
            levelNum++;
            loadLevel();
        }
    }

    function end() {
        paused = true;

        // clear level
        circles.forEach((c) => gameScene.removeChild(c));
        circles = [];

        bullets.forEach((b) => gameScene.removeChild(b));
        bullets = [];

        explosions.forEach((e) => gameScene.removeChild(e));
        explosions = [];

        app.view.onclick = null;

        gameOverScene.visible = true;
        gameScene.visible = false;

        gameOverScoreLabel.text = "Your final score: " + score;
        gameOverScoreLabel.x = sceneWidth / 2 - gameOverScoreLabel.width / 2;
    }

    function fireBullet() {
        if (paused) return;

        //check which key is pressed then move
        let b = new Bullet(0xffffff, ship.x, ship.y);
        bullets.push(b);
        gameScene.addChild(b);
        shootSound.play();

        // maybe for powerup...
        // if (score >= 5) {
        //     let b2 = new Bullet(0xffffff, ship.x - 10, ship.y);
        //     bullets.push(b2);
        //     gameScene.addChild(b2);

        //     let b3 = new Bullet(0xffffff, ship.x + 10, ship.y);
        //     bullets.push(b3);
        //     gameScene.addChild(b3);
        // }
    }

    function loadSpriteSheet() {
        let spriteSheet = PIXI.Texture.from("images/explosions.png");
        let width = 64;
        let height = 64;
        let numFrames = 16;
        let textures = [];
        for (let i = 0; i < numFrames; i++) {
            let frame = new PIXI.Texture({
                source: spriteSheet,
                frame: new PIXI.Rectangle(i * width, 64, width, height),
            });

            textures.push(frame);
        }
        return textures;
    }

    function createExplosion(x, y, frameWidth, frameHeight) {
        let w2 = frameWidth / 2;
        let h2 = frameHeight / 2;
        let expl = new PIXI.AnimatedSprite(explosionTextures);
        expl.x = x - w2;
        expl.y = y - h2;
        expl.animationSpeed = 1 / 7;
        expl.loop = false;
        expl.onComplete = () => gameScene.removeChild(expl);
        explosions.push(expl);
        gameScene.addChild(expl);
        expl.play();
    }

    app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas

    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}