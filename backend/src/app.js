import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
const mainRoutePath = "/api";

const app = express();

app.use(cors());
app.use(express.json());

app.use(`${mainRoutePath}/user`, userRoutes);

app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not registered`);
  error.status = 404;
  next(error);
});

app.use(errorHandler);

export default app;
