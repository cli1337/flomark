import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { SocketService } from "./services/socket.service.js";

const server = http.createServer(app);

const socketService = new SocketService(server);

const startTime = Date.now();

// Connect to database and start server
connectDatabase().then(() => {
  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${ENV.PORT}`);
    console.log(`🔌 Socket.IO initialized and ready for connections`);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`🚀 Server started in ${duration}s`);
  });
}).catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
