# Google AdSense Integration Guide

This project includes Google AdSense integration for monetizing your content with strategically placed ads.

## Ad Placements

### 1. **In-Article Ads (300x250)**
- Automatically inserted every 2 paragraphs within article content
- Medium rectangle format for better visibility
- Non-intrusive placement between content

### 2. **After Share Section (300x50)**
- Horizontal banner ad placed after social share buttons
- Compact size that doesn't disrupt user flow
- Good for mobile responsiveness

### 3. **After Related Articles (300x250)**
- Medium rectangle ad shown after the related articles section
- Catches readers before they leave the page
- High engagement placement

## Setup Instructions

### Step 1: Get Your AdSense Account Ready

1. Sign up for [Google AdSense](https://www.google.com/adsense/)
2. Get your site approved by AdSense
3. Note your **AdSense Client ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 2: Create Ad Units

In your AdSense dashboard, create 3 ad units:

1. **In-Article Ad** (300x250 - Display ads)
   - Type: Display ads
   - Size: 300x250 (Medium Rectangle)
   - Name: "In-Article Ad"

2. **After Share Ad** (300x50 - Display ads)
   - Type: Display ads
   - Size: 300x50 (Mobile Banner) or set to responsive
   - Name: "After Share Banner"

3. **After Related Articles** (300x250 - Display ads)
   - Type: Display ads
   - Size: 300x250 (Medium Rectangle)
   - Name: "After Related Articles"

### Step 3: Configure Environment Variables

Add these to your `.env.local` (development) or `.env.production` (production):

```bash
# Your AdSense Client ID (found in AdSense dashboard)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# Ad Slot IDs (get these when creating each ad unit)
NEXT_PUBLIC_ADSENSE_IN_ARTICLE_SLOT=1234567890
NEXT_PUBLIC_ADSENSE_AFTER_SHARE_SLOT=1234567891
NEXT_PUBLIC_ADSENSE_AFTER_RELATED_SLOT=1234567892
```

**To find your Ad Slot IDs:**
1. Go to AdSense > Ads > Overview
2. Click on the ad unit you created
3. Click "Get code"
4. Find the `data-ad-slot="XXXXXXXXXX"` value
5. Copy the number (without quotes)

### Step 4: Verify Installation

1. Build and run your site:
```bash
npm run build
npm run start
```

2. Open an article page
3. Open browser DevTools > Console
4. Look for AdSense debug messages
5. Ads may show as blank spaces initially (this is normal during testing)

### Step 5: Test Ads

**Important:** Don't click your own ads! This can get your account banned.

- Ads may take **48 hours** to start showing after initial setup
- Test ads will show blank spaces or "Advertisement" labels
- Use AdSense "Ad Review Center" to preview how ads look
- Check mobile responsiveness

## How It Works

### In-Article Ads
The `ArticleContentWithAds` component automatically:
1. Parses your article HTML content
2. Identifies paragraph (`<p>`) tags
3. Inserts ad placeholders after every 2 paragraphs
4. Dynamically loads AdSense ads into these placeholders

### Other Ads
Static ad components are placed:
- After the share buttons section
- After the related articles section

## Files Modified

- `components/AdSense.tsx` - Base AdSense component
- `components/InArticleAd.tsx` - Styled ad wrapper component
- `components/ArticleContentWithAds.tsx` - Client component for in-content ads
- `app/[...slug]/page.tsx` - Article page with ad placements
- `app/[...slug]/article.css` - Ad styling
- `app/layout.tsx` - AdSense script loader

## Styling

Ads are styled with a dark theme to match your site:
- Background: `#0a0a0a`
- Border: `1px solid #222`
- Label: "Advertisement" in uppercase
- Responsive sizing for mobile

## Troubleshooting

### Ads Not Showing?
1. ✅ Verify environment variables are set correctly
2. ✅ Check AdSense account is approved
3. ✅ Wait 48 hours after initial setup
4. ✅ Ensure ad slots are active in AdSense dashboard
5. ✅ Check browser console for errors
6. ✅ Verify site has sufficient content (AdSense requires quality content)

### Blank Ad Spaces?
- This is normal during development
- AdSense doesn't serve real ads to localhost
- Deploy to production to see real ads

### Console Errors?
- Check that Client ID starts with `ca-pub-`
- Verify ad slot IDs are numbers only
- Make sure AdSense script is loading (check Network tab)

## Best Practices

1. **Don't overdo it**: Current placement is balanced for UX
2. **Monitor performance**: Check AdSense dashboard regularly
3. **Respect users**: Ads are styled to be non-intrusive
4. **Follow policies**: Read [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
5. **Test regularly**: Check on different devices and browsers

## Custom Ad Slots

To add more ad positions, create a new ad unit in AdSense, then:

```tsx
<InArticleAd 
  slot={process.env.NEXT_PUBLIC_ADSENSE_YOUR_SLOT || ''} 
  size="300x250"  // or "300x50"
  className="your-custom-class"
/>
```

## Revenue Optimization Tips

1. **Quality content**: More engaging content = more ad views
2. **Page speed**: Faster pages = better ad performance
3. **Mobile first**: Ensure ads look good on mobile
4. **Strategic placement**: Current placements are optimized
5. **A/B testing**: Try different ad formats in AdSense dashboard

## Support

- [AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Community](https://support.google.com/adsense/community)
- [Policy Questions](https://support.google.com/adsense/answer/48182)

---

**Remember:** Never click your own ads. Use "Ad Review Center" in AdSense to preview.
