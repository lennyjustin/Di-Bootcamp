import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { auditRequest } from '../middleware/audit.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
router.use(auditRequest({ includeReads: true }), authenticate, authorize('super_admin'));

router.get('/', asyncHandler(async (req, res) => {
  const page = z.coerce.number().int().min(1).catch(1).parse(req.query.page);
  const limit = z.coerce.number().int().min(1).max(100).catch(100).parse(req.query.limit);
  const [events, total] = await prisma.$transaction([
    prisma.auditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        actorName: true,
        actorRole: true,
        method: true,
        path: true,
        statusCode: true,
        createdAt: true,
      },
    }),
    prisma.auditEvent.count(),
  ]);
  return res.json({
    events,
    page,
    limit,
    total,
    hasNextPage: page * limit < total,
  });
}));

export default router;
