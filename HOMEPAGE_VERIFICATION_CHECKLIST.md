# Homepage Verification Checklist - Task 6

## Development Server Status
✅ **Server Running**: http://localhost:3000/

## Verification Steps

### 1. Homepage Loading
- [ ] Page loads without JavaScript errors
- [ ] All CSS files load correctly (main.css, home.css)
- [ ] No console errors (except for missing images - expected)

### 2. Responsive Design Testing

#### Mobile (320px - 640px)
- [ ] Header: Logo and navigation stack vertically or collapse appropriately
- [ ] Hero section: Content and image stack vertically
- [ ] Text sections: Readable with appropriate padding
- [ ] Philosophy cards: Display in single column
- [ ] Footer: Sections stack vertically

#### Tablet (768px - 1024px)
- [ ] Header: Logo and navigation display side-by-side
- [ ] Hero section: Content and image display side-by-side
- [ ] Technique section: Text and image display side-by-side
- [ ] Philosophy cards: Display in 2 columns
- [ ] Footer: Sections display in 2 columns

#### Desktop (1280px+)
- [ ] All content centered with max-width of 1280px
- [ ] Hero section: Full side-by-side layout with larger text
- [ ] Philosophy cards: Display in 3 columns
- [ ] Footer: Sections display in 4 columns
- [ ] Decorative spherical elements visible in hero section

### 3. Content Verification

#### Header
- [ ] "Te Puo" logo visible and styled correctly
- [ ] Navigation menu with 3 links: Accueil, Nos Bijoux, Points de Vente
- [ ] "Accueil" link has active state (highlighted)
- [ ] Navigation links are clickable (even if pages don't exist yet)

#### Hero Section
- [ ] Title: "L'Art de la Terre Polie"
- [ ] Subtitle: "Bijoux artisanaux inspirés de la technique dorodango japonaise"
- [ ] Image placeholder for dorodango sphere (broken image is expected)
- [ ] Background gradient visible (sand to secondary color)

#### Brand Story Section
- [ ] Section title: "Notre Histoire"
- [ ] Two paragraphs of brand story text
- [ ] Text is readable and properly formatted

#### Dorodango Technique Section
- [ ] Section title: "La Technique Dorodango"
- [ ] Three paragraphs explaining the technique
- [ ] Image placeholder for process image (broken image is expected)
- [ ] Background color different from brand story section

#### Philosophy Section
- [ ] Section title: "Notre Philosophie"
- [ ] Three philosophy cards:
  1. "Authenticité"
  2. "Connexion à la Terre"
  3. "Slow Craft"
- [ ] Each card has title and description text
- [ ] Cards have subtle shadow and hover effect
- [ ] Commercial brief text below cards

#### Footer
- [ ] Four sections: Te Puo, Navigation, Contact, Suivez-nous
- [ ] Footer links work correctly
- [ ] Copyright notice: "© 2024 Te Puo. Tous droits réservés."
- [ ] Dark background with light text

### 4. Design Elements (Dorodango-Inspired)

#### Colors
- [ ] Earth tones visible throughout (browns, beiges, sand colors)
- [ ] Accent color (#8B6F47) used for highlights
- [ ] Good contrast between text and backgrounds

#### Shapes
- [ ] Spherical elements visible in hero section background
- [ ] Soft rounded corners on cards and sections (20px border-radius)
- [ ] Sphere image would be circular (if image was present)

#### Typography
- [ ] Headings are bold and properly sized
- [ ] Body text is readable with good line height
- [ ] Font sizes scale appropriately on different screen sizes

### 5. Accessibility

#### Semantic HTML
- [ ] Proper use of `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- [ ] Headings follow logical hierarchy (h1, h2, h3)
- [ ] Navigation has `aria-label="Navigation principale"`
- [ ] Sections have `aria-labelledby` attributes

#### Images
- [ ] All images have descriptive alt text (even if images are missing)
- [ ] Alt text is meaningful and describes the content

#### Keyboard Navigation
- [ ] Can tab through all navigation links
- [ ] Focus states are visible (outline on focused elements)
- [ ] Links are keyboard accessible

### 6. Performance

- [ ] Page loads within 3 seconds (should be very fast for static content)
- [ ] No layout shift when page loads
- [ ] Smooth scroll behavior works for anchor links

## Known Issues (Expected)

1. **Missing Images**: 
   - `dorodango-sphere-hero.jpg` - Hero section
   - `dorodango-process.jpg` - Technique section
   - These will show as broken images or alt text until actual images are added

2. **Navigation Links**:
   - Links to `bijoux.html` and `points-vente.html` will show 404 errors
   - These pages will be created in later tasks

## Questions to Ask User

1. Does the overall design feel artisanal and natural (matching the dorodango aesthetic)?
2. Are the earth tones and color palette appropriate for the brand?
3. Is the text content accurate and well-written in French?
4. Are there any layout issues on specific screen sizes?
5. Should any content be adjusted or modified?

## Next Steps After Verification

Once the user confirms the homepage is working correctly:
- Mark task 6 as complete
- Proceed to task 7 (Build Page Bijoux) when user is ready
- Address any issues or questions that arise during verification

