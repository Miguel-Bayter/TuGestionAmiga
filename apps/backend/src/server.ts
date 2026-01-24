import config from './config/env';
import prisma from './config/database';
import createApp from './app';
import container from './shared/config/container';

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connected');

    // Create app with container
    const app = createApp(container);

    // Start server
    app.listen(config.server.port, () => {
      console.log(`✓ Server running on http://localhost:${config.server.port}`);
      console.log(`✓ CORS enabled for: ${config.cors.origin}`);
      console.log(`✓ Environment: ${config.server.nodeEnv}`);
      console.log(`✓ Container initialized with dependencies`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
