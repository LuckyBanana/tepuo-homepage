# GitHub Pages Setup Instructions

This document provides step-by-step instructions for setting up GitHub Pages deployment for the Te Puo website.

## Prerequisites

- GitHub account
- Custom domain (tepuo.com) purchased and accessible
- Git installed locally
- Repository code ready to push

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right and select "New repository"
3. Configure the repository:
   - **Repository name**: `te-puo-website` (or your preferred name)
   - **Description**: "Site web vitrine pour Te Puo - Bijoux artisanaux inspirés du dorodango"
   - **Visibility**: Public (required for free GitHub Pages)
   - **Initialize**: Do NOT initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Push Code to GitHub

If you haven't initialized git yet:

```bash
git init
git add .
git commit -m "Initial commit: Te Puo website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/te-puo-website.git
git push -u origin main
```

If you already have a git repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/te-puo-website.git
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. In the left sidebar, click "Pages"
4. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click "Save"
6. GitHub will display a message: "Your site is ready to be published at https://YOUR_USERNAME.github.io/te-puo-website/"

## Step 4: Configure Custom Domain

### 4.1 Add CNAME File (Already Done)

The `CNAME` file in the repository root contains your custom domain:
```
tepuo.com
```

This file tells GitHub Pages to serve your site at this domain.

### 4.2 Configure DNS Records

You need to configure DNS records with your domain registrar (where you bought tepuo.com):

**Option A: Apex Domain (tepuo.com)**

Add these A records pointing to GitHub's IP addresses:

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
```

**Option B: Subdomain (www.tepuo.com)**

Add a CNAME record:

```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
```

**Recommended: Add both apex and www**

Add the A records above, plus:

```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
```

### 4.3 Verify Custom Domain in GitHub

1. Go back to Settings > Pages in your GitHub repository
2. Under "Custom domain", enter: `tepuo.com`
3. Click "Save"
4. Wait for DNS check to complete (can take up to 24 hours, usually much faster)
5. Once verified, check "Enforce HTTPS" for secure connections

## Step 5: Verify Deployment

1. Wait a few minutes for the initial deployment
2. Visit your site at:
   - `https://YOUR_USERNAME.github.io/te-puo-website/` (GitHub subdomain)
   - `https://tepuo.com` (custom domain, after DNS propagation)
3. Verify all pages load correctly:
   - Homepage (index.html)
   - Bijoux page (bijoux.html)
   - Points de Vente page (points-vente.html)

## Step 6: Set Up Automatic Deployment (GitHub Actions)

GitHub Actions workflows are configured in `.github/workflows/` directory. See:
- `deploy.yml` - Automatic deployment on push to main
- `test.yml` - Run tests on pull requests

These workflows will run automatically once pushed to GitHub.

## Troubleshooting

### Site Not Loading

- Check that GitHub Pages is enabled in Settings > Pages
- Verify the branch is set to `main` and folder to `/ (root)`
- Check the Actions tab for any deployment errors

### Custom Domain Not Working

- Verify DNS records are configured correctly (use `dig tepuo.com` or online DNS checker)
- DNS propagation can take up to 24-48 hours
- Ensure CNAME file contains only the domain name (no http://, no trailing slash)
- Check that "Enforce HTTPS" is enabled after DNS verification

### Images or Assets Not Loading

- Verify all asset paths are relative (not absolute)
- Check browser console for 404 errors
- Ensure Supabase configuration is correct in `scripts/config.js`

### HTTPS Certificate Issues

- Wait for GitHub to provision the certificate (can take up to 24 hours)
- Ensure "Enforce HTTPS" is checked in Settings > Pages
- Try accessing via http:// first, then enable HTTPS

## Security Notes

1. **Supabase Keys**: The anon key in `scripts/config.js` is safe to expose publicly as it only allows read-only access (configured via RLS policies)
2. **HTTPS**: Always use HTTPS in production for security
3. **CORS**: Ensure Supabase CORS settings allow requests from your custom domain

## Next Steps

After successful deployment:

1. Test all functionality on the live site
2. Run Lighthouse performance audit
3. Test on multiple devices and browsers
4. Set up monitoring/analytics if desired
5. Share the site URL with stakeholders

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Configuring a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
