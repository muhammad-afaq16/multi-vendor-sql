import dotenv from 'dotenv';
import app from './app';

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

let server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err: any) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down due to unhandled promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
