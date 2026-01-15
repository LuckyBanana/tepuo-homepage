-- Create jewelry table
-- This table stores individual jewelry items with their properties
-- Requirements: 3.1, 3.2

CREATE TABLE jewelry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_jewelry_collection_id ON jewelry(collection_id);
CREATE INDEX idx_jewelry_created_at ON jewelry(created_at);

-- Add comment for documentation
COMMENT ON TABLE jewelry IS 'Stores individual jewelry items with their properties';
COMMENT ON COLUMN jewelry.id IS 'Unique identifier for the jewelry item';
COMMENT ON COLUMN jewelry.name IS 'Name of the jewelry item';
COMMENT ON COLUMN jewelry.description IS 'Description of the jewelry item';
COMMENT ON COLUMN jewelry.image_url IS 'URL of the jewelry image stored in Supabase Storage';
COMMENT ON COLUMN jewelry.collection_id IS 'Reference to the collection this jewelry belongs to (nullable)';
COMMENT ON COLUMN jewelry.created_at IS 'Timestamp when the jewelry item was created';
