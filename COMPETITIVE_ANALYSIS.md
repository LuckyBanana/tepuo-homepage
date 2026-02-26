# Analyse Comparative - Tē Pūō

**Date :** Février 2026
**Objectif :** Identifier les fonctionnalités manquantes et les opportunités d'amélioration par rapport aux sites concurrents du secteur bijoux artisanaux / créateurs français.

---

## 1. Positionnement Actuel de Tē Pūō

### Ce que nous avons

| Fonctionnalité | Statut |
|---|---|
| Page d'accueil avec storytelling | Oui |
| Page collections (bijoux.html) | Oui |
| Carte interactive des points de vente (Leaflet) | Oui |
| Design responsive (mobile-first) | Oui |
| SEO (Open Graph, Schema.org, sitemap) | Oui |
| Animations au scroll | Oui |
| Accessibilité WCAG 2.1 AA | Oui |
| Backend Supabase (collections, bijoux, points de vente) | Oui |
| Cache sessionStorage (5 min TTL) | Oui |
| Navigation mobile avec focus trap | Oui |

### Notre positionnement unique
- Niche ultra-spécifique : technique **dorodango** appliquée à la bijouterie
- Storytelling fort autour de l'artisanat japonais ancestral
- Design cohérent avec des tons terreux inspirés du dorodango

---

## 2. Concurrents Analysés

| Concurrent | Spécialité | Points forts |
|---|---|---|
| **Terre de Bijoux** (terredebijoux.com) | Bijoux artisanaux argent/or | E-commerce complet, newsletter, fabrication française |
| **Maison Li.ama** (maisonliama.com) | Bijoux artisanaux raffinés | Panier d'achat, newsletter (-10%), storytelling artisan |
| **Retour de Plage** (retourdeplage.fr) | Bijoux faits main, Oléron | Label développement durable, newsletter, multi-livraison |
| **Nouvel Amour** (nouvelamourparis.com) | Bijoux plaqué or, Paris | Personnalisation, newsletter (-10%), SAV réparation |
| **Petite Madame** (petitemadame.net) | Bijoux faits main, Bretagne | E-shop, petites séries, artisanat local |
| **Nature Bijoux** (nature.fr) | Matériaux naturels | Newsletter (-10%), émaillage main, marque historique (1982) |
| **L'Atelier des Dames** (latelierdesdames.fr) | Bijoux créateurs | Garantie 2 ans, ventes privées, newsletter |
| **Tana Bijoux** (tanabijoux.com) | Multi-créateurs, Aix-en-Provence | Cartes cadeaux, paiement 3x, suivi commande |
| **Mejuri** (mejuri.com) | Fine jewelry, international | UX exemplaire, navigation dropdown riche, hover imagery |

---

## 3. Fonctionnalités Manquantes (par priorité)

### Priorite 1 - E-commerce (Impact fort)

Le site Tē Pūō est actuellement un **site vitrine** sans possibilité d'achat en ligne. **Tous les concurrents** analysés proposent un e-commerce.

**Ce qui manque :**
- **Panier d'achat** avec gestion des quantités
- **Fiches produit détaillées** (prix, matériaux, dimensions, poids, entretien)
- **Tunnel de commande** (panier, livraison, paiement)
- **Paiement sécurisé** (Stripe, PayPal)
- **Paiement fractionné** (3x sans frais - proposé par Tana Bijoux et d'autres)
- **Gestion des stocks** (pièces uniques / séries limitées)
- **Page de confirmation de commande** et emails transactionnels

**Recommandation :** Intégrer un système de commande même simplifié. Pour un artisan en petites séries, un formulaire de commande/réservation avec paiement via Stripe serait un bon premier pas.

---

### Priorite 2 - Engagement Client (Impact moyen-fort)

**Ce qui manque :**

#### Newsletter
- **Tous les concurrents** proposent une newsletter
- Offre de bienvenue standard : **-10% sur la première commande** (Maison Li.ama, Nouvel Amour, Nature Bijoux)
- Contenu : nouveautés, ventes privées, coulisses de l'atelier
- **Outils recommandés :** Mailchimp, Brevo (ex-Sendinblue), ou Supabase + service email

#### Formulaire de Contact Enrichi
- Le site ne contient qu'un email (contact@tepuo.com) en footer
- Manque un **formulaire de contact** dédié
- Possibilité d'ajouter : commande sur mesure, demande de devis, question sur un bijou

#### Avis Clients / Témoignages
- 58% des Français consultent les avis clients avant d'acheter
- Aucun avis ou témoignage visible sur le site
- **Recommandation :** Ajouter une section témoignages sur la page d'accueil ou les fiches produit

---

### Priorite 3 - Contenu & Storytelling (Impact moyen)

**Ce qui manque :**

#### Page "L'Atelier" / "Notre Histoire"
- Bien que l'accueil raconte l'histoire du dorodango, il manque une **page dédiée** à l'artisan, au processus de fabrication, à l'atelier
- Les concurrents (Retour de Plage, Petite Madame) mettent fortement en avant l'atelier et le processus
- **Photos/vidéos de fabrication** sont attendues par les visiteurs

#### Blog / Journal
- Contenu éducatif sur le dorodango, l'artisanat, l'entretien des bijoux
- Améliore le SEO de manière significative
- Retour de Plage et Terre de Bijoux ont des blogs actifs

#### Guide d'Entretien
- Les sites concurrents incluent des conseils d'entretien des bijoux
- Important pour la satisfaction client et la perception de qualité

---

### Priorite 4 - Fonctionnalites Produit (Impact moyen)

**Ce qui manque :**

#### Fiches Produit Enrichies
- Actuellement : nom, description, image, collection
- **Il manquerait :** prix, matériaux utilisés, dimensions, poids, conseils d'entretien
- **Photos multiples** par produit (portées, détails macro, angles multiples)
- **Zoom produit** au survol ou au clic

#### Filtres et Recherche
- Pas de filtre sur la page bijoux (par collection, prix, matériau, type)
- Pas de barre de recherche
- Les concurrents proposent des filtres par catégorie, prix, matériau

#### Page Produit Individuelle
- Actuellement, les bijoux sont affichés en grille sans page dédiée
- Une **page produit individuelle** permettrait d'afficher plus de détails et d'intégrer le bouton d'achat

---

### Priorite 5 - Confiance & Reassurance (Impact moyen)

**Ce qui manque :**

| Element | Concurrents qui l'ont |
|---|---|
| Politique de retour / remboursement | Tous les e-commerces |
| Conditions générales de vente (CGV) | Obligatoire pour e-commerce |
| Mentions légales | Obligatoire en France |
| Labels / certifications (Artisan d'Art, etc.) | Retour de Plage (Label Lucie) |
| Garantie sur les bijoux | L'Atelier des Dames (2 ans) |
| Politique de livraison | Tous les e-commerces |
| FAQ | Bonne pratique standard |

---

### Priorite 6 - Reseaux Sociaux & Communaute (Impact moyen)

**Ce qui manque :**

#### Integration Reseaux Sociaux
- Les liens Instagram et Facebook existent en footer mais sans intégration de contenu
- **Feed Instagram intégré** sur la page d'accueil (pratique courante dans le secteur)
- **Galerie UGC** (User Generated Content) : photos de clients portant les bijoux
- **Boutons de partage** sur les fiches produit

#### Cartes Cadeaux
- Proposées par Tana Bijoux et d'autres
- Format idéal pour le positionnement cadeau / artisanat

---

### Priorite 7 - Fonctionnalites Avancees (Impact variable)

**Tendances 2025-2026 observées chez les leaders du marché :**

| Fonctionnalite | Description | Priorité pour Tē Pūō |
|---|---|---|
| **Vue 360 degres** | Rotation du produit | Moyenne (pour pièces > 100 EUR) |
| **Essayage AR** | Try-on en réalité augmentée | Basse (plutôt pour bijoux standardisés) |
| **Personnalisation** | Gravure, choix matériaux | Moyenne (aligné avec l'artisanat) |
| **Chat en direct** | Support client instantané | Basse (trop lourd pour artisan solo) |
| **Programme de fidelite** | Points, avantages | Basse (volume trop faible) |
| **Wishlist** | Liste de souhaits | Moyenne (aide à la conversion) |

---

## 4. Matrice Comparative

| Fonctionnalite | Tē Pūō | Terre de Bijoux | Maison Li.ama | Retour de Plage | Mejuri |
|---|---|---|---|---|---|
| Site vitrine / storytelling | Oui | Oui | Oui | Oui | Oui |
| E-commerce / panier | **Non** | Oui | Oui | Oui | Oui |
| Fiches produit detaillees | Non | Oui | Oui | Oui | Oui |
| Prix affiches | **Non** | Oui | Oui | Oui | Oui |
| Newsletter | **Non** | Oui | Oui | Oui | Oui |
| Formulaire de contact | **Non** | Oui | Oui | Oui | Oui |
| Avis clients | **Non** | Non | Non | Oui | Oui |
| Blog | **Non** | Oui | Non | Oui | Oui |
| Carte interactive | Oui | Non | Non | Non | Non |
| Reseaux sociaux integres | Non | Oui | Oui | Oui | Oui |
| Cartes cadeaux | **Non** | Non | Non | Non | Oui |
| Paiement fractionne | **Non** | Non | Non | Non | Oui |
| Multi-langues | **Non** | Non | Non | Non | Oui |
| SEO structure | Oui | Oui | Moyen | Oui | Oui |
| Responsive / mobile | Oui | Oui | Oui | Oui | Oui |
| Accessibilite WCAG | Oui | Partiel | Partiel | Partiel | Partiel |
| Animations / micro-interactions | Oui | Basique | Basique | Moyen | Avance |

---

## 5. Recommandations Priorisees

### Court terme (a implementer rapidement)

1. **Page de contact** avec formulaire (nom, email, sujet, message)
2. **Newsletter** - formulaire d'inscription en footer + page d'accueil
3. **Mentions legales** et politique de confidentialité (obligatoire en France)
4. **Prix sur les bijoux** - même indicatifs, pour ancrer la perception de valeur
5. **Fiches produit enrichies** - ajouter matériaux, dimensions, entretien

### Moyen terme (evolution structurante)

6. **Page "L'Atelier"** - processus de fabrication, photos/vidéos, histoire de l'artisan
7. **Pages produit individuelles** - une URL par bijou avec détails complets
8. **Systeme de commande simplifie** - formulaire de réservation + paiement Stripe
9. **Blog / Journal** - articles sur le dorodango, l'artisanat, les coulisses
10. **Filtres** sur la page collections (par type, matériau, prix)

### Long terme (croissance)

11. **E-commerce complet** avec panier, tunnel d'achat, gestion stocks
12. **Cartes cadeaux** digitales
13. **Section temoignages** / avis clients
14. **Feed Instagram integre** sur la page d'accueil
15. **Guide d'entretien** des bijoux

---

## 6. Forces de Tē Pūō (Avantages Concurrentiels)

Il est important de noter que Tē Pūō possède des atouts que peu de concurrents ont :

- **Niche unique** : aucun concurrent direct dans le créneau dorodango + bijoux
- **Storytelling fort** : la page d'accueil raconte une histoire compelling
- **Carte interactive** : aucun concurrent analysé ne propose cette fonctionnalité
- **Accessibilité exemplaire** : WCAG 2.1 AA, au-dessus de la moyenne du secteur
- **Design cohérent** : palette terreux, typographie soignée, formes organiques
- **Architecture technique solide** : Vite, Supabase, tests automatisés, CI/CD
- **Performance** : site statique JAMstack, rapide par nature

---

## 7. Conclusion

Le site Tē Pūō est techniquement bien construit et possède un storytelling fort avec un positionnement de niche unique. Cependant, il fonctionne actuellement comme un **site vitrine** alors que **100% des concurrents analysés** proposent au minimum un e-commerce.

Les trois actions les plus impactantes seraient :
1. **Ajouter les prix et enrichir les fiches produit** (conversion)
2. **Créer un formulaire de contact + newsletter** (engagement)
3. **Mettre en place un système de commande** (revenus)

Ces ajouts transformeraient le site d'une vitrine en un véritable outil de vente, tout en conservant l'identité artisanale et le storytelling qui font la force de Tē Pūō.

---

## Sources

- [Jewelry ecommerce: How to start and succeed online (Omnisend)](https://www.omnisend.com/blog/jewelry-ecommerce/)
- [2025 Jewelry E-Commerce Trends (Arramton)](https://arramton.com/blogs/jewelry-e-commerce-website-development)
- [Jewelry E-Commerce Trends 2025 (Immerss)](https://www.immerss.live/content/jewelry-ecommerce-trends-2025/)
- [Smart Jewelry Website Development 2026 (3PTechies)](https://www.3ptechies.com/building-smart-jewelry-website.html)
- [31 Best Jewellery Website Design Examples (WeMakeWebsites)](https://www.wemakewebsites.com/blog/31-of-the-best-jewellery-website-design-examples)
- [Creation site bijouterie en ligne (Credit Agricole)](https://www.ca-moncommerce.com/aide/guide-actus/blog/nos-guides-e-commerce/pourquoi-et-comment-creer-son-site/creation-d-un-site-bijouterie-en-ligne-mode-d-emploi/)
- [De l'artisanat a l'e-commerce (Brandibay)](https://www.brandibay.com/blog/infos/de-l-artisanat-a-l-e-commerce-monter-sa-boutique-de-bijoux-en-ligne-1.html)
- [Terre de Bijoux](https://www.terredebijoux.com/)
- [Maison Li.ama](https://maisonliama.com/)
- [Retour de Plage](https://www.retourdeplage.fr/)
- [Nouvel Amour Paris](https://nouvelamourparis.com/)
- [Nature Bijoux](https://www.nature.fr/)
- [Tana Bijoux](https://www.tanabijoux.com/)
- [Best Jewelry Websites 2026 (99designs)](https://99designs.com/inspiration/websites/jewelry)
