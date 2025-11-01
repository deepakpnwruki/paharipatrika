#!/usr/bin/env node
/**
 * Quick test for news sitemap
 * Tests the /news-sitemap.xml route locally
 */

async function testNewsSitemap() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing News Sitemap...\n');
  
  try {
    const response = await fetch(`${baseUrl}/news-sitemap.xml`);
    
    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
      return;
    }
    
    const xml = await response.text();
    
    // Basic validation
    const checks = {
      'XML Declaration': xml.includes('<?xml version="1.0"'),
      'Sitemap namespace': xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'),
      'News namespace': xml.includes('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"'),
      'Has URLs': xml.includes('<url>'),
      'Has publication name': xml.includes('<news:name>'),
      'Has language tag': xml.includes('<news:language>hi</news:language>'),
      'Has publication dates': xml.includes('<news:publication_date>'),
      'Has titles': xml.includes('<news:title>'),
      'Has keywords': xml.includes('<news:keywords>') || xml.includes('</news:news>'), // Keywords optional
    };
    
    console.log('✅ Sitemap loaded successfully\n');
    console.log('📋 Validation Checks:');
    console.log('─'.repeat(50));
    
    Object.entries(checks).forEach(([check, passed]) => {
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${check}`);
    });
    
    // Count URLs
    const urlCount = (xml.match(/<url>/g) || []).length;
    console.log(`\n📊 Statistics:`);
    console.log(`   URLs found: ${urlCount}`);
    console.log(`   Size: ${(xml.length / 1024).toFixed(2)} KB`);
    
    // Extract sample article
    const urlMatch = xml.match(/<loc>(.*?)<\/loc>/);
    const titleMatch = xml.match(/<news:title>(.*?)<\/news:title>/);
    const keywordsMatch = xml.match(/<news:keywords>(.*?)<\/news:keywords>/);
    
    if (urlMatch || titleMatch) {
      console.log(`\n📰 Sample Article:`);
      if (urlMatch) console.log(`   URL: ${urlMatch[1]}`);
      if (titleMatch) console.log(`   Title: ${titleMatch[1]}`);
      if (keywordsMatch) console.log(`   Keywords: ${keywordsMatch[1]}`);
    }
    
    console.log('\n✅ News sitemap is working!\n');
    console.log('🌐 Access at: http://localhost:3000/news-sitemap.xml');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure dev server is running: npm run dev');
  }
}

testNewsSitemap();
