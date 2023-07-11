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
  constructor(x, y, width, height, imageSrc) {
    super(x, y, width, height, imageSrc);
    this.lives = 3;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;

    // Keep the player within the canvas
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
  }
}

class Bullet extends Entity {
  update() {
    this.y -= 5;
  }
}

class EnemyBullet extends Bullet {
  update() {
    this.y += 5;
  }
}

class Enemy extends Entity {
  constructor(x, y, width, height, imageSrc) {
    super(x, y, width, height, imageSrc);
    this.dx = 0;
    this.dy = 2;
    this.changeDirectionChance = 0.03;
    this.shouldSerpentine = Math.random() < 0.3; // 30%の確率で蛇行動作を行う
  }

  update() {
    this.y += this.dy;

    if (this.shouldSerpentine) {
      this.x += this.dx;

      // Update the enemy's direction and prevent it from going off the screen
      if (Math.random() < this.changeDirectionChance || this.x < 0 || this.x + this.width > canvas.width) {
        this.dx = -this.dx || (Math.random() > 0.5 ? 4 : -4);
      }
    }
  }
}

class Boss extends Enemy {
  constructor(x, y, width, height, imageSrc) {
    super(x, y, width, height, imageSrc);
    this.health = 5;
    this.shootCooldown = 0;
  }

  update() {
    this.x += this.dx;
    this.y = Math.max(0, this.y); // Keep the boss within the canvas (y-axis)

    // Update the boss's direction and prevent it from going off the screen
    if (Math.random() < this.changeDirectionChance || this.x < 0 || this.x + this.width > canvas.width) {
      this.dx = -this.dx || (Math.random() > 0.5 ? 4 : -4);
    }

    // Keep the boss within the canvas (x-axis)
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));

    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    } else {
      this.shootEnemyBullet();
      this.shootCooldown = 100; // Adjust cooldown for shooting bullets
    }
  }

  shootEnemyBullet() {
    const bullet = new EnemyBullet(
      this.x + this.width / 2 - 5,
      this.y + this.height,
      25,
      50,
      "enemy_bullet.png"
    );
    bullets.push(bullet);
  }
}

const player = new Player(canvas.width / 2 - 25, canvas.height - 60, 50, 70, "player.png");
const bullets = [];
const enemies = [];
let score = 0;
let gameOver = false;
let normalEnemiesKilled = 0;
let boss = null;

function spawnBoss() {
  const bossWidth = 80;
  const bossHeight = 80;
  const x = Math.random() * (canvas.width - bossWidth);
  const y = -bossHeight;
  boss = new Boss(x, y, bossWidth, bossHeight, "boss.png");
}

function spawnEnemy() {
  if (normalEnemiesKilled < 10) {
    const enemyWidth = 40;
    const enemyHeight = 40;
    const x = Math.random() * (canvas.width - enemyWidth);
    const y = -enemyHeight;
    const enemy = new Enemy(x, y, enemyWidth, enemyHeight, "enemy.png");
    enemies.push(enemy);
  } else if (!boss) {
    spawnBoss();
  }
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
  
  if (keys[" "] && bullets.filter(b => b instanceof Bullet && !(b instanceof EnemyBullet)).length < 3) {
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

function drawLives() {
  const heartImage = new Image();
  heartImage.src = "heart.png";

  for (let i = 0; i < player.lives; i++) {
    ctx.drawImage(heartImage, 390 + i * 30, 15, 20, 20);
  }
}

function checkGameOver() {
  if (player.lives <= 0) {
    gameOver = true;
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
  }
  return gameOver;
}

function update() {
  if (gameOver) {
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
    return;
  }

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
    normalEnemiesKilled++;
  }
});

if (boss) {
  if (
    bullet.x < boss.x + boss.width &&
    bullet.x + bullet.width > boss.x &&
    bullet.y < boss.y + boss.height &&
    bullet.y + bullet.height > boss.y
  ) {
    bullets.splice(bulletIndex, 1);
    boss.health--;

    if (boss.health <= 0) {
      score += 50;
      boss = null;
      normalEnemiesKilled = 0;
    }
  }
}
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
  player.lives -= 1;
}
});

if (boss) {
boss.update();
boss.draw();
}

bullets.forEach((bullet, index) => {
  if (
    bullet instanceof EnemyBullet &&
    bullet.x < player.x + player.width &&
    bullet.x + bullet.width > player.x &&
    bullet.y < player.y + player.height &&
    bullet.y + bullet.height > player.y
  ) {
    bullets.splice(index, 1);
    player.lives -= 1;
  }
});

if (
  boss &&
  boss.x < player.x + player.width &&
  boss.x + boss.width > player.x &&
  boss.y < player.y + player.height &&
  boss.y + boss.height > player.y
) {
  player.lives -= 1;
}

ctx.fillStyle = "#fff";
ctx.font = "20px Arial";
ctx.fillText(`💩: ${score}`, 10, 30);

drawLives();

if (!checkGameOver()) {
  requestAnimationFrame(update);
}
}

setInterval(spawnEnemy, 1000);

update();