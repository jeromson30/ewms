# TeamFlow

Application de gestion de projet en équipe avec Kanban et planning d'astreintes.

## Stack technique

- **Frontend** : React 18, Vite, React Router, dnd-kit, date-fns, Lucide Icons
- **Backend** : Node.js, Express, MongoDB/Mongoose
- **Auth** : JWT avec middleware Bearer Token

## Installation

```bash
# Installer toutes les dépendances
npm run install:all
```

## Configuration

Créer un fichier `server/.env` à partir de `server/.env.example` :

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teamflow
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=7d
```

## Lancement

```bash
# Lancer le serveur et le client en parallèle
npm run dev
```

- Frontend : http://localhost:5173
- Backend API : http://localhost:5000

## Fonctionnalités

- Authentification (inscription/connexion) avec JWT Bearer Token
- Gestion de projets avec membres
- Kanban avec drag & drop (colonnes, cartes, priorités, labels)
- Planning calendrier avec événements
- Gestion des astreintes (primaire, secondaire, backup)
