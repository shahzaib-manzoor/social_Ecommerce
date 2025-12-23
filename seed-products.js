/**
 * Product Seeding Script for Semantic Search Testing
 *
 * Creates diverse products to test:
 * - Semantic search (intent-based)
 * - Keyword search (exact matching)
 * - Hybrid search (combined)
 * - Category filtering
 *
 * Run: node seed-products.js
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
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test products organized by category
const testProducts = [
  // Electronics - Laptops & Computers
  {
    title: "MacBook Pro 16 M3 Max",
    description: "High-performance laptop for professionals. Powerful M3 Max chip, 36GB RAM, perfect for video editing, 3D rendering, and software development. Lightning-fast processing speed.",
    price: 2999,
    category: "Electronics",
    tags: ["laptop", "apple", "macbook", "professional", "fast", "powerful", "computer"],
    images: ["https://via.placeholder.com/400x400?text=MacBook+Pro"]
  },
  {
    title: "Dell XPS 15 Gaming Laptop",
    description: "Ultimate gaming machine with NVIDIA RTX 4070, Intel i9 processor, 32GB RAM. Delivers exceptional performance for modern games and heavy workloads. Fast and responsive.",
    price: 2199,
    category: "Electronics",
    tags: ["laptop", "gaming", "dell", "fast", "powerful", "computer", "high-performance"],
    images: ["https://via.placeholder.com/400x400?text=Dell+XPS+15"]
  },
  {
    title: "ASUS ROG Strix Gaming Desktop",
    description: "Pre-built gaming PC with RTX 4080, AMD Ryzen 9, 64GB RAM. Extreme performance for 4K gaming and content creation. The fastest computer in its class.",
    price: 3499,
    category: "Electronics",
    tags: ["desktop", "gaming", "computer", "fast", "powerful", "pc", "workstation"],
    images: ["https://via.placeholder.com/400x400?text=ASUS+ROG"]
  },
  {
    title: "Lenovo ThinkPad X1 Carbon",
    description: "Lightweight business laptop, perfect for travel. Intel i7, 16GB RAM, all-day battery life. Fast boot times and excellent productivity performance.",
    price: 1599,
    category: "Electronics",
    tags: ["laptop", "business", "lightweight", "portable", "computer", "professional"],
    images: ["https://via.placeholder.com/400x400?text=ThinkPad"]
  },

  // Electronics - Phones & Tablets
  {
    title: "iPhone 15 Pro Max",
    description: "Latest Apple flagship smartphone with A17 Pro chip, titanium design, 256GB storage. Best camera system, all-day battery, premium build quality.",
    price: 1199,
    category: "Electronics",
    tags: ["phone", "smartphone", "apple", "iphone", "mobile", "5G"],
    images: ["https://via.placeholder.com/400x400?text=iPhone+15+Pro"]
  },
  {
    title: "Samsung Galaxy S24 Ultra",
    description: "Android flagship phone with S Pen, 200MP camera, Snapdragon 8 Gen 3. Premium smartphone with AI features and stunning display.",
    price: 1299,
    category: "Electronics",
    tags: ["phone", "smartphone", "samsung", "android", "mobile", "5G"],
    images: ["https://via.placeholder.com/400x400?text=Galaxy+S24"]
  },
  {
    title: "iPad Pro 12.9 M2",
    description: "Professional tablet with M2 chip, perfect for digital artists and designers. Supports Apple Pencil, incredible display, desktop-class performance.",
    price: 1099,
    category: "Electronics",
    tags: ["tablet", "ipad", "apple", "professional", "digital-art", "portable"],
    images: ["https://via.placeholder.com/400x400?text=iPad+Pro"]
  },

  // Fashion - Winter Clothing
  {
    title: "Canada Goose Expedition Parka",
    description: "Warmest winter jacket for extreme cold weather. Down-filled, water-resistant, perfect for harsh winters. Keeps you cozy in -30°C temperatures.",
    price: 1195,
    category: "Fashion",
    tags: ["jacket", "winter", "warm", "coat", "clothing", "outerwear", "cold-weather"],
    images: ["https://via.placeholder.com/400x400?text=Canada+Goose"]
  },
  {
    title: "North Face Thermoball Jacket",
    description: "Lightweight warm jacket for everyday winter wear. Insulated with synthetic down, packable, perfect for cold weather outdoor activities.",
    price: 229,
    category: "Fashion",
    tags: ["jacket", "winter", "warm", "coat", "lightweight", "outdoor", "clothing"],
    images: ["https://via.placeholder.com/400x400?text=North+Face"]
  },
  {
    title: "Wool Blend Winter Sweater",
    description: "Cozy warm sweater made from premium wool blend. Soft, comfortable, perfect for layering in cold weather. Classic design for casual wear.",
    price: 89,
    category: "Fashion",
    tags: ["sweater", "warm", "winter", "clothing", "cozy", "wool", "knitwear"],
    images: ["https://via.placeholder.com/400x400?text=Wool+Sweater"]
  },
  {
    title: "Patagonia Fleece Pullover",
    description: "Warm and comfortable fleece for outdoor activities. Lightweight, breathable, perfect mid-layer for hiking and camping in cool weather.",
    price: 129,
    category: "Fashion",
    tags: ["fleece", "warm", "outdoor", "clothing", "comfortable", "lightweight"],
    images: ["https://via.placeholder.com/400x400?text=Fleece"]
  },

  // Fashion - Casual Wear
  {
    title: "Levi's 501 Original Jeans",
    description: "Classic straight-fit denim jeans. Comfortable, durable, timeless style. Perfect for everyday casual wear.",
    price: 98,
    category: "Fashion",
    tags: ["jeans", "denim", "pants", "casual", "clothing", "classic"],
    images: ["https://via.placeholder.com/400x400?text=Levis+Jeans"]
  },
  {
    title: "Nike Air Jordan 1 Sneakers",
    description: "Iconic basketball-inspired sneakers. Comfortable, stylish, perfect for streetwear. Premium leather construction.",
    price: 170,
    category: "Fashion",
    tags: ["shoes", "sneakers", "footwear", "nike", "jordan", "casual", "streetwear"],
    images: ["https://via.placeholder.com/400x400?text=Jordan+1"]
  },

  // Home & Garden
  {
    title: "Dyson V15 Cordless Vacuum",
    description: "Powerful cordless vacuum cleaner with laser detection. Perfect for deep cleaning carpets and hard floors. Long battery life, lightweight design.",
    price: 649,
    category: "Home & Garden",
    tags: ["vacuum", "cleaning", "appliance", "cordless", "home", "dyson"],
    images: ["https://via.placeholder.com/400x400?text=Dyson+V15"]
  },
  {
    title: "Ninja Air Fryer Pro",
    description: "Large capacity air fryer for healthy cooking. Crisps, roasts, and bakes with little to no oil. Perfect for quick family meals.",
    price: 169,
    category: "Home & Garden",
    tags: ["kitchen", "appliance", "cooking", "air-fryer", "home", "healthy"],
    images: ["https://via.placeholder.com/400x400?text=Air+Fryer"]
  },
  {
    title: "Weighted Blanket 20lbs",
    description: "Premium weighted blanket for better sleep. Soft, comfortable, helps reduce anxiety and improve sleep quality. Perfect for relaxation.",
    price: 89,
    category: "Home & Garden",
    tags: ["blanket", "sleep", "comfort", "bedroom", "relaxation", "home"],
    images: ["https://via.placeholder.com/400x400?text=Weighted+Blanket"]
  },

  // Sports & Outdoors
  {
    title: "Peloton Bike+ Indoor Cycling",
    description: "Premium smart exercise bike with live classes. Auto-resistance adjustment, rotating screen, perfect for home fitness. Great cardio workout.",
    price: 2495,
    category: "Sports & Outdoors",
    tags: ["fitness", "exercise", "bike", "cycling", "workout", "home-gym", "cardio"],
    images: ["https://via.placeholder.com/400x400?text=Peloton+Bike"]
  },
  {
    title: "Yoga Mat Premium Non-Slip",
    description: "Extra thick yoga mat for comfortable workouts. Non-slip surface, eco-friendly materials. Perfect for yoga, pilates, and stretching exercises.",
    price: 45,
    category: "Sports & Outdoors",
    tags: ["yoga", "fitness", "exercise", "mat", "workout", "wellness"],
    images: ["https://via.placeholder.com/400x400?text=Yoga+Mat"]
  },
  {
    title: "Coleman 6-Person Camping Tent",
    description: "Spacious family tent for outdoor camping adventures. Weatherproof, easy setup, perfect for weekend trips and summer camping.",
    price: 249,
    category: "Sports & Outdoors",
    tags: ["camping", "tent", "outdoor", "adventure", "travel", "family"],
    images: ["https://via.placeholder.com/400x400?text=Camping+Tent"]
  },

  // Toys & Kids
  {
    title: "LEGO Star Wars Millennium Falcon",
    description: "Ultimate building set for kids and collectors. 7,500+ pieces, detailed interior, perfect birthday gift. Hours of creative fun.",
    price: 849,
    category: "Toys",
    tags: ["lego", "toys", "building", "star-wars", "kids", "gift", "collectible"],
    images: ["https://via.placeholder.com/400x400?text=LEGO+Falcon"]
  },
  {
    title: "Nintendo Switch OLED Console",
    description: "Popular gaming console for kids and families. Portable and dockable, vibrant OLED screen. Perfect gift with family-friendly games.",
    price: 349,
    category: "Toys",
    tags: ["gaming", "console", "nintendo", "kids", "gift", "entertainment", "family"],
    images: ["https://via.placeholder.com/400x400?text=Switch+OLED"]
  },
  {
    title: "Barbie Dreamhouse Playset",
    description: "Large dollhouse with furniture and accessories. Interactive features, perfect for imaginative play. Great birthday gift for young children.",
    price: 199,
    category: "Toys",
    tags: ["toys", "dollhouse", "barbie", "kids", "gift", "playset", "girls"],
    images: ["https://via.placeholder.com/400x400?text=Dreamhouse"]
  },

  // Beauty & Personal Care
  {
    title: "Dyson Supersonic Hair Dryer",
    description: "Professional-grade hair dryer with intelligent heat control. Fast drying, prevents damage, multiple attachments. Perfect for all hair types.",
    price: 429,
    category: "Beauty",
    tags: ["hair", "beauty", "dryer", "styling", "personal-care", "professional"],
    images: ["https://via.placeholder.com/400x400?text=Dyson+Dryer"]
  },
  {
    title: "Skincare Gift Set - Luxury",
    description: "Premium skincare collection with cleanser, serum, and moisturizer. Anti-aging formula, suitable for all skin types. Perfect beauty gift.",
    price: 149,
    category: "Beauty",
    tags: ["skincare", "beauty", "gift", "cosmetics", "anti-aging", "luxury"],
    images: ["https://via.placeholder.com/400x400?text=Skincare+Set"]
  },

  // Books
  {
    title: "Atomic Habits by James Clear",
    description: "Best-selling self-improvement book about building good habits. Practical strategies for personal growth and productivity. Perfect gift for anyone.",
    price: 16,
    category: "Books",
    tags: ["book", "self-help", "habits", "productivity", "gift", "personal-development"],
    images: ["https://via.placeholder.com/400x400?text=Atomic+Habits"]
  },
  {
    title: "The Complete Harry Potter Collection",
    description: "Box set of all 7 Harry Potter books. Perfect gift for young readers and fantasy fans. Includes beautiful illustrations.",
    price: 75,
    category: "Books",
    tags: ["books", "harry-potter", "fantasy", "gift", "kids", "collection", "reading"],
    images: ["https://via.placeholder.com/400x400?text=Harry+Potter"]
  },
];

// Admin credentials for authentication
// You can override these via command line:
// node seed-products.js your@email.com yourpassword
const ADMIN_CREDENTIALS = {
  email: process.argv[2] || 'admin@example.com',
  password: process.argv[3] || 'admin123'
};

log(`\nℹ️  Using credentials: ${ADMIN_CREDENTIALS.email}`, 'cyan');
log(`   (Override with: node seed-products.js your@email.com yourpassword)\n`, 'cyan');

let authToken = null;

async function login() {
  try {
    log('\n🔐 Logging in as admin...', 'cyan');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);

    if (response.data.success && response.data.data.accessToken) {
      authToken = response.data.data.accessToken;
      log('✅ Login successful!', 'green');
      return true;
    } else {
      log('❌ Login failed: Invalid response', 'red');
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ Connection Failed: Backend server is not running', 'red');
      log('   Please start the backend with: cd backend && npm run dev', 'yellow');
    } else if (error.response?.status === 401) {
      log('❌ Invalid credentials. Please check ADMIN_CREDENTIALS in this script.', 'red');
      log('   Default: admin@example.com / admin123', 'yellow');
    } else {
      log(`❌ Login error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function createProduct(product) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/products`,
      product,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      log(`  ✅ Created: ${product.title}`, 'green');
      return true;
    } else {
      log(`  ❌ Failed: ${product.title} - ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    if (error.response?.status === 409) {
      log(`  ⚠️  Skipped: ${product.title} (already exists)`, 'yellow');
      return false;
    } else {
      log(`  ❌ Error creating ${product.title}: ${error.message}`, 'red');
      return false;
    }
  }
}

async function seedProducts() {
  log('\n═══════════════════════════════════════════════════', 'blue');
  log('  🌱 Product Seeding Script', 'blue');
  log('═══════════════════════════════════════════════════\n', 'blue');

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ Cannot proceed without authentication. Exiting...', 'red');
    process.exit(1);
  }

  log('\n📦 Creating test products...', 'cyan');
  log(`   Total products to create: ${testProducts.length}\n`, 'cyan');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  // Group products by category for better logging
  const categories = [...new Set(testProducts.map(p => p.category))];

  for (const category of categories) {
    const categoryProducts = testProducts.filter(p => p.category === category);
    log(`\n📂 ${category} (${categoryProducts.length} products):`, 'magenta');

    for (const product of categoryProducts) {
      const result = await createProduct(product);
      if (result) {
        created++;
      } else if (result === false) {
        skipped++;
      } else {
        failed++;
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  log('\n═══════════════════════════════════════════════════', 'blue');
  log(`  📊 Seeding Complete!`, 'blue');
  log('═══════════════════════════════════════════════════', 'blue');
  log(`  ✅ Created: ${created}`, 'green');
  log(`  ⚠️  Skipped: ${skipped}`, 'yellow');
  log(`  ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  log('═══════════════════════════════════════════════════\n', 'blue');

  if (created > 0) {
    log('🎉 Success! Test products have been added to the database.', 'green');
    log('\n📝 Test Semantic Search with these queries:', 'cyan');
    log('   • "fast computer" → Should find laptops & desktops', 'cyan');
    log('   • "warm clothes" → Should find jackets, sweaters, fleece', 'cyan');
    log('   • "gift for kids" → Should find toys, games, books', 'cyan');
    log('   • "birthday present" → Should find various gift items', 'cyan');
    log('   • "laptop gaming" → Should find gaming laptops', 'cyan');
    log('   • "phone" → Should find smartphones', 'cyan');
    log('   • "workout equipment" → Should find fitness items', 'cyan');

    log('\n🧪 Run the search test script:', 'yellow');
    log('   node test-search.js\n', 'yellow');
  } else if (skipped === testProducts.length) {
    log('ℹ️  All products already exist in the database.', 'yellow');
    log('   You can still test semantic search with existing products.\n', 'yellow');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n⚠️  Process interrupted. Exiting...', 'yellow');
  process.exit(0);
});

// Run the seeding
seedProducts().catch(error => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
