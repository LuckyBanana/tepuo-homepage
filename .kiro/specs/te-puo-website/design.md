# Design Document - Site Web Te Puo

## Overview

Le site web Te Puo est une application web statique construite avec HTML, CSS et JavaScript vanilla, hébergée sur GitHub Pages. Le site utilise Supabase comme backend pour gérer dynamiquement les bijoux, collections et points de vente. L'architecture suit un modèle JAMstack (JavaScript, APIs, Markup) où le contenu statique est enrichi par des appels API côté client.

Le design s'inspire de la technique dorodango japonaise avec des formes sphériques, des couleurs terre naturelles, et une esthétique artisanale minimaliste.

## Architecture

### Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Static Site (HTML/CSS/JS)               │  │
│  │                                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │  Accueil │  │  Bijoux  │  │ Points Vente │  │  │
│  │  │  (static)│  │(dynamic) │  │  (dynamic)   │  │  │
│  │  └──────────┘  └──────────┘  └──────────────┘  │  │
│  │                      │               │          │  │
│  └──────────────────────┼───────────────┼──────────┘  │
└─────────────────────────┼───────────────┼─────────────┘
                          │               │
                          ▼               ▼
                    ┌─────────────────────────┐
                    │   Supabase Backend      │
                    │  ┌──────────────────┐   │
                    │  │  PostgreSQL DB   │   │
                    │  │  - jewelry       │   │
                    │  │  - collections   │   │
                    │  │  - sales_points  │   │
                    │  └──────────────────┘   │
                    │  ┌──────────────────┐   │
                    │  │   REST API       │   │
                    │  │  (anon read-only)│   │
                    │  └──────────────────┘   │
                    └─────────────────────────┘

                    ┌─────────────────────────┐
                    │   OpenStreetMap API     │
                    │   (Leaflet.js)          │
                    └─────────────────────────┘
```

### Flux de Données

1. **Page Accueil**: Contenu statique chargé directement depuis les fichiers HTML
2. **Page Bijoux**: 
   - Chargement de la page → Fetch collections depuis Supabase
   - Fetch jewelry items depuis Supabase
   - Groupement des bijoux par collection côté client
   - Rendu dynamique du HTML
3. **Page Points de Vente**:
   - Chargement de la page → Initialisation de la carte Leaflet
   - Fetch sales points depuis Supabase
   - Ajout des marqueurs sur la carte

### Déploiement

Le site utilise GitHub Actions pour le déploiement automatique :
- Push sur la branche `main` → Déclenchement du workflow
- Build du site (si nécessaire)
- Déploiement sur GitHub Pages
- Configuration du domaine personnalisé via CNAME

## Components and Interfaces

### 1. Page Accueil (index.html)

**Responsabilité**: Présenter la marque, le concept et la technique dorodango

**Structure**:
```html
<header>
  <nav> Navigation principale </nav>
  <h1> Logo Te Puo </h1>
</header>

<main>
  <section class="hero">
    Image hero avec sphère dorodango
  </section>
  
  <section class="brand-story">
    Présentation de la marque
  </section>
  
  <section class="dorodango-technique">
    Explication de la technique japonaise
  </section>
  
  <section class="philosophy">
    Brief commercial et philosophie
  </section>
</main>

<footer>
  Liens, contact, réseaux sociaux
</footer>
```

### 2. Page Bijoux (bijoux.html)

**Responsabilité**: Afficher les bijoux organisés par collections

**Structure HTML**:
```html
<header> Navigation </header>

<main>
  <h1>Nos Collections</h1>
  <div id="collections-container">
    <!-- Généré dynamiquement par JavaScript -->
  </div>
</main>

<footer> Footer </footer>
```

**JavaScript Module** (`bijoux.js`):

```javascript
// Interface pour les données
interface Collection {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Jewelry {
  id: string;
  name: string;
  description: string;
  image_url: string;
  collection_id: string;
  created_at: string;
}

// Fonctions principales
async function fetchCollections(): Promise<Collection[]>
async function fetchJewelry(): Promise<Jewelry[]>
function groupJewelryByCollection(jewelry: Jewelry[], collections: Collection[]): Map<Collection, Jewelry[]>
function renderCollections(groupedData: Map<Collection, Jewelry[]>): void
async function initBijouxPage(): Promise<void>
```

### 3. Page Points de Vente (points-vente.html)

**Responsabilité**: Afficher une carte interactive avec les boutiques

**Structure HTML**:
```html
<header> Navigation </header>

<main>
  <h1>Où Trouver Nos Bijoux</h1>
  <div id="map-container">
    <div id="map"></div>
  </div>
  <div id="sales-points-list">
    <!-- Liste optionnelle des points de vente -->
  </div>
</main>

<footer> Footer </footer>
```

**JavaScript Module** (`points-vente.js`):

```javascript
// Interface pour les données
interface SalesPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  created_at: string;
}

// Fonctions principales
async function fetchSalesPoints(): Promise<SalesPoint[]>
function initMap(): L.Map
function addMarkers(map: L.Map, salesPoints: SalesPoint[]): void
function createMarkerPopup(salesPoint: SalesPoint): string
async function initPointsVentePage(): Promise<void>
```

### 4. Supabase Client Module (supabase-client.js)

**Responsabilité**: Gérer toutes les interactions avec l'API Supabase

```javascript
class SupabaseClient {
  constructor(supabaseUrl: string, supabaseAnonKey: string)
  
  async fetchCollections(): Promise<Collection[]>
  async fetchJewelry(): Promise<Jewelry[]>
  async fetchSalesPoints(): Promise<SalesPoint[]>
  
  private async fetch(endpoint: string, options?: RequestInit): Promise<any>
  private handleError(error: Error): void
}

// Instance singleton
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 5. Configuration Module (config.js)

**Responsabilité**: Centraliser la configuration

```javascript
const CONFIG = {
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  },
  map: {
    defaultCenter: [48.8566, 2.3522], // Paris par défaut
    defaultZoom: 6
  }
};
```

### 6. Styles CSS

**Fichiers**:
- `styles/main.css`: Styles globaux et variables CSS
- `styles/home.css`: Styles spécifiques à la page accueil
- `styles/bijoux.css`: Styles pour la page bijoux
- `styles/points-vente.css`: Styles pour la carte

**Variables CSS** (inspirées du dorodango):
```css
:root {
  /* Couleurs terre naturelles */
  --color-earth-dark: #5D4E37;
  --color-earth-medium: #8B7355;
  --color-earth-light: #C4A57B;
  --color-clay: #A0826D;
  --color-sand: #E8DCC4;
  
  /* Couleurs d'accent */
  --color-accent: #8B6F47;
  --color-text-dark: #3E2723;
  --color-text-light: #FFFFFF;
  
  /* Formes sphériques */
  --border-radius-sphere: 50%;
  --border-radius-soft: 20px;
  
  /* Espacements */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 2rem;
  --spacing-lg: 4rem;
  --spacing-xl: 6rem;
}
```

## Data Models

### Supabase Database Schema

#### Table: `collections`

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Champs**:
- `id`: Identifiant unique (UUID)
- `name`: Nom de la collection (ex: "Collection Terre", "Collection Océan")
- `description`: Description de la collection
- `created_at`: Date de création

#### Table: `jewelry`

```sql
CREATE TABLE jewelry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Champs**:
- `id`: Identifiant unique (UUID)
- `name`: Nom du bijou
- `description`: Description du bijou
- `image_url`: URL de l'image hébergée dans Supabase Storage (format: `https://{project}.supabase.co/storage/v1/object/public/jewelry-images/{filename}`)
- `collection_id`: Référence à la collection (nullable)
- `created_at`: Date de création

#### Table: `sales_points`

```sql
CREATE TABLE sales_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Champs**:
- `id`: Identifiant unique (UUID)
- `name`: Nom du point de vente
- `latitude`: Latitude GPS
- `longitude`: Longitude GPS
- `address`: Adresse complète (optionnelle)
- `created_at`: Date de création

### Row Level Security (RLS) Policies

Pour chaque table, configurer les politiques suivantes :

```sql
-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE jewelry ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_points ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access" ON collections
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON jewelry
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON sales_points
  FOR SELECT USING (true);
```

## Correctness Properties

*Une propriété est une caractéristique ou un comportement qui doit être vrai pour toutes les exécutions valides d'un système - essentiellement, une déclaration formelle sur ce que le système doit faire. Les propriétés servent de pont entre les spécifications lisibles par l'homme et les garanties de correction vérifiables par machine.*


### Testable Properties

Based on the prework analysis, here are the correctness properties that can be verified through automated testing:

**Property 1: Jewelry Display Completeness**

*For any* jewelry item stored in Supabase, when the Page_Bijoux is loaded, that jewelry item should be displayed with its name, description, and image.

**Validates: Requirements 3.3, 4.5**

**Property 2: Collection Section Creation**

*For any* collection that contains at least one jewelry item, when the Page_Bijoux is loaded, a section for that collection should be created and displayed.

**Validates: Requirements 3.4**

**Property 3: Empty Collection Exclusion**

*For any* collection that contains zero jewelry items, when the Page_Bijoux is loaded, that collection should not be displayed on the page.

**Validates: Requirements 4.4**

**Property 4: Jewelry Grouping Correctness**

*For any* set of jewelry items and collections fetched from Supabase, the grouping function should correctly associate each jewelry item with its corresponding collection based on the collection_id.

**Validates: Requirements 4.3**

**Property 5: Sales Point Marker Display**

*For any* sales point stored in Supabase, when the Page_Points_Vente is loaded, a marker should be displayed on the map at the correct coordinates (latitude, longitude).

**Validates: Requirements 5.2, 6.3**

**Property 6: Marker Popup Content**

*For any* marker on the map, when a user clicks on it, the popup should display the correct sales point name associated with that marker.

**Validates: Requirements 6.4**

**Property 7: Semantic HTML Usage**

*For any* page in the site, the HTML should use semantic elements (header, nav, main, section, article, footer) appropriately for accessibility.

**Validates: Requirements 8.3**

**Property 8: Image Alt Text Presence**

*For any* image element in the site, it should have a non-empty alt attribute for accessibility.

**Validates: Requirements 8.4**

**Property 9: API Error Handling**

*For any* API request to Supabase that fails, the system should catch the error, log it appropriately, and display a user-friendly error message instead of crashing.

**Validates: Requirements 9.4**

## Error Handling

### API Error Handling Strategy

All API calls to Supabase should be wrapped in try-catch blocks with the following error handling approach:

```javascript
async function fetchWithErrorHandling(fetchFunction, errorContext) {
  try {
    const data = await fetchFunction();
    return { success: true, data };
  } catch (error) {
    console.error(`Error in ${errorContext}:`, error);
    
    // Display user-friendly message
    displayErrorMessage(
      `Impossible de charger ${errorContext}. Veuillez réessayer plus tard.`
    );
    
    return { success: false, error };
  }
}
```

**Error Types**:
1. **Network Errors**: Connection timeout, no internet
   - Message: "Problème de connexion. Vérifiez votre connexion internet."
   
2. **API Errors**: Supabase service unavailable, rate limiting
   - Message: "Service temporairement indisponible. Veuillez réessayer dans quelques instants."
   
3. **Data Errors**: Invalid data format, missing required fields
   - Message: "Erreur lors du chargement des données. Veuillez contacter le support."

### Fallback Behavior

- **Page Bijoux**: If collections or jewelry fail to load, display a message and show empty state
- **Page Points de Vente**: If sales points fail to load, display the map with default center and a message
- **Images**: Use CSS to style broken images gracefully, rely on alt text

### User Feedback

Display errors using a toast notification system or inline error messages:

```javascript
function displayErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.setAttribute('role', 'alert');
  
  document.body.appendChild(errorDiv);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000);
}
```

## Testing Strategy

### Dual Testing Approach

The testing strategy combines **unit tests** for specific examples and edge cases with **property-based tests** for universal properties across all inputs.

**Unit Tests** focus on:
- Specific examples of data transformations
- Edge cases (empty arrays, null values, missing fields)
- Error conditions (network failures, invalid data)
- Integration points between modules

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Verifying correctness properties from the design document

Both approaches are complementary and necessary for comprehensive coverage.

### Testing Framework

**Recommended Stack**:
- **Test Runner**: Vitest (fast, modern, ESM support)
- **Property-Based Testing**: fast-check (JavaScript property testing library)
- **DOM Testing**: jsdom (for testing DOM manipulation)
- **Mocking**: Vitest built-in mocking for Supabase API calls

### Property-Based Test Configuration

Each property-based test should:
- Run a minimum of **100 iterations** to ensure comprehensive coverage
- Reference the design document property it validates
- Use the tag format: `Feature: te-puo-website, Property {number}: {property_text}`

Example:
```javascript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Feature: te-puo-website, Property 4: Jewelry Grouping Correctness', () => {
  it('should correctly group jewelry by collection for any input', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryJewelry()),
        fc.array(arbitraryCollection()),
        (jewelry, collections) => {
          const grouped = groupJewelryByCollection(jewelry, collections);
          
          // Verify each jewelry item is in the correct collection
          jewelry.forEach(item => {
            const collection = collections.find(c => c.id === item.collection_id);
            if (collection) {
              expect(grouped.get(collection)).toContain(item);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Examples

**Example 1: Testing Empty Collections**
```javascript
describe('Empty collection handling', () => {
  it('should not display collections with no jewelry items', () => {
    const collections = [
      { id: '1', name: 'Collection A', description: 'Desc A' }
    ];
    const jewelry = []; // Empty
    
    const result = renderCollections(groupJewelryByCollection(jewelry, collections));
    
    expect(result.querySelector('[data-collection-id="1"]')).toBeNull();
  });
});
```

**Example 2: Testing API Error Handling**
```javascript
describe('API error handling', () => {
  it('should display error message when fetch fails', async () => {
    // Mock fetch to throw error
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    
    await initBijouxPage();
    
    const errorMessage = document.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('Impossible de charger');
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 9 correctness properties must have corresponding property-based tests
- **Integration Tests**: Test complete page initialization flows
- **Accessibility Tests**: Verify semantic HTML and ARIA attributes

### Continuous Integration

Tests should run automatically on:
- Every pull request
- Before deployment to GitHub Pages
- Scheduled nightly runs for regression testing

Use GitHub Actions workflow:
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Implementation Notes

### File Structure

```
te-puo-website/
├── index.html              # Page Accueil
├── bijoux.html             # Page Bijoux
├── points-vente.html       # Page Points de Vente
├── styles/
│   ├── main.css           # Styles globaux
│   ├── home.css           # Styles page accueil
│   ├── bijoux.css         # Styles page bijoux
│   └── points-vente.css   # Styles carte
├── scripts/
│   ├── config.js          # Configuration
│   ├── supabase-client.js # Client Supabase
│   ├── bijoux.js          # Logic page bijoux
│   └── points-vente.js    # Logic page points de vente
├── images/
│   └── (images statiques)
├── tests/
│   ├── unit/
│   │   ├── bijoux.test.js
│   │   ├── points-vente.test.js
│   │   └── supabase-client.test.js
│   └── properties/
│       ├── jewelry-display.property.test.js
│       ├── collection-grouping.property.test.js
│       └── sales-points.property.test.js
├── .github/
│   └── workflows/
│       ├── deploy.yml     # Déploiement GitHub Pages
│       └── test.yml       # Tests CI
├── package.json
├── vite.config.js         # Configuration Vite (pour dev)
└── README.md
```

### External Dependencies

**Production**:
- Leaflet.js (v1.9+): For OpenStreetMap integration
- Supabase JS Client (v2.x): For API calls (optional, can use fetch directly)

**Development**:
- Vite: Development server and build tool
- Vitest: Test runner
- fast-check: Property-based testing
- jsdom: DOM testing environment

### Supabase Setup Checklist

1. Create Supabase project
2. Create tables: `collections`, `jewelry`, `sales_points`
3. Enable Row Level Security on all tables
4. Create read-only policies for anonymous users
5. Set up Supabase Storage bucket `jewelry-images` for jewelry photos
   - Enable public access for the bucket
   - Configure allowed file types (JPEG, PNG, WebP)
   - Set maximum file size (e.g., 5MB per image)
6. Configure CORS for GitHub Pages domain
7. Copy project URL and anon key to `config.js`

### GitHub Pages Setup

1. Create repository on GitHub
2. Add CNAME file with custom domain
3. Configure DNS records for custom domain
4. Enable GitHub Pages in repository settings
5. Set up GitHub Actions workflow for automatic deployment
6. Configure branch protection rules

### Performance Optimizations

1. **Image Optimization**: 
   - Store images in Supabase Storage in WebP format with JPEG fallbacks
   - Use Supabase image transformations for responsive images (thumbnail, medium, large)
   - Implement lazy loading for jewelry images
   - Example URL with transformation: `{image_url}?width=400&quality=80`
2. **API Caching**: Cache Supabase responses in sessionStorage for 5 minutes
3. **Code Splitting**: Load Leaflet.js only on points-vente page
4. **Minification**: Minify CSS and JS in production build
5. **CDN**: Use CDN for Leaflet.js and other libraries

### Accessibility Considerations

1. Use semantic HTML5 elements
2. Provide alt text for all images
3. Ensure keyboard navigation works for map controls
4. Use ARIA labels for dynamic content
5. Maintain sufficient color contrast (WCAG AA)
6. Test with screen readers

### Browser Support

Target modern browsers:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

No IE11 support required (can use modern JavaScript features).
