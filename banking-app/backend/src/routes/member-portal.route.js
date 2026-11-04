import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate, requirePasswordChangeComplete } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateRef } from '../utils/generateRef.js';
import { createMemberStkPayment, isDarajaConfigured, refreshMemberPayment } from '../services/daraja.service.js';
import { answerMemberQuestion } from '../services/ai-assistant.service.js';
import { buildFlatRateSchedule } from '../services/loan-schedule.service.js';
import { createPendingGuaranteeRequests } from '../services/loan-guarantees.service.js';
import {
  getLoanDocuments,
  readLoanDocument,
  receiveLoanDocuments,
  removeLoanDocuments,
  saveLoanDocuments,
} from '../services/loan-application-documents.service.js';
import { rateLimit } from 'express-rate-limit';

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
  principal: z.coerce.number().int().positive().safe(),
  termMonths: z.coerce.number().int().min(1).max(120),
  applicationNote: optionalText(300),
  employmentStatus: z.preprocess((value) => value === '' ? undefined : value, z.enum(['employed', 'self_employed', 'other']).optional()),
  occupation: optionalText(120),
  employerName: optionalText(120),
  monthlyIncome: optionalAmount,
  monthlyCommitments: optionalAmount,
  guarantors: guarantorsInput,
});
const guaranteeRequestSchema = z.object({
  loanId: z.string().uuid(),
  guarantorMemberNo: z.string().trim().min(3).max(32),
  amount: z.number().int().positive().safe(),
});
const guaranteeResponseSchema = z.object({
  status: z.enum(['accepted', 'declined']),
});
const stkPaymentSchema = z.discriminatedUnion('purpose', [
  z.object({
    purpose: z.literal('savings_deposit'),
    accountId: z.string().uuid(),
    amount: z.number().int().positive().safe().max(100_000_000),
    phone: z.string().trim().min(9).max(20),
  }),
  z.object({
    purpose: z.literal('loan_repayment'),
    loanId: z.string().uuid(),
    amount: z.number().int().positive().safe().max(100_000_000),
    phone: z.string().trim().min(9).max(20),
  }),
]);
const annualInterestRate = Number(process.env.DEFAULT_LOAN_INTEREST_RATE || 12);
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many M-Pesa payment attempts; please try again later.' },
});
const assistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many assistant requests. Please try again later.' },
});
const assistantSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(2000),
  })).max(8).default([]),
});

if (!Number.isFinite(annualInterestRate) || annualInterestRate < 0 || annualInterestRate > 100) {
  throw new Error('DEFAULT_LOAN_INTEREST_RATE must be between 0 and 100.');
}

router.use(authenticate, authorize('member'), requirePasswordChangeComplete);

router.post('/assistant/chat', assistantLimiter, validate(assistantSchema), asyncHandler(async (req, res) => {
  const answer = await answerMemberQuestion({
    memberId: req.user.memberId,
    ...req.validatedBody,
  });
  return res.json({ answer });
}));

router.get('/guarantees', asyncHandler(async (req, res) => {
  const memberId = req.user.memberId;
  const [sent, received] = await Promise.all([
    prisma.guaranteeRequest.findMany({
      where: { borrowerMemberId: memberId },
      include: {
        loan: { select: { id: true, loanNo: true, principal: true, outstandingBalance: true, status: true } },
        guarantor: { select: { memberNo: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.guaranteeRequest.findMany({
      where: { guarantorMemberId: memberId },
      include: {
        loan: { select: { id: true, loanNo: true, principal: true, outstandingBalance: true, status: true } },
        borrower: { select: { memberNo: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);
  const formatRequest = (request) => ({
    ...request,
    amount: Number(request.amount),
    loan: {
      ...request.loan,
      principal: Number(request.loan.principal),
      outstandingBalance: Number(request.loan.outstandingBalance),
    },
  });
  return res.json({
    myGuarantees: sent.map(formatRequest),
    requests: received.filter((request) => request.status === 'pending').map(formatRequest),
    decisions: received.filter((request) => request.status !== 'pending').map(formatRequest),
    liabilities: received.filter((request) => request.status === 'approved').map(formatRequest),
    notice: 'Recorded guarantee amounts and loan balances are shown separately. They do not determine legal liability or initiate collection.',
  });
}));

router.post('/guarantees', validate(guaranteeRequestSchema), asyncHandler(async (req, res) => {
  const { loanId, guarantorMemberNo, amount } = req.validatedBody;
  const result = await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findFirst({
      where: { id: loanId, memberId: req.user.memberId, status: 'pending' },
      select: { id: true, principal: true, loanNo: true },
    });
    if (!loan) return { error: 'Choose one of your loan applications awaiting review.', statusCode: 404 };

    const guarantor = await tx.member.findUnique({
      where: { memberNo: guarantorMemberNo },
      select: {
        id: true,
        fullName: true,
        memberNo: true,
        status: true,
        portalUser: { select: { id: true, isActive: true, role: true } },
      },
    });
    if (!guarantor || guarantor.status !== 'active' || !guarantor.portalUser?.isActive || guarantor.portalUser.role !== 'member') {
      return { error: 'An active member portal account was not found for that member number.', statusCode: 404 };
    }
    if (guarantor.id === req.user.memberId) {
      return { error: 'You cannot request a guarantee from yourself.', statusCode: 400 };
    }

    const reserved = await tx.guaranteeRequest.aggregate({
      where: { loanId, status: { in: ['pending', 'accepted', 'approved'] } },
      _sum: { amount: true },
    });
    const alreadyReserved = reserved._sum.amount || 0n;
    const requestedAmount = BigInt(amount);
    if (alreadyReserved + requestedAmount > loan.principal) {
      return { error: 'Total requested and approved guarantee amounts cannot exceed the loan principal.', statusCode: 400 };
    }
    const duplicate = await tx.guaranteeRequest.findFirst({
      where: {
        loanId,
        guarantorMemberId: guarantor.id,
        status: { in: ['pending', 'accepted', 'approved'] },
      },
      select: { id: true },
    });
    if (duplicate) return { error: 'A current guarantee request already exists for this member and loan.', statusCode: 409 };

    const request = await tx.guaranteeRequest.create({
      data: {
        loanId,
        borrowerMemberId: req.user.memberId,
        guarantorMemberId: guarantor.id,
        amount: requestedAmount,
      },
      include: {
        loan: { select: { id: true, loanNo: true, principal: true, outstandingBalance: true, status: true } },
        guarantor: { select: { memberNo: true, fullName: true } },
      },
    });
    return { request };
  });
  if (result.error) return res.status(result.statusCode).json({ message: result.error });
  return res.status(201).json({
    request: {
      ...result.request,
      amount: Number(result.request.amount),
      loan: {
        ...result.request.loan,
        principal: Number(result.request.loan.principal),
        outstandingBalance: Number(result.request.loan.outstandingBalance),
      },
    },
    message: 'Guarantee request sent. It is not recorded as a liability unless the member accepts and SACCO staff approve it.',
  });
}));

router.patch('/guarantees/:guaranteeId/response', validate(guaranteeResponseSchema), asyncHandler(async (req, res) => {
  const { status } = req.validatedBody;
  const updated = await prisma.guaranteeRequest.updateMany({
    where: {
      id: req.params.guaranteeId,
      guarantorMemberId: req.user.memberId,
      status: 'pending',
    },
    data: { status, respondedAt: new Date() },
  });
  if (updated.count !== 1) {
    return res.status(409).json({ message: 'Guarantee request not found or already answered.' });
  }
  return res.json({
    message: status === 'accepted'
      ? 'Consent recorded. The guarantee still requires SACCO staff review before it becomes an accepted record.'
      : 'Guarantee request declined.',
  });
}));

router.get('/', asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { id: req.user.memberId },
    select: {
      id: true,
      memberNo: true,
      fullName: true,
      email: true,
      phone: true,
      status: true,
      joinedAt: true,
      accounts: {
        select: {
          id: true,
          accountNo: true,
          balance: true,
          minimumBalance: true,
          interestRate: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      loans: {
        select: {
          id: true,
          loanNo: true,
          principal: true,
          interestRate: true,
          termMonths: true,
          totalInterest: true,
          totalRepayable: true,
          outstandingBalance: true,
          status: true,
          applicationNote: true,
          appliedAt: true,
          disbursedAt: true,
          employmentStatus: true,
          occupation: true,
          employerName: true,
          monthlyIncome: true,
          monthlyCommitments: true,
          applicationDocuments: {
            select: { id: true, documentType: true, extension: true, createdAt: true },
          },
        },
        orderBy: { appliedAt: 'desc' },
      },
    },
  });

  if (!member) {
    return res.status(404).json({ message: 'Member profile not found' });
  }

  const transactions = await prisma.transaction.findMany({
    where: { memberId: member.id },
    select: {
      id: true,
      reference: true,
      type: true,
      amount: true,
      balanceAfter: true,
      channel: true,
      status: true,
      description: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const savingsBalance = member.accounts
    .filter((account) => account.status === 'active')
    .reduce((total, account) => total + Number(account.balance), 0);
  return res.json({
    darajaEnabled: isDarajaConfigured(),
    member: {
      id: member.id,
      memberNo: member.memberNo,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      status: member.status,
      joinedAt: member.joinedAt,
    },
    summary: { savingsBalance },
    accounts: member.accounts.map((account) => ({
      ...account,
      balance: Number(account.balance),
      minimumBalance: Number(account.minimumBalance),
      interestRate: Number(account.interestRate),
    })),
    loans: member.loans.map((loan) => ({
      ...loan,
      principal: Number(loan.principal),
      interestRate: Number(loan.interestRate),
      totalInterest: Number(loan.totalInterest),
      totalRepayable: Number(loan.totalRepayable),
      outstandingBalance: Number(loan.outstandingBalance),
      monthlyIncome: loan.monthlyIncome === null ? null : Number(loan.monthlyIncome),
      monthlyCommitments: loan.monthlyCommitments === null ? null : Number(loan.monthlyCommitments),
    })),
    transactions: transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      balanceAfter: transaction.balanceAfter === null ? null : Number(transaction.balanceAfter),
    })),
  });
}));

router.post('/loans', receiveLoanDocuments, validate(applicationSchema), asyncHandler(async (req, res) => {
  const {
    principal, termMonths, applicationNote, employmentStatus, occupation, employerName,
    monthlyIncome, monthlyCommitments, guarantors,
  } = req.validatedBody;
  const member = await prisma.member.findUnique({
    where: { id: req.user.memberId },
    select: { id: true, status: true },
  });
  if (!member || member.status !== 'active') {
    return res.status(403).json({ message: 'Active membership is required to apply for a loan' });
  }

  const existingPendingLoan = await prisma.loan.findFirst({
    where: { memberId: member.id, status: 'pending' },
    select: { id: true },
  });
  if (existingPendingLoan) {
    return res.status(409).json({ message: 'You already have a loan application awaiting a decision' });
  }

  const totalInterest = Math.round(principal * (annualInterestRate / 100) * (termMonths / 12));
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
          memberId: member.id,
          principal: BigInt(principal),
          interestRate: annualInterestRate,
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
        select: {
          id: true,
          loanNo: true,
          principal: true,
          interestRate: true,
          termMonths: true,
          totalInterest: true,
          totalRepayable: true,
          status: true,
          applicationNote: true,
          appliedAt: true,
          employmentStatus: true,
          occupation: true,
          employerName: true,
          monthlyIncome: true,
          monthlyCommitments: true,
          applicationDocuments: { select: { id: true, documentType: true, extension: true, createdAt: true } },
        },
      });
      const guarantorRequestsCreated = await createPendingGuaranteeRequests(
        tx, newLoan.id, member.id, principal, guarantors
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
      ...loan,
      principal: Number(loan.principal),
      interestRate: Number(loan.interestRate),
      totalInterest: Number(loan.totalInterest),
      totalRepayable: Number(loan.totalRepayable),
      monthlyIncome: loan.monthlyIncome === null ? null : Number(loan.monthlyIncome),
      monthlyCommitments: loan.monthlyCommitments === null ? null : Number(loan.monthlyCommitments),
    },
    guarantorRequestsCreated: loan.guarantorRequestsCreated,
  });
}));

router.get('/loans/:loanId/documents/:documentId', asyncHandler(async (req, res) => {
  const document = await prisma.loanApplicationDocument.findFirst({
    where: { id: req.params.documentId, loanId: req.params.loanId, loan: { memberId: req.user.memberId } },
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

router.get('/loans/:loanId/schedule', asyncHandler(async (req, res) => {
  const loan = await prisma.loan.findFirst({
    where: { id: req.params.loanId, memberId: req.user.memberId },
  });
  if (!loan) return res.status(404).json({ message: 'Loan not found' });
  return res.json({
    loan: { id: loan.id, loanNo: loan.loanNo, status: loan.status, disbursedAt: loan.disbursedAt },
    schedule: buildFlatRateSchedule(loan),
  });
}));

router.post('/payments/stk', paymentLimiter, validate(stkPaymentSchema), asyncHandler(async (req, res) => {
  const payment = await createMemberStkPayment({
    memberId: req.user.memberId,
    ...req.validatedBody,
  });
  return res.status(202).json({
    payment,
    message: 'Payment prompt sent. Approve it on your phone, then check its status here.',
  });
}));

router.get('/payments/:paymentId', asyncHandler(async (req, res) => {
  if (!/^[a-f0-9]{32}$/i.test(req.params.paymentId)) {
    return res.status(400).json({ message: 'Invalid payment ID.' });
  }
  const payment = await refreshMemberPayment(req.params.paymentId, req.user.memberId);
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found.' });
  }
  return res.json({
    payment: { ...payment, amount: Number(payment.amount) },
  });
}));

export default router;
