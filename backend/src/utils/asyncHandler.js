// wraps an async route handler so a rejected promise is forwarded to
// Express's error middleware instead of crashing the request
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
