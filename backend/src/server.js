import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

const server = http.createServer(app);

const startTime = Date.now();

connectDatabase().then(() => {
  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${ENV.PORT}`);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`🚀 Server started in ${duration}s`);
  });
});
