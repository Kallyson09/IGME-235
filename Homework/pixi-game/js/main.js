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
let life = 100;
let levelNum = 1;
let paused = true;

// Load all assets
loadImages();

async function loadImages() {
    // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
    PIXI.Assets.addBundle("sprites", {
        spaceship: "images/spaceship.png",
        explosions: "images/explosions.png",
        move: "images/move.png",
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
            fill: 0xff0000,
            fontSize: 48,
            fontFamily: "Verdana",
        };

        // Make top start label
        let startLabel1 = new PIXI.Text("Circle Blast!", {
            fill: 0xffffff,
            fontSize: 96,
            fontFamily: "Verdana",
            stroke: 0xff0000,
            strokeThickness: 6,
        });
        startLabel1.x = 50;
        startLabel1.y = 120;
        startScene.addChild(startLabel1);

        // Make middle start label
        let startLabel2 = new PIXI.Text("R U worthy..?", {
            fill: 0xffffff,
            fontSize: 32,
            fontFamily: "Verdana",
            fontStyle: "italic",
            stroke: 0xff0000,
            strokeThickness: 6,
        });
        startLabel2.x = 185;
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
            //app.view.onclick = fireBullet;
            levelNum = 1;
            score = 0;
            life = 100;
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
            fontSize: 18,
            fontFamily: "Verdana",
            stroke: 0xff0000,
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
        let gameOverText = new PIXI.Text("Game Over!\n        :-O", {
            fill: 0xffffff,
            fontSize: 64,
            fontFamily: "Futura",
            stroke: 0xff0000,
            strokeThickness: 6,
        });
        gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
        gameOverText.y = sceneHeight / 2 - 160;
        gameOverScene.addChild(gameOverText);

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
        lifeLabel.text = `Life:     ${life}%`;
    }

    // #5 - Create ship
    ship = new Ship(assets.spaceship);
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

    // #8 - Start update loop

    function loadLevel() {
        createCircles(levelNum * 5);
    }

    function createCircles(numCircles = 10) {
        for (let i = 0; i < numCircles; i++) {
            let c = new Circle(10, 0xffff00);
            c.x = Math.random() * (sceneWidth - 50) + 25;
            c.y = Math.random() * (sceneHeight - 400) + 25;
            circles.push(c);
            gameScene.addChild(c);
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
            if (c.x <= c.radius || c.x >= sceneWidth - c.radius) {
                c.reflectX();
                c.move(dt);
            }

            if (c.y <= c.radius || c.y >= sceneHeight - c.radius) {
                c.reflectY();
                c.move(dt);
            }
        }

        // #4 - Move Bullets


        // #5 - Check for Collisions
        for (let c of circles) {
            //circle and bullet collision


            //circle and ship collision
            if (c.isAlive & rectsIntersect(c, ship)) {
                hitSound.play();
                gameScene.removeChild(c);
                c.isAlive = false;
                decreaseLifeBy(20);
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

        //app.view.onclick = null;

        gameOverScene.visible = true;
        gameScene.visible = false;
    }



    app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas

    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}