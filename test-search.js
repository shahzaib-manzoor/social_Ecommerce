/**
 * Quick Search API Test Script
 *
 * Tests all three search modes to verify functionality
 * Run: node test-search.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api/v1';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSearch(query, mode = 'hybrid', category = null) {
  try {
    log(`\n🔍 Testing ${mode.toUpperCase()} search: "${query}"${category ? ` (Category: ${category})` : ''}`, 'cyan');

    const params = { q: query, mode };
    if (category) params.category = category;

    const response = await axios.get(`${API_BASE_URL}/search`, { params });

    if (response.data.success) {
      const { products, count } = response.data.data;
      log(`✅ Success! Found ${count} products`, 'green');

      if (count > 0) {
        log(`\nTop 3 Results:`, 'blue');
        products.slice(0, 3).forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.title} - $${product.price}`);
        });
      } else {
        log(`  No products found`, 'yellow');
      }

      return true;
    } else {
      log(`❌ Failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log(`❌ Connection Failed: Backend server is not running at ${API_BASE_URL}`, 'red');
      log(`   Please start the backend with: cd backend && npm run dev`, 'yellow');
    } else if (error.response) {
      log(`❌ API Error: ${error.response.data.error || error.message}`, 'red');
    } else {
      log(`❌ Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function runTests() {
  log('\n═══════════════════════════════════════════════════', 'blue');
  log('  🧪 Semantic Search API Test Suite', 'blue');
  log('═══════════════════════════════════════════════════\n', 'blue');

  const tests = [
    // Test 1: Hybrid search (default)
    { query: 'laptop', mode: 'hybrid', category: null },

    // Test 2: Semantic search (AI-powered)
    { query: 'fast computer', mode: 'semantic', category: null },

    // Test 3: Keyword search (traditional)
    { query: 'phone', mode: 'keyword', category: null },

    // Test 4: Category filter
    { query: 'laptop', mode: 'hybrid', category: 'Electronics' },

    // Test 5: Intent-based semantic search
    { query: 'warm clothes', mode: 'semantic', category: null },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testSearch(test.query, test.mode, test.category);
    if (result) {
      passed++;
    } else {
      failed++;
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  log('\n═══════════════════════════════════════════════════', 'blue');
  log(`  📊 Test Results: ${passed} passed, ${failed} failed`, 'blue');
  log('═══════════════════════════════════════════════════\n', 'blue');

  if (failed === 0) {
    log('🎉 All tests passed! Semantic search is working correctly.', 'green');
  } else if (passed > 0) {
    log('⚠️  Some tests failed. Check the errors above.', 'yellow');
    log('   Note: Semantic mode requires OpenAI API key in backend/.env', 'yellow');
  } else {
    log('❌ All tests failed. Please check if the backend is running.', 'red');
  }

  log('\n📝 Notes:', 'cyan');
  log('   • Hybrid mode (default) = Semantic + Keyword combined', 'cyan');
  log('   • Semantic mode = AI-powered (requires OpenAI key)', 'cyan');
  log('   • Keyword mode = Traditional text search (always works)', 'cyan');
  log('   • If semantic fails, it auto-falls back to keyword mode\n', 'cyan');
}

// Run the tests
runTests().catch(error => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
