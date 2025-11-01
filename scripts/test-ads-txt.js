#!/usr/bin/env node
/**
 * Test ads.txt file
 * Verifies the ads.txt file is properly configured
 */

async function testAdsTxt() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const adsTxtUrl = `${baseUrl}/ads.txt`;
  
  console.log('🧪 Testing ads.txt file...\n');
  console.log(`URL: ${adsTxtUrl}\n`);
  
  try {
    const response = await fetch(adsTxtUrl);
    
    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
      console.log('\n💡 Tip: Make sure the server is running');
      return;
    }
    
    const content = await response.text();
    const contentType = response.headers.get('content-type');
    
    console.log('✅ ads.txt file is accessible!\n');
    
    // Validation checks
    const checks = {
      'Content-Type is text/plain': contentType?.includes('text/plain'),
      'Contains Google AdSense entry': content.includes('google.com'),
      'Has publisher ID': content.includes('pub-7262174488893520'),
      'Relationship is DIRECT': content.includes('DIRECT'),
      'Has Google TAG ID': content.includes('f08c47fec0942fa0'),
      'No trailing whitespace issues': !content.includes('  ,') && !content.includes(',  '),
    };
    
    console.log('📋 Validation Checks:');
    console.log('─'.repeat(50));
    
    let allPassed = true;
    Object.entries(checks).forEach(([check, passed]) => {
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${check}`);
      if (!passed) allPassed = false;
    });
    
    console.log('\n📄 File Content:');
    console.log('─'.repeat(50));
    console.log(content);
    console.log('─'.repeat(50));
    
    console.log(`\n📊 Statistics:`);
    console.log(`   File size: ${content.length} bytes`);
    console.log(`   Lines: ${content.split('\n').length}`);
    console.log(`   Ad entries: ${(content.match(/google\.com/g) || []).length}`);
    
    if (allPassed) {
      console.log('\n✅ All checks passed!');
      console.log('\n🎯 Next steps:');
      console.log('   1. Deploy to production');
      console.log('   2. Verify at: https://paharipatrika.in/ads.txt');
      console.log('   3. Check Google AdSense dashboard (Settings → Account)');
      console.log('   4. Wait 24-48 hours for Google to crawl the file');
    } else {
      console.log('\n⚠️  Some checks failed. Please review the file.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (baseUrl.includes('localhost')) {
      console.log('\n💡 Make sure dev server is running: npm run dev');
    }
  }
}

testAdsTxt();
