const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const dbPath = path.join(app.getPath('userData'), 'velysend.db');

// Initialisation de la base de données SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur lors de l’ouverture de la base de données', err);
    } else {
        console.log('Base de données SQLite ouverte avec succès');
        db.run(`CREATE TABLE IF NOT EXISTS smtp_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            server TEXT,
            port INTEGER,
            username TEXT,
            password TEXT,
            ssl BOOLEAN
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS email_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            smtp_account TEXT,
            to_address TEXT,
            subject TEXT,
            body TEXT,
            status TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

function deleteSmtpConfig(accountName) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM smtp_accounts WHERE name = ?`, [accountName], (err) => {
            if (err) {
                console.error("Erreur lors de la suppression du compte SMTP :", err);
                reject(err);
            } else {
                console.log("Compte SMTP supprimé :", accountName);
                resolve();
            }
        });
    });
}

// Sauvegarder la configuration SMTP
function saveSmtpConfig(config) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO smtp_accounts (name, server, port, username, password, ssl)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [config.name, config.server, config.port, config.username, config.password, config.ssl],
            (err) => {
                if (err) {
                    console.error("Erreur lors de l'ajout du compte SMTP :", err);
                    reject(err);
                } else {
                    console.log("Compte SMTP sauvegardé :", config.name);
                    resolve();
                }
            }
        );
    });
}

// Charger les configurations SMTP
function loadSmtpConfigs() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM smtp_accounts`, [], (err, rows) => {
            if (err) {
                console.error("Erreur lors du chargement des comptes SMTP :", err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Charger l'historique des emails
function loadEmailHistory() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM email_history ORDER BY created_at DESC`, [], (err, rows) => {
            if (err) {
                console.error("Erreur lors du chargement de l'historique des emails :", err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Effacer l'historique des emails
function clearEmailHistory() {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM email_history`, [], (err) => {
            if (err) {
                console.error("Erreur lors de l'effacement de l'historique des emails :", err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Obtenir les statistiques
function getStats() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) AS emailCount FROM email_history`, (err, emailResult) => {
            if (err) {
                console.error("Erreur lors de la récupération du nombre d'emails :", err);
                reject(err);
                return;
            }
            db.get(`SELECT COUNT(*) AS smtpCount FROM smtp_accounts`, (err, smtpResult) => {
                if (err) {
                    console.error("Erreur lors de la récupération du nombre de comptes SMTP :", err);
                    reject(err);
                    return;
                }
                resolve({
                    emailCount: emailResult.emailCount,
                    smtpCount: smtpResult.smtpCount
                });
            });
        });
    });
}

// Envoi d'email
ipcMain.handle('send-email', async (event, emailData) => {
    const smtpConfigs = await loadSmtpConfigs();
    const smtpConfig = smtpConfigs.find(config => config.name === emailData.smtpName);
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
        attachments: emailData.attachments // Ajout des pièces jointes encodées
    };

    try {
        await transporter.sendMail(mailOptions);
        db.run(`INSERT INTO email_history (smtp_account, to_address, subject, body, status) VALUES (?, ?, ?, ?, 'envoyé')`,
            [smtpConfig.name, emailData.to, emailData.subject, emailData.body]);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        db.run(`INSERT INTO email_history (smtp_account, to_address, subject, body, status) VALUES (?, ?, ?, ?, 'échoué')`,
            [smtpConfig.name, emailData.to, emailData.subject, emailData.body]);
        throw error;
    }
});

// Enregistrer les méthodes IPC
ipcMain.handle('load-smtp-configs', loadSmtpConfigs);
ipcMain.handle('save-smtp-config', (event, config) => saveSmtpConfig(config));
ipcMain.handle('delete-smtp-config', (event, accountName) => deleteSmtpConfig(accountName));
ipcMain.handle('load-email-history', loadEmailHistory);
ipcMain.handle('clear-email-history', clearEmailHistory);
ipcMain.handle('get-stats', getStats);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        },
    });
    mainWindow.loadFile('index.html');
    ipcMain.on('minimize-window', () => mainWindow.minimize());
    ipcMain.on('close-window', () => mainWindow.close());
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
