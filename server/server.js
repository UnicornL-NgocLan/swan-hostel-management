// server.js — Entry point
require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');
const { seedAdmin } = require('./src/services/auth.service');
const { initCronJobs } = require('./src/jobs/cron');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Kết nối MongoDB
  await connectDB();

  // Seed admin user lần đầu
  await seedAdmin();
  
  // Khởi động các tác vụ nền định kỳ
  initCronJobs();

  // Khởi động server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
// Trigger restart
// Trigger nodemon again
// restart 09/26/2026 16:14:31
