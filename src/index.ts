import CustomClient from './client/CustomClient';
import ExpressServer from './express/ExpressServer';
import config, { validateConfig } from './config';
import { sequelize } from './db';

const PORT = parseInt(config.EXPRESS_PORT!);

async function startServer() {
  try {
    validateConfig();

    await sequelize.sync();
    console.log('✅ Database synchronized');

    const client = new CustomClient();
    await client.Init();
    console.log('✅ Discord client initialized');

    const express = new ExpressServer(client);
    const server = await express.start(PORT);
    console.log(`✅ Express server running on port ${PORT}`);

    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      await client.destroy();
      server.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
