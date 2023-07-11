const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

class Entity {
  constructor(x, y, width, height, imageSrc) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = new Image();
    this.image.src = imageSrc;
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

class Player extends Entity {
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

class Bullet extends Entity {
  update() {
    this.y -= 5;
  }
}

class Enemy extends Entity {
  update() {
    this.y += 2;
  }
}

const player = new Player(canvas.width / 2 - 25, canvas.height - 60, 50, 70, "player.png");
const bullets = [];
const enemies = [];
let score = 0;

function spawnEnemy() {
  const enemyWidth = 40;
  const enemyHeight = 40;
  const x = Math.random() * (canvas.width - enemyWidth);
  const y = -enemyHeight;
  const enemy = new Enemy(x, y, enemyWidth, enemyHeight, "enemy.png");
  enemies.push(enemy);
}

let keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

function handlePlayerMovement() {
  const speed = 5;
  if (keys["ArrowLeft"]) {
    player.move(-speed, 0);
  }
  if (keys["ArrowRight"]) {
    player.move(speed, 0);
  }
  if (keys["ArrowUp"]) {
    player.move(0, -speed);
  }
  if (keys["ArrowDown"]) {
    player.move(0, speed);
  }
  if (keys[" "]) {
    const bullet = new Bullet(
      player.x + player.width / 2 - 5,
      player.y,
      35,
      50,
      "bullet.png"
    );
    bullets.push(bullet);
    keys[" "] = false;
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  handlePlayerMovement();

  player.draw();

  bullets.forEach((bullet, bulletIndex) => {
    bullet.update();
    bullet.draw();

    if (bullet.y < -bullet.height) {
      bullets.splice(bulletIndex, 1);
    }

    enemies.forEach((enemy, enemyIndex) => {
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          bullets.splice(bulletIndex, 1);
          enemies.splice(enemyIndex, 1);
          score += 10;
        }
      });
    });
  
    enemies.forEach((enemy, index) => {
      enemy.update();
      enemy.draw();
  
      if (enemy.y > canvas.height) {
        enemies.splice(index, 1);
        score -= 5;
      }
      
      // Check if the enemy collides with the player
      if (
        enemy.x < player.x + player.width &&
        enemy.x + enemy.width > player.x &&
        enemy.y < player.y + player.height &&
        enemy.y + enemy.height > player.y
      ) {
        // Remove the enemy when it collides with the player
        enemies.splice(index, 1);
      }
    });

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    requestAnimationFrame(update);
}

setInterval(spawnEnemy, 1000);

update();

