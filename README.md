# Projet Groupe 11 - API Express

## Description
Ce projet est une API développée avec Express.js. Elle permet de gérer des fonctionnalités spécifiques définies par le groupe de TP GL 11.

## Prérequis
Avant de lancer l'API, assurez-vous d'avoir les éléments suivants installés sur votre machine :
- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Installation
1. Clonez ce dépôt sur votre machine locale :
    ```bash
    git clone https://github.com/tafforzore/projet-groupe11-testing.git
    ```

2. Accédez au dossier du projet :
    ```bash
    cd Projet-Groupe11-Testing
    ```

3. Installez les dépendances nécessaires :
    ```bash
    npm install
    ```
    ou
    ```bash
    yarn install
    ```

## Lancer l'API
1. Démarrez le serveur en mode développement :
    ```bash
    npm run dev
    ```
    ou
    ```bash
    yarn dev
    ```

2. Démarrez le serveur en mode production :
    ```bash
    npm start
    ```
    ou
    ```bash
    yarn start
    ```

3. Par défaut, l'API sera accessible à l'adresse suivante :
    ```
    http://localhost:3000
    ```

## Scripts disponibles
- `npm run dev` : Lance le serveur en mode développement avec rechargement automatique.
- `npm start` : Lance le serveur en mode production.

## Structure du projet
- `src/` : Contient le code source de l'API.
- `routes/` : Contient les définitions des routes.
- `controllers/` : Contient la logique métier.
- `models/` : Contient les modèles de données.

## Contribution
Les contributions sont les bienvenues ! Veuillez suivre les étapes suivantes :
1. Forkez le dépôt.
2. Créez une branche pour votre fonctionnalité :
    ```bash
    git checkout -b feature/nom-de-la-fonctionnalite
    ```
3. Faites vos modifications et committez-les :
    ```bash
    git commit -m "Ajout de la fonctionnalité X"
    ```
4. Poussez vos modifications :
    ```bash
    git push origin feature/nom-de-la-fonctionnalite
    ```
6. lancez les test integrations et unitaire  :
    ```bash
    npm run test
    ```
7. lancez les test interfaces  :
    ```bash
    npx playwright test --headed
    ```

## Licence
Ce projet est sous licence MIT. Consultez le fichier `LICENSE` pour plus d'informations.


# 📄 Configuration du fichier `.env`

Ce projet utilise des variables d’environnement pour la configuration de la base de données, l’authentification JWT et les URLs du projet. Ces variables sont définies dans un fichier `.env` à la racine du projet.

---

## ✅ Étapes pour créer le fichier `.env`

1. Crée un fichier nommé `.env` à la racine de ton projet :

   touch .env

2. Ouvre le fichier dans ton éditeur de code et colle le contenu suivant en l’adaptant :

   # 🔐 Secrets pour JWT
   JWT_SECRET=votre_super_secret_32_caracteres
   JWT_EXPIRES_IN=15m

   # 🔐 Secret pour le refresh token
   JWT_REFRESH_SECRET=votre_super_refresh_secret_32_caracteres
   JWT_REFRESH_EXPIRES_IN=7d

   # 🌐 Connexion à MongoDB (MongoDB Atlas ou local)

   # Exemple local :
   MONGO_URL_LOCAL=mongodb://admin:password@localhost:27017/test?authSource=admin

   # Exemple cloud (MongoDB Atlas) :
   MONGO_URL=mongodb+srv://<utilisateur>:<mot_de_passe>@cluster0.0gr8udz.mongodb.net/<nom_de_la_base>

   # 🌍 URL de base de l’application pour les appels API
   baseURL=http://localhost:3000
   swaggers: http://localhost:3000/api-docs/

    ## MONGO_URL_LOCAL ET MONGO_URL sont a mettre dans env et peuvent etre identique
---

## 📌 À propos des variables

Nom de la variable        | Description
------------------------ | ---------------------------------------------
JWT_SECRET               | Clé secrète utilisée pour signer les tokens JWT d'accès
JWT_EXPIRES_IN           | Durée de validité du token d’accès (ex: 15m, 1h)
JWT_REFRESH_SECRET       | Clé utilisée pour les refresh tokens
JWT_REFRESH_EXPIRES_IN   | Durée de validité du refresh token (ex: 7d, 30d)
MONGO_URL                | URL de connexion à la base MongoDB locale ou distante
baseURL                  | Adresse de base de l’application (frontend ou backend)

---

## ✅ Étapes pour lancer le Docker

Pour lancer l’environnement de développement avec Docker, assurez-vous d’avoir installé :

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

### 🔧 1. Vérifiez que Docker fonctionne

Ouvrez votre terminal et tapez :

```bash
docker --version
docker-compose --version
```

puis tapez :

```bash
docker-compose up -d --build
```