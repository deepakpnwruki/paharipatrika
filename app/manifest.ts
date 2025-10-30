import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'EduNews',
    short_name: 'EduNews',
    description: 'Latest Hindi news, breaking news in Hindi',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#b80000',
    orientation: 'portrait',
    categories: ['news', 'education'],
    lang: 'hi',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}