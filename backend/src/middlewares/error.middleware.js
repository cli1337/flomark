export function errorHandler(err, req, res, next) {
  console.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({
    success: false,
    message: "Internal Server Error",
  });
}  