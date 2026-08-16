// Neo4j driver errors carry a `.code` that tells us what actually went
// wrong. We only special-case the ones that mean "the database itself is
// unreachable" so the frontend can show that state distinctly.
const UNREACHABLE_CODES = new Set([
  "ServiceUnavailable",
  "SessionExpired",
  "ConnectionTimeout",
]);

export function notFoundHandler(req, res) {
  res
    .status(404)
    .json({
      success: false,
      message: `No route matches ${req.method} ${req.originalUrl}`,
    });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error("[error]", err);

  // errors we threw ourselves via ApiError already know their status code
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  }

  if (
    UNREACHABLE_CODES.has(err.code) ||
    err.message?.includes("Could not perform")
  ) {
    return res.status(503).json({
      success: false,
      message:
        "The graph database is unreachable right now. Please try again shortly.",
    });
  }

  if (err.code?.startsWith("Neo.ClientError.Security")) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Database authentication failed. Check server credentials.",
      });
  }

  res
    .status(500)
    .json({ success: false, message: "Something went wrong on the server." });
}
