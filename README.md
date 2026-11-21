# DeliveryCommands

Application web de commande en ligne et de suivi de livraison, réalisée dans le cadre d'un projet de fin d'année (PFA) à l'ENSA de Fès.

Le client parcourt le catalogue, passe commande et suit sa livraison avec un code de suivi. Le commerçant gère les commandes depuis un espace administrateur sécurisé.

## Fonctionnalités

**Côté client**
- Catalogue avec recherche et filtre par catégorie, affichage du stock
- Panier conservé après actualisation de la page, quantités limitées au stock disponible
- Tunnel de commande : livraison, paiement, confirmation avec code de suivi
- Suivi de commande par code et e-mail, sans exposer les données personnelles
- Interface en français, prix en dirhams (MAD), affichage adapté au mobile

**Côté administrateur**
- Connexion sécurisée par jeton JWT
- Tableau de bord : nombre de commandes, chiffre d'affaires, commandes à livrer, produits en stock faible
- Recherche et filtre des commandes, changement de statut : traitée → expédiée → en route → livrée

> Le paiement est **simulé** : aucune donnée bancaire n'est envoyée ni enregistrée.

## Technologies

| Partie | Technologies |
|---|---|
| Frontend | Angular 16, TypeScript, RxJS, Bootstrap 5, ngx-toastr |
| Backend | Java 17, Spring Boot 4, Spring Data JPA, Spring Security (JWT, BCrypt), Bean Validation |
| Base de données | H2 (fichier local, aucune installation nécessaire) |

## Architecture

```
Navigateur ── Angular (composants, services, intercepteurs HTTP, guards)
                 │  HTTP + JSON
                 ▼
API REST ──── Spring Boot (contrôleurs → services → repositories)
                 │
                 ▼
             Base H2
```

Les prix, les totaux et le stock sont **toujours calculés par le serveur** : le navigateur n'envoie que les identifiants des produits et les quantités.

## Installation et lancement

**Prérequis :** Git, Node.js 18, JDK 17.

```bash
git clone https://github.com/imad14serrar/DeliveryCommands.git
cd DeliveryCommands
```

| Partie | Dossier | Commande | Adresse |
|---|---|---|---|
| API | `backend/` | `.\mvnw spring-boot:run` (Windows) ou `./mvnw spring-boot:run` | http://localhost:8080 |
| Site | racine | `npm install` puis `npm start` | http://localhost:4200 |

Au premier démarrage, l'API crée automatiquement un catalogue de 10 produits et quelques commandes de démonstration.

## Accès administrateur

Espace admin : http://localhost:4200/admin (icône bouclier dans le menu).

| Identifiant | Mot de passe |
|---|---|
| `admin` | `Mas*2026*2027` |

Le mot de passe peut être remplacé sans modifier le code avec la variable d'environnement `ADMIN_PASSWORD`.

## API REST

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| GET | `/api/products`, `/api/categories`, `/api/shipment-types` | Public | Catalogue et modes de livraison |
| POST | `/api/shipments` | Public | Création d'une commande |
| GET | `/api/shipments/track?code=…&email=…` | Public | Suivi d'une commande |
| POST | `/api/auth/login` | Public | Connexion administrateur |
| GET | `/api/admin/shipments` | Admin | Liste des commandes |
| PATCH | `/api/admin/shipments/{code}/status` | Admin | Changement de statut |
| GET | `/api/admin/stats` | Admin | Indicateurs du tableau de bord |

## Structure du projet

```
DeliveryCommands/
├── backend/                  API Spring Boot
│   └── src/main/java/ma/pfa/delivery/
│       ├── controller/       routes REST
│       ├── service/          règles métier
│       ├── repository/       accès aux données
│       ├── entity/           modèle de données
│       ├── dto/              format des échanges JSON
│       ├── config/           sécurité, données initiales
│       └── exception/        gestion des erreurs
└── src/app/                  application Angular
    ├── product-list/, cart/, shipment-page/, paiment-online/,
    │   order-confirmation/, trafic-orders/, contact-us/   pages client
    ├── admin/                connexion et tableau de bord
    ├── service/              accès à l'API, panier, authentification
    ├── interceptors/         erreurs, jeton JWT, chargement
    └── guards/               protection de la navigation
```
