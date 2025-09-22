import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

const server = http.createServer(app);

connectDatabase().then(() => {
  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${ENV.PORT}`);
  });
});
