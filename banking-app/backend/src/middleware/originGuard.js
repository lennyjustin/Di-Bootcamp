const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export function originGuard(req, res, next) {
  const origin = req.get('origin');

  if (!safeMethods.has(req.method) && origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({ message: 'Request origin is not allowed' });
  }

  return next();
}

export { allowedOrigins };
