/**
 * GraphQL Performance Test Script
 * Tests your WordPress GraphQL endpoint performance
 * 
 * Usage: node scripts/test-graphql-performance.js
 */

const endpoint = process.env.WP_GRAPHQL_ENDPOINT || 'https://cms.paharipatrika.in/graphql';

// Test queries
const queries = {
  'Homepage Posts': {
    query: `query HomepagePosts {
      posts(first: 10, where: {orderby: {field: DATE, order: DESC}}) {
        nodes {
          id
          title
          slug
          date
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }`
  },
  'Single Post': {
    query: `query SinglePost {
      post(id: "cG9zdDoxNzk5", idType: ID) {
        id
        title
        content
        date
        author {
          node {
            name
            slug
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }`
  },
  'Categories': {
    query: `query Categories {
      categories(first: 20, where: {hideEmpty: true}) {
        nodes {
          id
          name
          slug
          count
        }
      }
    }`
  },
  'Related Posts': {
    query: `query RelatedPosts {
      posts(first: 12, where: {orderby: {field: DATE, order: DESC}}) {
        nodes {
          id
          title
          slug
          excerpt
          date
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }`
  }
};

async function testQuery(name, { query, variables = {} }) {
  const results = [];
  
  console.log(`\n🔍 Testing: ${name}`);
  console.log('─'.repeat(50));
  
  // Run 5 tests to get average
  for (let i = 1; i <= 5; i++) {
    const start = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });
      
      const duration = Date.now() - start;
      
      if (!response.ok) {
        console.log(`  ${i}. ❌ HTTP ${response.status} - ${duration}ms`);
        continue;
      }
      
      const json = await response.json();
      
      if (json.errors) {
        console.log(`  ${i}. ❌ GraphQL Error - ${duration}ms`);
        console.log(`     ${json.errors[0]?.message || 'Unknown error'}`);
        continue;
      }
      
      results.push(duration);
      
      // Status indicator
      const status = duration > 1000 ? '🐌' : duration > 500 ? '⚠️ ' : '✅';
      console.log(`  ${i}. ${status} ${duration}ms`);
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 500));
      
    } catch (error) {
      console.log(`  ${i}. ❌ Network Error: ${error.message}`);
    }
  }
  
  if (results.length > 0) {
    const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
    const min = Math.min(...results);
    const max = Math.max(...results);
    
    console.log('\n📊 Results:');
    console.log(`   Average: ${avg}ms`);
    console.log(`   Min: ${min}ms | Max: ${max}ms`);
    
    // Recommendations
    if (avg > 1000) {
      console.log('\n⚠️  SLOW: Consider Redis caching & query optimization');
    } else if (avg > 500) {
      console.log('\n💡 MODERATE: Redis caching would help');
    } else {
      console.log('\n✅ FAST: Performance is good!');
    }
  } else {
    console.log('\n❌ All tests failed!');
  }
  
  return results;
}

async function runTests() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║   WordPress GraphQL Performance Test             ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log(`\nEndpoint: ${endpoint}`);
  console.log(`Testing ${Object.keys(queries).length} queries with 5 runs each...\n`);
  
  const allResults = {};
  
  for (const [name, config] of Object.entries(queries)) {
    const results = await testQuery(name, config);
    if (results.length > 0) {
      allResults[name] = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
    }
  }
  
  // Summary
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   SUMMARY                                         ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  
  const entries = Object.entries(allResults);
  if (entries.length > 0) {
    entries.forEach(([name, avg]) => {
      const status = avg > 1000 ? '🐌' : avg > 500 ? '⚠️ ' : '✅';
      console.log(`  ${status} ${name.padEnd(20)} ${avg}ms`);
    });
    
    const overallAvg = Math.round(entries.reduce((sum, [, avg]) => sum + avg, 0) / entries.length);
    console.log('\n' + '─'.repeat(50));
    console.log(`  Overall Average: ${overallAvg}ms\n`);
    
    // Final recommendation
    console.log('💡 Recommendations:');
    if (overallAvg > 1000) {
      console.log('  • URGENT: Install Redis caching');
      console.log('  • Optimize WordPress database (remove revisions, spam)');
      console.log('  • Consider upgrading server resources');
    } else if (overallAvg > 500) {
      console.log('  • Install Redis caching for better performance');
      console.log('  • Current ISR strategy (60-600s) is working well');
    } else {
      console.log('  • Performance is excellent!');
      console.log('  • Redis would provide marginal improvements');
      console.log('  • Focus on Next.js ISR optimization instead');
    }
  } else {
    console.log('  ❌ No successful tests. Check your endpoint configuration.');
  }
  
  console.log('\n');
}

runTests().catch(console.error);
