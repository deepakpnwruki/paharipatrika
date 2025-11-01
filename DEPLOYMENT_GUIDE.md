# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables Setup
Copy `.env.example` to `.env.production` and update all values:

```bash
cp .env.example .env.production
```

**CRITICAL - Must Change:**
- ✅ `NEXT_PUBLIC_SITE_URL` - Your actual domain
- ✅ `SITE_NAME` - Your website name
- ✅ `ORGANIZATION_NAME` - Your company/org name
- ✅ `WP_GRAPHQL_ENDPOINT` - Your WordPress GraphQL URL
- ✅ `GOOGLE_SITE_VERIFICATION` - Get from Google Search Console
- ✅ `GOOGLE_ANALYTICS_ID` - Get from Google Analytics

**Important - Update if Available:**
- 📱 Social media links (Facebook, Twitter, Instagram, YouTube, etc.)
- 📧 Contact information (email, phone, address)
- 🎨 Logo path (put your logo in `/public/images/logo.png`)
- 🔒 `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`

---

## 2. Logo Setup

### Replace Default Logo:
1. Place your logo file in: `/public/images/logo.png`
2. Recommended size: 200x50px (PNG with transparent background)
3. Update `.env.production`:
   ```
   NEXT_PUBLIC_SITE_LOGO=/images/logo.png
   LOGO_WIDTH=200
   LOGO_HEIGHT=50
   ```

### Favicon Setup:
1. Place your favicon in: `/public/favicon.ico`
2. Place Apple touch icon in: `/public/apple-touch-icon.png` (180x180px)
3. Update manifest colors in `/app/manifest.ts` if needed

---

## 3. Social Media Configuration

### Add Your Social Links in `.env.production`:
```bash
SOCIAL_FACEBOOK=https://www.facebook.com/yourpage
SOCIAL_TWITTER=https://twitter.com/yourhandle
SOCIAL_INSTAGRAM=https://www.instagram.com/yourhandle
SOCIAL_YOUTUBE=https://www.youtube.com/@yourchannel
```

### Update Social Icons in Footer:
Edit `components/Footer.tsx` to use these environment variables.

---

## 4. SEO & Analytics Setup

### Google Search Console:
1. Go to: https://search.google.com/search-console
2. Add your property
3. Copy verification code
4. Add to `.env.production`: `GOOGLE_SITE_VERIFICATION=your-code`

### Google Analytics:
1. Create property at: https://analytics.google.com
2. Get Measurement ID (starts with G-)
3. Add to `.env.production`: `GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX`

### Facebook Pixel (Optional):
1. Create pixel at: https://business.facebook.com
2. Add to `.env.production`: `FACEBOOK_PIXEL_ID=your-pixel-id`

---

## 5. Content & Pages

### Footer Menu:
Update footer links in `.env.production`:
```bash
FOOTER_MENU_LINKS=about-us,contact,privacy-policy,terms,disclaimer
```

Make sure these pages exist in WordPress or create them as Next.js pages.

### WordPress Setup:
1. ✅ Install WPGraphQL plugin
2. ✅ Configure GraphQL endpoint: `https://yourdomain.com/graphql`
3. ✅ Enable CORS for your Next.js domain
4. ✅ Set up categories and create content

---

## 6. Performance Optimization

### Image Optimization:
- All images should be in WebP format when possible
- Use Next.js `<Image>` component (already implemented)
- Set quality in `.env.production`: `IMAGE_QUALITY=85`

### Caching:
- Set revalidation time: `REVALIDATE_SECONDS=300` (5 minutes)
- Increase for less frequent updates, decrease for real-time content

---

## 7. Build & Deploy

### Test Build Locally:
```bash
npm run build
npm run start
```

Visit `http://localhost:3000` and test:
- ✅ All pages load
- ✅ Images display correctly
- ✅ Logo appears
- ✅ Social links work
- ✅ Mobile navigation sticky works
- ✅ No console errors

### Deploy to Vercel (Recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add environment variables in Vercel dashboard under:
Settings → Environment Variables

### Deploy to Other Platforms:
- **Netlify**: Connect repo, set build command: `npm run build`
- **AWS/DigitalOcean**: Use PM2 or Docker
- **cPanel**: Build locally, upload `.next` folder

---

## 8. Post-Deployment Verification

### Test Everything:
- [ ] Homepage loads
- [ ] Articles display correctly
- [ ] Categories work
- [ ] Search functions
- [ ] Mobile responsive
- [ ] Logo appears
- [ ] Social links work
- [ ] Google Analytics tracking
- [ ] Site map: `yourdomain.com/sitemap.xml`
- [ ] RSS feed: `yourdomain.com/feed.xml`
- [ ] robots.txt: `yourdomain.com/robots.txt`

### Submit to Search Engines:
1. **Google**: Submit sitemap in Search Console
2. **Bing**: https://www.bing.com/webmasters
3. **Yandex** (if targeting Russia): https://webmaster.yandex.com

---

## 9. Security Checklist

- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up CORS on WordPress
- [ ] Remove development environment variables
- [ ] Don't commit `.env.production` to Git
- [ ] Enable rate limiting on API routes

---

## 10. Ongoing Maintenance

### Regular Updates:
```bash
# Update dependencies monthly
npm update

# Check for security issues
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring:
- Set up Google Analytics alerts
- Monitor Core Web Vitals in Search Console
- Check error logs regularly
- Test mobile performance weekly

---

## Quick Start Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

---

## Environment Variables Quick Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | Your domain | `https://yoursite.com` |
| `SITE_NAME` | Site name | `YourNews` |
| `WP_GRAPHQL_ENDPOINT` | WordPress API | `https://wp.yoursite.com/graphql` |
| `NEXT_PUBLIC_SITE_LOGO` | Logo path | `/images/logo.png` |
| `GOOGLE_ANALYTICS_ID` | Analytics ID | `G-XXXXXXXXXX` |
| `SOCIAL_FACEBOOK` | Facebook URL | `https://facebook.com/yourpage` |
| `CONTACT_EMAIL` | Contact email | `contact@yoursite.com` |

---

## Troubleshooting

### Build Errors:
- Check all environment variables are set
- Verify WordPress GraphQL endpoint is accessible
- Clear `.next` folder: `rm -rf .next`

### Images Not Loading:
- Check image paths in `/public`
- Verify WordPress media URLs are accessible
- Check CORS settings on WordPress

### Sticky Nav Not Working:
- Clear browser cache
- Test on actual mobile device
- Check JavaScript console for errors

---

## Support & Resources

- Next.js Docs: https://nextjs.org/docs
- Vercel Deployment: https://vercel.com/docs
- WPGraphQL: https://www.wpgraphql.com

---

**Last Updated:** November 2025
