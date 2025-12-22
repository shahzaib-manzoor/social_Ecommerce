import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

const PORT = parseInt(env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
