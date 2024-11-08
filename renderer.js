window.addEventListener('DOMContentLoaded', () => {
    showSection('home'); // Charger la page d'accueil par défaut

    loadSmtpConfigs();
    loadEmailHistory();
    loadStats();

    async function loadSmtpConfigs() {
        const smtpConfigs = await window.electronAPI.loadSmtpConfigs();
        const smtpAccountSelect = document.getElementById('smtp-account');
        smtpAccountSelect.innerHTML = '<option>Sélectionnez un compte SMTP</option>';

        if (smtpConfigs.length === 0) {
            showSection('config-smtp');
            document.getElementById('delete-smtp-btn').classList.add('hidden');
        } else {
            smtpConfigs.forEach(config => {
                const option = document.createElement('option');
                option.value = config.name;
                option.textContent = config.name;
                smtpAccountSelect.appendChild(option);
            });
            document.getElementById('delete-smtp-btn').classList.remove('hidden');
        }
        loadStats();
    }

    async function loadEmailHistory() {
        const history = await window.electronAPI.loadEmailHistory();
        const historyContainer = document.getElementById('history-container');
        historyContainer.innerHTML = '';

        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="has-text-centered">Aucun email envoyé !</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('table', 'is-fullwidth', 'is-striped');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>À</th>
                    <th>Sujet</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${history.map(email => `
                    <tr>
                        <td>${email.to_address}</td>
                        <td>${email.subject}</td>
                        <td>${email.status}</td>
                        <td>${new Date(email.created_at).toLocaleString()}</td>
                        <td>
                            ${email.status === 'échoué' ? `<button class="button is-small is-danger resend-btn" data-id="${email.id}">Renvoyer</button>` : ''}
                            <button class="button is-small is-warning delete-btn" data-id="${email.id}">Effacer</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        historyContainer.appendChild(table);

        document.querySelectorAll('.resend-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const emailId = event.target.getAttribute('data-id');
                await resendEmail(emailId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async () => {
                await window.electronAPI.clearEmailHistory();
                loadEmailHistory();
                loadStats();
            });
        });
    }

    async function loadStats() {
        const stats = await window.electronAPI.getStats();
        document.getElementById('email-count').textContent = stats.emailCount;
        document.getElementById('smtp-count').textContent = stats.smtpCount;
    }

    async function resendEmail(emailId) {
        try {
            const emailData = await window.electronAPI.getEmailById(emailId);
            await window.electronAPI.sendEmail(emailData);
            showNotification("E-mail renvoyé avec succès !", "success");
            loadEmailHistory();
            loadStats();
        } catch (error) {
            showNotification("Erreur lors du renvoi de l'e-mail : " + error.message, "error");
        }
    }

    function showSection(sectionId) {
        const sections = ['home', 'send-email', 'history', 'config-smtp'];
        sections.forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');
    }

    document.getElementById('nav-home').addEventListener('click', () => showSection('home'));
    document.getElementById('nav-send-email').addEventListener('click', () => showSection('send-email'));
    document.getElementById('nav-history').addEventListener('click', () => showSection('history'));
    document.getElementById('nav-config-smtp').addEventListener('click', () => showSection('config-smtp'));

    document.getElementById('send-btn').addEventListener('click', async () => {
        // Convertir les fichiers en base64
        const attachments = await Promise.all(
            dropzone.getAcceptedFiles().map(file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        filename: file.name,
                        content: reader.result.split(',')[1],
                        encoding: 'base64'
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }))
        );

        const emailData = {
            smtpName: document.getElementById('smtp-account').value,
            to: document.getElementById('email-to').value,
            subject: document.getElementById('email-subject').value,
            body: tinymce.get('email-body').getContent(),
            attachments
        };

        try {
            await window.electronAPI.sendEmail(emailData);
            showNotification("Email envoyé avec succès !", "success");
            loadEmailHistory();
            loadStats();
        } catch (error) {
            showNotification("Erreur lors de l'envoi de l'email : " + error.message, "error");
        }
    });

    document.getElementById('delete-smtp-btn').addEventListener('click', async () => {
        const smtpAccountSelect = document.getElementById('smtp-account');
        const selectedAccount = smtpAccountSelect.value;

        if (selectedAccount === 'Sélectionnez un compte SMTP') {
            showNotification("Veuillez sélectionner un compte SMTP à supprimer.", "error");
            return;
        }

        try {
            await window.electronAPI.deleteSmtpConfig(selectedAccount);
            showNotification(`Compte SMTP "${selectedAccount}" supprimé avec succès !`, "success");
            loadSmtpConfigs();
            loadStats();
        } catch (error) {
            showNotification("Erreur lors de la suppression du compte SMTP : " + error.message, "error");
        }
    });

    document.getElementById('save-smtp-btn').addEventListener('click', async () => {
        const config = {
            name: document.getElementById('smtp-name').value,
            server: document.getElementById('smtp-server').value,
            port: parseInt(document.getElementById('smtp-port').value, 10),
            username: document.getElementById('smtp-username').value,
            password: document.getElementById('smtp-password').value,
            ssl: document.getElementById('smtp-ssl').checked
        };

        if (!config.name || !config.server || !config.port || !config.username || !config.password) {
            showNotification("Veuillez remplir tous les champs pour enregistrer un compte SMTP.", "error");
            return;
        }

        try {
            await window.electronAPI.saveSmtpConfig(config);
            showNotification("Compte SMTP enregistré avec succès !", "success");
            loadSmtpConfigs();
            showSection('send-email');
        } catch (error) {
            showNotification("Erreur lors de l'enregistrement du compte SMTP : " + error.message, "error");
        }
    });

});

function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.classList.add("notification-bubble", type);
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("fade-out");
        notification.addEventListener("transitionend", () => notification.remove());
    }, 3000);
}
