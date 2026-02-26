-- Create blog_posts table for the Journal page
-- Execute this script in your Supabase SQL Editor

-- ============================================================================
-- 1. CREATE BLOG_POSTS TABLE
-- ============================================================================

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  image_url TEXT,
  image_alt TEXT,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_is_featured ON blog_posts(is_featured) WHERE is_featured = true;

-- Add comments
COMMENT ON TABLE blog_posts IS 'Stores blog articles for the Journal page';
COMMENT ON COLUMN blog_posts.title IS 'Article title';
COMMENT ON COLUMN blog_posts.excerpt IS 'Short excerpt displayed in the card';
COMMENT ON COLUMN blog_posts.content IS 'Full article content (HTML or markdown)';
COMMENT ON COLUMN blog_posts.category IS 'Category label (e.g. Savoir-faire, Matériaux, Coulisses)';
COMMENT ON COLUMN blog_posts.image_url IS 'Cover image URL';
COMMENT ON COLUMN blog_posts.image_alt IS 'Alt text for the cover image';
COMMENT ON COLUMN blog_posts.is_featured IS 'Whether this article is featured (displayed larger)';
COMMENT ON COLUMN blog_posts.published_at IS 'Publication date displayed on the site';

-- ============================================================================
-- 2. ENABLE RLS
-- ============================================================================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anonymous read access (public website)
CREATE POLICY "Allow anonymous read access" ON blog_posts
  FOR SELECT
  USING (true);

-- Authenticated admin CRUD
CREATE POLICY "Allow authenticated insert" ON blog_posts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON blog_posts
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON blog_posts
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;
