import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { authorizePermission } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
router.use(authenticate, authorizePermission('audit.read'));

router.get('/', asyncHandler(async (req, res) => {
  const limit = z.coerce.number().int().min(1).max(100).catch(50).parse(req.query.limit);
  const events = await prisma.auditEvent.findMany({
    orderBy: { createdAt: 'desc' },
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
  });
  return res.json({ events });
}));

export default router;
