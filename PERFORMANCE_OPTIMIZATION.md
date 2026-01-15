# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Te Puo website and provides instructions for testing and further optimization.

## Implemented Optimizations

### 1. SessionStorage Caching ✅

**Implementation**: API responses from Supabase are cached in sessionStorage with a 5-minute TTL (Time To Live).

**Benefits**:
- Reduces API calls to Supabase
- Faster page loads on subsequent visits within the same session
- Reduces bandwidth usage

**How it works**:
- First request fetches data from Supabase and stores it in sessionStorage
- Subsequent requests within 5 minutes use cached data
- Cache automatically expires after 5 minutes
- Cache is cleared when the browser tab is closed

**Cache keys**:
- `tepuo_cache_collections` - Collections data
- `tepuo_cache_jewelry` - Jewelry items data
- `tepuo_cache_sales_points` - Sales points data

**Manual cache clearing**:
```javascript
// In browser console
const supabase = new SupabaseClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
supabase.clearCache();
```

### 2. Lazy Loading for Images ✅

**Implementation**: All jewelry images use the `loading="lazy"` attribute.

**Benefits**:
- Images only load when they're about to enter the viewport
- Faster initial page load
- Reduced bandwidth for users who don't scroll through all content

**Code example** (from `scripts/bijoux.js`):
```javascript
image.loading = 'lazy'; // Enable lazy loading for performance
```

### 3. CSS and JavaScript Minification ✅

**Implementation**: Vite build process automatically minifies CSS and JavaScript for production.

**Configuration** (in `vite.config.js`):
```javascript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true  // Remove console.log in production
    }
  }
}
```

**Benefits**:
- Smaller file sizes
- Faster download times
- Removes console.log statements in production

**Build command**:
```bash
npm run build
```

The minified files are output to the `dist/` directory.

### 4. Image Optimization in Supabase Storage

**Status**: Requires manual setup in Supabase

#### Instructions for Optimizing Images

**Step 1: Convert Images to WebP Format**

WebP provides superior compression compared to JPEG/PNG while maintaining quality.

**Using online tools**:
- [Squoosh](https://squoosh.app/) - Google's image optimization tool
- [CloudConvert](https://cloudconvert.com/jpg-to-webp) - Batch conversion

**Using command line** (ImageMagick):
```bash
# Install ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Convert single image
convert input.jpg -quality 85 output.webp

# Batch convert all JPG files
for file in *.jpg; do
  convert "$file" -quality 85 "${file%.jpg}.webp"
done
```

**Recommended settings**:
- Quality: 80-85 for photos
- Quality: 90-95 for images with text or fine details

**Step 2: Upload Optimized Images to Supabase Storage**

1. Log in to your Supabase project dashboard
2. Navigate to Storage > jewelry-images bucket
3. Upload the optimized WebP images
4. Copy the public URL for each image
5. Update the `image_url` field in the `jewelry` table with the new URLs

**Step 3: Use Supabase Image Transformations**

Supabase Storage supports on-the-fly image transformations. You can request different sizes:

```javascript
// Original URL
const originalUrl = 'https://your-project.supabase.co/storage/v1/object/public/jewelry-images/necklace.webp';

// Thumbnail (400px width)
const thumbnailUrl = `${originalUrl}?width=400&quality=80`;

// Medium (800px width)
const mediumUrl = `${originalUrl}?width=800&quality=85`;

// Large (1200px width)
const largeUrl = `${originalUrl}?width=1200&quality=85`;
```

**Responsive images implementation**:
```html
<img 
  src="image.webp?width=400"
  srcset="
    image.webp?width=400 400w,
    image.webp?width=800 800w,
    image.webp?width=1200 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Jewelry description"
  loading="lazy"
>
```

**Step 4: Set Up Storage Policies for Optimization**

Ensure your storage bucket has proper caching headers:

```sql
-- In Supabase SQL Editor
ALTER TABLE storage.objects 
SET (
  cache_control = 'public, max-age=31536000, immutable'
);
```

### 5. Additional Performance Best Practices

#### Code Splitting
Leaflet.js is only loaded on the points-vente page, not globally.

#### Asset Optimization
- Use CDN for external libraries (Leaflet.js)
- Minimize HTTP requests
- Enable compression (handled by GitHub Pages automatically)

#### Browser Caching
GitHub Pages automatically sets appropriate cache headers for static assets.

## Testing Performance with Lighthouse

### What is Lighthouse?

Lighthouse is an open-source, automated tool for improving the quality of web pages. It audits:
- Performance
- Accessibility
- Best Practices
- SEO
- Progressive Web App (PWA) capabilities

### How to Run Lighthouse

#### Method 1: Chrome DevTools (Recommended)

1. Open your site in Google Chrome
2. Right-click and select "Inspect" or press `F12`
3. Click on the "Lighthouse" tab
4. Select categories to audit:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. Select device: Mobile or Desktop
6. Click "Analyze page load"
7. Wait for the report to generate

#### Method 2: Chrome Extension

1. Install the [Lighthouse Chrome Extension](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk)
2. Navigate to your site
3. Click the Lighthouse icon in the toolbar
4. Click "Generate report"

#### Method 3: Command Line (CI/CD)

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://tepuo.com --output html --output-path ./lighthouse-report.html

# Run audit for mobile
lighthouse https://tepuo.com --preset=mobile --output html --output-path ./lighthouse-mobile.html

# Run audit for desktop
lighthouse https://tepuo.com --preset=desktop --output html --output-path ./lighthouse-desktop.html
```

#### Method 4: PageSpeed Insights (Online)

1. Go to [PageSpeed Insights](https://pagespeed.web.dev/)
2. Enter your URL: `https://tepuo.com`
3. Click "Analyze"
4. View results for both Mobile and Desktop

### Interpreting Lighthouse Scores

Lighthouse provides scores from 0-100 for each category:

- **90-100**: Good (Green)
- **50-89**: Needs Improvement (Orange)
- **0-49**: Poor (Red)

### Target Scores for Te Puo Website

| Category | Target Score | Priority |
|----------|--------------|----------|
| Performance | 90+ | High |
| Accessibility | 95+ | High |
| Best Practices | 90+ | Medium |
| SEO | 90+ | Medium |

### Common Performance Metrics

**Core Web Vitals**:
- **LCP (Largest Contentful Paint)**: < 2.5s (Good)
- **FID (First Input Delay)**: < 100ms (Good)
- **CLS (Cumulative Layout Shift)**: < 0.1 (Good)

**Other Metrics**:
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.8s
- **TBT (Total Blocking Time)**: < 200ms
- **Speed Index**: < 3.4s

### Lighthouse Report Analysis

After running Lighthouse, review the following sections:

1. **Opportunities**: Suggestions to improve load time
   - Properly size images
   - Eliminate render-blocking resources
   - Minify CSS/JavaScript
   - Enable text compression

2. **Diagnostics**: Additional information about performance
   - Reduce JavaScript execution time
   - Minimize main-thread work
   - Reduce the impact of third-party code

3. **Passed Audits**: What you're doing well
   - Uses HTTPS
   - Avoids enormous network payloads
   - Efficient cache policy

### Automated Lighthouse Testing in CI/CD

Add Lighthouse CI to your GitHub Actions workflow:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build site
        run: npm run build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/bijoux.html
            http://localhost:3000/points-vente.html
          uploadArtifacts: true
          temporaryPublicStorage: true
```

## Performance Monitoring

### Ongoing Monitoring

1. **Run Lighthouse monthly** to track performance over time
2. **Monitor Core Web Vitals** in Google Search Console
3. **Use Real User Monitoring (RUM)** tools like:
   - Google Analytics 4 (Web Vitals report)
   - Cloudflare Web Analytics
   - Vercel Analytics

### Performance Budget

Set performance budgets to prevent regression:

```javascript
// lighthouse-budget.json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 150
    },
    {
      "resourceType": "stylesheet",
      "budget": 50
    },
    {
      "resourceType": "image",
      "budget": 500
    },
    {
      "resourceType": "total",
      "budget": 800
    }
  ],
  "timings": [
    {
      "metric": "interactive",
      "budget": 3000
    },
    {
      "metric": "first-contentful-paint",
      "budget": 1500
    }
  ]
}
```

## Troubleshooting Performance Issues

### Slow API Responses

**Symptoms**: Long wait times for jewelry/collections to load

**Solutions**:
1. Check Supabase region (should be close to target audience)
2. Verify RLS policies aren't too complex
3. Add database indexes if needed
4. Consider using Supabase Edge Functions for complex queries

### Large Image Files

**Symptoms**: High LCP scores, slow image loading

**Solutions**:
1. Compress images to WebP format
2. Use appropriate image dimensions (don't serve 4K images for thumbnails)
3. Implement responsive images with srcset
4. Consider using a CDN for images

### Render-Blocking Resources

**Symptoms**: High FCP/LCP scores

**Solutions**:
1. Inline critical CSS
2. Defer non-critical JavaScript
3. Use async/defer attributes for scripts
4. Minimize CSS/JS files

### Third-Party Scripts

**Symptoms**: High TBT, slow TTI

**Solutions**:
1. Load third-party scripts asynchronously
2. Use facade patterns for heavy embeds
3. Consider self-hosting critical third-party resources

## Summary

The Te Puo website implements several performance optimizations:

✅ SessionStorage caching (5-minute TTL)
✅ Lazy loading for images
✅ CSS/JS minification
✅ Efficient build configuration
📋 Image optimization (requires manual setup)
📋 Lighthouse testing (instructions provided)

**Next steps**:
1. Optimize and upload images to Supabase Storage
2. Run Lighthouse audit on deployed site
3. Address any issues identified in the audit
4. Set up ongoing performance monitoring

**Target**: Achieve 90+ Lighthouse Performance score on all pages.
