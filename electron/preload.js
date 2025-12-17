const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    saveBackup: (data) => ipcRenderer.send('save-backup', data)
});
