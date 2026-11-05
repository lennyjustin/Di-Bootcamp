import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { authorizePermission } from '../middleware/authorize.js';
import { saveDarajaCallback } from '../services/daraja.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
const callbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.post('/callback', (req, res) => {
  return res.status(503).json({
    ResultCode: 1,
    ResultDesc: 'M-Pesa callbacks are disabled until Daraja credentials and callback verification are configured.',
  });
});

router.post('/stk/callback', callbackLimiter, asyncHandler(async (req, res) => {
  await saveDarajaCallback(req.body);
  return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}));

router.get('/transactions', authenticate, authorizePermission('payments.read'), asyncHandler(async (req, res) => {
  const query = z.object({
    status: z.enum(['pending', 'initiating', 'processing', 'completed', 'failed', 'review', 'cancelled']).optional(),
    purpose: z.enum(['savings_deposit', 'loan_repayment', 'legacy']).optional(),
    limit: z.coerce.number().int().min(1).max(100).catch(50),
  }).safeParse(req.query);
  if (!query.success) return res.status(400).json({ message: 'Invalid mobile payment filters' });

  const transactions = await prisma.mpesaTransaction.findMany({
    where: {
      ...(query.data.status ? { status: query.data.status } : {}),
      ...(query.data.purpose ? { purpose: query.data.purpose } : {}),
    },
    include: {
      member: { select: { id: true, memberNo: true, fullName: true } },
      loan: { select: { loanNo: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: query.data.limit,
  });
  return res.json({
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      purpose: transaction.purpose,
      checkoutRequestId: transaction.checkoutRequestId,
      receiptNumber: transaction.receiptNumber,
      phoneNumber: transaction.phoneNumber ? `***${transaction.phoneNumber.slice(-3)}` : null,
      amount: Number(transaction.amount),
      status: transaction.status,
      resultCode: transaction.resultCode,
      resultDescription: transaction.resultDescription,
      settledAt: transaction.settledAt,
      createdAt: transaction.createdAt,
      member: transaction.member,
      loan: transaction.loan,
    })),
  });
}));

export default router;
