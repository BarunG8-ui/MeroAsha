const notFoundHandler = (req, res, next) => {
  const ignoredPaths = [
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/apple-touch-icon-precomposed.png",
  ];

  // Ignore browser automatic icon requests
  if (ignoredPaths.includes(req.originalUrl)) {
    return res.status(204).end();
  }

  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;

  next(error);
};

const errorHandler = (error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};