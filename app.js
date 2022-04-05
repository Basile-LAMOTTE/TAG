PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application();
app.renderer.backgroundColor = 0x211f30;
app.renderer.view.style.position = 'absolute';
app.renderer.resize(window.innerWidth, window.innerHeight);
const graphics = new PIXI.Graphics();
const pixel = new PIXI.Graphics();
const SCALE = 1.8
const OFFSETX = (app.screen.width/2)-800*0.9
const OFFSETY = (app.screen.height/2)-448*0.9

document.body.appendChild(app.view);

// ------ Map colision ------

var map = [
    "00000000000000000000000000000000000000000000000000",
    "00000000000011111111111111111111111111111111100000",
    "00000000011111111111111111111111111111111111111000",
    "00000111111111111111111111111111111111111111111100",
    "00001111111000111111111111111111111111111111111100",
    "00111111111111111111111111111111111111111111111100",
    "00111111111111111111111001111111111111111111111100",
    "00111111111111111111111001111111111111111111111100",
    "00111111111111111111111111111111111111111111111100",
    "00111111111111111111111111111111111100000111111100",
    "00111111111111111111111111111111111111111111111100",
    "00111111111111111111111111111111111111111111111100",
    "00111111111111111111111111111111111111111111111100",
    "00001111111111111000000001111111111111111111111100",
    "00001111111111111111111111111111111111111111111100",
    "00001111111111111111111111111111111111111111111100", //15
    "00001111111111111111111111111111111111000111111100",
    "00001111101111111111111111111111111111111111111100",
    "00001111110001111111111111111111111111111111111100",
    "00001111111111111111100111111111111111111111111100",
    "00000111111111111111100111111111111111111111100000",
    "00000111111111111111111111111111000111111111100000",
    "00000011111111111111111111111111111111111111000000",
    "00000001111111111111111111000111111111111110000000",
    "00000000011111111111111111000111111111111000000000",
    "00000000000011111111111110000111111111000000000000", //25
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000"
];

// ------ Backgfloor image ------
const mapSprite = PIXI.Sprite.from('./terrain.png');

mapSprite.anchor.set(0.5);
// mapSprite.filters = [new PIXI.filters.GlitchFilter(10)]
mapSprite.x = app.screen.width / 2;
mapSprite.y = app.screen.height / 2;
mapSprite.scale.set(SCALE, SCALE);
//800, 448

graphics.beginFill(0x00D8FF);
graphics.drawRect(OFFSETX, OFFSETY, 800*SCALE, 448*SCALE);
graphics.endFill();
app.stage.addChild(graphics);
app.stage.addChild(mapSprite);

// ------ Character ------
// app.loader.load(setup)

const blur = new PIXI.filters.MotionBlurFilter([0, 0], 5);

let textures = []
for (let i = 0; i < 4; i++) {
    const texture = PIXI.Texture.from(`./character/adventurer-idle-0${i}.png`);
    textures.push(texture);
}
const standing = new PIXI.AnimatedSprite(textures);
standing.scale.set(4, 4)
standing.anchor.set(0.5)
standing.animationSpeed = 0.1
standing.play();

textures = []
for (let i = 0; i < 6; i++) {
    const texture = PIXI.Texture.from(`./character/adventurer-run-0${i}.png`);
    textures.push(texture);
}
const running = new PIXI.AnimatedSprite(textures);
running.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
running.scale.set(4, 4);
running.anchor.set(0.5);
running.animationSpeed = 0.2;
running.animationSpeed = 0.2;
running.play();

let character = {
    x: app.screen.width/2.5, y: 750,//app.screen.height/1.26,
    vx: 10, vy: 0,
    direction: 0,
    activeAnim: standing,
    touchingFloor: true,
    jumped: false
};

let kb = {
    ArrowRight: false,
    ArrowLeft: false,
    Space: false
}

const coliding = coord => !map[coord[1]][coord[0]]

function testCollision(worldX, worldY) {
    let hitbox = [
        [Math.floor((worldX-OFFSETX)/(16*SCALE)), Math.floor((worldY-OFFSETY)/(16*SCALE))+1],
        [Math.floor((worldX-OFFSETX)/(16*SCALE)), Math.floor((worldY-OFFSETY)/(16*SCALE))],
        [Math.floor((worldX-OFFSETX)/(16*SCALE)), Math.floor((worldY-OFFSETY)/(16*SCALE))-1],
        [Math.floor((worldX-OFFSETX)/(16*SCALE)), Math.floor((worldY-OFFSETY)/(16*SCALE))-2]
    ]
    if (hitbox.some(coliding))
        return false;
    return true;
}

document.addEventListener('keydown', function(e) {
    if (e.key === "ArrowRight") {
        kb.ArrowRight = true;
        character.activeAnim = running;
        running.scale.x = 4;
        standing.scale.x = 4;
    }
    if (e.key === "ArrowLeft") {
        kb.ArrowLeft = true;
        character.vx = Math.max(-8, character.vx - 2);
        character.activeAnim = running;
        running.scale.x = -4;
        standing.scale.x = -4;
    }
    if (e.key === " " && touchingGround) {
        key.Space = true;
    }
})

document.addEventListener('keyup', function(e) {
    if (e.key === "ArrowRight" && kb.ArrowRight) {
        kb.ArrowRight = false;
        character.direction = 0;
        character.activeAnim = standing
    }
    if (e.key === "ArrowLeft" && kb.ArrowLeft) {
        kb.ArrowLeft = false;
        character.direction = 0;
        character.activeAnim = standing
    }
    if (e.key === " ") {
        key.Space = false;
    }
})

// Listen for frame updates
app.ticker.add((time) => {

    // console.log("x =", Math.floor((character.x+OFFSETX)/(16*SCALE))-4, "y =", Math.floor((character.y+OFFSETY)/(16*SCALE))-3)
    // console.log("TRUEx =", character.x, "TRUEy =", character.y)

    character.vy = Math.min(12, character.vy + 1)
    if (character.vx > 0) {
        character.vx -= 1;
    }
    if (character.vx < 0) {
        character.vx += 1;
    }
    console.log("vx =", character.vx);
    let touchingGround = testCollision(
        character.x + 2,
        character.y + 16 * SCALE * 2 + 1
      ) || testCollision(
        character.x + 16 * SCALE - 3,
        character.y + 16 * SCALE * 2 + 1
    );

    if (character.vy > 0) {
        for (let i = 0; i < character.vy; i++) {
            let testX1 = character.x + 2;
            let testX2 = character.x + 16 * SCALE - 3;
            let testY = character.y + 16 * SCALE * 2;
            if (testCollision(testX1, testY) || testCollision(testX2, testY)) {
                character.vy = 0;
                break;
            }
            character.y = character.y + 1;
        }
    }
    if (character.vy < 0) {
        for (let i = character.vy; i < 0; i++) {
          let testX1 = character.x + 2;
          let testX2 = character.x + 16 * SCALE - 3;
          let testY = character.y + 5;
          if (testCollision(testX1, testY) || testCollision(testX2, testY)) {
            character.vy = 0;
            break;
          }
          character.y = character.y - 1;
        }
    }
    if (character.vx > 0) {
        character.direction = 0;
        for (let i = 0; i < character.vx; i++) {
            let testX = character.x + 16 * SCALE - 2;
            let testY1 = character.y + 5;
            let testY2 = character.y + 16 * SCALE;
            let testY3 = character.y + 16 * SCALE * 2 - 1;
            if (testCollision(testX, testY1) || testCollision(testX, testY2) || testCollision(testX, testY3)) {
                character.vx = 0;
                break;
            }
            character.x = character.x + 1;
        }
    }

    if (character.vx < 0) {
        character.direction = 1;
        for (let i = character.vx; i < 0; i++) {
            let testX = character.x + 1;
            let testY1 = character.y + 5;
            let testY2 = character.y + 16 * SCALE;
            let testY3 = character.y + 16 * SCALE * 2 - 1;
            if (testX < 0 || testCollision(testX, testY1) || testCollision(testX, testY2) || testCollision(testX, testY3)) {
                character.vx = 0;
                break;
            }
            character.x = character.x - 1;
        }
    }
    if (kb.ArrowRight) {
        console.log("KeyRight");
        character.direction = 0;
        character.vx = Math.min(8, character.vx + 2);
    }
    if (kb.ArrowLeft) {
        character.direction = 1;
        character.vx = Math.max(-8, character.vx - 2);
    }
    if (!kb.Space && touchingGround && character.jumped) {
        character.jumped = false;
    }
    if (kb.Space && touchingGround && !character.jumped) {
        character.vy = -19;
        character.jumped = true;
    }
    // console.log("vy = ", character.vy);
    // console.log("touchingGround:", touchingGround);

    blur.velocity = [character.vx, character.vy]
    running.position.set(character.x, character.y);
    standing.position.set(character.x, character.y)
    running.visible = false
    standing.visible = false
    character.activeAnim.visible = true
    app.stage.addChild(character.activeAnim);
});

app.loader.onError.add((error) => console.error(error));


// ------ Title ------
const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    dropShadow: true,
    dropShadowAlpha: 0.8,
    dropShadowAngle: 2.1,
    dropShadowBlur: 4,
    dropShadowColor: '0x111111',
    dropShadowDistance: 5,
    fill: ['#FFE800'], // ['#00CD66', '#8B4513'],
    stroke: '#000000',
    fontSize: 28,
    fontWeight: 'lighter',
    lineJoin: 'floor',
    strokeThickness: 12,
});


pixel.beginFill(0xFFFFFF);
// for (let i = 0; i < map.length; i++)
//     for (let y = 0; y < map[i].length; y++)
//         if (map[i][y] == 1) {
//             console.log("DRAW");
//             console.log(OFFSETX, ((app.screen.width/2)-800*0.9))
//             pixel.drawRect(y*16*SCALE+OFFSETX, i*16*SCALE+OFFSETY, 16*SCALE, 16*SCALE);
//         }
pixel.drawRect(10*16*SCALE+OFFSETX, 18*16*SCALE+OFFSETY, 16*SCALE, 16*SCALE);
pixel.drawRect(380, 750-16*SCALE, 16*SCALE, 16*SCALE);
pixel.endFill();
app.stage.addChild(pixel);

const title = new PIXI.Text('Tag Duel', style);
title.anchor.set(0.5, 0.5);
title.x = app.screen.width/2;
title.y = app.screen.height/20;
// app.stage.addChild(title);