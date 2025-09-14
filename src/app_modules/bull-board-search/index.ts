export function createMiddleware() {
  return async function middleware(req, res, next) {
    next();
  };
}
