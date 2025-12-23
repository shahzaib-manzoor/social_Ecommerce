/**
 * Create Admin User Script
 *
 * Creates an admin user in the database
 * Run: node create-admin.js email@example.com password123
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api/v1';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createAdminUser() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';
  const username = process.argv[4] || 'admin';

  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  👤 Create Admin User', 'cyan');
  log('═══════════════════════════════════════════════════\n', 'cyan');

  log(`Creating admin user:`, 'cyan');
  log(`  Email: ${email}`, 'cyan');
  log(`  Username: ${username}`, 'cyan');
  log(`  Password: ${password}\n`, 'cyan');

  try {
    // Step 1: Register the user
    log('📝 Registering user...', 'yellow');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      password,
      username
    });

    if (!registerResponse.data.success) {
      if (registerResponse.data.error?.includes('already exists')) {
        log('⚠️  User already exists. Trying to login...', 'yellow');

        // Try to login
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password
        });

        if (loginResponse.data.success) {
          log('✅ Login successful!', 'green');
          log(`\n🎉 You can now use these credentials:`, 'green');
          log(`   Email: ${email}`, 'cyan');
          log(`   Password: ${password}\n`, 'cyan');
          log('💡 Run the seeding script:', 'yellow');
          log(`   node seed-products.js ${email} ${password}\n`, 'yellow');
          return;
        }
      }
      throw new Error(registerResponse.data.error || 'Registration failed');
    }

    log('✅ User registered successfully!', 'green');

    // Step 2: Update user to admin role
    // Note: This requires direct database access or an admin endpoint
    log('\n⚠️  User created but not yet admin.', 'yellow');
    log('   You need to manually update the role in MongoDB:', 'yellow');
    log('\n   Run in MongoDB shell or Compass:', 'cyan');
    log(`   db.users.updateOne(`, 'cyan');
    log(`     { email: "${email}" },`, 'cyan');
    log(`     { $set: { role: "admin" } }`, 'cyan');
    log(`   )\n`, 'cyan');

    log('   Or if you have an admin user, login to admin panel and promote this user.\n', 'yellow');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ Connection Failed: Backend server is not running', 'red');
      log('   Please start the backend with: cd backend && npm run dev\n', 'yellow');
    } else if (error.response?.data?.error) {
      log(`❌ Error: ${error.response.data.error}`, 'red');
    } else {
      log(`❌ Error: ${error.message}`, 'red');
    }
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n⚠️  Process interrupted. Exiting...', 'yellow');
  process.exit(0);
});

// Show usage if no args
if (process.argv.length < 3) {
  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  👤 Create Admin User', 'cyan');
  log('═══════════════════════════════════════════════════\n', 'cyan');
  log('Usage:', 'yellow');
  log('  node create-admin.js <email> <password> [username]\n', 'cyan');
  log('Example:', 'yellow');
  log('  node create-admin.js admin@test.com mypassword123 admin\n', 'cyan');
  log('Or use defaults:', 'yellow');
  log('  Email: admin@example.com', 'cyan');
  log('  Password: admin123', 'cyan');
  log('  Username: admin\n', 'cyan');
}

createAdminUser();
