-- Te Puo Website - Sample Data for Testing
-- This script inserts sample data into the database for testing purposes
-- Execute this AFTER creating the tables and configuring RLS policies

-- ============================================================================
-- SAMPLE COLLECTIONS
-- ============================================================================

INSERT INTO collections (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Collection Terre', 'Bijoux inspirés des tons naturels de la terre, évoquant la chaleur et l''authenticité de l''argile travaillée.'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Collection Océan', 'Pièces aux nuances bleues et vertes rappelant les profondeurs marines et la sérénité des eaux calmes.'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Collection Forêt', 'Créations aux teintes vertes et brunes célébrant la richesse et la vitalité de la nature forestière.');


-- ============================================================================
-- SAMPLE JEWELRY ITEMS
-- ============================================================================
-- Note: Replace image URLs with actual Supabase Storage URLs after uploading images

INSERT INTO jewelry (id, name, description, image_url, collection_id) VALUES
  -- Collection Terre items
  ('660e8400-e29b-41d4-a716-446655440001', 
   'Collier Argile', 
   'Collier élégant avec perles en terre polie selon la technique dorodango, tons ocre et brun.',
   'https://placeholder.supabase.co/storage/v1/object/public/jewelry-images/collier-argile.jpg',
   '550e8400-e29b-41d4-a716-446655440001'),
  
  ('660e8400-e29b-41d4-a716-446655440002',
   'Boucles d''Oreilles Sable',
   'Boucles d''oreilles légères avec sphères dorées rappelant les grains de sable polis.',
   'https://placeholder.supabase.co/storage/v1/object/public/jewelry-images/boucles-sable.jpg',
   '550e8400-e29b-41d4-a716-446655440001'),
  
  ('660e8400-e29b-41d4-a716-446655440003',
   'Bracelet Terracotta',
   'Bracelet composé de perles en terre cuite aux reflets chauds et naturels.',
   'https://placeholder.supabase.co/storage/v1/object/public/jewelry-images/bracelet-terracotta.jpg',
   '550e8400-e29b-41d4-a716-446655440001'),
  
  -- Collection Océan items
  ('660e8400-e29b-41d4-a716-446655440004',
   'Collier Vague',
   'Collier aux perles bleues évoquant le mouvement des vagues et la profondeur de l''océan.',
   'https://placeholder.supabase.co/storage/v1/object/public/jewelry-images/collier-vague.jpg',
   '550e8400-e29b-41d4-a716-446655440002'),
  
  ('660e8400-e29b-41d4-a716-446655440005',
   'Boucles d''Oreilles Corail',
   'Boucles d''oreilles délicates aux tons turquoise et vert d''eau.',
   'https://placeholder.supabase.co/storage/v1/object/public/jewelry-images/boucles-corail.jpg',
   '550e8400-e29b-41d4-a716-446655440002'),
  
  -- Collection Forêt items
  ('660e8400-e29b-41d4-a716-446655440006',
   'Collier Mousse',
   'Collier aux perles vertes rappelant la mousse fraîche des sous-bois.',
   'https://placeholder.supabase.co/storage/v1/object/public/jewelry-images/collier-mousse.jpg',
   '550e8400-e29b-41d4-a716-446655440003'),
  
  ('660e8400-e29b-41d4-a716-446655440007',
   'Bracelet Écorce',
   'Bracelet aux tons bruns et verts évoquant la texture de l''écorce d''arbre.',
   'https://placeholder.supabase.co/storage/v1/object/public/jewelry-images/bracelet-ecorce.jpg',
   '550e8400-e29b-41d4-a716-446655440003');


-- ============================================================================
-- SAMPLE SALES POINTS
-- ============================================================================
-- Sample boutiques in France with real GPS coordinates

INSERT INTO sales_points (id, name, latitude, longitude, address) VALUES
  ('770e8400-e29b-41d4-a716-446655440001',
   'Boutique Te Puo Paris',
   48.8566,
   2.3522,
   '15 Rue de la Paix, 75002 Paris, France'),
  
  ('770e8400-e29b-41d4-a716-446655440002',
   'Galerie Artisanale Lyon',
   45.7640,
   4.8357,
   '8 Place Bellecour, 69002 Lyon, France'),
  
  ('770e8400-e29b-41d4-a716-446655440003',
   'Atelier Créatif Marseille',
   43.2965,
   5.3698,
   '22 Quai du Port, 13002 Marseille, France'),
  
  ('770e8400-e29b-41d4-a716-446655440004',
   'Boutique Nature Bordeaux',
   44.8378,
   -0.5792,
   '45 Rue Sainte-Catherine, 33000 Bordeaux, France'),
  
  ('770e8400-e29b-41d4-a716-446655440005',
   'Espace Artisanal Toulouse',
   43.6047,
   1.4442,
   '12 Place du Capitole, 31000 Toulouse, France');


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count items in each table
SELECT 'collections' as table_name, COUNT(*) as row_count FROM collections
UNION ALL
SELECT 'jewelry', COUNT(*) FROM jewelry
UNION ALL
SELECT 'sales_points', COUNT(*) FROM sales_points;

-- View all collections with their jewelry count
SELECT 
  c.name as collection_name,
  c.description,
  COUNT(j.id) as jewelry_count
FROM collections c
LEFT JOIN jewelry j ON c.id = j.collection_id
GROUP BY c.id, c.name, c.description
ORDER BY c.name;

-- View all jewelry items with their collection names
SELECT 
  j.name as jewelry_name,
  c.name as collection_name,
  j.description
FROM jewelry j
LEFT JOIN collections c ON j.collection_id = c.id
ORDER BY c.name, j.name;

-- View all sales points
SELECT 
  name,
  latitude,
  longitude,
  address
FROM sales_points
ORDER BY name;
