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

  // Khởi động server với xử lý lỗi cổng
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });

  // Bắt lỗi EADDRINUSE — cổng đang bị chiếm
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Cổng ${PORT} đang bị chiếm. Đang thử kill và retry sau 1 giây...`);
      server.close();
      setTimeout(() => {
        server.listen(PORT);
      }, 1000);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown khi nodemon restart
  process.on('SIGTERM', () => server.close());
  process.on('SIGINT', () => server.close());
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
