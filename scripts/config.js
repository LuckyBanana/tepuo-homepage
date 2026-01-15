/**
 * Configuration file for Te Puo website
 * 
 * IMPORTANT: Replace the placeholder values with your actual Supabase credentials
 * before deploying to production.
 * 
 * To get your Supabase credentials:
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to Settings > API
 * 3. Copy the Project URL and anon/public key
 */

export const CONFIG = {
  supabase: {
    // Replace with your Supabase project URL
    // Example: 'https://xyzcompany.supabase.co'
    url: 'https://gjsqkascyoqpoxtuyrxu.supabase.co',
    
    // Replace with your Supabase anon/public key
    // This key is safe to use in client-side code as it only allows
    // read access based on your Row Level Security policies
    anonKey: 'sb_publishable_nd9h1FxUtCFOpnPfrkzZHw_pgTJeZoO'
  },
  
  map: {
    // Default map center coordinates [latitude, longitude]
    // Currently set to Paris, France
    defaultCenter: [48.8566, 2.3522],
    
    // Default zoom level (1-18, where 18 is most zoomed in)
    defaultZoom: 6
  },
  
  cache: {
    // Cache duration for API responses in milliseconds
    // 5 minutes = 300000 ms
    ttl: 300000
  }
};
