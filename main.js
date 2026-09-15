const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const savePath = path.join(app.getPath('userData'), 'save.json');

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