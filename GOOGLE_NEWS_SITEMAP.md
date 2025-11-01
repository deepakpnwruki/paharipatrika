# Google News Sitemap Implementation

## Overview
Your site now has a Google News compliant sitemap at `/news-sitemap.xml` that follows the latest Google News guidelines (2024/2025).

## Features Implemented

### ✅ Latest Google News Guidelines (2024/2025)
- **48-hour window**: Only includes articles from last 2 days
- **Maximum 1000 URLs**: Automatically limited by query
- **Required fields**: Publication name, language, date, title
- **Keywords**: Up to 10 keywords per article from categories and tags
- **Language tag**: `hi` for Hindi content
- **Proper XML escaping**: All special characters handled
- **Auto-refresh**: Updates every 10 minutes

### ✅ Technical Implementation
```typescript
// News sitemap endpoint
/news-sitemap.xml

// Sitemap index (groups all sitemaps)
/sitemap-index.xml

// Main sitemap (all content)
/sitemap.xml
```

## Sitemap Structure

### News Sitemap Format
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://paharipatrika.in/article-url</loc>
    <news:news>
      <news:publication>
        <news:name>Pahari Patrika</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>2025-11-02T10:30:00+00:00</news:publication_date>
      <news:title>Article Title</news:title>
      <news:keywords>keyword1, keyword2, keyword3</news:keywords>
    </news:news>
  </url>
</urlset>
```

## Keywords Strategy

### How Keywords are Generated
1. **Categories** (first priority): Up to 3 category names
2. **Tags** (second priority): Remaining slots filled with tags
3. **Maximum 10 keywords**: Google News limit
4. **Source**: WordPress categories and tags from your posts

Example:
- Post Categories: "Tech", "Uttarakhand"
- Post Tags: "smartphones", "iqoo", "review", "price"
- Keywords: "Tech, Uttarakhand, smartphones, iqoo, review, price"

## Google News Publisher Center Setup

### Step 1: Submit to Google News
1. Go to [Google News Publisher Center](https://publishercenter.google.com/)
2. Click "Add Publication"
3. Enter your site URL: `https://paharipatrika.in`
4. Upload your logo (192x192px minimum)

### Step 2: Verify Ownership
Choose one method:
- **HTML file upload** (easiest)
- **Meta tag** (add to layout.tsx)
- **Google Analytics** (if already set up)
- **Google Tag Manager**

### Step 3: Submit Sitemap
1. In Publisher Center, go to "Publication settings"
2. Under "Sitemaps", add:
   ```
   https://paharipatrika.in/news-sitemap.xml
   ```
3. Click "Submit"

### Step 4: Configure Settings
- **Language**: Hindi (hi)
- **Country**: India
- **Content type**: News
- **Update frequency**: Multiple times per day
- **RSS feed** (optional): `https://paharipatrika.in/feed.xml`

## Google Search Console Setup

### Add News Sitemap
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Navigate to "Sitemaps" in left sidebar
4. Add both sitemaps:
   ```
   https://paharipatrika.in/sitemap-index.xml
   https://paharipatrika.in/news-sitemap.xml
   ```
5. Click "Submit"

### Monitor Performance
Check these sections:
- **Coverage**: Should show all recent articles indexed
- **Enhancements**: Check for any issues
- **Performance**: Track clicks and impressions from Google News

## robots.txt Configuration

Your robots.txt now includes both sitemaps:
```
Sitemap: https://paharipatrika.in/sitemap.xml
Sitemap: https://paharipatrika.in/news-sitemap.xml
```

## Verification & Testing

### 1. Test Sitemap Locally
```bash
# Start development server
npm run dev

# Visit in browser
http://localhost:3000/news-sitemap.xml
```

### 2. Test Sitemap in Production
```bash
# After deployment, check:
https://paharipatrika.in/news-sitemap.xml
```

### 3. Validate XML
Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- Paste your sitemap URL
- Check for XML errors
- Verify all URLs are valid

### 4. Check Google News Guidelines
- **48-hour content**: ✅ Only last 2 days
- **Title length**: Keep under 110 characters
- **Publication name**: ✅ "Pahari Patrika"
- **Language tag**: ✅ "hi"
- **Keywords**: ✅ Up to 10 per article

## Best Practices for Google News

### Content Guidelines
1. **Publish frequency**: Multiple articles per day
2. **Original content**: No duplicate content
3. **Timeliness**: News should be current (within 48 hours)
4. **Quality**: Well-written, factual reporting
5. **Transparency**: Clear author attribution (already implemented)

### Technical Guidelines
1. **Fast loading**: Your ISR setup ensures this ✅
2. **Mobile-friendly**: Responsive design ✅
3. **HTTPS**: Required (your site uses HTTPS) ✅
4. **Structured data**: NewsArticle schema implemented ✅
5. **Author info**: E-E-A-T compliant ✅

### SEO Optimization
1. **Keywords in titles**: Natural keyword usage
2. **Meta descriptions**: Clear and compelling
3. **Image alt text**: Descriptive alt attributes
4. **Internal linking**: Link to related articles
5. **Categories**: Proper categorization (Tech, Sports, etc.)

## Monitoring & Maintenance

### Daily Checks
- [ ] New articles appear in news sitemap
- [ ] Keywords are being generated correctly
- [ ] No XML errors

### Weekly Checks
- [ ] Google Search Console: Check indexing status
- [ ] Google News Publisher Center: Review traffic
- [ ] Monitor for any sitemap errors

### Monthly Optimization
- [ ] Review keyword performance
- [ ] Update categories/tags strategy
- [ ] Analyze which articles perform best in Google News
- [ ] Adjust content strategy based on data

## Troubleshooting

### Sitemap Not Showing Articles
**Issue**: News sitemap is empty or has few articles
**Solution**: 
- Check if posts are published in last 48 hours
- Verify WordPress date query in GraphQL
- Check console for errors: `npm run dev`

### Keywords Not Appearing
**Issue**: No keywords in sitemap
**Solution**:
- Ensure posts have categories and tags in WordPress
- Check that categories/tags are published
- Verify GraphQL query includes categories/tags

### XML Validation Errors
**Issue**: XML parser errors
**Solution**:
- Check for special characters in titles (handled by escapeXml)
- Ensure all URLs are valid
- Verify date format is ISO 8601

### Not Indexed by Google News
**Issue**: Articles not appearing in Google News search
**Solution**:
- Wait 24-48 hours after submission
- Verify site is approved in Publisher Center
- Check content meets Google News guidelines
- Ensure articles are timely (breaking news)

## Performance Notes

### Caching Strategy
```typescript
// News sitemap refreshes every 10 minutes
export const revalidate = 600;

// Main sitemap refreshes every hour
export const revalidate = 3600;
```

### Database Performance
- Query limited to 1000 recent posts
- Date filter reduces database load
- Cached for 10 minutes to reduce GraphQL calls

### Expected Response Times
- News sitemap generation: ~500-700ms
- Cached response: <50ms
- Total size: ~50-200KB (depending on article count)

## Additional Resources

- [Google News Publisher Center Help](https://support.google.com/news/publisher-center/)
- [Google News Sitemap Guidelines](https://support.google.com/news/publisher-center/answer/9606710)
- [News Sitemap XML Format](https://support.google.com/webmasters/answer/9606710)
- [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)

## Next Steps

1. ✅ **Deploy to production**
2. ⏳ **Submit to Google News Publisher Center**
3. ⏳ **Add sitemap to Google Search Console**
4. ⏳ **Wait 24-48 hours for indexing**
5. ⏳ **Monitor performance and adjust**

---

**Status**: ✅ Implementation Complete
**Last Updated**: 2 November 2025
**Sitemap URLs**: 
- Main: `https://paharipatrika.in/sitemap.xml`
- News: `https://paharipatrika.in/news-sitemap.xml`
- Index: `https://paharipatrika.in/sitemap-index.xml`
