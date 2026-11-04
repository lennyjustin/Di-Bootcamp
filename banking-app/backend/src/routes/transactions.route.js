import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { auditRequest } from '../middleware/audit.js';
import { authorizePermission } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
router.use(authenticate, auditRequest({ includeReads: true }));

router.get('/', authorizePermission('transactions.read'), asyncHandler(async (req, res) => {
  const limit = z.coerce.number().int().min(1).max(100).catch(50).parse(req.query.limit);
  const transactions = await prisma.transaction.findMany({
    include: { member: { select: { id: true, memberNo: true, fullName: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return res.json({
    transactions: transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      balanceAfter: transaction.balanceAfter === null ? null : Number(transaction.balanceAfter),
    })),
  });
}));

export default router;
