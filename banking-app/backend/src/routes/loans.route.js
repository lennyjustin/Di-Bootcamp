import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { authorizePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateRef } from '../utils/generateRef.js';
import { buildFlatRateSchedule } from '../services/loan-schedule.service.js';
import { createPendingGuaranteeRequests } from '../services/loan-guarantees.service.js';
import {
  getLoanDocuments,
  readLoanDocument,
  receiveLoanDocuments,
  removeLoanDocuments,
  saveLoanDocuments,
} from '../services/loan-application-documents.service.js';

const router = express.Router();
const optionalText = (max) => z.preprocess(
  (value) => value === '' || value === undefined ? undefined : value,
  z.string().trim().max(max).optional()
);
const optionalAmount = z.preprocess(
  (value) => value === '' || value === undefined ? undefined : value,
  z.string().regex(/^\d{1,15}$/).optional()
);
const guarantorSchema = z.object({
  memberNo: z.string().trim().min(3).max(32),
  amount: z.coerce.number().int().positive().safe(),
});
const guarantorsInput = z.preprocess((value) => {
  if (value === undefined || value === '') return [];
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}, z.array(guarantorSchema).max(10));
const applicationSchema = z.object({
  memberId: z.string().uuid(),
  principal: z.coerce.number().int().positive().safe(),
  interestRate: z.coerce.number().min(0).max(100),
  termMonths: z.coerce.number().int().min(1).max(120),
  applicationNote: optionalText(300),
  employmentStatus: z.preprocess((value) => value === '' ? undefined : value, z.enum(['employed', 'self_employed', 'other']).optional()),
  occupation: optionalText(120),
  employerName: optionalText(120),
  monthlyIncome: optionalAmount,
  monthlyCommitments: optionalAmount,
  guarantors: guarantorsInput,
});
const statusSchema = z.object({ status: z.enum(['approved', 'rejected']) });
const repaymentSchema = z.object({
  amount: z.number().int().positive().safe(),
  channel: z.enum(['cash', 'bank', 'mpesa']).default('cash'),
});
const guaranteeReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNote: z.string().trim().max(500).optional(),
});
router.use(authenticate);

function formatLoan(loan) {
  return {
    ...loan,
    principal: Number(loan.principal),
    totalInterest: Number(loan.totalInterest),
    totalRepayable: Number(loan.totalRepayable),
    outstandingBalance: Number(loan.outstandingBalance),
    monthlyIncome: loan.monthlyIncome === null ? null : Number(loan.monthlyIncome),
    monthlyCommitments: loan.monthlyCommitments === null ? null : Number(loan.monthlyCommitments),
    applicationDocuments: loan.applicationDocuments?.map(({ id, documentType, extension, createdAt }) => ({
      id, documentType, extension, createdAt,
    })),
  };
}

router.get('/', authorizePermission('loans.read'), asyncHandler(async (req, res) => {
  const loans = await prisma.loan.findMany({
    include: {
      member: { select: { id: true, memberNo: true, fullName: true, phone: true } },
      applicationDocuments: { select: { id: true, documentType: true, extension: true, createdAt: true } },
    },
    orderBy: { appliedAt: 'desc' },
    take: 100,
  });
  return res.json({
    loans: loans.map(formatLoan),
  });
}));

router.get('/:loanId/documents/:documentId', authorizePermission('loans.read'), asyncHandler(async (req, res) => {
  const document = await prisma.loanApplicationDocument.findFirst({
    where: { id: req.params.documentId, loanId: req.params.loanId },
    select: { storedName: true, documentType: true, extension: true },
  });
  if (!document) return res.status(404).json({ message: 'Loan application document not found' });
  const file = await readLoanDocument(document.storedName);
  if (!file) return res.status(404).json({ message: 'Loan application document not found' });
  res.set({
    'Cache-Control': 'private, no-store',
    'Content-Type': file.contentType,
    'X-Content-Type-Options': 'nosniff',
  });
  return res.attachment(`${document.documentType}.${document.extension}`).send(file.content);
}));

router.get('/guarantees', authorizePermission('guarantees.review'), asyncHandler(async (req, res) => {
  const requests = await prisma.guaranteeRequest.findMany({
    include: {
      loan: { select: { id: true, loanNo: true, principal: true, outstandingBalance: true, status: true } },
      borrower: { select: { id: true, memberNo: true, fullName: true } },
      guarantor: { select: { id: true, memberNo: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return res.json({
    requests: requests.map((request) => ({
      ...request,
      amount: Number(request.amount),
      loan: {
        ...request.loan,
        principal: Number(request.loan.principal),
        outstandingBalance: Number(request.loan.outstandingBalance),
      },
    })),
  });
}));

router.get('/portfolio/analytics', authorizePermission('loans.analytics'), asyncHandler(async (req, res) => {
  const [statusGroups, riskGroups, loanRecords, totalLoans] = await Promise.all([
    prisma.loan.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { principal: true, outstandingBalance: true },
    }),
    prisma.loan.groupBy({
      by: ['aiRiskLevel'],
      _count: { _all: true },
    }),
    prisma.loan.findMany({
      include: {
        member: { select: { id: true, memberNo: true, fullName: true } },
      },
      orderBy: { appliedAt: 'desc' },
      take: 100,
    }),
    prisma.loan.count(),
  ]);
  const grouped = Object.fromEntries(statusGroups.map((group) => [group.status, group]));
  const totalsFor = (statuses) => statuses.reduce((result, status) => {
    const group = grouped[status];
    if (!group) return result;
    result.count += group._count._all;
    result.principal += group._sum.principal || 0n;
    result.outstanding += group._sum.outstandingBalance || 0n;
    return result;
  }, { count: 0, principal: 0n, outstanding: 0n });

  const pending = totalsFor(['pending']);
  const approved = totalsFor(['approved']);
  const active = totalsFor(['active']);
  const overdue = totalsFor(['overdue']);
  const defaulted = totalsFor(['defaulted']);
  const inRecovery = {
    count: overdue.count + defaulted.count,
    outstanding: overdue.outstanding + defaulted.outstanding,
  };
  const performingOutstanding = active.outstanding;
  const exposure = performingOutstanding + inRecovery.outstanding;
  const aiRiskCounts = Object.fromEntries(riskGroups
    .filter((group) => group.aiRiskLevel)
    .map((group) => [group.aiRiskLevel, group._count._all]));

  return res.json({
    summary: {
      totalLoans,
      pending: { count: pending.count, principal: Number(pending.principal) },
      approvedForDisbursement: { count: approved.count, principal: Number(approved.principal) },
      active: { count: active.count, principal: Number(active.principal), outstanding: Number(active.outstanding) },
      overdue: { count: overdue.count, outstanding: Number(overdue.outstanding) },
      defaulted: { count: defaulted.count, outstanding: Number(defaulted.outstanding) },
      recovery: { count: inRecovery.count, outstanding: Number(inRecovery.outstanding) },
      statusBasedRecoveryShare: exposure > 0n ? Number((inRecovery.outstanding * 10000n) / exposure) / 100 : 0,
      performanceNote: 'Recovery share uses recorded overdue/defaulted statuses; loan records do not currently define due dates or verified arrears aging.',
      aiRiskCounts,
    },
    pipeline: loanRecords.map((loan) => ({
      id: loan.id,
      loanNo: loan.loanNo,
      member: loan.member,
      principal: Number(loan.principal),
      totalRepayable: Number(loan.totalRepayable),
      outstandingBalance: Number(loan.outstandingBalance),
      interestRate: loan.interestRate,
      termMonths: loan.termMonths,
      status: loan.status,
      aiRiskScore: loan.aiRiskScore,
      aiRiskLevel: loan.aiRiskLevel,
      aiDecisionNote: loan.aiDecisionNote,
      applicationNote: loan.applicationNote,
      appliedAt: loan.appliedAt,
      disbursedAt: loan.disbursedAt,
    })),
    pipelineLimit: 100,
  });
}));

router.get('/:loanId/schedule', authorizePermission('loans.read'), asyncHandler(async (req, res) => {
  const loan = await prisma.loan.findUnique({ where: { id: req.params.loanId } });
  if (!loan) return res.status(404).json({ message: 'Loan not found' });
  return res.json({
    loan: { id: loan.id, loanNo: loan.loanNo, status: loan.status, disbursedAt: loan.disbursedAt },
    schedule: buildFlatRateSchedule(loan),
  });
}));

router.post('/', authorizePermission('loans.apply'), receiveLoanDocuments, validate(applicationSchema), asyncHandler(async (req, res) => {
  const {
    memberId, principal, interestRate, termMonths, applicationNote,
    employmentStatus, occupation, employerName, monthlyIncome, monthlyCommitments,
    guarantors,
  } = req.validatedBody;
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true, status: true } });
  if (!member || member.status !== 'active') {
    return res.status(404).json({ message: 'Active member not found' });
  }

  const totalInterest = Math.round(principal * (interestRate / 100) * (termMonths / 12));
  if (!Number.isSafeInteger(principal + totalInterest)) {
    return res.status(400).json({ message: 'Requested loan amount is too large' });
  }
  const documents = getLoanDocuments(req);
  const savedPaths = await saveLoanDocuments(documents);
  let loan;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const newLoan = await tx.loan.create({
        data: {
          loanNo: generateRef('LOAN'),
          memberId,
          principal: BigInt(principal),
          interestRate,
          termMonths,
          totalInterest: BigInt(totalInterest),
          totalRepayable: BigInt(principal + totalInterest),
          applicationNote: applicationNote || null,
          employmentStatus: employmentStatus || null,
          occupation: occupation || null,
          employerName: employerName || null,
          monthlyIncome: monthlyIncome ? BigInt(monthlyIncome) : null,
          monthlyCommitments: monthlyCommitments ? BigInt(monthlyCommitments) : null,
          status: 'pending',
          applicationDocuments: documents.length ? {
            create: documents.map(({ documentType, storedName, extension }) => ({ documentType, storedName, extension })),
          } : undefined,
        },
        include: { applicationDocuments: true },
      });
      const guarantorRequestsCreated = await createPendingGuaranteeRequests(
        tx, newLoan.id, memberId, principal, guarantors
      );
      return { loan: newLoan, guarantorRequestsCreated };
    });
    loan = created.loan;
    loan.guarantorRequestsCreated = created.guarantorRequestsCreated;
  } catch (error) {
    await removeLoanDocuments(savedPaths);
    throw error;
  }
  return res.status(201).json({
    loan: {
      ...formatLoan(loan),
    },
    guarantorRequestsCreated: loan.guarantorRequestsCreated,
  });
}));

router.patch('/guarantees/:guaranteeId/review', authorizePermission('guarantees.review'), validate(guaranteeReviewSchema), asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.validatedBody;
  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.guaranteeRequest.findUnique({
      where: { id: req.params.guaranteeId },
      select: { id: true, loanId: true, amount: true, status: true, loan: { select: { principal: true, status: true } } },
    });
    if (!request || request.status !== 'accepted') return { error: 'Guarantee request is not awaiting staff review', statusCode: 409 };
    if (!['pending', 'approved', 'active'].includes(request.loan.status)) {
      return { error: 'The related loan is no longer eligible for guarantee review', statusCode: 409 };
    }

    if (status === 'approved') {
      const approved = await tx.guaranteeRequest.aggregate({
        where: { loanId: request.loanId, status: 'approved', NOT: { id: request.id } },
        _sum: { amount: true },
      });
      if ((approved._sum.amount || 0n) + request.amount > request.loan.principal) {
        return { error: 'Approved guarantee amounts cannot exceed the loan principal', statusCode: 409 };
      }
    }

    const updated = await tx.guaranteeRequest.updateMany({
      where: { id: request.id, status: 'accepted' },
      data: {
        status,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
    });
    if (updated.count !== 1) return { error: 'Guarantee request changed; refresh and try again', statusCode: 409 };
    return { request: await tx.guaranteeRequest.findUnique({
      where: { id: request.id },
      include: {
        loan: { select: { loanNo: true, status: true } },
        borrower: { select: { memberNo: true, fullName: true } },
        guarantor: { select: { memberNo: true, fullName: true } },
      },
    }) };
  });
  if (result.error) return res.status(result.statusCode).json({ message: result.error });
  return res.json({
    request: { ...result.request, amount: Number(result.request.amount) },
    message: status === 'approved' ? 'Guarantee recorded as approved; no financial transaction was posted.' : 'Guarantee request rejected.',
  });
}));

router.patch('/:loanId/status', authorizePermission('loans.review'), validate(statusSchema), asyncHandler(async (req, res) => {
  const { status } = req.validatedBody;
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.loan.updateMany({
      where: { id: req.params.loanId, status: 'pending' },
      data: { status, ...(status === 'approved' ? { approvedBy: req.user.id } : {}) },
    });
    if (updated.count === 1 && status === 'rejected') {
      await tx.guaranteeRequest.updateMany({
        where: { loanId: req.params.loanId, status: { in: ['pending', 'accepted', 'approved'] } },
        data: { status: 'cancelled', reviewedAt: new Date(), reviewNote: 'Related loan application was rejected.' },
      });
    }
    return updated;
  });
  if (result.count !== 1) {
    return res.status(409).json({ message: 'Loan not found or no longer pending' });
  }
  return res.json({ loan: formatLoan(await prisma.loan.findUnique({ where: { id: req.params.loanId } })) });
}));

router.post('/:loanId/disburse', authorizePermission('loans.disburse'), asyncHandler(async (req, res) => {
  const loan = await prisma.$transaction(async (tx) => {
    const approvedLoan = await tx.loan.findUnique({ where: { id: req.params.loanId } });
    if (!approvedLoan || approvedLoan.status !== 'approved') {
      return null;
    }
    const updated = await tx.loan.updateMany({
      where: { id: approvedLoan.id, status: 'approved' },
      data: { status: 'active', outstandingBalance: approvedLoan.totalRepayable, disbursedAt: new Date() },
    });
    if (updated.count !== 1) {
      return null;
    }
    await tx.transaction.create({
      data: {
        reference: generateRef('DISB'),
        memberId: approvedLoan.memberId,
        loanId: approvedLoan.id,
        type: 'loan_disbursement',
        amount: approvedLoan.principal,
        channel: 'cash',
        createdBy: req.user.id,
      },
    });
    return tx.loan.findUnique({ where: { id: approvedLoan.id } });
  });
  if (!loan) {
    return res.status(409).json({ message: 'Loan not found or not approved for disbursement' });
  }
  return res.json({ loan: formatLoan(loan) });
}));

router.post('/:loanId/repayments', authorizePermission('loans.repay'), validate(repaymentSchema), asyncHandler(async (req, res) => {
  const { amount, channel } = req.validatedBody;
  const amountValue = BigInt(amount);
  const result = await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({ where: { id: req.params.loanId } });
    if (!loan || loan.status !== 'active') {
      return { error: 'Active loan not found', status: 404 };
    }
    if (amountValue > loan.outstandingBalance) {
      return { error: 'Repayment exceeds the outstanding balance', status: 400 };
    }
    const updated = await tx.loan.updateMany({
      where: { id: loan.id, status: 'active', outstandingBalance: { gte: amountValue } },
      data: { outstandingBalance: { decrement: amountValue } },
    });
    if (updated.count !== 1) {
      return { error: 'Loan balance changed; please retry the repayment', status: 409 };
    }
    const reference = generateRef('REPAY');
    const remaining = loan.outstandingBalance - amountValue;
    const repayment = await tx.loanRepayment.create({
      data: { loanId: loan.id, amount: amountValue, reference },
    });
    await tx.transaction.create({
      data: {
        reference,
        memberId: loan.memberId,
        loanId: loan.id,
        amount: amountValue,
        type: 'loan_repayment',
        balanceAfter: remaining,
        channel,
        createdBy: req.user.id,
      },
    });
    if (remaining === 0n) {
      await tx.loan.update({ where: { id: loan.id }, data: { status: 'repaid' } });
      await tx.guaranteeRequest.updateMany({
        where: { loanId: loan.id, status: 'approved' },
        data: { status: 'released', reviewedAt: new Date(), reviewNote: 'Related loan was fully repaid.' },
      });
    }
    return { repayment, remaining };
  });
  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }
  return res.status(201).json({
    repayment: { ...result.repayment, amount: Number(result.repayment.amount) },
    outstandingBalance: Number(result.remaining),
  });
}));

export default router;
