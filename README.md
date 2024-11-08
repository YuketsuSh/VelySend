# VelySend

VelySend est une application desktop multiplateforme (Windows, macOS, Linux) développée avec **ElectronJS**. Cette application permet à **Velyorix** d'envoyer des emails personnalisés et stylisés via un SMTP dédié, avec une gestion multi-comptes et un design moderne en glassmorphism.

## 📑 Sommaire

- [Fonctionnalités principales](#fonctionnalités-principales)
- [Technologies utilisées](#technologies-utilisées)
- [Installation et démarrage](#installation-et-démarrage)
- [Utilisation](#utilisation)
    - [Configuration d'un Compte SMTP](#configuration-dun-compte-smtp)
    - [Envoi d'un Email](#envoi-dun-email)
- [Build et déploiement](#build-et-déploiement)
- [Licence](#licence)

## 🖥️ Fonctionnalités principales

- **Envoi d'emails stylisés en HTML** : Composer et envoyer des emails avec du contenu HTML personnalisé.
- **Gestion multi-comptes SMTP** : Ajouter, éditer, et supprimer des configurations SMTP avec stockage sécurisé en base de données SQLite.
- **Pièces jointes** : Possibilité d'ajouter plusieurs fichiers en pièce jointe (images, PDF).
- **Notifications d'envoi** : Confirmation de succès ou échec après chaque envoi.
- **Historique des envois** : Suivi des emails envoyés, avec possibilité de renvoi et de suppression d'historique.
- **Statistiques dynamiques** : Affichage en temps réel du nombre de comptes SMTP et d'e-mails envoyés.
- **Design en glassmorphism** : Interface moderne et responsive en utilisant Bulma CSS et des effets de transparence et de dégradé.

## 🚀 Technologies utilisées

- **ElectronJS** : Framework pour créer des applications desktop avec des technologies web.
- **Node.js** : Backend intégré pour gérer l'envoi d'emails et la gestion de configuration.
- **SQLite** : Base de données intégrée pour stocker les configurations SMTP et l'historique des envois.
- **Bulma CSS** : Framework CSS pour une interface responsive et élégante.
- **NodeMailer** : Bibliothèque Node.js pour l'envoi d'emails via des serveurs SMTP.

## 📦 Installation et démarrage

1. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/YuketsuSh/velysend.git
   cd velysend
   ```

2. **Installer les dépendances** :

   ```bash
   npm install
   ```

3. **Lancer l'application en développement** :

   ```bash
   npm start
   ```

## 📖 Utilisation

### Configuration d'un Compte SMTP

Lors de la première utilisation, l'application vous demandera de configurer un compte SMTP :
- Renseignez les informations nécessaires : nom du compte, serveur SMTP, port, nom d'utilisateur, mot de passe, et SSL/TLS.
- Les informations sont stockées de manière sécurisée dans la base de données SQLite.
- Une fois le compte ajouté, l'interface d'envoi d'email sera accessible.

### Envoi d'un Email

Une fois un compte SMTP configuré :
- Remplissez les champs de destinataire, sujet, et contenu de l'email.
- Ajoutez des pièces jointes si nécessaire (formats autorisés : images et PDF).
- Cliquez sur **Envoyer** pour envoyer l'email.
- L'historique des envois est automatiquement mis à jour, avec des options pour renvoyer ou supprimer des envois individuels.

## 📤 Build et déploiement

L'application peut être packagée en exécutables pour Windows, Linux, et macOS.

1. **Installer Electron Builder** (si ce n'est pas déjà fait) :

   ```bash
   npm install electron-builder --save-dev
   ```

2. **Générer les builds** :

- **Windows** : `npm run build --win`
- **Linux** : `npm run build --linux`
- **macOS** : `npm run build --mac`

3. **Fichiers d'installation** :
- Windows : `.exe` dans le dossier `dist/`
- Linux : `.AppImage` et `.deb` dans le dossier `dist/`
- macOS : `.dmg` dans le dossier `dist/`

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
