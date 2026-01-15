# Deployment Checklist - Te Puo Website

This checklist ensures all steps are completed before deploying the Te Puo website to production.

## Pre-Deployment Checklist

### 1. Supabase Configuration ✅

- [ ] Supabase project created
- [ ] Database tables created (collections, jewelry, sales_points)
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Read-only policies configured for anonymous users
- [ ] Storage bucket `jewelry-images` created
- [ ] Storage bucket has public access enabled
- [ ] Sample data added for testing
- [ ] Supabase URL and anon key configured in `scripts/config.js`

**Verification**:
```bash
# Test API access
curl "YOUR_SUPABASE_URL/rest/v1/collections?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 2. Code Quality ✅

- [ ] All tests passing (`npm test`)
- [ ] No console errors in browser
- [ ] No TypeScript/ESLint errors (if configured)
- [ ] Code reviewed and approved
- [ ] All TODO comments addressed or documented

**Run tests**:
```bash
npm test -- --run
npm run test:coverage
```

**Expected**: All tests pass, coverage > 80%

### 3. Content Review ✅

- [ ] Homepage content reviewed and approved
- [ ] All text in French is correct (no typos)
- [ ] Brand story accurately represents Te Puo
- [ ] Dorodango technique explanation is clear
- [ ] All images have appropriate alt text
- [ ] Contact information is correct

### 4. Functionality Testing ✅

#### Homepage (index.html)
- [ ] Page loads without errors
- [ ] All sections display correctly
- [ ] Navigation links work
- [ ] Images load properly
- [ ] Responsive on mobile, tablet, desktop

#### Bijoux Page (bijoux.html)
- [ ] Collections load from Supabase
- [ ] Jewelry items display correctly
- [ ] Images load with lazy loading
- [ ] Empty state displays when no data
- [ ] Error handling works (test by breaking API)
- [ ] Responsive layout works

#### Points de Vente Page (points-vente.html)
- [ ] Map loads correctly
- [ ] Markers display at correct locations
- [ ] Marker popups show correct information
- [ ] Map controls work (zoom, pan)
- [ ] Responsive on all devices

### 5. Performance Optimization ✅

- [ ] SessionStorage caching implemented (5-minute TTL)
- [ ] Lazy loading enabled for images
- [ ] CSS and JavaScript minified in build
- [ ] Images optimized (WebP format recommended)
- [ ] Build size is reasonable (< 1MB total)

**Test build**:
```bash
npm run build
# Check dist/ folder size
du -sh dist/
```

**Run Lighthouse audit**:
- Performance: Target 90+
- Accessibility: Target 95+
- Best Practices: Target 90+
- SEO: Target 90+

### 6. Accessibility ✅

- [ ] Semantic HTML used throughout
- [ ] All images have alt attributes
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Screen reader tested (NVDA or VoiceOver)
- [ ] ARIA attributes used for dynamic content

**Test with**:
- [ ] Keyboard only (no mouse)
- [ ] Screen reader (NVDA/VoiceOver)
- [ ] axe DevTools (no critical issues)
- [ ] Lighthouse accessibility audit (95+)

### 7. Browser Compatibility ✅

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Minimum supported versions**:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions

### 8. Responsive Design ✅

Test on:
- [ ] Mobile (320px - 480px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1280px+)
- [ ] Large desktop (1920px+)

**Test orientations**:
- [ ] Portrait
- [ ] Landscape

### 9. Security ✅

- [ ] HTTPS enabled (GitHub Pages provides this)
- [ ] No sensitive data in client-side code
- [ ] Supabase anon key is safe to expose (read-only)
- [ ] No API keys or secrets in repository
- [ ] CORS configured correctly in Supabase
- [ ] RLS policies prevent unauthorized writes

### 10. SEO ✅

- [ ] All pages have descriptive `<title>` tags
- [ ] Meta descriptions added
- [ ] Open Graph tags for social sharing (optional)
- [ ] Sitemap.xml created (optional)
- [ ] robots.txt configured (optional)

**Example meta tags**:
```html
<meta name="description" content="Te Puo - Bijoux artisanaux inspirés de la technique dorodango japonaise">
<meta name="keywords" content="bijoux, artisanal, dorodango, Te Puo">
```

## GitHub Pages Deployment

### 1. Repository Setup ✅

- [ ] GitHub repository created
- [ ] Code pushed to `main` branch
- [ ] `.gitignore` configured correctly
- [ ] README.md is comprehensive

**Commands**:
```bash
git init
git add .
git commit -m "Initial commit: Te Puo website"
git remote add origin https://github.com/YOUR_USERNAME/te-puo-website.git
git push -u origin main
```

### 2. GitHub Pages Configuration ✅

- [ ] GitHub Pages enabled in repository settings
- [ ] Source set to `main` branch, `/ (root)` folder
- [ ] CNAME file added with custom domain
- [ ] DNS records configured at domain registrar
- [ ] HTTPS enforced

**DNS Configuration**:
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153

Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
```

### 3. GitHub Actions Workflows ✅

- [ ] `.github/workflows/deploy.yml` created
- [ ] `.github/workflows/test.yml` created
- [ ] Workflows have correct permissions
- [ ] Test workflow runs on pull requests
- [ ] Deploy workflow runs on push to main

**Verify workflows**:
- Go to repository > Actions tab
- Check that workflows are listed
- Trigger a test run by pushing a commit

### 4. Custom Domain Setup ✅

- [ ] Domain purchased and accessible
- [ ] DNS records configured
- [ ] CNAME file contains correct domain
- [ ] DNS propagation complete (can take 24-48 hours)
- [ ] HTTPS certificate provisioned by GitHub

**Test DNS**:
```bash
# Check A records
dig tepuo.com

# Check CNAME
dig www.tepuo.com

# Expected: Points to GitHub Pages IPs
```

## Post-Deployment Verification

### 1. Live Site Testing ✅

- [ ] Site accessible at custom domain (https://tepuo.com)
- [ ] All pages load correctly
- [ ] No console errors
- [ ] API calls to Supabase work
- [ ] Images load from Supabase Storage
- [ ] Map displays correctly
- [ ] Navigation works between pages

### 2. Performance Testing ✅

- [ ] Run Lighthouse on live site
- [ ] Check Core Web Vitals
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- [ ] Test on slow 3G connection
- [ ] Verify caching works (check Network tab)

**Run Lighthouse**:
```bash
lighthouse https://tepuo.com --output html --output-path ./lighthouse-report.html
```

### 3. Cross-Device Testing ✅

Test on real devices:
- [ ] iPhone (Safari)
- [ ] Android phone (Chrome)
- [ ] iPad (Safari)
- [ ] Android tablet (Chrome)
- [ ] Desktop (Chrome, Firefox, Safari)

### 4. Analytics Setup (Optional) 📋

- [ ] Google Analytics configured
- [ ] Google Search Console verified
- [ ] Tracking code added to all pages
- [ ] Goals/conversions configured

### 5. Monitoring Setup (Optional) 📋

- [ ] Uptime monitoring configured (e.g., UptimeRobot)
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Performance monitoring (e.g., Cloudflare Analytics)

## Documentation

### 1. User Documentation ✅

- [ ] README.md is complete and accurate
- [ ] Setup instructions are clear
- [ ] Troubleshooting section included
- [ ] Contact information provided

### 2. Technical Documentation ✅

- [ ] GITHUB_PAGES_SETUP.md created
- [ ] PERFORMANCE_OPTIMIZATION.md created
- [ ] ACCESSIBILITY_TESTING.md created
- [ ] Database schema documented
- [ ] API endpoints documented

### 3. Maintenance Documentation 📋

- [ ] How to add new jewelry items
- [ ] How to add new collections
- [ ] How to add new sales points
- [ ] How to update images
- [ ] How to update content

**Create maintenance guide**:
```markdown
# Maintenance Guide

## Adding New Jewelry

1. Upload image to Supabase Storage (jewelry-images bucket)
2. Copy the public URL
3. Insert into jewelry table:
   ```sql
   INSERT INTO jewelry (name, description, image_url, collection_id)
   VALUES ('New Bracelet', 'Description', 'https://...', 'collection-uuid');
   ```
4. Changes appear automatically on the site (cache clears after 5 minutes)
```

## Launch Checklist

### Pre-Launch (1 week before)

- [ ] All development complete
- [ ] All tests passing
- [ ] Code review completed
- [ ] Staging environment tested
- [ ] Client approval received
- [ ] Content finalized
- [ ] Images optimized and uploaded

### Launch Day

- [ ] Final test on staging
- [ ] Backup current state
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Test all functionality on live site
- [ ] Monitor for errors (check logs)
- [ ] Announce launch (social media, email, etc.)

### Post-Launch (1 week after)

- [ ] Monitor analytics
- [ ] Check for errors in logs
- [ ] Gather user feedback
- [ ] Address any issues
- [ ] Run performance audit
- [ ] Document lessons learned

## Rollback Plan

If issues occur after deployment:

1. **Immediate rollback**:
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   ```

2. **Disable GitHub Pages temporarily**:
   - Go to Settings > Pages
   - Change source to "None"
   - Fix issues locally
   - Re-enable when ready

3. **Emergency contact**:
   - Have contact information for:
     - GitHub support
     - Supabase support
     - Domain registrar support

## Success Criteria

The deployment is successful when:

✅ Site is accessible at custom domain
✅ All pages load without errors
✅ Data loads from Supabase correctly
✅ Performance scores meet targets (90+)
✅ Accessibility scores meet targets (95+)
✅ No critical bugs reported
✅ Client approval received
✅ Analytics tracking works
✅ All documentation complete

## Sign-Off

- [ ] Developer sign-off: _______________
- [ ] QA sign-off: _______________
- [ ] Client sign-off: _______________
- [ ] Deployment date: _______________
- [ ] Deployment time: _______________

## Notes

Use this section to document any issues, workarounds, or special considerations:

```
[Add notes here]
```

---

**Deployment completed successfully! 🎉**

Next steps:
1. Monitor site performance
2. Gather user feedback
3. Plan future enhancements
4. Schedule regular maintenance
