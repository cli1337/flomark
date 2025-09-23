export function errorHandler(err, req, res, next) {
  console.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  let errorMessage = "Internal Server Error";
  if (err.status === 404) {
    errorMessage = "Not Found";
  }

  res.status(err.status || 500).json({
    success: false,
    code: err.status || 500,
    message: errorMessage,
  });
}  