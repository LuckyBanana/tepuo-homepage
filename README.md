# Te Puo - Site Web Vitrine

Site web vitrine pour Te Puo, une marque de bijoux artisanaux faits main inspirés de la technique dorodango japonaise.

## 🎨 À propos

Te Puo crée des bijoux uniques à partir de terre travaillée en sphères selon la technique dorodango japonaise. Ce site présente la marque, affiche les collections de bijoux de manière dynamique, et permet aux visiteurs de localiser les points de vente sur une carte interactive.

## ✨ Fonctionnalités

- 🏠 **Page d'accueil** : Présentation de la marque et de la technique dorodango
- 💎 **Page Bijoux** : Affichage dynamique des collections depuis Supabase
- 📍 **Page Points de Vente** : Carte interactive OpenStreetMap avec les boutiques
- 🚀 **Performance** : Caching sessionStorage, lazy loading, minification
- ♿ **Accessibilité** : WCAG 2.1 AA, navigation clavier, screen reader compatible
- 📱 **Responsive** : Optimisé pour mobile, tablette et desktop

## 🏗️ Structure du Projet

```
te-puo-website/
├── index.html              # Page d'accueil (présentation de la marque)
├── bijoux.html             # Page des bijoux (affichage dynamique des collections)
├── points-vente.html       # Page des points de vente (carte interactive)
├── CNAME                   # Configuration domaine personnalisé
├── styles/                 # Fichiers CSS
│   ├── main.css           # Styles globaux et variables
│   ├── home.css           # Styles page d'accueil
│   ├── bijoux.css         # Styles page bijoux
│   └── points-vente.css   # Styles carte
├── scripts/                # Fichiers JavaScript
│   ├── config.js          # Configuration Supabase
│   ├── supabase-client.js # Client API Supabase
│   ├── bijoux.js          # Logique page bijoux
│   └── points-vente.js    # Logique carte interactive
├── images/                 # Images statiques
├── tests/                  # Tests unitaires et property-based tests
│   ├── bijoux.test.js
│   ├── supabase-client.test.js
│   └── setup.js
├── database/               # Scripts SQL et documentation Supabase
│   ├── 00_setup_all_tables.sql
│   ├── 05_configure_rls_policies.sql
│   ├── 07_setup_storage_bucket.sql
│   └── README.md
├── .github/
│   └── workflows/
│       ├── deploy.yml     # Déploiement automatique GitHub Pages
│       └── test.yml       # Tests CI/CD
├── package.json           # Dépendances npm
├── vite.config.js         # Configuration Vite
├── GITHUB_PAGES_SETUP.md  # Guide déploiement GitHub Pages
├── PERFORMANCE_OPTIMIZATION.md  # Guide optimisation performance
├── ACCESSIBILITY_TESTING.md     # Guide tests accessibilité
└── .gitignore             # Fichiers à ignorer par Git
```

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm
- Compte Supabase (gratuit)
- Compte GitHub (pour le déploiement)

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd te-puo-website
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Supabase**
   
   a. Créer un projet Supabase sur [supabase.com](https://supabase.com)
   
   b. Créer les tables de base de données :
   ```bash
   # Copier le contenu de database/00_setup_all_tables.sql
   # Coller dans l'éditeur SQL de Supabase et exécuter
   ```
   
   c. Configurer les politiques RLS :
   ```bash
   # Copier le contenu de database/05_configure_rls_policies.sql
   # Coller dans l'éditeur SQL de Supabase et exécuter
   ```
   
   d. Configurer le storage :
   ```bash
   # Copier le contenu de database/07_setup_storage_bucket.sql
   # Coller dans l'éditeur SQL de Supabase et exécuter
   ```
   
   e. Configurer les clés API :
   - Ouvrir `scripts/config.js`
   - Remplacer `YOUR_SUPABASE_URL` par l'URL de votre projet
   - Remplacer `YOUR_SUPABASE_ANON_KEY` par votre clé anon/public
   
   📚 **Documentation détaillée** : Voir `database/README.md` et `database/STORAGE_SETUP_GUIDE.md`

4. **Ajouter des données de test** (optionnel)
   ```bash
   # Copier le contenu de database/04_sample_data.sql
   # Coller dans l'éditeur SQL de Supabase et exécuter
   ```

## 💻 Développement

**Lancer le serveur de développement**
```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

**Build pour la production**
```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

**Prévisualiser le build de production**
```bash
npm run preview
```

## 🧪 Tests

**Lancer tous les tests**
```bash
npm test
```

**Lancer les tests en mode watch**
```bash
npm test -- --watch
```

**Lancer les tests avec l'interface UI**
```bash
npm run test:ui
```

**Générer un rapport de couverture**
```bash
npm run test:coverage
```

Le rapport sera disponible dans `coverage/index.html`

### Types de tests

- **Tests unitaires** : Vérifient les fonctions individuelles
- **Tests d'intégration** : Vérifient l'interaction entre modules
- **Property-based tests** : Vérifient les propriétés universelles avec fast-check

## 🚀 Déploiement

### GitHub Pages (Recommandé)

1. **Créer un repository GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/te-puo-website.git
   git push -u origin main
   ```

2. **Activer GitHub Pages**
   - Aller dans Settings > Pages
   - Source : Branch `main`, folder `/ (root)`
   - Sauvegarder

3. **Configurer le domaine personnalisé**
   - Ajouter votre domaine dans Settings > Pages > Custom domain
   - Configurer les DNS records (voir `GITHUB_PAGES_SETUP.md`)

4. **Déploiement automatique**
   - Les workflows GitHub Actions sont déjà configurés
   - Chaque push sur `main` déclenche un déploiement automatique

📚 **Guide complet** : Voir `GITHUB_PAGES_SETUP.md`

### Autres options de déploiement

- **Netlify** : Drag & drop du dossier `dist/`
- **Vercel** : Import du repository GitHub
- **Cloudflare Pages** : Connexion au repository

## 🗄️ Configuration Supabase

### Tables requises

Le projet nécessite trois tables dans Supabase :

1. **collections** - Regroupements thématiques de bijoux
   ```sql
   id UUID PRIMARY KEY
   name TEXT NOT NULL
   description TEXT
   created_at TIMESTAMP
   ```

2. **jewelry** - Articles de bijouterie
   ```sql
   id UUID PRIMARY KEY
   name TEXT NOT NULL
   description TEXT
   image_url TEXT NOT NULL
   collection_id UUID REFERENCES collections(id)
   created_at TIMESTAMP
   ```

3. **sales_points** - Points de vente physiques
   ```sql
   id UUID PRIMARY KEY
   name TEXT NOT NULL
   latitude DOUBLE PRECISION NOT NULL
   longitude DOUBLE PRECISION NOT NULL
   address TEXT
   created_at TIMESTAMP
   ```

### Row Level Security (RLS)

Toutes les tables doivent avoir :
- ✅ RLS activé
- ✅ Politique de lecture anonyme (SELECT)
- ❌ Aucune politique d'écriture anonyme

### Storage

Créer un bucket `jewelry-images` pour stocker les photos des bijoux :
- ✅ Accès public activé
- ✅ Types MIME autorisés : image/jpeg, image/png, image/webp
- ✅ Taille maximale : 5MB par fichier

📚 **Documentation complète** : Voir `database/README.md`

## ⚡ Performance

Le site implémente plusieurs optimisations :

- **Caching** : SessionStorage avec TTL de 5 minutes
- **Lazy Loading** : Images chargées à la demande
- **Minification** : CSS et JS minifiés en production
- **Code Splitting** : Leaflet.js chargé uniquement sur la page carte

**Score cible Lighthouse** : 90+ Performance

📚 **Guide complet** : Voir `PERFORMANCE_OPTIMIZATION.md`

## ♿ Accessibilité

Le site respecte les standards WCAG 2.1 AA :

- ✅ HTML sémantique
- ✅ Alt text pour toutes les images
- ✅ Navigation au clavier
- ✅ Contraste de couleurs suffisant
- ✅ Compatible screen readers
- ✅ ARIA attributes pour le contenu dynamique

**Score cible Lighthouse** : 95+ Accessibilité

📚 **Guide de test** : Voir `ACCESSIBILITY_TESTING.md`

## 📦 Technologies

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Variables CSS, Flexbox, Grid
- **JavaScript (ES6+)** : Modules, async/await, fetch API

### Build & Dev Tools
- **Vite** : Build tool et dev server
- **Vitest** : Test runner
- **fast-check** : Property-based testing
- **jsdom** : DOM testing environment

### Backend & Services
- **Supabase** : PostgreSQL + REST API + Storage
- **Leaflet.js** : Cartographie interactive
- **OpenStreetMap** : Données cartographiques

### Hébergement & CI/CD
- **GitHub Pages** : Hébergement statique
- **GitHub Actions** : CI/CD automatique

## 🎨 Design

Le design s'inspire de la technique dorodango avec :

### Palette de couleurs
- **Terre foncée** : `#5D4E37`
- **Terre moyenne** : `#8B7355`
- **Terre claire** : `#C4A57B`
- **Argile** : `#A0826D`
- **Sable** : `#E8DCC4`
- **Accent** : `#8B6F47`

### Principes de design
- ✨ Formes sphériques (`border-radius: 50%`)
- 🌍 Couleurs terre naturelles
- 🎨 Esthétique artisanale et minimaliste
- 📱 Design responsive mobile-first

## 📁 Documentation

- `GITHUB_PAGES_SETUP.md` - Guide de déploiement GitHub Pages
- `PERFORMANCE_OPTIMIZATION.md` - Guide d'optimisation des performances
- `ACCESSIBILITY_TESTING.md` - Guide de test d'accessibilité
- `database/README.md` - Documentation Supabase
- `database/STORAGE_SETUP_GUIDE.md` - Configuration du storage
- `database/RLS_TESTING_GUIDE.md` - Test des politiques RLS
- `.kiro/specs/te-puo-website/` - Spécifications complètes du projet

## 🐛 Dépannage

### Le site ne charge pas les données

1. Vérifier la configuration dans `scripts/config.js`
2. Vérifier que les tables Supabase existent
3. Vérifier que les politiques RLS sont configurées
4. Ouvrir la console du navigateur pour voir les erreurs

### Les images ne s'affichent pas

1. Vérifier que le bucket `jewelry-images` existe
2. Vérifier que l'accès public est activé
3. Vérifier les URLs dans la table `jewelry`
4. Vérifier les politiques de storage

### Les tests échouent

1. Vérifier que les dépendances sont installées : `npm install`
2. Vérifier la version de Node.js : `node --version` (18+ requis)
3. Nettoyer et réinstaller : `rm -rf node_modules && npm install`

### Le déploiement GitHub Pages échoue

1. Vérifier que GitHub Pages est activé dans Settings
2. Vérifier les logs dans l'onglet Actions
3. Vérifier que le workflow a les permissions nécessaires
4. Vérifier que le build local fonctionne : `npm run build`

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code

- Utiliser ES6+ JavaScript
- Suivre les conventions de nommage existantes
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les fonctions avec JSDoc
- Vérifier l'accessibilité (WCAG 2.1 AA)

## 📝 License

MIT License - voir le fichier LICENSE pour plus de détails

## 👥 Contact

Pour toute question concernant le projet, veuillez contacter l'équipe Te Puo.

## 🙏 Remerciements

- Technique dorodango japonaise pour l'inspiration
- Supabase pour le backend
- Leaflet.js et OpenStreetMap pour la cartographie
- La communauté open source

---

**Fait avec ❤️ pour Te Puo**
