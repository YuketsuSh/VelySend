window.addEventListener('DOMContentLoaded', () => {
    // Charger les configurations SMTP et afficher l'interface correspondante
    loadSmtpConfigs();

    async function loadSmtpConfigs() {
        const smtpConfigs = await window.electronAPI.loadSmtpConfigs();
        const smtpAccountSelect = document.getElementById('smtp-account');
        smtpAccountSelect.innerHTML = '<option>Sélectionnez un compte SMTP</option>';

        if (smtpConfigs.length === 0) {
            // Aucun compte configuré : afficher le formulaire de création de compte SMTP et masquer l'interface d'envoi
            showSmtpConfig();
        } else {
            // Au moins un compte configuré : afficher l'interface d'envoi et masquer le formulaire de création de compte SMTP
            showEmailSend();
            // Remplir le menu déroulant avec les comptes existants
            smtpConfigs.forEach(config => {
                const option = document.createElement('option');
                option.value = config.name;
                option.textContent = config.name;
                smtpAccountSelect.appendChild(option);
            });
        }
    }

    function showSmtpConfig() {
        document.getElementById('smtp-config').classList.remove('hidden');
        document.getElementById('email-send').classList.add('hidden');
    }

    function showEmailSend() {
        document.getElementById('smtp-config').classList.add('hidden');
        document.getElementById('email-send').classList.remove('hidden');
    }

    // Afficher le formulaire pour ajouter un nouveau compte SMTP lorsque le bouton est cliqué
    document.getElementById('add-smtp-btn').addEventListener('click', () => {
        showSmtpConfig();
    });

    // Supprimer le compte SMTP sélectionné et recharger l'affichage en fonction des comptes restants
    document.getElementById('delete-smtp-btn').addEventListener('click', async () => {
        const selectedAccount = document.getElementById('smtp-account').value;
        if (selectedAccount !== 'Sélectionnez un compte SMTP') {
            await window.electronAPI.deleteSmtpConfig(selectedAccount);
            alert("Compte SMTP supprimé !");
            loadSmtpConfigs(); // Recharge la liste après suppression
        }
    });

    // Enregistrement d'un nouveau compte SMTP
    document.getElementById('save-smtp-btn').addEventListener('click', async () => {
        const smtpConfig = {
            name: document.getElementById('smtp-name').value,
            server: document.getElementById('smtp-server').value,
            port: document.getElementById('smtp-port').value,
            username: document.getElementById('smtp-username').value,
            password: document.getElementById('smtp-password').value,
            ssl: document.getElementById('smtp-ssl').checked,
        };
        await window.electronAPI.saveSmtpConfig(smtpConfig);
        alert("Configuration SMTP enregistrée !");
        loadSmtpConfigs(); // Recharge la liste après enregistrement et bascule l'affichage
    });
});
