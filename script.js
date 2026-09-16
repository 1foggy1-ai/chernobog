const versionLabel = document.getElementById('versionLabel');
if (versionLabel) {
    versionLabel.textContent = 'v0.7.0';
}

let saveData = {};

async function initSave() {
    if (window.chernobogAPI) {
        saveData = await window.chernobogAPI.loadSave();
    }

    if (saveData.protocolsAccess) {
        const protocolsButton = document.getElementById('protocolsButton');
        if (protocolsButton) {
            protocolsButton.style.display = 'inline-block';
        }
    }

    if (saveData.openedProtocols && saveData.openedProtocols.maze) {
        window.protocolMazeOpened = true;
    }
}

function saveToFile() {
    if (window.chernobogAPI) {
        window.chernobogAPI.saveData(saveData);
    }
}

initSave();

const bootScreen = document.getElementById('bootScreen');
const bootText = document.getElementById('bootText');
const mainInterface = document.getElementById('mainInterface');
const activationScreen = document.getElementById('activationScreen');
const introLinesCanvas = document.getElementById('introLinesCanvas');

const bootLines = [
    'initializing system...',
    'loading core modules...',
    'establishing secure channel...',
    'decrypting local database...',
    'checking firewall status...',
    'scanning network interfaces...',
    'connecting to security nodes...',
    'bypassing restricted protocols...',
    'access granted.',
    'restoring previous session...',
    'synchronizing data...',
    'all systems operational.',
    '',
    'CHERNOBOG v0.7.0',
    'System ready.',
    'Starting...'
];

let lineIndex = 0;
let charIndex = 0;

let audioContext = null;
let ambientNodes = [];

const params = new URLSearchParams(window.location.search);
const skipIntro = params.has('skipIntro');

if (skipIntro) {
    activationScreen.style.display = 'none';
    bootScreen.style.display = 'none';
    mainInterface.style.display = 'block';
    startMainInterface();
    showFirstMessage();

    document.getElementById('matrixCanvas').style.opacity = '0.5';
    document.querySelector('.title').style.opacity = '1';
    document.querySelector('.subtitle').style.opacity = '1';
    document.querySelector('.status-line').style.opacity = '1';
    document.querySelector('.chat-container').style.opacity = '1';
} else {
    activationScreen.addEventListener('click', () => {
        activationScreen.style.display = 'none';
        startAmbient();
        startIntroLines();
        typeBoot();
    });
}

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playIntroDeepTone() {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = 120 + Math.random() * 80;

    gain.gain.value = 0.09;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    oscillator.stop(ctx.currentTime + 0.02);
}

function playFlashHit() {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 50;
    oscillator.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.9);

    gain.gain.value = 0.5;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 1.1);
}

function startAmbient() {
    if (audioContext) return;

    const ctx = getAudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.2;
    masterGain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 38;

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 57;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);

    osc1.start();
    osc2.start();

    ambientNodes = [osc1, osc2, masterGain, filter];
}

const introLinesCtx = introLinesCanvas.getContext('2d');
let introLinesActive = false;
let introLines = [];

function resizeIntroLines() {
    introLinesCanvas.width = window.innerWidth;
    introLinesCanvas.height = window.innerHeight;
}

resizeIntroLines();
window.addEventListener('resize', resizeIntroLines);

function startIntroLines() {
    introLinesActive = true;

    introLines = [];
    for (let i = 0; i < 40; i++) {
        introLines.push({
            x: Math.random() * introLinesCanvas.width,
            y: Math.random() * introLinesCanvas.height,
            speed: 1 + Math.random() * 3,
            angle: Math.random() * Math.PI * 2,
            length: 20 + Math.random() * 60,
            opacity: 0.1 + Math.random() * 0.3
        });
    }

    animateIntroLines();
}

function animateIntroLines() {
    if (!introLinesActive) return;

    introLinesCtx.clearRect(0, 0, introLinesCanvas.width, introLinesCanvas.height);

    const centerX = introLinesCanvas.width / 2;
    const centerY = introLinesCanvas.height / 2;

    for (const line of introLines) {
        const dx = centerX - line.x;
        const dy = centerY - line.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20) {
            line.x = Math.random() * introLinesCanvas.width;
            line.y = Math.random() * introLinesCanvas.height;
            continue;
        }

        const normX = dx / dist;
        const normY = dy / dist;

        line.x += normX * line.speed;
        line.y += normY * line.speed;

        const gradient = introLinesCtx.createLinearGradient(
            line.x,
            line.y,
            line.x - normX * line.length,
            line.y - normY * line.length
        );
        gradient.addColorStop(0, `rgba(255, 30, 30, ${line.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        introLinesCtx.strokeStyle = gradient;
        introLinesCtx.lineWidth = 1.2;

        introLinesCtx.beginPath();
        introLinesCtx.moveTo(line.x, line.y);
        introLinesCtx.lineTo(
            line.x - normX * line.length,
            line.y - normY * line.length
        );
        introLinesCtx.stroke();
    }

    requestAnimationFrame(animateIntroLines);
}

function typeBoot() {
    if (lineIndex < bootLines.length) {
        const currentLine = bootLines[lineIndex];

        if (charIndex < currentLine.length) {
            bootText.textContent += currentLine[charIndex];
            charIndex++;

            if (Math.random() > 0.8) {
                playIntroDeepTone();
            }

            setTimeout(typeBoot, 30 + Math.random() * 40);
        } else {
            bootText.textContent += '\n';
            lineIndex++;
            charIndex = 0;
            setTimeout(typeBoot, 200);
        }
    } else {
        introLinesActive = false;

        setTimeout(() => {
            bootScreen.style.opacity = '0';
            setTimeout(() => {
                bootScreen.style.display = 'none';
                startMainInterface();
                showFullscreenFlash();
            }, 500);
        }, 1000);
    }
}

function showFullscreenFlash() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = '#ff0000';
    flash.style.zIndex = '95';
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 1.2s ease';
    flash.style.pointerEvents = 'none';

    document.body.appendChild(flash);

    playFlashHit();

    setTimeout(() => {
        flash.style.opacity = '0';

        setTimeout(() => {
            flash.remove();
        }, 1200);
    }, 100);

    setTimeout(() => {
        mainInterface.style.display = 'block';
        document.getElementById('matrixCanvas').style.opacity = '0.5';
        document.querySelector('.title').style.opacity = '1';
        document.querySelector('.subtitle').style.opacity = '1';
        document.querySelector('.status-line').style.opacity = '1';
        document.querySelector('.chat-container').style.opacity = '1';
    }, 500);

    setTimeout(() => {
        showFirstMessage();
    }, 2500);
}

function showFirstMessage() {
    const messageBox = document.getElementById('messageBox');

    if (messageBox.children.length > 0) return;

    const firstMessage = document.createElement('div');
    firstMessage.classList.add('message', 'bot-message');
    firstMessage.textContent = 'Чернобог онлайн. Угрозы обнаружены. Задай вопрос.';
    messageBox.appendChild(firstMessage);
    messageBox.scrollTop = messageBox.scrollHeight;
}

function startMainInterface() {
    initMatrix();
    initEye();
    initChat();
    initProtocols();
}

function initMatrix() {
    const matrixCanvas = document.getElementById('matrixCanvas');
    const matrixCtx = matrixCanvas.getContext('2d');

    function resizeMatrix() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
    }

    resizeMatrix();
    window.addEventListener('resize', resizeMatrix);

    const fontSize = 16;
    let columns = Math.floor(window.innerWidth / fontSize);
    let drops = [];
    let speeds = [];

    function initDrops() {
        columns = Math.floor(window.innerWidth / fontSize);
        drops = [];
        speeds = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -matrixCanvas.height);
            speeds[i] = 0.3 + Math.random() * 1.5;
        }
    }

    initDrops();
    window.addEventListener('resize', initDrops);

    const chars = '0123456789ABCDEF';

    function drawGrid() {
        const gridSize = 80;

        matrixCtx.strokeStyle = 'rgba(255, 20, 20, 0.05)';
        matrixCtx.lineWidth = 1;

        for (let x = 0; x < matrixCanvas.width; x += gridSize) {
            matrixCtx.beginPath();
            matrixCtx.moveTo(x, 0);
            matrixCtx.lineTo(x, matrixCanvas.height);
            matrixCtx.stroke();
        }

        for (let y = 0; y < matrixCanvas.height; y += gridSize) {
            matrixCtx.beginPath();
            matrixCtx.moveTo(0, y);
            matrixCtx.lineTo(matrixCanvas.width, y);
            matrixCtx.stroke();
        }
    }

    function drawMatrix() {
        matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        drawGrid();

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const y = drops[i] * fontSize;

            matrixCtx.fillStyle = '#ff1a1a';
            matrixCtx.font = fontSize + 'px monospace';
            matrixCtx.fillText(char, i * fontSize, y);

            if (y > matrixCanvas.height && Math.random() > 0.98) {
                drops[i] = Math.random() * -20;
            }
            drops[i] += speeds[i];
        }
    }

    setInterval(drawMatrix, 50);
}

function initEye() {
    const canvas = document.getElementById('eyeCanvas');
    const ctx = canvas.getContext('2d');
    const eyeWrapper = document.getElementById('eyeWrapper');

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let pupilX = canvas.width / 2;
    let pupilY = canvas.height / 2;
    let isBlinking = false;
    let blinkTimer = 0;
    let blinkDuration = 0;
    let eyeOpenness = 1.0;
    let lastMouseMoveTime = Date.now();
    let wanderTarget = null;

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mouseX = (e.clientX - rect.left) * scaleX;
        mouseY = (e.clientY - rect.top) * scaleY;
        lastMouseMoveTime = Date.now();
        wanderTarget = null;
    });

    function updatePupil() {
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const dx = mouseX - center.x;
        const dy = mouseY - center.y;
        const maxDist = 55;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX, targetY;

        if (Date.now() - lastMouseMoveTime > 3000) {
            if (!wanderTarget) {
                wanderTarget = {
                    x: center.x + (Math.random() * 80 - 40),
                    y: center.y + (Math.random() * 40 - 20)
                };
            }

            const dxW = wanderTarget.x - pupilX;
            const dyW = wanderTarget.y - pupilY;
            const distW = Math.sqrt(dxW * dxW + dyW * dyW);

            if (distW < 5) {
                wanderTarget = {
                    x: center.x + (Math.random() * 80 - 40),
                    y: center.y + (Math.random() * 40 - 20)
                };
            }

            targetX = wanderTarget.x;
            targetY = wanderTarget.y;
        } else if (dist > maxDist) {
            targetX = center.x + (dx / dist) * maxDist;
            targetY = center.y + (dy / dist) * maxDist;
        } else {
            targetX = center.x + dx;
            targetY = center.y + dy;
        }

        pupilX += (targetX - pupilX) * 0.06;
        pupilY += (targetY - pupilY) * 0.06;
    }

    function drawPixelEye(openness) {
        const w = canvas.width;
        const h = canvas.height;
        const pixelSize = 8;

        ctx.clearRect(0, 0, w, h);

        const centerX = w / 2;
        const centerY = h / 2;
        const radiusX = w * 0.4;
        const radiusY = h * 0.3;

        for (let y = 0; y < h; y += pixelSize) {
            for (let x = 0; x < w; x += pixelSize) {
                const dx = (x - centerX) / radiusX;
                const dy = (y - centerY) / radiusY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= 1.05 && dist > 0.85) {
                    ctx.fillStyle = '#3a0606';
                    ctx.fillRect(x, y, pixelSize, pixelSize);
                } else if (dist <= 0.85) {
                    ctx.fillStyle = '#5a0a0a';
                    ctx.fillRect(x, y, pixelSize, pixelSize);
                }
            }
        }

        const pupilRadius = Math.min(w, h) * 0.14;

        for (let y = 0; y < h; y += pixelSize) {
            for (let x = 0; x < w; x += pixelSize) {
                const distToPupil = Math.sqrt((x - pupilX) ** 2 + (y - pupilY) ** 2);

                if (distToPupil < pupilRadius) {
                    ctx.fillStyle = '#ff1a1a';
                    ctx.fillRect(x, y, pixelSize, pixelSize);

                    if (distToPupil < pupilRadius - 6) {
                        ctx.fillStyle = '#ff5555';
                        ctx.fillRect(x, y, pixelSize, pixelSize);
                    }
                }
            }
        }

        ctx.fillStyle = '#ffcccc';
        ctx.fillRect(pupilX - 16, pupilY - 16, 4, 4);
        ctx.fillRect(pupilX - 8, pupilY - 24, 3, 3);

        if (openness < 1) {
            const closeHeight = h * (1 - openness);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, centerY - closeHeight / 2, w, closeHeight);
        }
    }

    function startBlink() {
        if (!isBlinking) {
            isBlinking = true;
            blinkTimer = 0;
            blinkDuration = 8 + Math.random() * 15;
        }
    }

    function updateBlink() {
        if (isBlinking) {
            blinkTimer++;
            const progress = blinkTimer / blinkDuration;

            if (progress < 0.4) eyeOpenness = 1 - progress / 0.4;
            else if (progress < 0.8) eyeOpenness = 0;
            else eyeOpenness = (progress - 0.8) / 0.2;

            if (blinkTimer >= blinkDuration) {
                isBlinking = false;
                eyeOpenness = 1;
                setTimeout(startBlink, 2000 + Math.random() * 3000);
            }
        }
    }

    setTimeout(startBlink, 1500);

    function animationLoop() {
        updatePupil();
        updateBlink();
        drawPixelEye(eyeOpenness);
        requestAnimationFrame(animationLoop);
    }

    animationLoop();
}

function initChat() {
    const statusLine = document.getElementById('statusLine');
    const messageBox = document.getElementById('messageBox');
    const userInput = document.getElementById('userInput');
    const suggestions = document.getElementById('suggestions');

    const questionBank = [
        'Как защитить пароль?',
        'Как защитить телефон?',
        'Как защитить аккаунт?',
        'Что такое фишинг?',
        'Нужен ли VPN?',
        'Как работает антивирус?',
        'Что такое брандмауэр?',
        'Как защититься от взлома?',
        'Что такое DDoS?',
        'Как использовать шифрование?',
        'Как сделать бэкап?',
        'Как защитить Wi-Fi?',
        'Что делать при утечке данных?',
        'Что такое кейлоггер?',
        'Что такое ransomware?',
        'Как защитить соцсети?',
        'Как защитить браузер?',
        'Как защитить банк?',
        'Как защитить почту?',
        'Что такое двухфакторная аутентификация?',
        'Почему важны обновления?',
        'Как сохранить анонимность?',
        'Тебе нужна помощь?'
    ];

    const responses = [
        {
            keywords: ['пароль', 'пароли', 'паролю', 'паролем'],
            answer: 'Надёжный пароль — от 16 символов: буквы, цифры, спецзнаки. Не используй "123456" или "password".'
        },
        {
            keywords: ['аккаунт', 'учетная запись', 'учётная запись', 'логин'],
            answer: 'Защити аккаунт: включи двухфакторную аутентификацию, используй уникальный пароль и проверяй активность.'
        },
        {
            keywords: ['телефон', 'смартфон', 'мобильный'],
            answer: 'Защити телефон: включи блокировку экрана, обновляй систему, устанавливай приложения только из официальных магазинов.'
        },
        {
            keywords: ['фишинг', 'обман', 'мошенничество', 'фишинговый'],
            answer: 'Фишинг — обман. Проверяй URL-адрес. Не переходи по подозрительным ссылкам.'
        },
        {
            keywords: ['vpn', 'трафик', 'шифрование канала'],
            answer: 'VPN шифрует трафик. Используй WireGuard или OpenVPN.'
        },
        {
            keywords: ['антивирус', 'вирус', 'защита пк', 'защита компьютера'],
            answer: 'Антивирус — базовый уровень защиты. Держи его обновлённым.'
        },
        {
            keywords: ['брандмауэр', 'файрвол', 'firewall'],
            answer: 'Брандмауэр — фильтр между устройством и сетью. Держи его включённым.'
        },
        {
            keywords: ['взлом', 'взломали', 'хакер', 'хакнули'],
            answer: 'Большинство взломов происходит через слабые пароли. Включи 2FA и проверь активность аккаунтов.'
        },
        {
            keywords: ['ddos', 'ддос', 'атака на сайт'],
            answer: 'DDoS — перегрузка сервера. Используй CDN и фильтрацию трафика.'
        },
        {
            keywords: ['шифрование', 'шифровать', 'криптография'],
            answer: 'Используй AES-256 для защиты данных. Не храни ключи рядом с зашифрованными файлами.'
        },
        {
            keywords: ['бэкап', 'резервная копия', 'копия данных', 'восстановление'],
            answer: 'Правило 3-2-1: 3 копии, 2 разных носителя, 1 вне дома.'
        },
        {
            keywords: ['wi-fi', 'wifi', 'вай фай', 'роутер', 'беспроводная сеть'],
            answer: 'Публичный Wi-Fi опасен. Используй VPN. Домашний роутер: смени пароль и включи WPA3.'
        },
        {
            keywords: ['утечка', 'утечка данных', 'слив данных', 'пароль утёк'],
            answer: 'Проверяй на haveibeenpwned.com. Если пароль утёк — смени его немедленно.'
        },
        {
            keywords: ['кейлоггер', 'клавиатурный шпион', 'запись клавиш'],
            answer: 'Кейлоггер записывает клавиши. Не вводи пароли на чужих устройствах.'
        },
        {
            keywords: ['ransomware', 'шифровальщик', 'вирус-вымогатель', 'вымогатель'],
            answer: 'Ransomware — вирус-шифровальщик. Не плати выкуп. Делай бэкапы.'
        },
        {
            keywords: ['соцсети', 'социальные сети', 'профиль', 'страница'],
            answer: 'Не публикуй личные данные. Проверяй настройки приватности.'
        },
        {
            keywords: ['браузер', 'куки', 'cookie', 'история'],
            answer: 'Используй приватный режим, отключай сторонние cookie и устанавливай проверенные расширения.'
        },
        {
            keywords: ['банк', 'карта', 'платёж', 'платеж'],
            answer: 'Не вводи данные карты на подозрительных сайтах. Включи уведомления о платежах.'
        },
        {
            keywords: ['почта', 'email', 'письмо', 'спам'],
            answer: 'Не открывай вложения от неизвестных отправителей. Используй отдельную почту для важных сервисов.'
        },
        {
            keywords: ['двухфакторная', '2fa', 'двухэтапная', 'код подтверждения'],
            answer: 'Двухфакторная аутентификация — второй рубеж защиты. Лучше приложение, чем SMS.'
        },
        {
            keywords: ['обновления', 'обновление', 'патч', 'patch'],
            answer: 'Обновления закрывают уязвимости. Ставь их сразу.'
        },
        {
            keywords: ['анонимность', 'анонимный', 'скрыться', 'tor'],
            answer: 'Полная анонимность — миф. Tor повышает приватность, но не делает невидимым.'
        }
    ];

    const fallbacks = [
        'Этот запрос вне моей компетенции. Я специализируюсь на кибербезопасности.',
        'Вопрос не распознан. Спросите о защите данных, сети или устройств.',
        'Я не обрабатываю такие запросы. Мои модули: пароли, вирусы, сети, VPN, утечки.'
    ];

    function getBotResponse(text) {
        const lower = text.toLowerCase();

        if (lower.includes('помощь') && lower.includes('нужна')) {
            saveData.protocolsAccess = true;
            saveToFile();

            document.getElementById('protocolsButton').style.display = 'inline-block';
            return 'Доступ к протоколам открыт.';
        }

        for (const item of responses) {
            if (item.keywords.some(keyword => lower.includes(keyword))) {
                return item.answer;
            }
        }

        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');

        if (sender === 'user') {
            msgDiv.classList.add('user-message');
            msgDiv.textContent = text;
        } else {
            msgDiv.classList.add('bot-message');

            const dotsSpan = document.createElement('span');
            dotsSpan.classList.add('thinking-dots');
            dotsSpan.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

            const textSpan = document.createElement('span');
            textSpan.textContent = text;
            textSpan.style.display = 'none';

            msgDiv.appendChild(dotsSpan);
            msgDiv.appendChild(textSpan);

            setTimeout(() => {
                dotsSpan.style.display = 'none';
                textSpan.style.display = 'inline';
            }, 1500 + Math.random() * 800);
        }

        messageBox.appendChild(msgDiv);
        messageBox.scrollTop = messageBox.scrollHeight;
    }

    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';
        suggestions.style.display = 'none';

        statusLine.textContent = '... анализ запроса ...';

        setTimeout(() => {
            const reply = getBotResponse(text);
            addMessage(reply, 'bot');
            statusLine.textContent = '... сканирую сеть ...';
        }, 2500 + Math.random() * 1500);
    }

    function showSuggestions(value) {
        if (!value.trim()) {
            suggestions.style.display = 'none';
            return;
        }

        const matches = questionBank.filter(q =>
            q.toLowerCase().includes(value.toLowerCase())
        );

        if (matches.length === 0) {
            suggestions.style.display = 'none';
            return;
        }

        suggestions.innerHTML = '';

        matches.forEach(match => {
            const div = document.createElement('div');
            div.classList.add('suggestion-item');
            div.textContent = match;

            div.addEventListener('click', () => {
                userInput.value = match;
                suggestions.style.display = 'none';
                handleSend();
            });

            suggestions.appendChild(div);
        });

        suggestions.style.display = 'block';
    }

    userInput.addEventListener('input', (e) => {
        showSuggestions(e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            suggestions.style.display = 'none';
        }
    });

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
}

function initProtocols() {
    const protocolsButton = document.getElementById('protocolsButton');
    const protocolsModal = document.getElementById('protocolsModal');
    const closeProtocolsButton = document.getElementById('closeProtocolsButton');
    const protocolsList = document.getElementById('protocolsList');

    if (saveData.protocolsAccess) {
        protocolsButton.style.display = 'inline-block';
    }

    const protocols = [
        {
            id: 'maze',
            name: 'ЛАБИРИНТ',
            file: 'protocols/maze/maze.html'
        }
    ];

    function renderProtocols() {
        protocolsList.innerHTML = '';

        protocols.forEach(protocol => {
            const item = document.createElement('div');
            item.classList.add('protocol-item');

            const savedState = (saveData.openedProtocols && saveData.openedProtocols[protocol.id]) ? 'opened' : null;

            if (savedState === 'opened') {
                item.classList.add('opened');
                item.textContent = protocol.name;

                item.addEventListener('click', () => {
                    window.location.href = protocol.file;
                });
            } else {
                item.classList.add('locked');
                item.textContent = '???';

                item.addEventListener('click', () => {
                    window.location.href = 'symbol-game.html';
                });
            }

            protocolsList.appendChild(item);
        });
    }

    protocolsButton.addEventListener('click', () => {
        protocolsModal.style.display = 'flex';
        renderProtocols();
    });

    closeProtocolsButton.addEventListener('click', () => {
        protocolsModal.style.display = 'none';
    });
}