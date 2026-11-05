import prisma from '../config/db.js';

export function auditRequest({ includeReads = false, excludePaths = [] } = {}) {
  return (req, res, next) => {
    if (excludePaths.includes(req.path)
      || (!includeReads && ['GET', 'HEAD', 'OPTIONS'].includes(req.method))) {
      return next();
    }

    const auditEvent = prisma.auditEvent.create({
      data: {
        actorName: 'Unauthenticated request',
        actorRole: 'anonymous',
        method: req.method,
        path: req.originalUrl.split('?')[0].slice(0, 512),
      },
    });

    return auditEvent.then((event) => {
      res.once('finish', () => {
        prisma.auditEvent.update({
          where: { id: event.id },
          data: {
            actorUserId: req.user?.id ?? null,
            actorName: req.user?.fullName ?? 'Unauthenticated request',
            actorRole: req.user?.role ?? 'anonymous',
            statusCode: res.statusCode,
          },
        }).catch((error) => {
          console.error('Failed to record audit response status', error);
        });
      });
      return next();
    }).catch(next);
  };
}
