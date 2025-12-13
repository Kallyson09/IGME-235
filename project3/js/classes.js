class Ship extends PIXI.Sprite {
    constructor(texture, x = 0, y = 0) {
        super(texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(3.25);
        this.x = x;
        this.y = y;
    }
}

class Ghost extends PIXI.Sprite {
    constructor(texture, x = 100, y = 100) {
        super(texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(3);
        this.x = x;
        this.y = y;
        this.fwd = getRandomUnitVector();
        this.speed = Math.random() * (85 - 40) + 40;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xffffff, x = 0, y = 0) {
        super();
        this.rect(-2, -3, 4, 6);
        this.fill(color);
        this.x = x;
        this.y = y;

        this.fwd = { x: 0, y: -1 };
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    setFwd(xFwd, yFwd) {
        this.fwd.x = xFwd;
        this.fwd.y = yFwd;
    }
}