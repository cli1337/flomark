import { ENV } from "../config/env.js";

export const checkDemoMode = (req, res, next) => {
  if (ENV.DEMO_MODE) {
    return res.status(403).json({
      message: "This action is disabled in demo mode",
      key: "demo_mode_restricted",
      success: false,
    });
  }
  next();
};

