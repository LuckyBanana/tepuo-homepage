-- CMS Tables: site_content, pages, page_blocks
-- Execute this in your Supabase SQL Editor

-- ============================================================================
-- 1. SITE_CONTENT - Editable content for existing pages
-- ============================================================================

CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  field_key TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  label TEXT NOT NULL,
  value TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page, section, field_key)
);

CREATE INDEX idx_site_content_page ON site_content(page);

COMMENT ON TABLE site_content IS 'Editable content for fixed pages (home, atelier, entretien)';
COMMENT ON COLUMN site_content.content_type IS 'text | textarea | image | url | list';

-- ============================================================================
-- 2. PAGES - Dynamic pages created from admin
-- ============================================================================

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pages_slug ON pages(slug);

COMMENT ON TABLE pages IS 'Dynamic pages created from admin CMS';

-- ============================================================================
-- 3. PAGE_BLOCKS - Content blocks for dynamic pages
-- ============================================================================

CREATE TABLE page_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_page_blocks_page_id ON page_blocks(page_id, sort_order);

COMMENT ON TABLE page_blocks IS 'Content blocks for dynamic pages';
COMMENT ON COLUMN page_blocks.block_type IS 'hero | text | image_text | gallery | cta';
COMMENT ON COLUMN page_blocks.data IS 'JSON data specific to block_type';

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

-- Anonymous read (public website)
CREATE POLICY "Allow anonymous read access" ON site_content FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON pages FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON page_blocks FOR SELECT USING (true);

-- Authenticated CRUD (admin)
CREATE POLICY "Allow authenticated insert" ON site_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON site_content FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON site_content FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON pages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON pages FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON pages FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON page_blocks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON page_blocks FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON page_blocks FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 5. SEED DATA - Existing page content
-- ============================================================================

-- ----- HOME PAGE -----
INSERT INTO site_content (page, section, field_key, content_type, label, value, sort_order) VALUES
-- Hero
('home', 'hero', 'overline', 'text', 'Surtitre', 'Artisanat japonais', 1),
('home', 'hero', 'title', 'text', 'Titre', 'L''Art de la Terre Polie', 2),
('home', 'hero', 'subtitle', 'text', 'Sous-titre', 'Bijoux artisanaux inspirés de la technique dorodango japonaise', 3),
('home', 'hero', 'cta_text', 'text', 'Texte du bouton', 'Découvrir nos créations', 4),
('home', 'hero', 'cta_url', 'url', 'Lien du bouton', 'bijoux.html', 5),
('home', 'hero', 'image_url', 'image', 'Image', 'https://via.placeholder.com/600x700', 6),
('home', 'hero', 'image_alt', 'text', 'Alt image', 'Bijou artisanal Tē Pūō en terre polie, inspiré du dorodango', 7),
-- Notre histoire
('home', 'story', 'overline', 'text', 'Surtitre', 'Notre histoire', 10),
('home', 'story', 'title', 'text', 'Titre', 'L''essence de Tē Pūō', 11),
('home', 'story', 'text', 'textarea', 'Texte', 'Tē Pūō est née d''une fascination pour l''art ancestral japonais du dorodango, cette technique millénaire qui transforme la terre brute en sphères polies d''une beauté hypnotique. Chaque bijou Tē Pūō est une célébration de cette alchimie entre patience, savoir-faire et respect de la matière.

Notre atelier perpétue cet héritage artisanal en créant des pièces uniques où la terre devient parure. Chaque création porte en elle l''essence de la nature et le temps suspendu du geste artisan.', 12),
-- Technique dorodango
('home', 'technique', 'overline', 'text', 'Surtitre', 'Savoir-faire', 20),
('home', 'technique', 'title', 'text', 'Titre', 'La Technique Dorodango', 21),
('home', 'technique', 'image_url', 'image', 'Image', 'https://via.placeholder.com/600x400', 22),
('home', 'technique', 'image_alt', 'text', 'Alt image', 'Processus de création d''une sphère dorodango montrant les différentes étapes de polissage de la terre', 23),
('home', 'technique', 'text', 'textarea', 'Texte', 'Le dorodango (泥だんご) est un art japonais traditionnel qui consiste à façonner et polir la terre jusqu''à obtenir une sphère parfaitement lisse et brillante. Ce processus méditatif, pratiqué depuis des siècles, révèle la beauté cachée dans la matière la plus humble.

La technique repose sur un équilibre délicat entre l''humidité de la terre, la pression des mains et la patience du polissage. Couche après couche, grain après grain, la surface se transforme en un miroir naturel qui capture la lumière d''une manière unique.

Chez Tē Pūō, nous adaptons cette technique ancestrale pour créer des bijoux qui portent en eux cette même magie : la transformation de la terre en objet précieux par la seule force du geste artisan.', 24),
-- Philosophie
('home', 'philosophy', 'overline', 'text', 'Surtitre', 'Nos valeurs', 30),
('home', 'philosophy', 'title', 'text', 'Titre', 'Notre Philosophie', 31),
('home', 'philosophy', 'card_1_title', 'text', 'Valeur 1 — titre', 'Authenticité', 32),
('home', 'philosophy', 'card_1_text', 'textarea', 'Valeur 1 — texte', 'Chaque bijou Tē Pūō est façonné à la main, pièce unique portant l''empreinte de son créateur. Nous refusons la production de masse pour privilégier l''excellence artisanale.', 33),
('home', 'philosophy', 'card_2_title', 'text', 'Valeur 2 — titre', 'Connexion à la Terre', 34),
('home', 'philosophy', 'card_2_text', 'textarea', 'Valeur 2 — texte', 'Nos créations célèbrent la beauté brute de la matière naturelle. La terre n''est pas seulement notre matériau, elle est l''âme de chaque bijou.', 35),
('home', 'philosophy', 'card_3_title', 'text', 'Valeur 3 — titre', 'Slow Craft', 36),
('home', 'philosophy', 'card_3_text', 'textarea', 'Valeur 3 — texte', 'Dans un monde de vitesse, nous choisissons la lenteur. Chaque pièce demande des heures de travail patient, un temps nécessaire pour révéler la beauté cachée dans la terre.', 37),
('home', 'philosophy', 'brief', 'textarea', 'Texte de présentation', 'Tē Pūō propose des bijoux artisanaux uniques pour celles et ceux qui cherchent des pièces authentiques, chargées de sens et d''histoire. Nos créations s''adressent aux amateurs d''artisanat d''exception, sensibles à la beauté des matières naturelles et au savoir-faire traditionnel.

Découvrez nos collections et trouvez la pièce qui résonnera avec votre propre histoire.', 38);

-- ----- ATELIER PAGE -----
INSERT INTO site_content (page, section, field_key, content_type, label, value, sort_order) VALUES
-- Hero
('atelier', 'hero', 'overline', 'text', 'Surtitre', 'Notre savoir-faire', 1),
('atelier', 'hero', 'title', 'text', 'Titre', 'L''Atelier', 2),
('atelier', 'hero', 'subtitle', 'text', 'Sous-titre', 'Là où la terre devient bijou, guidée par la patience et le geste ancestral du dorodango', 3),
-- Introduction
('atelier', 'intro', 'title', 'text', 'Titre', 'Un lieu de création', 10),
('atelier', 'intro', 'text', 'textarea', 'Texte', 'L''atelier Tē Pūō est un espace où le temps s''arrête. Ici, chaque bijou naît d''un dialogue intime entre l''artisan et la matière. La terre, récoltée avec soin, est travaillée selon les principes du dorodango japonais — un art qui transforme l''humilité de la terre en beauté pure.

Notre atelier est à la fois laboratoire et sanctuaire. C''est un lieu de recherche constante, où chaque nouvelle argile, chaque nouvelle technique de polissage, ouvre des possibilités créatives infinies.', 11),
('atelier', 'intro', 'image_url', 'image', 'Image', 'https://via.placeholder.com/600x500', 12),
('atelier', 'intro', 'image_alt', 'text', 'Alt image', 'Vue de l''atelier Tē Pūō avec les outils de fabrication et les terres naturelles', 13),
-- Processus
('atelier', 'process', 'overline', 'text', 'Surtitre', 'Le processus', 20),
('atelier', 'process', 'title', 'text', 'Titre', 'De la Terre au Bijou', 21),
('atelier', 'process', 'intro', 'textarea', 'Introduction', 'Chaque bijou Tē Pūō traverse un processus de création en plusieurs étapes, où patience et précision se conjuguent pour révéler la beauté cachée de la terre.', 22),
-- Étape 1
('atelier', 'step_1', 'title', 'text', 'Titre', 'La Sélection de la Terre', 30),
('atelier', 'step_1', 'text', 'textarea', 'Texte', 'Tout commence par le choix de la terre. Nous sélectionnons des argiles naturelles aux textures et pigments variés — ocre, sienne, terre d''ombre. Chaque terre apporte sa couleur unique et ses propriétés de polissage distinctes.', 31),
('atelier', 'step_1', 'image_url', 'image', 'Image', 'https://via.placeholder.com/500x350', 32),
('atelier', 'step_1', 'image_alt', 'text', 'Alt image', 'Différentes terres et argiles naturelles utilisées pour la création des bijoux', 33),
-- Étape 2
('atelier', 'step_2', 'title', 'text', 'Titre', 'Le Façonnage', 40),
('atelier', 'step_2', 'text', 'textarea', 'Texte', 'La terre est hydratée puis façonnée à la main. Ce geste fondamental du dorodango demande une maîtrise parfaite de l''humidité et de la pression. La forme émerge progressivement, couche après couche, dans un rythme méditatif.', 41),
('atelier', 'step_2', 'image_url', 'image', 'Image', 'https://via.placeholder.com/500x350', 42),
('atelier', 'step_2', 'image_alt', 'text', 'Alt image', 'Mains de l''artisan façonnant la terre pour créer la forme du bijou', 43),
-- Étape 3
('atelier', 'step_3', 'title', 'text', 'Titre', 'Le Séchage Contrôlé', 50),
('atelier', 'step_3', 'text', 'textarea', 'Texte', 'La pièce est ensuite séchée dans des conditions soigneusement contrôlées. Cette étape critique détermine la solidité finale du bijou. Le séchage se fait progressivement, parfois sur plusieurs jours, pour éviter les fissures.', 51),
('atelier', 'step_3', 'image_url', 'image', 'Image', 'https://via.placeholder.com/500x350', 52),
('atelier', 'step_3', 'image_alt', 'text', 'Alt image', 'Bijoux en terre en cours de séchage contrôlé dans l''atelier', 53),
-- Étape 4
('atelier', 'step_4', 'title', 'text', 'Titre', 'Le Polissage', 60),
('atelier', 'step_4', 'text', 'textarea', 'Texte', 'C''est l''étape magique. Par des frottements répétés et délicats, la surface de la terre se transforme. Les particules fines remontent en surface et créent un lustre naturel hypnotique. Ce polissage peut prendre des heures de travail patient.', 61),
('atelier', 'step_4', 'image_url', 'image', 'Image', 'https://via.placeholder.com/500x350', 62),
('atelier', 'step_4', 'image_alt', 'text', 'Alt image', 'Polissage minutieux de la surface du bijou en terre pour obtenir un lustre naturel', 63),
-- Étape 5
('atelier', 'step_5', 'title', 'text', 'Titre', 'La Finition', 70),
('atelier', 'step_5', 'text', 'textarea', 'Texte', 'Une fois le polissage achevé, chaque bijou reçoit un traitement protecteur qui préserve son éclat tout en respectant la matière naturelle. Les apprêts sont ajoutés avec soin pour transformer la sphère polie en bijou portable.', 71),
('atelier', 'step_5', 'image_url', 'image', 'Image', 'https://via.placeholder.com/500x350', 72),
('atelier', 'step_5', 'image_alt', 'text', 'Alt image', 'Bijou en terre polie terminé avec ses finitions et apprêts', 73),
-- Matériaux
('atelier', 'materials', 'overline', 'text', 'Surtitre', 'Nos matériaux', 80),
('atelier', 'materials', 'title', 'text', 'Titre', 'La Terre, Notre Matière Première', 81),
('atelier', 'material_1', 'name', 'text', 'Matériau 1 — nom', 'Terre d''Ocre', 82),
('atelier', 'material_1', 'desc', 'text', 'Matériau 1 — description', 'Teintes chaudes allant du jaune doré au rouge profond. Riche en oxydes de fer.', 83),
('atelier', 'material_2', 'name', 'text', 'Matériau 2 — nom', 'Terre de Sienne', 84),
('atelier', 'material_2', 'desc', 'text', 'Matériau 2 — description', 'Nuances brunes et ambrées rappelant les paysages toscans. Texture fine et soyeuse.', 85),
('atelier', 'material_3', 'name', 'text', 'Matériau 3 — nom', 'Terre d''Ombre', 86),
('atelier', 'material_3', 'desc', 'text', 'Matériau 3 — description', 'Tons profonds et terreux, du brun chocolat au noir chaud. Polissage exceptionnel.', 87),
('atelier', 'material_4', 'name', 'text', 'Matériau 4 — nom', 'Argile Blanche', 88),
('atelier', 'material_4', 'desc', 'text', 'Matériau 4 — description', 'Pureté et luminosité. Crée des pièces d''une clarté presque lunaire après polissage.', 89),
-- CTA
('atelier', 'cta', 'title', 'text', 'Titre', 'Découvrez nos créations', 90),
('atelier', 'cta', 'text', 'textarea', 'Texte', 'Chaque bijou Tē Pūō porte en lui des heures de travail patient et la beauté brute de la terre transformée. Explorez nos collections pour trouver votre pièce unique.', 91),
('atelier', 'cta', 'button_text', 'text', 'Texte du bouton', 'Voir nos collections', 92),
('atelier', 'cta', 'button_url', 'url', 'Lien du bouton', 'bijoux.html', 93);

-- ----- ENTRETIEN PAGE -----
INSERT INTO site_content (page, section, field_key, content_type, label, value, sort_order) VALUES
-- Hero
('entretien', 'hero', 'overline', 'text', 'Surtitre', 'Prendre soin', 1),
('entretien', 'hero', 'title', 'text', 'Titre', 'Guide d''Entretien', 2),
('entretien', 'hero', 'subtitle', 'text', 'Sous-titre', 'Nos conseils pour préserver la beauté et l''éclat de vos bijoux en terre polie', 3),
-- Intro
('entretien', 'intro', 'text', 'textarea', 'Texte d''introduction', 'Vos bijoux Tē Pūō sont des pièces artisanales façonnées à la main à partir de terre naturelle. Comme tout objet précieux, ils méritent une attention particulière pour conserver leur lustre et leur beauté au fil du temps. Suivez ces quelques conseils simples pour profiter longtemps de vos créations.', 10),
-- Conseils
('entretien', 'tips', 'title', 'text', 'Titre de section', 'Les Gestes Essentiels', 20),
('entretien', 'tip_1', 'title', 'text', 'Conseil 1 — titre', 'Entretien quotidien', 21),
('entretien', 'tip_1', 'text', 'textarea', 'Conseil 1 — texte', 'Après chaque utilisation, essuyez délicatement votre bijou avec un chiffon doux et sec. Ce geste simple suffit à éliminer les traces de doigts et à préserver le lustre naturel de la terre polie.', 22),
('entretien', 'tip_2', 'title', 'text', 'Conseil 2 — titre', 'Éviter l''eau', 23),
('entretien', 'tip_2', 'text', 'textarea', 'Conseil 2 — texte', 'La terre polie est sensible à l''humidité prolongée. Retirez vos bijoux avant de vous laver les mains, prendre une douche ou nager. Un contact bref avec l''eau n''est pas grave, mais séchez immédiatement.', 24),
('entretien', 'tip_3', 'title', 'text', 'Conseil 3 — titre', 'Rangement soigné', 25),
('entretien', 'tip_3', 'text', 'textarea', 'Conseil 3 — texte', 'Rangez chaque bijou séparément dans la pochette en tissu fournie ou un écrin individuel. Évitez le contact avec d''autres bijoux, en particulier métalliques, qui pourraient rayer la surface polie.', 26),
('entretien', 'tip_4', 'title', 'text', 'Conseil 4 — titre', 'Produits chimiques', 27),
('entretien', 'tip_4', 'text', 'textarea', 'Conseil 4 — texte', 'Éloignez vos bijoux des parfums, crèmes, lotions et produits ménagers. Appliquez vos cosmétiques et laissez-les sécher complètement avant de mettre vos bijoux. L''ordre est important : parfum d''abord, bijou ensuite.', 28),
-- Bonnes pratiques
('entretien', 'dos_donts', 'title', 'text', 'Titre de section', 'Les Bonnes Pratiques', 30),
('entretien', 'dos', 'title', 'text', 'Titre « À faire »', 'À faire', 31),
('entretien', 'dos', 'items', 'list', 'Liste « À faire »', '["Nettoyer avec un chiffon doux et sec","Ranger dans une pochette individuelle","Retirer avant la douche ou le bain","Mettre le bijou après le parfum et la crème","Manipuler avec des mains propres et sèches","Stocker dans un endroit sec à température ambiante"]', 32),
('entretien', 'donts', 'title', 'text', 'Titre « À éviter »', 'À éviter', 33),
('entretien', 'donts', 'items', 'list', 'Liste « À éviter »', '["Immerger dans l''eau ou l''exposer à l''humidité prolongée","Utiliser des produits nettoyants chimiques","Frotter avec des matériaux abrasifs","Ranger avec d''autres bijoux métalliques","Exposer à des températures extrêmes","Laisser tomber sur une surface dure"]', 34),
-- Restauration
('entretien', 'restoration', 'overline', 'text', 'Surtitre', 'Service', 40),
('entretien', 'restoration', 'title', 'text', 'Titre', 'Repolissage & Restauration', 41),
('entretien', 'restoration', 'text', 'textarea', 'Texte', 'Si votre bijou a perdu de son éclat ou présente des micro-rayures, pas de panique ! La beauté du dorodango réside aussi dans sa capacité à être repoli. Nous proposons un service de repolissage pour redonner à votre bijou son lustre d''origine.

Contactez-nous pour en savoir plus sur notre service de restauration. Chaque bijou sera traité avec le même soin que lors de sa création initiale.', 42),
('entretien', 'restoration', 'cta_text', 'text', 'Texte du bouton', 'Nous contacter', 43),
('entretien', 'restoration', 'cta_url', 'url', 'Lien du bouton', 'mailto:contact@tepuo.com', 44);
