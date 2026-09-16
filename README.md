# 📦 Coursier Tracking — Suivi de disponibilité des coursiers en temps réel

Application complète composée de trois parties :

| Dossier | Rôle | Stack |
|---|---|---|
| `backend/` | API REST + WebSocket | Node.js, Express, Socket.IO, MySQL (Sequelize), JWT |
| `mobile/` | App coursier | Flutter (Android/iOS), OpenStreetMap, Firebase Cloud Messaging |
| `admin-dashboard/` | Dashboard web admin | React, Vite, Leaflet (OpenStreetMap), Socket.IO client |

---

## 1. Architecture générale

```
[App Flutter Coursier] ──HTTP (REST)──► [Backend Express] ◄──HTTP (REST)── [Dashboard Admin React]
        │                                      │                                  │
        └──────────────WebSocket (Socket.IO)───┴──────WebSocket (Socket.IO)───────┘
                                                 │
                                          [MySQL Database]
                                                 │
                                     [Firebase Cloud Messaging]
                                       (notifications push)
```

- Le **REST** gère l'authentification, les lectures/écritures ponctuelles et la persistance.
- Le **WebSocket (Socket.IO)** gère le flux continu : position GPS et changements de statut diffusés instantanément au dashboard admin, et les nouvelles missions poussées instantanément au coursier concerné.
- **FCM** relaie une notification push même si l'app coursier est en arrière-plan (le WebSocket seul ne suffit pas dans ce cas).

---

## 2. Prérequis

- Node.js ≥ 18
- MySQL ≥ 8
- Flutter SDK ≥ 3.x (avec Android Studio / Xcode selon la cible)
- Un projet Firebase (gratuit) pour les notifications push
- npm ou yarn

---

## 3. Installation du Backend

```bash
cd backend
npm install
cp .env.example .env
```

Édite `.env` :
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` : tes identifiants MySQL
- `JWT_SECRET` et `JWT_REFRESH_SECRET` : génère des chaînes aléatoires longues, par ex. :
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `FIREBASE_SERVICE_ACCOUNT_PATH` : chemin vers la clé de service Firebase (voir §6)

Crée la base de données (deux options) :

**Option A — automatique (recommandé en dev)** : le serveur crée/synchronise les tables tout seul au démarrage (`sequelize.sync({alter:true})`), il suffit que la base `coursier_tracking` existe :
```sql
CREATE DATABASE coursier_tracking CHARACTER SET utf8mb4;
```

**Option B — manuelle** : exécute le script SQL fourni :
```bash
mysql -u root -p < database/schema.sql
```

Crée le compte admin par défaut :
```bash
npm run db:init
```
Cela affiche l'email et le mot de passe générés (ou ceux définis via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` dans `.env`). **Change ce mot de passe après la première connexion.**

Lance le serveur :
```bash
npm run dev      # avec rechargement automatique (nodemon)
# ou
npm start
```

Le serveur écoute sur `http://localhost:5000`. Vérifie qu'il tourne :
```bash
curl http://localhost:5000/api/health
```

---

## 4. Installation du Dashboard Admin

```bash
cd admin-dashboard
npm install
cp .env.example .env
npm run dev
```

Ouvre `http://localhost:3000`, connecte-toi avec le compte admin créé à l'étape 3 (`npm run db:init`).

Build de production :
```bash
npm run build   # génère le dossier dist/ à déployer sur n'importe quel hébergeur statique
```

---

## 5. Installation de l'app mobile Flutter

```bash
cd mobile
flutter pub get
```

### 5.1 Configurer l'URL du backend

Modifie `lib/config.dart` :
- Émulateur Android → laisse `10.0.2.2` (pointe vers le `localhost` de ta machine)
- Appareil physique ou serveur distant → remplace par l'IP/domaine réel, ex. `http://192.168.1.50:5000/api`

### 5.2 Lancer l'app

```bash
flutter run
```

---

## 6. Configuration Firebase (notifications push)

1. Crée un projet sur [console.firebase.google.com](https://console.firebase.google.com)
2. **Backend** : Paramètres du projet → Comptes de service → *Générer une nouvelle clé privée* → télécharge le JSON → place-le dans `backend/` et pointe `FIREBASE_SERVICE_ACCOUNT_PATH` vers ce fichier
3. **Mobile** : installe la CLI FlutterFire puis configure le projet :
   ```bash
   dart pub global activate flutterfire_cli
   cd mobile
   flutterfire configure
   ```
   Cela génère automatiquement `firebase_options.dart`, `google-services.json` (Android) et `GoogleService-Info.plist` (iOS).

Sans cette configuration, l'app fonctionne normalement (statut, carte, WebSocket) mais les notifications push resteront désactivées (un avertissement s'affiche dans les logs backend).

---

## 7. Utilisation

### Côté coursier (mobile)
1. S'inscrire (`POST /api/auth/coursier/register`, ou ajoute un écran d'inscription réutilisant `ApiService.register`) ou se connecter avec un compte existant.
2. Basculer son statut via les boutons **Disponible / Occupé / Hors ligne**.
3. La position GPS est envoyée automatiquement en continu dès que le statut n'est pas "Hors ligne".
4. À la réception d'une mission (notification push + bandeau dans l'app), le coursier peut la **démarrer** puis la **terminer** — il redevient alors automatiquement "Disponible".

### Côté admin (dashboard web)
1. Se connecter avec le compte admin.
2. La carte affiche tous les coursiers en temps réel (vert = disponible, orange = occupé, gris = hors ligne).
3. Le tableau liste chaque coursier avec son véhicule, statut et heure de dernière position.
4. Créer une mission via l'API (`POST /api/missions`) déclenche automatiquement l'attribution au coursier disponible le plus proche (basée sur la formule de Haversine), avec notification push envoyée automatiquement.

---

## 8. Référence API REST

Toutes les routes (sauf `/health` et les routes `/auth/*`) nécessitent l'en-tête :
```
Authorization: Bearer <accessToken>
```

| Méthode | Route | Rôle | Description |
|---|---|---|---|
| POST | `/api/auth/coursier/register` | public | Inscription coursier |
| POST | `/api/auth/coursier/login` | public | Connexion coursier |
| POST | `/api/auth/admin/login` | public | Connexion admin |
| POST | `/api/auth/refresh-token` | public | Renouvelle l'access token |
| GET | `/api/coursiers/me` | coursier | Profil du coursier connecté |
| PATCH | `/api/coursiers/statut` | coursier | Change le statut (`disponible`\|`occupe`\|`hors_ligne`) |
| PATCH | `/api/coursiers/position` | coursier | Met à jour la position GPS |
| POST | `/api/coursiers/fcm-token` | coursier | Enregistre le token de notification push |
| GET | `/api/coursiers/disponibles` | authentifié | Liste des coursiers disponibles (carte) |
| GET | `/api/coursiers` | admin | Liste complète des coursiers, filtrable par `?statut=` |
| POST | `/api/missions` | admin | Crée une mission (attribution auto par défaut) |
| GET | `/api/missions` | authentifié | Liste des missions (admin : toutes, coursier : les siennes) |
| PATCH | `/api/missions/:id/statut` | authentifié | Change le statut d'une mission |
| PATCH | `/api/missions/:id/assigner` | admin | Assigne manuellement une mission à un coursier |

## 9. Événements WebSocket (Socket.IO)

Connexion : `io(SOCKET_URL, { auth: { token: accessToken } })`

| Événement | Émis par | Reçu par | Payload |
|---|---|---|---|
| `position:update` | coursier | serveur | `{ latitude, longitude }` |
| `statut:update` | coursier | serveur | `{ statut }` |
| `coursier:position_update` | serveur | admins | `{ coursierId, latitude, longitude, timestamp }` |
| `coursier:statut_change` | serveur | admins | `{ coursierId, statut, timestamp }` |
| `mission:nouvelle` | serveur | coursier concerné | `{ mission }` |
| `mission:assignee` | serveur | admins | `{ mission, coursierId }` |
| `mission:statut_change` | serveur | admins | `{ missionId, statut }` |

---

## 10. Structure des dossiers

```
coursier-app/
├── backend/
│   ├── database/
│   │   ├── schema.sql        # schéma SQL de référence
│   │   └── init.js           # script de création du compte admin
│   ├── src/
│   │   ├── config/           # connexion DB + Firebase
│   │   ├── controllers/      # logique métier (auth, coursiers, missions)
│   │   ├── middleware/       # auth JWT, gestion d'erreurs
│   │   ├── models/           # modèles Sequelize + associations
│   │   ├── routes/           # définition des routes REST
│   │   ├── sockets/          # gestionnaire Socket.IO
│   │   ├── utils/            # JWT, géolocalisation (Haversine), push FCM
│   │   └── server.js         # point d'entrée
│   ├── .env.example
│   └── package.json
├── mobile/
│   ├── lib/
│   │   ├── models/            # Coursier, Mission
│   │   ├── screens/           # Login, Home (carte + statut)
│   │   ├── services/          # API, Socket.IO, GPS, notifications, stockage
│   │   ├── widgets/           # StatutSelector
│   │   ├── config.dart
│   │   └── main.dart
│   └── pubspec.yaml
└── admin-dashboard/
    ├── src/
    │   ├── components/        # CourierMap, StatsCards, CourierList
    │   ├── pages/              # Login, Dashboard
    │   ├── services/           # api.js, socket.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

---

## 11. Pistes d'évolution

- Ajouter des migrations Sequelize CLI au lieu de `sync({alter:true})` en production
- Écran d'inscription dans l'app mobile (actuellement l'endpoint existe côté API, l'UI est à ajouter)
- Historique/statistiques d'activité par coursier (la table `historique_disponibilites` est déjà prête pour ça)
- File d'attente de missions (Redis/BullMQ) si le volume de missions simultanées augmente
- Authentification à deux facteurs pour les comptes admin
- Zones de couverture géographique et tarification par distance
