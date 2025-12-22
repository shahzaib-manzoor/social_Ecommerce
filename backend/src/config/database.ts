import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-ecommerce';

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB connected successfully');

    // Create indexes for better performance
    await createIndexes();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async (): Promise<void> => {
  try {
    // Indexes will be created by models using schema.index()
    console.log('✅ Database indexes ready');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
