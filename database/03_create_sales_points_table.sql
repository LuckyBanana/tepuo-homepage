-- Create sales_points table
-- This table stores physical sales locations with geographic coordinates
-- Requirements: 5.1

CREATE TABLE sales_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_sales_points_coordinates ON sales_points(latitude, longitude);
CREATE INDEX idx_sales_points_created_at ON sales_points(created_at);

-- Add constraints to ensure valid coordinates
ALTER TABLE sales_points ADD CONSTRAINT check_latitude 
  CHECK (latitude >= -90 AND latitude <= 90);
ALTER TABLE sales_points ADD CONSTRAINT check_longitude 
  CHECK (longitude >= -180 AND longitude <= 180);

-- Add comment for documentation
COMMENT ON TABLE sales_points IS 'Stores physical sales locations with geographic coordinates';
COMMENT ON COLUMN sales_points.id IS 'Unique identifier for the sales point';
COMMENT ON COLUMN sales_points.name IS 'Name of the sales point/boutique';
COMMENT ON COLUMN sales_points.latitude IS 'GPS latitude coordinate (-90 to 90)';
COMMENT ON COLUMN sales_points.longitude IS 'GPS longitude coordinate (-180 to 180)';
COMMENT ON COLUMN sales_points.address IS 'Full address of the sales point (optional)';
COMMENT ON COLUMN sales_points.created_at IS 'Timestamp when the sales point was created';
