# EduNews - Headless WordPress News Platform

# Pahari Patrika - Headless WordPress News Platform

Modern, blazing-fast news platform built with Next.js 16 (App Router), TypeScript, and WordPress as a headless CMS. Features ISR (Incremental Static Regeneration), comprehensive SEO optimization, and social media embeds.

## ✨ Features

- 🚀 **Next.js 16** with Turbopack
- 📰 **Headless WordPress** via WPGraphQL
- 🎨 **Responsive Design** - Mobile-first approach
- 🖼️ **Image Optimization** - AVIF/WebP with next/image
- 🔍 **SEO Optimized** - OpenGraph, Twitter Cards, Schema.org
- 🌐 **i18n Ready** - Hindi localization support
- ⚡ **ISR** - Incremental Static Regeneration
- 🔒 **Security Hardened** - CSP, HSTS, and more
- 📱 **PWA Ready** - Progressive Web App capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- WordPress site with WPGraphQL plugin
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/paharipatrika-next.git
cd paharipatrika-next

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` file:

```env
# WordPress GraphQL Endpoint
WP_GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql
WORDPRESS_GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
SITE_NAME=Pahari Patrika
ORGANIZATION_NAME=Pahari Patrika Media
SITE_URL=https://your-domain.com

# Revalidation
REVALIDATE_SECONDS=300

# Optional: GraphQL Fetch Settings
WP_FETCH_TIMEOUT_MS=10000
WP_FETCH_RETRIES=1
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
edunews-next/
├── app/
│   ├── [...slug]/          # Dynamic catch-all routes
│   │   ├── page.tsx        # Main article/page component
│   │   ├── mobile-article.tsx
│   │   └── mobile-article.css
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   └── ShareButtons.tsx    # Social sharing
├── lib/
│   ├── graphql.ts          # GraphQL fetch utility
│   └── queries.ts          # GraphQL queries
├── public/                 # Static assets
├── .env.local             # Environment variables (git-ignored)
├── next.config.js         # Next.js configuration
└── tsconfig.json          # TypeScript configuration
```

## 🛠️ WordPress Setup

### Required Plugins

1. **WPGraphQL** - Core GraphQL API
2. **WPGraphQL for ACF** (optional) - Custom fields support

### Recommended WordPress Settings

- Permalink structure: Post name
- Enable CORS headers for GraphQL endpoint
- Configure featured images for all posts

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables on Vercel

Add all `.env.local` variables to Vercel project settings.

### Other Platforms

Works with any Node.js hosting:
- Netlify
- AWS Amplify
- Railway
- Render
- DigitalOcean App Platform

## 📊 Performance

- **Lighthouse Score**: 95+
- **ISR**: 5-minute revalidation (configurable)
- **Image Optimization**: Automatic AVIF/WebP
- **Bundle Size**: Optimized with tree-shaking

## 🔒 Security Features

- Content Security Policy (CSP)
- HSTS headers
- XSS protection
- CSRF protection
- Referrer policy
- Permissions policy

## 🌐 SEO Features

- Dynamic metadata generation
- OpenGraph tags (hi_IN locale)
- Twitter Cards
- Schema.org JSON-LD (NewsArticle)
- Canonical URLs
- Sitemap support
- Robots.txt

## 📱 Mobile Features

- Responsive design
- Touch-optimized UI
- Full-bleed images
- Compact layouts
- Native-like experience

## 🎨 Customization

### Styling

- CSS Modules
- Inline styles for dynamic content
- Mobile-first responsive design

### Theme

Edit colors, fonts, and layouts in component files.

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/paharipatrika-next/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/paharipatrika-next/discussions)

## 🙏 Acknowledgments

- Next.js team
- WordPress & WPGraphQL community
- All contributors

---

Built with ❤️ using Next.js & WordPress
