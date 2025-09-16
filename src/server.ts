import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';

// handling uncaught exception
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down due to uncaught exception`);
  process.exit(1);
});

if (process.env.NODE_ENV !== 'PRODUCTION') {
  dotenv.config();
}

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer();
// unhandled promise rejection
process.on('unhandledRejection', (err: any) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down due to unhandled promise rejection`);
  process.exit(1);
});
