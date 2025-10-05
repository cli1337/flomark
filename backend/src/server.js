import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { SocketService } from "./services/socket.service.js";

const server = http.createServer(app);


const socketService = new SocketService(server);

const startTime = Date.now();

connectDatabase().then(() => {
  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${ENV.PORT}`);
    console.log(`🔌 Socket.IO initialized and ready for connections`);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`🚀 Server started in ${duration}s`);
  });
});
