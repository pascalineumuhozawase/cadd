export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err.stack || err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Image is too large. Maximum allowed size is configured by MAX_IMAGE_MB." });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? "An unexpected server error occurred." : err.message,
    ...(process.env.NODE_ENV !== "production" && status === 500 ? { detail: err.message } : {})
  });
}
