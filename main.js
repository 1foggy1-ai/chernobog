const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const AdmZip = require('adm-zip');

const savePath = path.join(app.getPath('userData'), 'save.json');

const VERSION_URL = 'https://raw.githubusercontent.com/1foggy1-ai/chernobog/main/version.json';
const CURRENT_VERSION = '0.7.1';

function loadSave() {
    try {
        if (fs.existsSync(savePath)) {
            return JSON.parse(fs.readFileSync(savePath, 'utf8'));
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
    return {};
}

function saveData(data) {
    try {
        fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        return false;
    }
}

function checkForUpdates() {
    return new Promise((resolve) => {
        https.get(VERSION_URL, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const remote = JSON.parse(data);
                    resolve(remote);
                } catch (error) {
                    console.error('Ошибка проверки обновлений:', error);
                    resolve(null);
                }
            });
        }).on('error', (error) => {
            console.error('Ошибка сети:', error);
            resolve(null);
        });
    });
}

function downloadUpdate(url, callback) {
    https.get(url, (res) => {
        const chunks = [];

        res.on('data', (chunk) => {
            chunks.push(chunk);
        });

        res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            callback(buffer);
        });
    }).on('error', (error) => {
        console.error('Ошибка загрузки:', error);
        callback(null);
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        resizable: true,
        title: 'ЧЕРНОБОГ',
        backgroundColor: '#000000',
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');

    setTimeout(async () => {
        const remote = await checkForUpdates();

        if (remote && remote.version !== CURRENT_VERSION) {
            const result = await dialog.showMessageBox(win, {
                type: 'question',
                buttons: ['Обновить', 'Позже'],
                title: 'Доступно обновление',
                message: `Новая версия: ${remote.version}`,
                detail: remote.changelog || 'Улучшения и исправления'
            });

            if (result.response === 0) {
                downloadUpdate(remote.url, (buffer) => {
                    if (buffer) {
                        fs.writeFileSync(path.join(__dirname, 'update.zip'), buffer);
                        dialog.showMessageBox(win, {
                            type: 'info',
                            buttons: ['OK'],
                            title: 'Обновление',
                            message: 'Обновление скачано. Перезапустите программу.'
                        });
                    }
                });
            }
        }
    }, 3000);
}

ipcMain.handle('load-save', () => {
    return loadSave();
});

ipcMain.handle('save-data', (event, data) => {
    return saveData(data);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});