-- Create collections table
-- This table stores jewelry collections with their basic information
-- Requirements: 3.1, 3.2

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on created_at for sorting
CREATE INDEX idx_collections_created_at ON collections(created_at);

-- Add comment for documentation
COMMENT ON TABLE collections IS 'Stores jewelry collections with name and description';
COMMENT ON COLUMN collections.id IS 'Unique identifier for the collection';
COMMENT ON COLUMN collections.name IS 'Name of the collection (e.g., "Collection Terre", "Collection Océan")';
COMMENT ON COLUMN collections.description IS 'Description of the collection';
COMMENT ON COLUMN collections.created_at IS 'Timestamp when the collection was created';
