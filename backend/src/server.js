import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { SocketService } from "./services/socket.service.js";
import { initializeDemoData, startAutoReset, stopAutoReset } from "./services/demo-data.service.js";

const server = http.createServer(app);

const socketService = new SocketService(server);

const startTime = Date.now();

// Check if demo mode is enabled
const isDemoMode = ENV.DEMO_MODE === true;

if (isDemoMode) {
  // Initialize demo mode with in-memory data
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║  🎭  DEMO MODE ENABLED - NO DATABASE ACCESS  ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log("");
  
  initializeDemoData().then(() => {
    startAutoReset();
    
    server.listen(ENV.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${ENV.PORT} (Demo Mode)`);
      console.log(`🔌 Socket.IO initialized and ready for connections`);
      console.log(`⏰ Demo data auto-resets every 20-30 minutes`);
      console.log(`🔒 Database access is COMPLETELY BLOCKED`);
      console.log(`💾 All data stored in RAM (in-memory only)`);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      console.log(`🚀 Server started in ${duration}s`);
    });
  }).catch((err) => {
    console.error("❌ Failed to initialize demo mode:", err);
    process.exit(1);
  });
} else {
  // Connect to database in normal mode
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
    console.error("💡 Tip: Set DEMO_MODE=true in .env to run without database");
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (isDemoMode) {
    stopAutoReset();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (isDemoMode) {
    stopAutoReset();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
