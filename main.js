const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const smtpConfigPath = path.join(app.getPath('userData'), 'smtp_config.json');

function loadSmtpConfigs() {
    if (!fs.existsSync(smtpConfigPath)) return [];
    try {
        const data = fs.readFileSync(smtpConfigPath, 'utf-8');
        return JSON.parse(data) || [];
    } catch (error) {
        console.error("Erreur lors du chargement du fichier JSON :", error);
        return [];
    }
}

function saveSmtpConfig(config) {
    config.password = bcrypt.hashSync(config.password, 10);
    const configs = loadSmtpConfigs();
    configs.push(config);
    fs.writeFileSync(smtpConfigPath, JSON.stringify(configs, null, 2));
}

function deleteSmtpConfig(name) {
    let configs = loadSmtpConfigs();
    configs = configs.filter(config => config.name !== name);
    fs.writeFileSync(smtpConfigPath, JSON.stringify(configs, null, 2));
}

function getSmtpConfigByName(name) {
    const configs = loadSmtpConfigs();
    return configs.find(config => config.name === name);
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        },
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();
}

ipcMain.handle('load-smtp-configs', () => loadSmtpConfigs());
ipcMain.handle('save-smtp-config', (event, config) => saveSmtpConfig(config));
ipcMain.handle('delete-smtp-config', (event, accountName) => deleteSmtpConfig(accountName));
ipcMain.handle('send-email', async (event, emailData) => {
    const smtpConfig = getSmtpConfigByName(emailData.smtpName);
    if (!smtpConfig) throw new Error("Compte SMTP non trouvé");

    const transporter = nodemailer.createTransport({
        host: smtpConfig.server,
        port: smtpConfig.port,
        secure: smtpConfig.ssl,
        auth: {
            user: smtpConfig.username,
            pass: smtpConfig.password
        }
    });

    const mailOptions = {
        from: smtpConfig.username,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.body,
        attachments: emailData.attachments.map(file => ({ path: file.path }))
    };

    await transporter.sendMail(mailOptions);
});

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
