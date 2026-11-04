import prisma from '../config/db.js';

export function auditRequest({ includeReads = false } = {}) {
  return (req, res, next) => {
    if (!includeReads && ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const auditEvent = prisma.auditEvent.create({
      data: {
        actorUserId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        method: req.method,
        path: req.originalUrl.split('?')[0].slice(0, 512),
      },
    });

    return auditEvent.then((event) => {
      res.once('finish', () => {
        prisma.auditEvent.update({
          where: { id: event.id },
          data: { statusCode: res.statusCode },
        }).catch((error) => {
          console.error('Failed to record audit response status', error);
        });
      });
      return next();
    }).catch(next);
  };
}
