const road = document.getElementById('road');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const gameOver = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const gameArea = document.getElementById('game');
const moveSound = document.getElementById('move-sound');
const crashSound = document.getElementById('crash-sound');
const bgMusic = document.getElementById('bg-music');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const jumpBtn = document.getElementById('jump-btn');
const touchControls = document.getElementById('touch-controls');
const pauseBtn = document.getElementById('pause-button');
const musicToggle = document.getElementById('music-toggle');

let playerX = 40;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let speed = 2;
let obstacleInterval = 1500;
let isGameOver = false;
let isPaused = false;
let isJumping = false;
let jumpDirection = 1;
let shield = false;

highScoreDisplay.textContent = "High Score: " + highScore;

function isMobile() {
  return window.innerWidth <= 768;
}

function updateTheme(score) {
  const themes = [
    {score: 0, bg: '#222', road: '#555'},
    {score: 100, bg: '#003366', road: '#005599'},
    {score: 200, bg: '#4B0082', road: '#800080'},
    {score: 300, bg: '#000000', road: '#333333'},
  ];
  for (let i = themes.length - 1; i >= 0; i--) {
    if (score >= themes[i].score) {
      document.body.style.backgroundColor = themes[i].bg;
      road.style.backgroundColor = themes[i].road;
      break;
    }
  }
}

function movePlayer(dir) {
  if (isGameOver || isPaused) return;
  if (dir === 'left' && playerX > 10) playerX -= 15;
  else if (dir === 'right' && playerX < 78) playerX += 15;
  player.style.left = playerX + '%';
  moveSound.play();
}

function jumpPlayer() {
  if (isJumping || isPaused || isGameOver) return;
  isJumping = true;
  let height = 0;

  const jumpInterval = setInterval(() => {
    if (isPaused || isGameOver) return;

    if (jumpDirection === 1) {
      height += 2;
      if (height >= 60) jumpDirection = -1;
    } else {
      height -= 2;
      if (height <= 0) {
        jumpDirection = 1;
        isJumping = false;
        clearInterval(jumpInterval);
      }
    }
    player.style.bottom = `calc(10% + ${height}px)`;
  }, 10);
}

function createObstacle() {
  const obstacle = document.createElement('div');
  obstacle.classList.add('obstacle');
  const positions = [10, 25, 40, 55, 70];
  obstacle.style.left = positions[Math.floor(Math.random() * positions.length)] + '%';
  road.appendChild(obstacle);

  let obstacleTop = -100;
  const move = setInterval(() => {
    if (isGameOver || isPaused) return;

    obstacleTop += speed;
    obstacle.style.top = obstacleTop + 'px';

    if (obstacleTop > window.innerHeight) {
      obstacle.remove();
      clearInterval(move);
    }

    const obsRect = obstacle.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      obsRect.bottom > playerRect.top &&
      obsRect.top < playerRect.bottom &&
      obsRect.left < playerRect.right &&
      obsRect.right > playerRect.left
    ) {
      if (!shield) {
        isGameOver = true;
        crashSound.play();
        bgMusic.pause();
        gameOver.style.display = 'block';
        if (score > highScore) localStorage.setItem('highScore', score);
      }
      obstacle.remove();
      clearInterval(move);
    }
  }, 20);
}

function createCoin() {
  const coin = document.createElement('div');
  coin.classList.add('coin');
  const positions = [10, 25, 40, 55, 70];
  coin.style.left = positions[Math.floor(Math.random() * positions.length)] + '%';
  road.appendChild(coin);

  let topPos = -50;
  const move = setInterval(() => {
    if (isGameOver || isPaused) return;

    topPos += speed;
    coin.style.top = topPos + 'px';

    if (topPos > window.innerHeight) {
      coin.remove();
      clearInterval(move);
    }

    const coinRect = coin.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
  coinRect.bottom > playerRect.top &&
  coinRect.top < playerRect.bottom &&
  coinRect.left < playerRect.right &&
  coinRect.right > playerRect.left
) {
  coin.remove();
  score += 20;
  scoreDisplay.textContent = 'Score: ' + score;

  // Play coin sound
  const coinSound = document.getElementById('coin-sound');
  if (coinSound) {
    coinSound.currentTime = 0;
    coinSound.play();
  }

  clearInterval(move);
}

  }, 20);
}

function createPowerUp() {
  const power = document.createElement('div');
  power.classList.add('power-up');
  const positions = [10, 25, 40, 55, 70];
  power.style.left = positions[Math.floor(Math.random() * positions.length)] + '%';
  road.appendChild(power);

  let topPos = -50;
  const move = setInterval(() => {
    if (isGameOver || isPaused) return;

    topPos += speed;
    power.style.top = topPos + 'px';

    if (topPos > window.innerHeight) {
      power.remove();
      clearInterval(move);
    }

    const powerRect = power.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
  powerRect.bottom > playerRect.top &&
  powerRect.top < playerRect.bottom &&
  powerRect.left < playerRect.right &&
  powerRect.right > playerRect.left
) {
  power.remove();

  // Play shield sound
  const shieldSound = document.getElementById('shield-sound');
  if (shieldSound) {
    shieldSound.currentTime = 0;
    shieldSound.play();
  }

  activateShield();
  clearInterval(move);
}

  }, 20);
}

function activateShield() {
  shield = true;
  player.style.backgroundColor = 'limegreen';
  setTimeout(() => {
    shield = false;
    player.style.backgroundColor = 'red';
  }, 5000);
}

function updateScore() {
  if (isGameOver || isPaused) return;
  score += 1;
  scoreDisplay.textContent = 'Score: ' + score;

  if (score % 100 === 0) {
    speed += 0.5;
    if (obstacleInterval > 500) obstacleInterval -= 100;
  }

  if (score === 100) player.style.backgroundColor = 'blue';
  if (score === 200) player.style.backgroundColor = 'purple';
  if (score === 300) player.style.backgroundColor = 'orange';

  updateTheme(score);
  setTimeout(updateScore, 100);
}

function startSpawning() {
  if (isGameOver || isPaused) return;
  createObstacle();

  if (Math.random() < 0.3) createCoin();
  if (Math.random() < 0.1) createPowerUp();

  setTimeout(startSpawning, obstacleInterval);
}

function togglePause() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? '▶️' : '⏸️';
  if (!isPaused) {
    updateScore();
    startSpawning();
  }
}

pauseBtn.onclick = togglePause;

musicToggle.onclick = () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicToggle.textContent = '🔊';
  } else {
    bgMusic.pause();
    musicToggle.textContent = '🔇';
  }
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') movePlayer('left');
  if (e.key === 'ArrowRight') movePlayer('right');
  if (e.key === 'ArrowUp') jumpPlayer();
  if (e.key === ' ' || e.key === 'p') togglePause();
});

if (isMobile()) {
  touchControls.style.display = 'block';
  leftBtn.onclick = () => movePlayer('left');
  rightBtn.onclick = () => movePlayer('right');
  jumpBtn.onclick = jumpPlayer;
}

document.getElementById('start-button').onclick = () => {
  startScreen.style.display = 'none';
  gameArea.style.display = 'block';
  bgMusic.volume = 0.4;
  bgMusic.play();
  updateScore();
  startSpawning();
};
