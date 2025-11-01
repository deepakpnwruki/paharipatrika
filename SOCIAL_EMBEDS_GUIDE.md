# Social Media Embeds Guide

## Overview
Your website now supports automatic embedding of YouTube videos and Twitter/X posts within articles. The embeds are automatically processed and styled for a consistent look.

## Supported Platforms

### 1. YouTube Videos
- Regular YouTube videos (youtube.com/watch)
- YouTube Shorts (youtube.com/shorts)
- Shortened URLs (youtu.be)

### 2. Twitter/X Posts
- Twitter.com links
- X.com links
- Automatically styled with dark theme

### 3. Other Embeds
- Generic iframes are automatically styled
- Instagram embeds (if WordPress supports them)

## How to Add Embeds in WordPress

### YouTube Videos

1. **Using the YouTube Block (Recommended)**
   - In WordPress editor, click the "+" button
   - Search for "YouTube"
   - Select the "YouTube" block
   - Paste your YouTube URL
   - Example URLs that work:
     - `https://www.youtube.com/watch?v=VIDEO_ID`
     - `https://youtu.be/VIDEO_ID`
     - `https://www.youtube.com/shorts/VIDEO_ID`

2. **Using Embed Block**
   - Click "+" → Search "Embed"
   - Select "Embed" block
   - Paste YouTube URL
   - WordPress will automatically detect it as YouTube

### Twitter/X Posts

1. **Using the Twitter/X Block**
   - In WordPress editor, click "+"
   - Search for "Twitter" or "X"
   - Select the Twitter/X block
   - Paste your tweet URL
   - Example: `https://twitter.com/username/status/1234567890`
   - Or: `https://x.com/username/status/1234567890`

2. **Using Embed Block**
   - Click "+" → "Embed"
   - Paste tweet URL
   - WordPress auto-detects as Twitter

## How It Works

### Technical Implementation

1. **SocialEmbeds Component**
   - Loads Twitter/X widget script
   - Enables Twitter card rendering
   - Runs on client-side only

2. **EmbedProcessor Component**
   - Automatically converts YouTube URLs to video players
   - Converts Twitter URLs to embedded tweets
   - Styles all iframes consistently
   - Processes embeds after page load

3. **Automatic Processing**
   - Detects `.wp-block-embed-youtube` blocks
   - Extracts video ID from URL
   - Creates responsive iframe embed
   - Detects `.wp-block-embed-twitter` blocks
   - Creates Twitter blockquote
   - Loads Twitter widget to render tweet

## Styling

### YouTube Videos
- Full-width responsive
- 400px height on desktop
- 280px height on mobile
- 8px border-radius for modern look
- Centered in content

### Twitter/X Posts
- Maximum width: 550px
- Centered alignment
- Dark theme applied
- Responsive sizing

### Spacing
- 40px margin on desktop
- 32px margin on mobile
- Consistent spacing with other content

## Customization

### Change YouTube Player Height
Edit `/app/[...slug]/article.css`:

```css
.wp-block-embed-youtube iframe {
  height: 500px; /* Change from 400px */
}
```

### Change Twitter Theme
Edit `/components/EmbedProcessor.tsx`:

```tsx
blockquote.setAttribute('data-theme', 'light'); // Change from 'dark'
```

### Adjust Embed Width
Edit `/app/[...slug]/article.css`:

```css
.wp-block-embed-youtube {
  max-width: 800px; /* Change from 100% */
}
```

## Troubleshooting

### YouTube video not showing
1. Check if URL is valid YouTube link
2. Verify video is not private/restricted
3. Check browser console for errors
4. Ensure video ID is correctly extracted

### Twitter post not loading
1. Check if tweet URL is valid
2. Verify tweet is not deleted
3. Check if Twitter widget script loaded
4. Look for network errors in console

### Embeds not responsive on mobile
1. Clear browser cache
2. Check CSS is loaded properly
3. Verify viewport meta tag in layout

## Best Practices

### Performance
- Embeds load after initial page render
- Twitter script loads asynchronously
- No impact on page load speed

### SEO
- YouTube embeds include proper alt text
- Twitter embeds maintain original link
- Search engines can still crawl links

### Accessibility
- Iframes include proper attributes
- Allow fullscreen for YouTube
- Keyboard navigation supported

## Examples

### Example Article with Embeds

```html
<!-- WordPress will output something like this -->
<figure class="wp-block-embed-youtube">
  <div class="wp-block-embed__wrapper">
    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Video Link</a>
  </div>
</figure>
```

This automatically becomes:

```html
<figure class="wp-block-embed-youtube">
  <div class="wp-block-embed__wrapper">
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" ...></iframe>
  </div>
</figure>
```

## WordPress Setup Requirements

### YouTube Embeds
- No special setup needed
- Works with default WordPress

### Twitter Embeds
- No authentication required
- Twitter widget loads automatically
- Works with public tweets only

## Additional Features

### Supported URL Patterns

**YouTube:**
- `youtube.com/watch?v=VIDEO_ID`
- `youtu.be/VIDEO_ID`
- `youtube.com/embed/VIDEO_ID`
- `youtube.com/shorts/VIDEO_ID`

**Twitter/X:**
- `twitter.com/user/status/ID`
- `x.com/user/status/ID`

### Auto-styling Features
- Rounded corners (8px)
- Responsive width (100% max)
- Proper aspect ratios
- Dark theme for tweets
- Centered alignment

## Support

If embeds are not working:
1. Check WordPress embed settings (Settings → Media)
2. Verify oEmbed is enabled
3. Test with a different URL
4. Check browser console for JavaScript errors
5. Ensure Next.js is running in development or built for production

## Future Enhancements

Potential additions:
- Instagram embed support
- Facebook video embeds
- TikTok embeds
- Vimeo support
- Spotify embeds
- SoundCloud embeds

To request additional embed types, update `EmbedProcessor.tsx` with new platform detection and iframe generation logic.
