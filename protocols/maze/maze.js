const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('mazeTimer');
const statusDisplay = document.getElementById('mazeStatus');

const tileSize = 16;
const mazeRows = 25;
const mazeCols = 25;

let playerX = 1;
let playerY = 1;
let exitX = 23;
let exitY = 23;
let timeLeft = 45;
let gameActive = true;

let maze = [];

function generateMaze() {
    maze = [];

    for (let row = 0; row < mazeRows; row++) {
        maze[row] = [];
        for (let col = 0; col < mazeCols; col++) {
            if (
                row === 0 ||
                row === mazeRows - 1 ||
                col === 0 ||
                col === mazeCols - 1 ||
                Math.random() < 0.27
            ) {
                maze[row][col] = 1;
            } else {
                maze[row][col] = 0;
            }
        }
    }

    maze[1][1] = 0;
    maze[2][1] = 0;
    maze[1][2] = 0;

    maze[exitY][exitX] = 0;
    maze[exitY - 1][exitX] = 0;
    maze[exitY][exitX - 1] = 0;
    maze[exitY - 1][exitX - 1] = 0;
    maze[exitY - 2][exitX] = 0;
    maze[exitY][exitX - 2] = 0;
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < mazeRows; row++) {
        for (let col = 0; col < mazeCols; col++) {
            if (maze[row][col] === 1) {
                ctx.fillStyle = '#3a0606';
                ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
            }
        }
    }

    ctx.fillStyle = '#ff1a1a';
    ctx.fillRect(exitX * tileSize, exitY * tileSize, tileSize, tileSize);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playerX * tileSize, playerY * tileSize, tileSize, tileSize);
}

function movePlayer(dx, dy) {
    if (!gameActive) return;

    const newX = playerX + dx;
    const newY = playerY + dy;

    if (
        newX >= 0 &&
        newX < mazeCols &&
        newY >= 0 &&
        newY < mazeRows &&
        maze[newY][newX] === 0
    ) {
        playerX = newX;
        playerY = newY;

        if (playerX === exitX && playerY === exitY) {
            winGame();
        }
    }

    drawMaze();
}

function startTimer() {
    const interval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(interval);
            loseGame();
        }
    }, 1000);
}

function winGame() {
    gameActive = false;
    statusDisplay.textContent = 'Ты успел спасти систему';

    setTimeout(() => {
        window.location.href = '../../index.html?skipIntro=1';
    }, 2000);
}

function loseGame() {
    gameActive = false;
    statusDisplay.textContent = 'Ты не успел спасти систему';

    setTimeout(() => {
        window.location.href = '../../index.html?skipIntro=1';
    }, 2000);
}

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === 'arrowup' || key === 'w') movePlayer(0, -1);
    if (key === 'arrowdown' || key === 's') movePlayer(0, 1);
    if (key === 'arrowleft' || key === 'a') movePlayer(-1, 0);
    if (key === 'arrowright' || key === 'd') movePlayer(1, 0);
});

generateMaze();
drawMaze();
startTimer();