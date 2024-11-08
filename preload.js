const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadSmtpConfigs: () => ipcRenderer.invoke('load-smtp-configs'),
    saveSmtpConfig: (config) => ipcRenderer.invoke('save-smtp-config', config),
    deleteSmtpConfig: (accountName) => ipcRenderer.invoke('delete-smtp-config', accountName),
    sendEmail: (emailData) => ipcRenderer.invoke('send-email', emailData),
    loadEmailHistory: () => ipcRenderer.invoke('load-email-history'),
    clearEmailHistory: () => ipcRenderer.invoke('clear-email-history'),
    getStats: () => ipcRenderer.invoke('get-stats')
});

// Événements pour les boutons de la fenêtre
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('minimize-btn').addEventListener('click', () => {
        ipcRenderer.send('minimize-window');
    });

    document.getElementById('close-btn').addEventListener('click', () => {
        ipcRenderer.send('close-window');
    });
});
