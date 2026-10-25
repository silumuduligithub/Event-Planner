const mongoose = require('mongoose');
const app = require('./src/app');
const env = require('./src/config/env');
const { connectDatabase } = require('./src/config/db');

async function start() {
  await connectDatabase();
  const server = app.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));

  async function shutdown() {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('API startup failed:', error);
  process.exit(1);
});
