const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadSmtpConfigs: () => ipcRenderer.invoke('load-smtp-configs'),
    saveSmtpConfig: (config) => ipcRenderer.invoke('save-smtp-config', config),
    deleteSmtpConfig: (accountName) => ipcRenderer.invoke('delete-smtp-config', accountName),
    sendEmail: (emailData) => ipcRenderer.invoke('send-email', emailData)
});
