const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const counterDisplay = document.getElementById('counter');
const statusDisplay = document.getElementById('gameStatus');
const exitButton = document.getElementById('exitButton');

const symbols = ['A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const targetSymbols = ['A', '1', 'C', '7', 'E', '0', 'B', '9', 'D', '3'];
const fallingSymbols = [];
const collectedSymbols = [];

let gameActive = true;
let spawnInterval = null;

function spawnSymbol() {
    const isTarget = Math.random() < 0.6;

    fallingSymbols.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -30,
        symbol: isTarget
            ? targetSymbols[Math.floor(Math.random() * targetSymbols.length)]
            : symbols[Math.floor(Math.random() * symbols.length)],
        target: isTarget,
        speed: 2.6
    });
}

function updateSymbols() {
    for (let i = fallingSymbols.length - 1; i >= 0; i--) {
        const s = fallingSymbols[i];
        s.y += s.speed;

        if (s.y > canvas.height + 30) {
            fallingSymbols.splice(i, 1);
        }
    }
}

function drawSymbols() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of fallingSymbols) {
        ctx.font = '24px monospace';

        if (s.target) {
            ctx.fillStyle = '#ff8800';
        } else {
            ctx.fillStyle = '#ff1a1a';
        }

        ctx.fillText(s.symbol, s.x, s.y);
    }
}

function checkClick(e) {
    if (!gameActive) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (let i = fallingSymbols.length - 1; i >= 0; i--) {
        const s = fallingSymbols[i];

        const dx = clickX - s.x;
        const dy = clickY - s.y;

        if (Math.sqrt(dx * dx + dy * dy) < 25) {
            if (s.target) {
                collectedSymbols.push(s.symbol);
                fallingSymbols.splice(i, 1);
                updateCounter();

                if (collectedSymbols.length >= 10) {
                    finishGame();
                }
            } else {
                statusDisplay.textContent = 'Ошибка. Продолжай.';
            }

            break;
        }
    }
}

function updateCounter() {
    counterDisplay.textContent = `${collectedSymbols.length} / 10`;
}

function finishGame() {
    gameActive = false;
    statusDisplay.textContent = `Код получен: ${collectedSymbols.join('')}`;

    clearInterval(spawnInterval);

    if (window.chernobogAPI) {
        window.chernobogAPI.loadSave().then(save => {
            save.openedProtocols = save.openedProtocols || {};
            save.openedProtocols.maze = true;
            window.chernobogAPI.saveData(save);
        });
    }

    setTimeout(() => {
        window.location.href = 'index.html?skipIntro=1';
    }, 2500);
}

canvas.addEventListener('click', checkClick);

exitButton.addEventListener('click', () => {
    window.location.href = 'index.html?skipIntro=1';
});

spawnInterval = setInterval(() => {
    if (gameActive) {
        spawnSymbol();
    }
}, 900);

function gameLoop() {
    if (gameActive) {
        updateSymbols();
    }

    drawSymbols();
    requestAnimationFrame(gameLoop);
}

gameLoop();