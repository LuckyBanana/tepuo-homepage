/**
 * Configuration file for Tē Pūō website
 *
 * Uses Vite environment variables when available (import.meta.env),
 * falls back to defaults for development.
 *
 * To configure:
 * 1. Copy .env.example to .env
 * 2. Fill in your Supabase credentials
 */

export const CONFIG = {
  supabase: {
    url: import.meta.env?.VITE_SUPABASE_URL || 'https://gjsqkascyoqpoxtuyrxu.supabase.co',
    anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nd9h1FxUtCFOpnPfrkzZHw_pgTJeZoO'
  },

  map: {
    defaultCenter: [48.8566, 2.3522],
    defaultZoom: 6
  },

  cache: {
    // Cache duration for API responses in milliseconds (5 minutes)
    ttl: 300000
  }
};
