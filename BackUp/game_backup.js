const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

class Entity {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
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

const player = new Player(canvas.width / 2 - 25, canvas.height - 60, 50, 50, "#00f");
const bullets = [];
const enemies = [];
let score = 0;

function spawnEnemy() {
  const enemyWidth = 40;
  const enemyHeight = 40;
  const x = Math.random() * (canvas.width - enemyWidth);
  const y = -enemyHeight;
  const enemy = new Enemy(x, y, enemyWidth, enemyHeight, "#f00");
  enemies.push(enemy);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  });

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);

  requestAnimationFrame(update);
}

setInterval(spawnEnemy, 1000);

    document.addEventListener("keydown", (event) => {
      const speed = 50;
      if (event.key === "ArrowLeft") {
        player.move(-speed, 0);
      } else if (event.key === "ArrowRight") {
        player.move(speed, 0);
      } else if (event.key === "ArrowUp") {
        player.move(0, -speed);
      } else if (event.key === "ArrowDown") {
        player.move(0, speed);
      } else if (event.key === " ") {
        const bullet = new Bullet(
          player.x + player.width / 2 - 5,
          player.y,
          10,
          20,
          "#0f0"
        );
        bullets.push(bullet);
      }
    });

    update();
