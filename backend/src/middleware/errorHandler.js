// Neo4j driver errors carry a `.code` that tells us what actually went wrong.
// We only special-case the ones that mean "the database itself is the
// problem" so the frontend can show a distinct "can't reach the database"
// state instead of a generic error for those.
const UNREACHABLE_CODES = new Set([
  'ServiceUnavailable',
  'SessionExpired',
  'ConnectionTimeout',
]);

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route matches ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  if (UNREACHABLE_CODES.has(err.code) || err.message?.includes('Could not perform')) {
    return res.status(503).json({
      error: 'The graph database is unreachable right now. Please try again shortly.',
    });
  }

  if (err.code?.startsWith('Neo.ClientError.Security')) {
    return res.status(500).json({ error: 'Database authentication failed. Check server credentials.' });
  }

  res.status(500).json({ error: 'Something went wrong on the server.' });
}
