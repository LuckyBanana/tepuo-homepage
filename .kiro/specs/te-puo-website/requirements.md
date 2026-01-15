# Requirements Document - Site Web Te Puo

## Introduction

Le site web Te Puo est une vitrine en ligne pour une marque de bijoux artisanaux faits main. Les bijoux sont créés à partir de terre travaillée en sphères selon la technique dorodango japonaise. Le site doit présenter la marque, afficher les collections de bijoux de manière dynamique via une base de données Supabase, et permettre aux visiteurs de localiser les points de vente sur une carte interactive.

## Glossary

- **Site_Web**: L'application web statique hébergée sur GitHub Pages
- **Supabase_Backend**: Le service backend Supabase fournissant la base de données et les APIs
- **Page_Accueil**: La page de présentation de la marque avec contenu statique
- **Page_Bijoux**: La page affichant les bijoux organisés par collections
- **Page_Points_Vente**: La page affichant une carte interactive des boutiques
- **Collection**: Un regroupement thématique de bijoux
- **Bijou**: Un article de bijouterie artisanal
- **Point_Vente**: Une boutique physique vendant les bijoux Te Puo
- **Carte_OSM**: La carte OpenStreetMap interactive
- **Domaine_Personnalisé**: Le nom de domaine acheté par le client

## Requirements

### Requirement 1: Hébergement et Déploiement

**User Story:** En tant que propriétaire de la marque, je veux que le site soit hébergé sur GitHub Pages avec mon nom de domaine personnalisé, afin que les clients puissent accéder au site via une URL professionnelle.

#### Acceptance Criteria

1. THE Site_Web SHALL be deployable to GitHub Pages
2. WHEN the site is deployed, THE Site_Web SHALL be accessible via the custom domain
3. THE Site_Web SHALL serve all pages as static HTML/CSS/JavaScript files
4. WHEN code is pushed to the main branch, THE Site_Web SHALL automatically deploy via GitHub Actions

### Requirement 2: Page Accueil Statique

**User Story:** En tant que visiteur, je veux découvrir la marque Te Puo et son concept, afin de comprendre l'histoire et la philosophie derrière les bijoux.

#### Acceptance Criteria

1. THE Page_Accueil SHALL display brand presentation content
2. THE Page_Accueil SHALL display the commercial brief and concept
3. THE Page_Accueil SHALL display information about the dorodango technique
4. WHEN content needs updating, THE Page_Accueil SHALL be updated by modifying static files and redeploying

### Requirement 3: Gestion des Bijoux et Collections

**User Story:** En tant que propriétaire de la marque, je veux gérer mes bijoux et collections dans Supabase, afin de pouvoir ajouter, modifier ou supprimer des produits sans modifier le code du site.

#### Acceptance Criteria

1. THE Supabase_Backend SHALL store jewelry items with their properties (name, description, image URL, collection reference)
2. THE Supabase_Backend SHALL store collections with their properties (name, description)
3. WHEN a jewelry item is added to Supabase, THE Page_Bijoux SHALL display it automatically
4. WHEN a collection is created in Supabase, THE Page_Bijoux SHALL create a new section for it
5. THE Site_Web SHALL fetch jewelry and collection data via Supabase REST API

### Requirement 4: Affichage des Bijoux par Collections

**User Story:** En tant que visiteur, je veux voir les bijoux organisés par collections, afin de naviguer facilement entre les différentes gammes de produits.

#### Acceptance Criteria

1. WHEN the Page_Bijoux loads, THE Site_Web SHALL fetch all collections from Supabase
2. WHEN the Page_Bijoux loads, THE Site_Web SHALL fetch all jewelry items from Supabase
3. THE Page_Bijoux SHALL display jewelry items grouped by their collection
4. WHEN a collection has no jewelry items, THE Page_Bijoux SHALL not display that collection
5. THE Page_Bijoux SHALL display jewelry images, names, and descriptions

### Requirement 5: Gestion des Points de Vente

**User Story:** En tant que propriétaire de la marque, je veux gérer les points de vente dans Supabase, afin de pouvoir ajouter ou retirer des boutiques sans modifier le code.

#### Acceptance Criteria

1. THE Supabase_Backend SHALL store sales points with name and geographic coordinates (latitude, longitude)
2. WHEN a sales point is added to Supabase, THE Page_Points_Vente SHALL display it automatically on the map
3. THE Site_Web SHALL fetch sales points data via Supabase REST API

### Requirement 6: Carte Interactive des Points de Vente

**User Story:** En tant que visiteur, je veux voir une carte interactive avec les boutiques vendant les bijoux Te Puo, afin de trouver le point de vente le plus proche de moi.

#### Acceptance Criteria

1. THE Page_Points_Vente SHALL display an OpenStreetMap interactive map
2. WHEN the Page_Points_Vente loads, THE Site_Web SHALL fetch all sales points from Supabase
3. THE Carte_OSM SHALL display a marker for each sales point at its coordinates
4. WHEN a user clicks on a marker, THE Carte_OSM SHALL display the sales point name
5. THE Carte_OSM SHALL allow users to zoom and pan

### Requirement 7: Design Inspiré du Dorodango

**User Story:** En tant que visiteur, je veux que le design du site reflète l'esthétique artisanale et naturelle de la technique dorodango, afin de ressentir l'identité de la marque.

#### Acceptance Criteria

1. THE Site_Web SHALL use spherical shapes in the design elements
2. THE Site_Web SHALL use earth tones and natural colors in the color palette
3. THE Site_Web SHALL convey an artisanal and handcrafted aesthetic
4. THE Site_Web SHALL maintain visual consistency across all pages

### Requirement 8: Performance et Accessibilité

**User Story:** En tant que visiteur, je veux que le site se charge rapidement et soit accessible, afin d'avoir une expérience utilisateur optimale.

#### Acceptance Criteria

1. THE Site_Web SHALL load the Page_Accueil within 3 seconds on standard connections
2. THE Site_Web SHALL be responsive and display correctly on mobile, tablet, and desktop devices
3. THE Site_Web SHALL use semantic HTML for accessibility
4. WHEN images fail to load, THE Site_Web SHALL display appropriate alt text

### Requirement 9: Sécurité et Configuration Supabase

**User Story:** En tant que propriétaire de la marque, je veux que les données Supabase soient accessibles en lecture seule depuis le site public, afin de protéger mes données contre les modifications non autorisées.

#### Acceptance Criteria

1. THE Supabase_Backend SHALL allow anonymous read access to jewelry, collections, and sales points tables
2. THE Supabase_Backend SHALL prevent anonymous write, update, or delete operations
3. THE Site_Web SHALL use Supabase anon key for API requests
4. THE Site_Web SHALL handle API errors gracefully and display user-friendly messages
