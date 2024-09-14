let canvas;
let context;
let request_id;
let fpsInterval = 1000 / 30; // the denominator is frames-per-second
let now;
let then = Date.now();
let lastFrameTime = Date.now();
let delta;
let kills = 0;
let startTime = Date.now();
let player = {
    x : 0,
    y: 0,
    width : 48,
    height : 48,
    collisionWidth : 24,
    collisionHeight : 28,
    frameX : 0,
    frameY : 0, 
    xChange: 0,
    yChange : 0,
    health : 100,
};

let enemies = [];
let invincible;
let enemy = {
    x : 0,
    y : 0,
    width : 32,
    height : 36,
    collisionWidth : 24,
    collisionHeight : 28,
    frameX : 0,
    frameY : 0, 
    xChange : 0,
    yChange : 0,
    angle : 0,
    dx : 0,
    dy : 0,
    distance : 0,
    speed : 1.5,
    moveTimer : 0,
    moveInterval : 3000,
    health : 100,
    frameDuration : 200,
    currentFrameTime : 0,
    knockBackDuration : 1000,
    // UpdateAngle : function() {
    //     this.dx = player.x - this.x;
    //     this.dy = player.y - this.y;
    //     this.distance = Math.sqrt((this.dx*this.dx) + (this.dy*this.dy));
    //     this.angle = Math.atan2(this.dy,this.dx) * 180 / Math.PI;
    // },
    // UpdateSpeed : function() {
    //     this.xChange = this.speed * (this.dx/this.distance);
    //     this.yChange = this.speed * (this.dy/this.distance);
    //     let speedFactor = (this.distance < 100) ? 0.75 : 1;
    //     this.xChange *= speedFactor;
    //     this.yChange *= speedFactor;
    // },
    // SpreadOut : function() {
    //     let dist = 25;
    //     for (let otherEnemy of enemies) {
    //       if (otherEnemy != this) {
    //         if (otherEnemy.x === this.x && otherEnemy.y === this.y) {
    //             let angle = Math.atan2(otherEnemy.y - this.y, otherEnemy.x - this.x);
    //             otherEnemy.x += 12.5 * Math.cos(angle);         // Move the first enemy away from the second one
    //             otherEnemy.y += 12.5 * Math.sin(angle);
    //             this.x += 12.5 * Math.cos(angle + Math.PI);     // Move the second enemy away from the first one
    //             this.y += 12.5 * Math.sin(angle + Math.PI);
    //         }
    //         let dx = this.x - otherEnemy.x;
    //         let dy = this.y - otherEnemy.y;
    //         let distance = Math.sqrt(dx * dx + dy * dy);
    //         if (distance < dist) {
    //           let unitDx = dx / distance;
    //           let unitDy = dy / distance;
    //           this.x += unitDx * (dist - distance);
    //           this.y += unitDy * (dist - distance);
    //         }
    //       }
    //     }
    // },
    CheckCollision : function() {
        let playerLeft = player.x + 12;
        let playerRight = player.x + 12 + player.collisionWidth;
        let playerTop = player.y + 12;
        let playerBottom = player.y + 10 + player.collisionHeight;
        let enemyLeft = this.x + 4
        let enemyRight = this.x + 4 + this.collisionWidth;
        let enemyTop = this.y + 4
        let enemyBottom = this.y + 4 + this.collisionHeight;
        if (attack && (playerImage.src == attackImage.src)) {
            playerLeft = player.x + 36;
            playerRight = player.x + 36 + player.collisionWidth;
            playerTop = player.y + 36;
            playerBottom = player.y + 32 + player.collisionHeight;
        }
        // if (player.health != 100) {
        //     context.fillStyle = "yellow";
        // }
        // else {
        //     context.fillStyle = "red";
        // }
        // context.fillRect(playerLeft, playerTop, player.collisionWidth, player.collisionHeight);
        // context.fillStyle = "blue";
        
        if ((playerLeft < enemyRight) && (playerRight > enemyLeft) && (playerTop < enemyBottom) && (playerBottom > enemyTop)) {
            if (!invincible) {
                player.health -= 20;
                if (player.health <= 0) {
                    stop();
                    health.style.width = 0;
                    return;
                }
                console.log('Player HP: ', player.health)
                invincible = true;
                setTimeout(() => { invincible = false; }, 2000);
            }
            // context.fillRect(this.x + 4, this.y + 4, this.collisionWidth, this.collisionHeight);
        }
        if (attack) {
            if ((attackX < enemyRight) && (attackX + attackWidth > enemyLeft) && (attackY < enemyBottom) && (attackY + attackHeight > enemyTop)) {
                this.health -= 30;
                let knockbackAngle = Math.atan2(this.y - player.y, this.x - player.x);
                this.x += 30 * Math.cos(knockbackAngle);        // knockback distance
                this.y += 30 * Math.sin(knockbackAngle);
                if (this.health <= 0) {
                    let index = enemies.indexOf(this);
                    kills ++;
                    enemies.splice(index, 1);
                }
                console.log('Enemy ', enemies.indexOf(this), ': ', this.health)
            }
        }
    },
    Move : function() {
        if (this.knockbackDuration > 0) {
            this.knockBackDuration -= delta;
            this.x += Math.cos(knockbackAngle) * 5;
            this.y += Math.sin(knockbackAngle) * 5;
        }
        else {
            this.UpdateAngle();
            this.UpdateSpeed();
            this.SpreadOut();
            this.x += this.xChange;
            this.y += this.yChange;
        }
        this.CheckCollision();
    }
};

let moveLeft = false; 
let moveUp = false; 
let moveRight = false;
let moveDown = false;
let roll = false;
let attack = false;
let count = 0;
let originalY;
let cooldown = false;
let facing_down = [0,9,10,11,14,15];
let facing_up = [1,2,3,4,5,6];
let attackX;
let attackY;
let attackWidth;
let attackHeight;

let round = 1;
let numEnemies = 4;

let playerImage = new Image();
let enemyImage = new Image();
let backgroundImage = new Image();
let attackImage = new Image();
let deathImage = new Image();

let tilesPerRow = 24;
let tileSize = 32;

let roundNumber = document.getElementById("round-number");
let timeAlive = document.getElementById("time-alive");
let enemiesDefeated = document.getElementById("enemies-defeated");
let playerHealth = document.getElementById("health-bar");
let health = document.getElementById("health");

let background = [
    [2,5,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,75,3,3,3,5,26],
    [26,29,98,99,27,27,27,33,27,27,27,27,27,98,27,27,33,27,27,99,27,27,29,26],
    [26,53,227,228,-1,-1,-1,-1,216,217,218,-1,-1,-1,-1,-1,-1,-1,247,-1,-1,-1,53,26],
    [26,247,251,252,-1,-1,-1,-1,241,241,242,243,-1,-1,-1,-1,227,228,-1,-1,-1,-1,-1,26],
    [26,276,277,202,-1,-1,-1,-1,264,265,266,-1,-1,-1,-1,-1,251,252,253,254,253,-1,-1,26],
    [26,-1,277,278,252,-1,-1,223,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,275,276,277,278,-1,26],
    [26,-1,251,252,-1,-1,-1,227,228,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,227,228,251,252,26],
    [26,-1,-1,227,228,-1,-1,-1,227,228,-1,-1,-1,-1,-1,227,228,-1,-1,-1,-1,-1,-1,26],
    [26,-1,-1,-1,-1,-1,-1,-1,251,252,253,-1,-1,-1,223,251,252,-1,-1,-1,-1,-1,-1,26],
    [26,-1,-1,-1,-1,-1,-1,-1,275,276,277,-1,-1,-1,-1,276,277,202,-1,-1,-1,-1,-1,26],
    [26,-1,-1,227,228,-1,247,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,277,278,-1,-1,-1,-1,26],
    [26,-1,-1,251,252,253,254,253,-1,-1,-1,-1,-1,-1,-1,-1,-1,251,252,111,-1,-1,-1,26],
    [26,-1,-1,275,276,277,278,-1,-1,-1,-1,-1,-1,-1,251,252,-1,227,228,-1,-1,-1,-1,26],
    [26,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,227,228,-1,-1,-1,-1,-1,-1,26],
    [50,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,28],
]

document.addEventListener("DOMContentLoaded", init, false);

function addEnemies(numEnemies) {
    let spawnX = [224,512,224,512];
    let spawnY = [32,32,418,418];
    let batchIndex = 0;

    for (let i = 0; i < numEnemies; i++) {
        let newEnemy = Object.assign({}, enemy); // Create a new enemy object to avoid overwriting existing enemies
            newEnemy.x = spawnX[batchIndex];
            newEnemy.y = spawnY[batchIndex];
            batchIndex = (batchIndex + 1) % 4;
            enemies.push(newEnemy);
        }
};

function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    // playerImage.src = "/~som11/cgi-bin/ca2/sprites/player.png";
    // attackImage.src = "/~som11/cgi-bin/ca2/sprites/attacks.png";
    // enemyImage.src = "/~som11/cgi-bin/ca2/sprites/enemy.png";
    // backgroundImage.src = "/~som11/cgi-bin/ca2/sprites/dungeon_tileset.png";
    // deathImage.src = "/~som11/cgi-bin/ca2/sprites/death.png";
    playerImage.src = "/sprites/player.png";
    attackImage.src = "/sprites/attacks.png";
    enemyImage.src = "/sprites/enemy.png";
    backgroundImage.src = "/sprites/dungeon_tileset.png";
    deathImage.src = "/sprites/death.png";

    window.addEventListener("keydown", activate, false);
    window.addEventListener("keyup", deactivate, false);
    
    draw();
    load_assets([
        // {"var": playerImage, "url": "/~som11/cgi-bin/ca2/sprites/player.png"},
        // {"var": attackImage, "url": "/~som11/cgi-bin/ca2/sprites/attacks.png"},
        // {"var": enemyImage, "url": "/~som11/cgi-bin/ca2/sprites/enemy.png"},
        // {"var": backgroundImage, "url": "/~som11/cgi-bin/ca2/sprites/dungeon_tileset.png"},
        // {"var": deathImage, "url": "/~som11/cgi-bin/ca2/sprites/death.png"},
        {"var": playerImage, "url": "/sprites/player.png"},
        {"var": attackImage, "url": "/sprites/attacks.png"},
        {"var": enemyImage, "url": "/sprites/enemy.png"},
        {"var": backgroundImage, "url": "/sprites/dungeon_tileset.png"},
        {"var": deathImage, "url": "/sprites/death.png"},
    ], draw);

    addEnemies(numEnemies);
}

function drawEnemies() {
    for (let enemy of enemies) {
        enemy.currentFrameTime += delta;
        if (enemy.currentFrameTime >= enemy.frameDuration) {
            enemy.currentFrameTime = 0;
            enemy.frameX = (enemy.frameX + 1) % 6;
        }
        if (enemy.angle < 45 && enemy.angle > -45) {   // right
            enemy.frameY = 2;
        }
        else if (enemy.angle < -45 && enemy.angle > -135) {  // up
            enemy.frameY = 3;
        }
        else if (enemy.angle > 45 && enemy.angle < 135) {    // down
            enemy.frameY = 0;
        }
        else if (enemy.angle > 135 || enemy.angle < -135) {    // down
            enemy.frameY = 1;
        }

        context.save();
        context.translate(enemy.x + enemy.width / 2, enemy.y - 10);
        context.fillStyle = "red";
        context.fillRect(-enemy.width / 2, -5, enemy.width * (enemy.health / 100), 5);
        context.restore();

        context.drawImage(enemyImage,
            enemy.width * enemy.frameX, enemy.height * enemy.frameY, enemy.width, enemy.height,
            enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

// class Particle {
//     constructor(x, y, radius, color, speedX, speedY) {
//       this.x = x;
//       this.y = y;
//       this.radius = radius;
//       this.color = color;
//       this.speedX = speedX;
//       this.speedY = speedY;
//       this.opacity = 3;
//     }
  
//     draw(context) {             // Draw the particle on the canvas
//       context.save();
//       context.globalAlpha = this.opacity;
//       context.fillStyle = this.color;
//       context.beginPath();
//       context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
//       context.fill();
//       context.restore();
//     }
  
//     update(delta) {                 // Update the particle's position and opacity
//       this.x += this.speedX * delta;
//       this.y += this.speedY * delta;
//       this.opacity -= 0.01;
//       this.radius -= 0.01;
//     }
// }
  

// function playDeathAnimation(x, y) {
//         let particles = [];
//         let particleCanvas = document.createElement("canvas");
//         particleCanvas.width = canvas.width;
//         particleCanvas.height = canvas.height;
//         let particleContext = particleCanvas.getContext("2d");
      
//         for (let i = 0; i < 50; i++) {          // Create 50 particles with random speed
//           let radius = Math.random() * 5 + 1;
//           let color = '#8B0000';
//           let speedX = (Math.random() - 0.5) * 2;
//           let speedY = (Math.random() - 0.5) * 2;
//           particles.push(new Particle(x, y, radius, color, speedX, speedY));
//         }
      
//         function update() {
//           particleContext.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
//           for (let particle of particles) {
//             particle.update(delta);
//             particle.draw(particleContext);
//           }

//           particles.filter(particle => particle.opacity > 0);   // Remove the particles when opacity is 0
//           context.drawImage(particleCanvas, 0, 0);
//         }
      
//         let intervalId = setInterval(update, 16);
//         setTimeout(() => clearInterval(intervalId), 1000);
// }


function allEnemiesDefeated() {
    for (let enemy of enemies) {
      if (enemy.health > 0) {
        return false; // at least one enemy is still alive
      }
    }
    return true; // all enemies are defeated
}

function regenerateHealth() {
    if (!invincible || (roll)) {
        player.health += 5;
        if (player.health > 100) {
            player.health = 100; // Cap health at 100
            }
            console.log('Player health: ', player.health);
    }
}

setInterval(regenerateHealth, 2000);

function draw() {
    request_id = window.requestAnimationFrame(draw);
    let now = Date.now();
    delta = (now - lastFrameTime);
    lastFrameTime = now;
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    // Draw background on canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#42494f"; // grey
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 15; r += 1) { 
        for (let c = 0; c < 24; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow); 
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(backgroundImage,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
        }
    }
}

// let elapsedTime = Date.now() - startTime;
// let minutes = Math.floor(elapsedTime / 60000);
// let seconds = Math.floor((elapsedTime % 60000) / 1000);
// let timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

let healthPercentage = player.health / 100;
health.style.width = `${healthPercentage * 100}%`;

if (healthPercentage > 0.7) {
    health.style.backgroundColor = 'green';
  } else if (healthPercentage > 0.25) {
    health.style.backgroundColor = 'orange';
  } else {
    health.style.backgroundColor = 'red';
  }

roundNumber.textContent = round;
timeAlive.innerHTML = timeString;
enemiesDefeated.textContent = kills;

if (allEnemiesDefeated()) {
        numEnemies += 4;
        round++;
        addEnemies(numEnemies);
        for (let enemy of enemies) {
            enemy.speed += 0.5;
        }
}

for (let enemy of enemies) {
    enemy.Move();
    if (enemy.health <= 0) {
        playDeathAnimation(enemy.x, enemy.y);
    }
}

drawEnemies();

context.drawImage(playerImage,
    player.width * player.frameX, player.height * player.frameY, player.width, player.height,
    player.x, player.y, player.width, player.height);

    if ((moveLeft || moveRight || moveUp || moveDown) &&
        !(moveRight && moveLeft && !(moveDown || moveUp)) && !(moveUp && moveDown) && !(roll) && !(attack)) {
        player.frameX = (player.frameX + 1) % 4;
    }

    if (roll && player.frameX === 3 && (player.frameY >= 4 || player.frameY <= 11)) {      // Stop rolling on roll complete
        roll = false;
        setTimeout(() => invincible = false, 1000);
        count = 0
    }

    function playerAttack(newFrame) {
        if (!(cooldown)) {
            playerImage.src = attackImage.src;
            player.width = 96;
            player.height = 96;
            player.frameY = newFrame;
            context.fillStyle = 'rgba(255, 0, 0, 0.5)';
            if (newFrame === 0) {           // down
                if (count === 0) {
                    attackX = player.x + 30 - 24;
                    attackY = player.y + 66 - 24;
                }
                else {
                    attackX = player.x + 30;
                    attackY = player.y + 66;
                }
                attackWidth = 34;
                attackHeight = 22;
                // context.fillRect(attackX, attackY, attackWidth, attackHeight);
            }
            if (newFrame === 3) {           // up
                if (count === 0) {
                    attackX = player.x + 34 - 24;
                    attackY = player.y + 13 - 24;
                }
                else {
                    attackX = player.x + 34;
                    attackY = player.y + 13;
                }
                attackWidth = 34;
                attackHeight = 22;
                // context.fillRect(attackX, attackY, attackWidth, attackHeight);
            }
            if (newFrame === 2) {           // left
                if (count === 0) {
                    attackX = player.x + 13-24;
                    attackY = player.y + 30-24;
                }
                else {
                    attackX = player.x + 13;
                    attackY = player.y + 30;
                }
                attackWidth = 22;
                attackHeight = 36;
                // context.fillRect(attackX, attackY, attackWidth, attackHeight);
            }
            if (newFrame === 1) {           // right
                if (count === 0) {
                    attackX = player.x + 62-24;
                    attackY = player.y + 36-24;
                }
                else {
                    attackX = player.x + 62;
                    attackY = player.y + 36;
                }
                attackWidth = 22;
                attackHeight = 36;
                // context.fillRect(attackX, attackY, attackWidth, attackHeight);
            }
            count = (count + 1);
            if (count === 1) {
                player.x = player.x - 24
                player.y = player.y - 24
            }
            if (count % 2 == 0) {
                player.frameX = (player.frameX + 1);
            }
        }
    }

    if (!(moveLeft || moveRight || moveUp || moveDown) && !(attack)) {      // Normal standing sprite when standing
        player.frameX = 0;
    }

    if (attack && !(moveLeft || moveRight || moveUp || moveDown)) {         // Attacking when not moving
        if (count === 0) {
            originalY = player.frameY;
        }
        if (facing_down.includes(originalY)) {
            playerAttack(0);
        }
        if (facing_up.includes(originalY)) {
            playerAttack(3);
        }
        if (originalY === 8 || originalY === 13) {
            playerAttack(2)
        }
        if (originalY === 7 || originalY === 12) {
            playerAttack(1)
        }
    }

    if (attack && player.frameX === 4) {      // Stop attacking on attack complete
        player.width = 48;
        player.height = 48;
        player.x = player.x + 24
        player.y = player.y + 24
        count = 0
        // playerImage.src = "/~som11/cgi-bin/ca2/sprites/player.png";
        playerImage.src = "/sprites/player.png";
        attack = false;
        player.frameY = originalY;
        cooldown = true;
        setTimeout(() => cooldown = false, 300);
    }

    // Draw other objects
    
    // Handle key presses 
    if (moveLeft && !(moveUp || moveDown)) {
        player.xChange = player.xChange - 1.5;
        player.frameY = 13;
        if (roll) {
                player.xChange = player.xChange - 3;
                player.frameY = 8;
                count = (count + 1)
                if (count % 5 == 0) {
                    player.frameX = (player.frameX + 1)
                }
        }
        if (attack) {
            playerAttack(2);
        }
    }
    if (moveRight && !(moveUp || moveDown)) {
        player.xChange = player.xChange + 1.5;
        player.frameY = 12;
        if (roll) {
            player.xChange = player.xChange + 3;
            player.frameY = 7;
            count = (count + 1)
            if (count % 5 == 0) {
                player.frameX = (player.frameX + 1)
            }
        }
        if (attack) {
            playerAttack(1);
        }
    }
    if (moveUp && !(moveLeft || moveRight)) {
        player.yChange = player.yChange - 1.5;
        player.frameY = 3;
        if (roll) {
            player.yChange = player.yChange - 3;
            player.frameY = 6;
            count = (count + 1)
            if (count % 5 == 0) {
                player.frameX = (player.frameX + 1)
            }
        }
        if (attack) {
            playerAttack(3);
        }
    }
    if (moveDown && !(moveLeft || moveRight)) {
        player.yChange = player.yChange + 1.5;
        player.frameY = 0;
        if (roll) {
            player.yChange = player.yChange + 3;
            player.frameY = 11;
            count = (count + 1)
            if (count % 5 == 0) {
                player.frameX = (player.frameX + 1)
            }
        }
        if (attack) {
            playerAttack(0);
        }
    }
    // Diagonal Movements
    if (moveLeft && moveUp) {
        player.xChange = player.xChange - 1.5;
        player.yChange = player.yChange - 1.5;
        player.frameY = 2;
        if (roll) {
            player.xChange = player.xChange - 3;
            player.yChange = player.yChange - 3;
            player.frameY = 5;
            count = (count + 1)
            if (count % 5 == 0) {
                player.frameX = (player.frameX + 1)
            }
        }
        if (attack) {
            playerAttack(3);
        }
    }
    if (moveRight && moveUp) {
        player.xChange = player.xChange + 1.5;
        player.yChange = player.yChange - 1.5;
        player.frameY = 1;
        if (roll) {
            player.xChange = player.xChange + 3;
            player.yChange = player.yChange - 3;
            player.frameY = 4;
            count = (count + 1)
            if (count % 5 == 0) {
                player.frameX = (player.frameX + 1)
            }
        }
        if (attack) {
            playerAttack(3);
        }
    }
    if (moveLeft && moveDown) {
        player.xChange = player.xChange - 1.5;
        player.yChange = player.yChange + 1.5;
        player.frameY = 15;
        if (roll) {
            player.xChange = player.xChange - 3;
            player.yChange = player.yChange + 3;
            player.frameY = 10;
            count = (count + 1)
            if (count % 5 == 0) {
                player.frameX = (player.frameX + 1)
            }
        }
        if (attack) {
            playerAttack(0);
        }
    }
    if (moveRight && moveDown) {
        player.xChange = player.xChange + 1.5;
        player.yChange = player.yChange + 1.5;
        player.frameY = 14;
        if (roll) {
            player.xChange = player.xChange + 3;
            player.yChange = player.yChange + 3;
            player.frameY = 11;
            count = (count + 1);
            if (count % 5 == 0) {
                player.frameX = (player.frameX + 1);
            }
        }
        if (attack) {
            playerAttack(0);
        }
    }

    // Update the player
    player.x = player.x + player.xChange; player.y = player.y + player.yChange;
    
    // Physics 
    player.xChange = player.xChange * 0.6 // friction
    player.yChange = player.yChange * 0.6 // friction

    // Going off left or right
    if (player.x < 20) { 
        player.x = 20;
    } else if (player.x + 12 + player.collisionWidth > canvas.width - 32) { 
        player.x = canvas.width - 66;
    }

    // Going off up or down
    if (player.y < 32) { 
        player.y = 32;
    } else if (player.y + 12 + player.collisionHeight > canvas.height - 32) { 
        player.y = canvas.height - 72;
    }
}

function activate (event) {
    let key = event.key;
    if (key === "a") {
        moveLeft = true;
    } else if (key === "w") {
        moveUp = true;
    } else if (key === "d") {
        moveRight = true;
    } else if (key === "s") {
        moveDown = true;
    } else if (key === " ") {
        roll = true;
        invincible = true;
    } else if (key === "j") {
        attack = true;
    }
}

function deactivate (event) {
    let key = event.key;
    if (key === "a") {  
        moveLeft = false;
    } else if (key === "w") {
        moveUp = false;
    } else if (key === "d") {
        moveRight = false;
    } else if (key === "s") {
        moveDown = false;
    }
}

function randint(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function stop() {
    let retry = document.getElementById("play-again");
    retry.innerHTML = "Play Again"
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "red";
    context.font = "48px Arial";
    context.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2);
    window.removeEventListener('keydown', activate, false);
    window.removeEventListener('keyup', deactivate, false);
    window.cancelAnimationFrame(request_id);
}

function load_assets(assets, callback) {
    let num_assets = assets.length;
    let loaded = function() {
        console.log("loaded");
        num_assets = num_assets - 1
        if (num_assets === 0) {
            callback();
        }
    };
    for (let asset of assets) {
        let element = asset.var;
        if (element instanceof HTMLImageElement ) {
            console.log("img");
            element.addEventListener("load", loaded, false);
        }
        else if ( element instanceof HTMLAudioElement) {
            console.log("audio");
            element.addEventListener("canplaythrough", loaded, false);
        }
        element.src = asset.url;
    }
}