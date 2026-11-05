import express from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { authorizePermission } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isDarajaConfigured } from '../services/daraja.service.js';

const router = express.Router();
router.use(authenticate);

router.get('/', authorizePermission('dashboard.read'), asyncHandler(async (req, res) => {
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - 5, 1);
  since.setUTCHours(0, 0, 0, 0);

  const [
    members,
    savings,
    loans,
    shares,
    transactions,
    recentMembers,
    monthlyTransactions,
    latestMpesa,
    mpesaExceptions,
  ] = await Promise.all([
    prisma.member.count({ where: { status: 'active' } }),
    prisma.savingsAccount.aggregate({
      where: { status: 'active' },
      _sum: { balance: true },
    }),
    prisma.loan.findMany({
      select: { status: true, principal: true, outstandingBalance: true },
    }),
    prisma.share.findMany({ select: { units: true, valuePerShare: true } }),
    prisma.transaction.findMany({
      include: { member: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.member.findMany({
      select: { memberNo: true, fullName: true, phone: true, status: true },
      orderBy: { joinedAt: 'desc' },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: since } },
      select: { type: true, amount: true, createdAt: true },
    }),
    prisma.mpesaTransaction.findFirst({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      select: { amount: true, phoneNumber: true, createdAt: true },
    }),
    prisma.mpesaTransaction.findMany({
      where: {
        OR: [
          { status: 'review' },
          { status: 'pending', createdAt: { lte: new Date(Date.now() - 15 * 60 * 1000) } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: {
        id: true,
        purpose: true,
        amount: true,
        phoneNumber: true,
        resultDescription: true,
        createdAt: true,
        member: { select: { fullName: true, memberNo: true } },
      },
    }),
  ]);

  const monthBuckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setUTCMonth(date.getUTCMonth() - (5 - index), 1);
    return {
      month: date.toLocaleString('en', { month: 'short', timeZone: 'UTC' }),
      year: date.getUTCFullYear(),
      savings: 0,
      loans: 0,
      key: `${date.getUTCFullYear()}-${date.getUTCMonth()}`,
    };
  });
  const monthIndex = new Map(monthBuckets.map((item, index) => [item.key, index]));
  for (const transaction of monthlyTransactions) {
    const date = new Date(transaction.createdAt);
    const index = monthIndex.get(`${date.getUTCFullYear()}-${date.getUTCMonth()}`);
    if (index === undefined) continue;
    if (transaction.type === 'deposit') monthBuckets[index].savings += Number(transaction.amount);
    if (transaction.type === 'loan_disbursement') monthBuckets[index].loans += Number(transaction.amount);
  }

  const loanTotals = loans.reduce((totals, loan) => {
    const balance = Number(loan.outstandingBalance);
    if (loan.status === 'pending') totals.pending += Number(loan.principal);
    else if (['active', 'approved'].includes(loan.status)) totals.active += balance || Number(loan.principal);
    else if (['overdue', 'defaulted'].includes(loan.status)) totals.overdue += balance;
    return totals;
  }, { active: 0, pending: 0, overdue: 0 });

  return res.json({
    darajaEnabled: isDarajaConfigured(),
    summary: {
      members,
      savings: Number(savings._sum.balance || 0n),
      loans: loanTotals.active + loanTotals.pending + loanTotals.overdue,
      shares: shares.reduce((sum, share) => sum + share.units * Number(share.valuePerShare), 0),
      transactions: await prisma.transaction.count(),
      activeLoans: loans.filter((loan) => ['active', 'approved'].includes(loan.status)).length,
    },
    loanPortfolio: loanTotals,
    recentTransactions: transactions.map((transaction) => ({
      ...transaction,
      member: transaction.member?.fullName || '—',
      amount: Number(transaction.amount),
      balanceAfter: transaction.balanceAfter === null ? null : Number(transaction.balanceAfter),
    })),
    recentMembers,
    monthlyTrend: monthBuckets.map(({ month, year, savings: savingsAmount, loans: loanAmount }) => ({
      month,
      year,
      savings: savingsAmount,
      loans: loanAmount,
    })),
    latestMpesa: latestMpesa ? {
      ...latestMpesa,
      amount: Number(latestMpesa.amount),
      phoneNumber: latestMpesa.phoneNumber ? `***${latestMpesa.phoneNumber.slice(-3)}` : null,
    } : null,
    mpesaExceptions: mpesaExceptions.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
      phoneNumber: payment.phoneNumber ? `***${payment.phoneNumber.slice(-3)}` : null,
    })),
  });
}));

router.get('/summary', authorizePermission('portfolio.summary'), asyncHandler(async (req, res) => {
  const [members, savings, loanGroups, shareGroups] = await Promise.all([
    prisma.member.count({ where: { status: 'active' } }),
    prisma.savingsAccount.aggregate({
      where: { status: 'active' },
      _sum: { balance: true },
    }),
    prisma.loan.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { principal: true, outstandingBalance: true },
    }),
    prisma.share.groupBy({
      by: ['valuePerShare'],
      _sum: { units: true },
    }),
  ]);
  const shareValue = shareGroups.reduce(
    (total, group) => total + BigInt(group._sum.units || 0) * group.valuePerShare,
    0n
  );
  return res.json({
    summary: {
      activeMembers: members,
      savingsBalance: Number(savings._sum.balance || 0n),
      loanStatuses: loanGroups.map((group) => ({
        status: group.status,
        count: group._count._all,
        principal: Number(group._sum.principal || 0n),
        outstandingBalance: Number(group._sum.outstandingBalance || 0n),
      })),
      recordedShareValue: Number(shareValue),
      note: 'Aggregate recorded balances only. No accounting statements, arrears calculations, dividends, or regulatory conclusions are produced.',
    },
  });
}));

export default router;
