# Pahari Patrika - Production Deployment Guide

## 🎯 Production Details

- **Website Name**: Pahari Patrika
- **Production URL**: https://paharipatrika.in
- **WordPress Backend**: https://cms.paharipatrika.in/graphql
- **Organization**: Pahari Patrika Media

## ✅ Pre-Deployment Checklist

### 1. Environment Variables

Ensure your `.env.production` or production environment has these variables set:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_NAME="Pahari Patrika"
NEXT_PUBLIC_SITE_URL="https://paharipatrika.in"
SITE_NAME="Pahari Patrika"
SITE_URL="https://paharipatrika.in"
ORGANIZATION_NAME="Pahari Patrika Media"

# WordPress GraphQL Endpoint
NEXT_PUBLIC_GRAPHQL_ENDPOINT="https://cms.paharipatrika.in/graphql"
WP_GRAPHQL_ENDPOINT="https://cms.paharipatrika.in/graphql"

# Site Assets
SITE_LOGO_URL="/logo.svg"
NEXT_PUBLIC_LOGO_WIDTH=190
NEXT_PUBLIC_LOGO_HEIGHT=50

# Performance
REVALIDATE_SECONDS=300

# Google AdSense (if configured)
NEXT_PUBLIC_ADSENSE_CLIENT_ID="ca-pub-YOUR_ID"
NEXT_PUBLIC_ADSENSE_IN_ARTICLE_SLOT="YOUR_SLOT_ID"
NEXT_PUBLIC_ADSENSE_AFTER_SHARE_SLOT="YOUR_SLOT_ID"
NEXT_PUBLIC_ADSENSE_AFTER_RELATED_SLOT="YOUR_SLOT_ID"
```

### 2. WordPress Backend Setup

Ensure your WordPress at `cms.paharipatrika.in` has:

- ✅ WPGraphQL plugin installed and activated
- ✅ CORS headers configured to allow `paharipatrika.in`
- ✅ Posts, categories, tags, and authors populated
- ✅ Featured images set for all posts
- ✅ Proper permalinks structure
- ✅ SSL certificate installed (HTTPS)

### 3. Code Verification

```bash
# Run type check
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build

# Test production build locally
npm start
```

### 4. Social Media Configuration

Update social media handles in `/app/layout.tsx`:

```typescript
"sameAs": [
  "https://twitter.com/paharipatrika",
  "https://www.facebook.com/paharipatrika",
  "https://www.youtube.com/@paharipatrika",
  "https://www.instagram.com/paharipatrika"
]
```

Replace with your actual social media URLs.

### 5. Contact Information

Update editorial email in `/lib/structured-data.ts`:

```typescript
"email": "editorial@paharipatrika.in"
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel login
   vercel
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.production`

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Domain**
   - Add `paharipatrika.in` in Vercel dashboard
   - Update DNS records as instructed by Vercel

### Option 2: Netlify

1. **Connect Repository**
   - Link GitHub repo in Netlify dashboard

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Add all variables in Netlify dashboard

4. **Deploy**
   - Trigger deployment from dashboard or push to main branch

### Option 3: Custom Server (VPS/Cloud)

1. **Install Dependencies**
   ```bash
   npm ci --production
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start npm --name "paharipatrika" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name paharipatrika.in www.paharipatrika.in;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name paharipatrika.in www.paharipatrika.in;

       ssl_certificate /etc/letsencrypt/live/paharipatrika.in/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/paharipatrika.in/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔒 Security Checklist

- ✅ SSL certificate installed (HTTPS)
- ✅ CORS properly configured on WordPress backend
- ✅ WordPress admin protected with strong passwords
- ✅ WordPress updated to latest version
- ✅ Security plugins installed (Wordfence, etc.)
- ✅ Regular backups configured
- ✅ Environment variables secured (not in git)

## 📊 Post-Deployment Verification

### 1. Test Core Features

- [ ] Homepage loads correctly
- [ ] Article pages display properly
- [ ] Category pages work
- [ ] Tag pages work
- [ ] Author pages display
- [ ] Search functionality works
- [ ] RSS feed accessible (/feed.xml)
- [ ] Sitemap generated (/sitemap.xml)
- [ ] Robots.txt accessible (/robots.txt)

### 2. Test SEO

- [ ] Meta tags present on all pages
- [ ] Open Graph tags working
- [ ] Twitter cards rendering
- [ ] Structured data valid (test with Google Rich Results)
- [ ] Images have alt text
- [ ] Canonical URLs correct

### 3. Test Performance

```bash
# Lighthouse audit
npx lighthouse https://paharipatrika.in --view

# PageSpeed Insights
https://pagespeed.web.dev/
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 4. Test Social Media

- [ ] Facebook sharing preview
- [ ] Twitter card preview
- [ ] WhatsApp sharing works
- [ ] LinkedIn preview

### 5. Test Embeds

- [ ] YouTube videos embed correctly
- [ ] Twitter/X posts display
- [ ] Embeds are responsive on mobile

### 6. Test AdSense (if configured)

- [ ] Ad units display on articles
- [ ] Ads placed correctly (in-article, after share, after related)
- [ ] Ads responsive on mobile
- [ ] ADVERTISEMENT label visible

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📈 Monitoring & Analytics

### 1. Google Analytics

Add to `.env.production`:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### 2. Google Search Console

- Add property: `https://paharipatrika.in`
- Verify ownership
- Submit sitemap: `https://paharipatrika.in/sitemap.xml`

### 3. Error Tracking

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics (if on Vercel)

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Images Not Loading

- Check WordPress media library URLs
- Verify CORS headers on WordPress
- Check image domains in `next.config.js`

### GraphQL Errors

- Verify WPGraphQL plugin is active
- Test endpoint: `curl https://cms.paharipatrika.in/graphql`
- Check WordPress REST API is enabled

### ISR Not Working

- Verify `revalidate` values in page components
- Check Vercel/Netlify cache settings
- Test with `?revalidate=1` query parameter

## 📞 Support

For deployment issues:
1. Check build logs
2. Verify environment variables
3. Test WordPress GraphQL endpoint
4. Check DNS settings
5. Review SSL certificate

## 🎉 Go Live Checklist

Final steps before announcing:

- [ ] All tests passing
- [ ] Performance scores > 90
- [ ] SSL certificate valid
- [ ] DNS propagated (24-48 hours)
- [ ] Google Analytics tracking
- [ ] Search Console verified
- [ ] Social media sharing tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing complete
- [ ] Backup system in place
- [ ] Monitoring configured

## 🔄 Maintenance

### Regular Tasks

- **Daily**: Monitor error logs
- **Weekly**: Check performance metrics
- **Monthly**: Update dependencies, WordPress plugins
- **Quarterly**: Security audit, backup verification

### Update Commands

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Update Next.js
npm install next@latest react@latest react-dom@latest
```

---

**Production URL**: https://paharipatrika.in  
**Last Updated**: November 2, 2025  
**Next.js Version**: 16.0.1
