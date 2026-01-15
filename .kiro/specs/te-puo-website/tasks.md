# Implementation Plan: Site Web Te Puo

## Overview

Ce plan d'implémentation décompose la création du site web Te Puo en étapes incrémentales. Le site sera construit avec HTML, CSS et JavaScript vanilla, utilisant Supabase comme backend et Leaflet.js pour la cartographie. Chaque tâche construit sur les précédentes pour créer progressivement un site fonctionnel.

## Tasks

- [x] 1. Setup project structure and configuration
  - Create directory structure (styles/, scripts/, images/, tests/)
  - Initialize package.json with Vite, Vitest, fast-check, jsdom dependencies
  - Create vite.config.js for development server
  - Create config.js with Supabase URL and anon key placeholders
  - Set up .gitignore to exclude node_modules and environment files
  - _Requirements: 1.1, 1.3_

- [ ] 2. Create Supabase database schema and configuration
  - [x] 2.1 Create database tables
    - Write SQL to create `collections` table with id, name, description, created_at
    - Write SQL to create `jewelry` table with id, name, description, image_url, collection_id, created_at
    - Write SQL to create `sales_points` table with id, name, latitude, longitude, address, created_at
    - _Requirements: 3.1, 3.2, 5.1_
  
  - [x] 2.2 Configure Row Level Security policies
    - Enable RLS on all three tables
    - Create anonymous read-only policies for collections, jewelry, and sales_points
    - Verify that anonymous users cannot write/update/delete
    - _Requirements: 9.1, 9.2_
  
  - [x] 2.3 Set up Supabase Storage for jewelry images
    - Create `jewelry-images` storage bucket
    - Enable public access on the bucket
    - Configure allowed MIME types (image/jpeg, image/png, image/webp)
    - Set maximum file size to 5MB
    - _Requirements: 3.1_

- [ ] 3. Implement Supabase client module
  - [x] 3.1 Create supabase-client.js with SupabaseClient class
    - Implement constructor accepting supabaseUrl and anonKey
    - Implement fetchCollections() method to GET from collections table
    - Implement fetchJewelry() method to GET from jewelry table
    - Implement fetchSalesPoints() method to GET from sales_points table
    - Implement private fetch() helper with error handling
    - _Requirements: 3.5, 5.3, 9.3_
  
  - [ ]* 3.2 Write unit tests for Supabase client
    - Test successful fetch operations with mocked responses
    - Test error handling for network failures
    - Test error handling for invalid responses
    - _Requirements: 9.4_
  
  - [ ]* 3.3 Write property test for API error handling
    - **Property 9: API Error Handling**
    - **Validates: Requirements 9.4**

- [x] 4. Create global styles and design system
  - Create styles/main.css with CSS variables for dorodango-inspired colors
  - Define earth tone color palette (--color-earth-dark, --color-earth-light, etc.)
  - Define spherical border radius variables (--border-radius-sphere, --border-radius-soft)
  - Define spacing scale (--spacing-xs through --spacing-xl)
  - Create base typography styles
  - Create responsive breakpoints
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 5. Build Page Accueil (static homepage)
  - [x] 5.1 Create index.html structure
    - Create semantic HTML with header, nav, main, footer
    - Add hero section with placeholder for dorodango sphere image
    - Add brand story section with presentation text
    - Add dorodango technique explanation section
    - Add philosophy/commercial brief section
    - Include proper meta tags and page title
    - _Requirements: 2.1, 2.2, 2.3, 8.3_
  
  - [x] 5.2 Style the homepage
    - Create styles/home.css
    - Style hero section with spherical design elements
    - Style text sections with earth tones
    - Ensure responsive layout for mobile/tablet/desktop
    - Add smooth scroll behavior
    - _Requirements: 7.1, 7.2, 7.3, 8.2_
  
  - [ ]* 5.3 Write unit tests for homepage accessibility
    - Test that semantic HTML elements are present
    - Test that all images have alt attributes
    - _Requirements: 8.3, 8.4_
  
  - [ ]* 5.4 Write property test for semantic HTML
    - **Property 7: Semantic HTML Usage**
    - **Validates: Requirements 8.3**
  
  - [ ]* 5.5 Write property test for image alt text
    - **Property 8: Image Alt Text Presence**
    - **Validates: Requirements 8.4**

- [x] 6. Checkpoint - Verify static homepage
  - Ensure homepage loads correctly in browser
  - Verify responsive design on different screen sizes
  - Ask the user if questions arise

- [ ] 7. Build Page Bijoux (dynamic jewelry display)
  - [x] 7.1 Create bijoux.html structure
    - Create semantic HTML with header, nav, main, footer
    - Add navigation links to other pages
    - Add empty container div with id="collections-container"
    - Add loading state placeholder
    - Add error message container
    - _Requirements: 4.1, 8.3_
  
  - [x] 7.2 Implement bijoux.js logic
    - Implement fetchCollections() to call Supabase client
    - Implement fetchJewelry() to call Supabase client
    - Implement groupJewelryByCollection(jewelry, collections) function
    - Implement renderCollections(groupedData) to generate HTML
    - Implement initBijouxPage() to orchestrate page load
    - Add error handling with user-friendly messages
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 9.4_
  
  - [x] 7.3 Style the jewelry page
    - Create styles/bijoux.css
    - Style collection sections with spherical accents
    - Style jewelry cards with image, name, description
    - Implement lazy loading for jewelry images
    - Add loading spinner styles
    - Add error message styles
    - _Requirements: 4.5, 7.1, 7.2_
  
  - [ ]* 7.4 Write unit tests for jewelry page
    - Test groupJewelryByCollection with various inputs
    - Test renderCollections with empty collections
    - Test error display when API fails
    - _Requirements: 4.3, 4.4, 9.4_
  
  - [ ]* 7.5 Write property test for jewelry display completeness
    - **Property 1: Jewelry Display Completeness**
    - **Validates: Requirements 3.3, 4.5**
  
  - [ ]* 7.6 Write property test for collection section creation
    - **Property 2: Collection Section Creation**
    - **Validates: Requirements 3.4**
  
  - [ ]* 7.7 Write property test for empty collection exclusion
    - **Property 3: Empty Collection Exclusion**
    - **Validates: Requirements 4.4**
  
  - [ ]* 7.8 Write property test for jewelry grouping correctness
    - **Property 4: Jewelry Grouping Correctness**
    - **Validates: Requirements 4.3**

- [x] 8. Checkpoint - Verify jewelry page functionality
  - Add test data to Supabase (collections and jewelry items)
  - Verify jewelry page loads and displays collections correctly
  - Test with empty collections
  - Test error handling by temporarily breaking API connection
  - Ask the user if questions arise

- [ ] 9. Build Page Points de Vente (interactive map)
  - [x] 9.1 Create points-vente.html structure
    - Create semantic HTML with header, nav, main, footer
    - Add navigation links to other pages
    - Add map container div with id="map"
    - Add optional sales points list container
    - Add loading state and error message containers
    - Include Leaflet.js CSS and JS from CDN
    - _Requirements: 6.1, 8.3_
  
  - [x] 9.2 Implement points-vente.js logic
    - Implement fetchSalesPoints() to call Supabase client
    - Implement initMap() to create Leaflet map instance
    - Implement addMarkers(map, salesPoints) to add markers with popups
    - Implement createMarkerPopup(salesPoint) to format popup content
    - Implement initPointsVentePage() to orchestrate page load
    - Add error handling with user-friendly messages
    - _Requirements: 5.2, 6.2, 6.3, 6.4, 9.4_
  
  - [x] 9.3 Style the map page
    - Create styles/points-vente.css
    - Style map container to fill viewport appropriately
    - Style custom marker popups with brand colors
    - Add loading spinner for map initialization
    - Add error message styles
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 9.4 Write unit tests for map page
    - Test fetchSalesPoints with mocked data
    - Test marker creation for various sales points
    - Test popup content generation
    - Test error handling when API fails
    - _Requirements: 6.3, 6.4, 9.4_
  
  - [ ]* 9.5 Write property test for sales point marker display
    - **Property 5: Sales Point Marker Display**
    - **Validates: Requirements 5.2, 6.3**
  
  - [ ]* 9.6 Write property test for marker popup content
    - **Property 6: Marker Popup Content**
    - **Validates: Requirements 6.4**

- [x] 10. Checkpoint - Verify map page functionality
  - Add test sales points to Supabase
  - Verify map loads and displays markers correctly
  - Test marker click interactions and popups
  - Test error handling
  - Ask the user if questions arise

- [x] 11. Implement navigation and cross-page integration
  - Add consistent navigation menu to all three pages
  - Ensure navigation links work correctly between pages
  - Add active page indicator in navigation
  - Test navigation flow across all pages
  - _Requirements: 7.4_

- [x] 12. Set up GitHub Pages deployment
  - [x] 12.1 Create GitHub repository and configure Pages
    - Initialize git repository
    - Create GitHub repository
    - Add CNAME file with custom domain
    - Configure GitHub Pages to serve from main branch
    - _Requirements: 1.1, 1.2_
  
  - [x] 12.2 Create GitHub Actions deployment workflow
    - Create .github/workflows/deploy.yml
    - Configure workflow to build site on push to main
    - Configure workflow to deploy to GitHub Pages
    - Add environment variables for Supabase credentials (if needed)
    - _Requirements: 1.4_
  
  - [x] 12.3 Create GitHub Actions test workflow
    - Create .github/workflows/test.yml
    - Configure workflow to run tests on pull requests
    - Configure workflow to run tests on push to main
    - Add test coverage reporting
    - _Requirements: Testing Strategy_

- [x] 13. Performance optimization and final polish
  - Implement sessionStorage caching for API responses (5 minute TTL)
  - Add lazy loading for jewelry images with loading="lazy" attribute
  - Minify CSS and JavaScript for production
  - Optimize images in Supabase Storage (WebP format)
  - Test site performance with Lighthouse
  - _Requirements: 8.1_

- [x] 14. Final checkpoint and documentation
  - Run full test suite and ensure all tests pass
  - Verify all pages work correctly on mobile, tablet, and desktop
  - Test with screen reader for accessibility
  - Create README.md with setup instructions
  - Document Supabase configuration steps
  - Document deployment process
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (9 total)
- Unit tests validate specific examples and edge cases
- Test data should be added to Supabase before testing dynamic pages
- Supabase credentials should be configured in config.js before testing API integration
