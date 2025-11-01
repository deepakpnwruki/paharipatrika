# Google AdSense ads.txt Implementation

## Overview
Your site now has an `ads.txt` file at `https://paharipatrika.in/ads.txt` to prevent ad fraud and unauthorized inventory sales.

## What is ads.txt?

**ads.txt** (Authorized Digital Sellers) is an IAB Tech Lab initiative that helps prevent ad fraud by allowing publishers to publicly declare which companies are authorized to sell their ad inventory.

### Benefits:
- ✅ **Prevents ad fraud**: Stops unauthorized sellers from selling your ad space
- ✅ **Increases revenue**: Advertisers pay more for verified inventory
- ✅ **Google requirement**: Required for AdSense approval and optimal performance
- ✅ **Brand protection**: Protects your site's reputation

## Current Configuration

### Your ads.txt File
```
# Google AdSense
google.com, pub-7262174488893520, DIRECT, f08c47fec0942fa0
```

**Location**: `/public/ads.txt`
**URL**: `https://paharipatrika.in/ads.txt`

### Format Explanation
```
<DOMAIN>, <PUBLISHER_ID>, <RELATIONSHIP>, <CERTIFICATION_AUTHORITY_ID>
```

- **DOMAIN**: `google.com` - The ad system domain
- **PUBLISHER_ID**: `pub-7262174488893520` - Your AdSense publisher ID
- **RELATIONSHIP**: `DIRECT` - Direct business relationship
- **CERTIFICATION_AUTHORITY_ID**: `f08c47fec0942fa0` - Google's TAG ID

## Verification Steps

### 1. Check File Accessibility
After deployment, verify your ads.txt is accessible:

```bash
# Using curl
curl https://paharipatrika.in/ads.txt

# Using browser
# Visit: https://paharipatrika.in/ads.txt
```

Expected response:
```
# ads.txt file for Pahari Patrika
google.com, pub-7262174488893520, DIRECT, f08c47fec0942fa0
```

### 2. Google AdSense Verification

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Navigate to **Settings** → **Account** → **Account information**
3. Check **ads.txt** status - should show "Authorized"
4. If issues found, click "Fix now" and follow instructions

### 3. ads.txt Validator

Use [ads.txt validator](https://adstxt.guru/) to check your file:
1. Enter URL: `https://paharipatrika.in/ads.txt`
2. Click "Validate"
3. Ensure all entries are valid

## Common Issues & Solutions

### Issue 1: ads.txt Not Found (404 Error)
**Problem**: File returns 404 error
**Solutions**:
- ✅ Ensure file is in `/public/ads.txt`
- ✅ Deploy to production (file only works after deployment)
- ✅ Check file name is exactly `ads.txt` (lowercase, no `.txt.txt`)
- ✅ Clear CDN cache if using one

### Issue 2: Wrong Content-Type
**Problem**: File served with wrong MIME type
**Next.js automatically serves `.txt` files with correct `text/plain` type ✅**

### Issue 3: AdSense Shows "ads.txt file has problems"
**Solutions**:
1. Wait 24-48 hours after publishing (Google crawls periodically)
2. Check publisher ID matches exactly: `pub-7262174488893520`
3. Ensure no extra spaces or hidden characters
4. Verify file is at root domain (not subdomain)

### Issue 4: Multiple Publisher IDs
**Problem**: You have multiple AdSense accounts
**Solution**: Add all your publisher IDs:
```
google.com, pub-7262174488893520, DIRECT, f08c47fec0942fa0
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

## Adding More Ad Networks

### Format for Additional Networks

When you add more ad networks (like Ezoic, Media.net, etc.), add them to ads.txt:

```txt
# Google AdSense
google.com, pub-7262174488893520, DIRECT, f08c47fec0942fa0

# Ezoic (example)
ezoic.com, 123456, DIRECT

# Media.net (example)
media.net, 8CU123456, DIRECT
```

### Common Ad Networks

```txt
# Google AdSense
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0

# Google Ad Manager
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0

# Ezoic
ezoic.com, XXXXXX, DIRECT

# Media.net
media.net, XXXXXXXX, DIRECT

# Taboola
taboola.com, XXXXXXXXXXXX, DIRECT, f08c47fec0942fa0

# Outbrain
outbrain.com, XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0

# Amazon Publisher Services
aps.amazon.com, XXXX-XXXX-XXXX, DIRECT

# Index Exchange
indexexchange.com, XXXXX, DIRECT

# OpenX
openx.com, XXXXXXXXX, DIRECT, 6a698e2ec38604c6

# PubMatic
pubmatic.com, XXXXXX, DIRECT, 5d62403b186f2ace

# Rubicon Project (Magnite)
rubiconproject.com, XXXXX, DIRECT, 0bfd66d529a55807
```

## Best Practices

### 1. Keep File Updated
- ✅ Update when adding new ad networks
- ✅ Remove entries when stopping partnerships
- ✅ Verify entries annually

### 2. Use DIRECT Relationships
- Only use `DIRECT` for networks you have direct accounts with
- Use `RESELLER` if another company sells on your behalf

### 3. Monitor Regularly
- Check AdSense dashboard monthly
- Use [ads.txt crawler](https://adstxt.guru/) quarterly
- Watch for fraud alerts

### 4. Backup File
Keep a backup of your ads.txt in case you need to restore it

## Security Considerations

### File Permissions
- ✅ File should be publicly readable
- ✅ No authentication required
- ✅ Served over HTTPS (your site uses HTTPS ✅)

### Content Security
- ✅ Only add verified publisher IDs
- ✅ Never share your publisher ID publicly outside ads.txt
- ✅ Regularly audit entries

## Testing in Development

### Local Testing
Your ads.txt file will be accessible at:
- **Development**: `http://localhost:3000/ads.txt`
- **Production**: `https://paharipatrika.in/ads.txt`

```bash
# Test locally (after npm run dev)
curl http://localhost:3000/ads.txt

# Test production (after deployment)
curl https://paharipatrika.in/ads.txt
```

## Integration with Next.js

### How It Works
Next.js automatically serves static files from the `/public` directory:

```
/public/ads.txt  →  https://paharipatrika.in/ads.txt
/public/robots.txt  →  https://paharipatrika.in/robots.txt
/public/favicon.ico  →  https://paharipatrika.in/favicon.ico
```

### No Configuration Needed
- ✅ No routing setup required
- ✅ Automatically served with correct MIME type
- ✅ Works immediately after deployment

## Google AdSense Setup Checklist

### Pre-Approval
- [x] ads.txt file created
- [x] AdSense code added to site (layout.tsx)
- [x] Site has original content
- [x] Site follows Google policies
- [ ] Submit for AdSense review

### Post-Approval
- [ ] Verify ads.txt in AdSense dashboard
- [ ] Configure ad units
- [ ] Place ads in content (already done ✅)
- [ ] Monitor earnings and performance

## Monitoring & Maintenance

### Weekly
- Check AdSense dashboard for alerts
- Verify ads are showing correctly

### Monthly
- Review ads.txt status in AdSense
- Check for unauthorized sellers
- Verify all entries are current

### Quarterly
- Run ads.txt validator
- Audit all ad network partnerships
- Update file if networks change

## Advanced Configuration

### Multiple Domains
If you have multiple domains, each needs its own ads.txt:
```
paharipatrika.in/ads.txt
cms.paharipatrika.in/ads.txt (if showing ads on CMS)
```

### Subdomains
Google recommends placing ads.txt on the root domain only:
- ✅ `https://paharipatrika.in/ads.txt`
- ❌ `https://www.paharipatrika.in/ads.txt` (not needed if www redirects to non-www)

### CDN Considerations
If using a CDN (Cloudflare, etc.):
- Ensure ads.txt is not blocked
- Set cache headers appropriately
- Clear CDN cache after updates

## Resources

### Official Documentation
- [IAB ads.txt Specification](https://iabtechlab.com/ads-txt/)
- [Google AdSense ads.txt Guide](https://support.google.com/adsense/answer/7532444)
- [Google Ad Manager ads.txt](https://support.google.com/admanager/answer/7441288)

### Validation Tools
- [ads.txt Guru](https://adstxt.guru/)
- [ads.txt Validator by Google](https://adstxt.adnami.io/)
- [IAB ads.txt Crawler](https://iabtechlab.com/ads-txt/)

### Support
- [Google AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Community](https://support.google.com/adsense/community)

## Troubleshooting Commands

```bash
# Check if file exists
ls -la public/ads.txt

# View file content
cat public/ads.txt

# Test file accessibility (local)
curl http://localhost:3000/ads.txt

# Test file accessibility (production)
curl -I https://paharipatrika.in/ads.txt

# Check HTTP headers
curl -I https://paharipatrika.in/ads.txt | grep -i content-type

# Validate content
curl -s https://paharipatrika.in/ads.txt | grep "pub-7262174488893520"
```

## Expected Output

When you visit `https://paharipatrika.in/ads.txt`, you should see:

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Cache-Control: public, max-age=0, must-revalidate

# ads.txt file for Pahari Patrika
# Learn more: https://support.google.com/adsense/answer/7532444

# Google AdSense
google.com, pub-7262174488893520, DIRECT, f08c47fec0942fa0
```

## Summary

✅ **File Created**: `/public/ads.txt`
✅ **Your Publisher ID**: `pub-7262174488893520`
✅ **Relationship**: DIRECT (you own the account)
✅ **Google Certification**: f08c47fec0942fa0 (valid)

### Next Steps:
1. **Deploy to production**
2. **Verify file is accessible** at `https://paharipatrika.in/ads.txt`
3. **Check AdSense dashboard** (Settings → Account → ads.txt)
4. **Wait 24-48 hours** for Google to crawl the file
5. **Monitor for issues** in AdSense dashboard

---

**Status**: ✅ Implementation Complete
**Last Updated**: 2 November 2025
**File URL**: `https://paharipatrika.in/ads.txt`
