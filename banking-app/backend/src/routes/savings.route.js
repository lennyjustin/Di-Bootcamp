import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { authorizePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateRef } from '../utils/generateRef.js';

const router = express.Router();
const transactionSchema = z.object({
  amount: z.number().int().positive().safe(),
  channel: z.enum(['cash', 'bank', 'mpesa']).default('cash'),
  description: z.string().trim().max(250).optional(),
});
router.use(authenticate);

router.get('/', authorizePermission('savings.read'), asyncHandler(async (req, res) => {
  const accounts = await prisma.savingsAccount.findMany({
    include: { member: { select: { id: true, memberNo: true, fullName: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return res.json({
    accounts: accounts.map((account) => ({
      ...account,
      balance: Number(account.balance),
      minimumBalance: Number(account.minimumBalance),
    })),
  });
}));

async function postSavingsTransaction(req, res, next, type) {
  try {
    const { amount, channel, description } = req.validatedBody;
    const value = BigInt(amount);
    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.savingsAccount.findUnique({ where: { id: req.params.accountId } });
      if (!account || account.status !== 'active') {
        return { error: 'Savings account not found or inactive', status: 404 };
      }
      if (type === 'withdrawal' && account.balance - value < account.minimumBalance) {
        return { error: 'Insufficient funds or minimum balance would be breached', status: 409 };
      }

      const updated = await tx.savingsAccount.updateMany({
        where: {
          id: account.id,
          status: 'active',
          ...(type === 'withdrawal' ? { balance: { gte: value + account.minimumBalance } } : {}),
        },
        data: { balance: { [type === 'deposit' ? 'increment' : 'decrement']: value } },
      });
      if (updated.count !== 1) {
        return { error: 'Account balance changed; please retry the transaction', status: 409 };
      }

      const balanceAfter = type === 'deposit' ? account.balance + value : account.balance - value;
      const transaction = await tx.transaction.create({
        data: {
          reference: generateRef(type === 'deposit' ? 'DEP' : 'WDR'),
          memberId: account.memberId,
          savingsAccountId: account.id,
          type,
          amount: value,
          balanceAfter,
          channel,
          description,
          createdBy: req.user.id,
        },
      });
      return { transaction };
    });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }
    return res.status(201).json({
      transaction: { ...result.transaction, amount: Number(result.transaction.amount), balanceAfter: Number(result.transaction.balanceAfter) },
    });
  } catch (error) {
    return next(error);
  }
}

router.post('/:accountId/deposits', authorizePermission('savings.post'), validate(transactionSchema), (req, res, next) => (
  postSavingsTransaction(req, res, next, 'deposit')
));
router.post('/:accountId/withdrawals', authorizePermission('savings.post'), validate(transactionSchema), (req, res, next) => (
  postSavingsTransaction(req, res, next, 'withdrawal')
));

export default router;
