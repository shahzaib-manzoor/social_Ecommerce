import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/modules/users/user.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-ecommerce';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const adminData = {
      username: 'admin',
      email: 'admin@socialecommerce.com',
      password: 'Admin@123',
      role: 'admin',
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminData.email },
        { username: adminData.username }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Username: ${existingAdmin.username}`);

      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
    } else {
      // Hash password
      const passwordHash = await bcrypt.hash(adminData.password, 12);

      // Create admin user
      const admin = new User({
        username: adminData.username,
        email: adminData.email,
        passwordHash,
        role: 'admin',
        bio: 'System Administrator',
        interests: ['technology', 'e-commerce', 'management'],
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📝 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Access Admin Panel at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdmin();
