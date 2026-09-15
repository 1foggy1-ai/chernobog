const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('chernobogAPI', {
    loadSave: () => ipcRenderer.invoke('load-save'),
    saveData: (data) => ipcRenderer.invoke('save-data', data)
});