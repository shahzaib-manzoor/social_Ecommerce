import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

const PORT = parseInt(env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server - listen on all network interfaces (0.0.0.0) to allow external connections
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Local: http://localhost:${PORT}/api/v1`);
      console.log(`🔗 Network: http://192.168.88.69:${PORT}/api/v1`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
