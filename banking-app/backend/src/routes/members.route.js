import express from 'express';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { authorizePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateRef } from '../utils/generateRef.js';

const router = express.Router();
const createMemberSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  nationalId: z.string().trim().min(4).max(32),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
  address: z.string().trim().max(300).optional(),
  dob: z.string().datetime().optional(),
});
const updateMemberSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().min(7).max(20).optional(),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
  address: z.string().trim().max(300).optional(),
  status: z.enum(['active', 'suspended']).optional(),
}).refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');
const portalAccountSchema = z.object({
  confirmEmail: z.string().trim().email().max(254),
});

router.use(authenticate);

router.get('/', authorizePermission('members.read'), asyncHandler(async (req, res) => {
  const query = z.coerce.number().int().min(1).max(100).catch(50).parse(req.query.limit);
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  const members = await prisma.member.findMany({
    where: search ? {
      OR: [
        { fullName: { contains: search } },
        { memberNo: { contains: search } },
        { phone: { contains: search } },
      ],
    } : undefined,
    select: {
      id: true,
      memberNo: true,
      fullName: true,
      phone: true,
      email: true,
      status: true,
      joinedAt: true,
      portalUser: { select: { id: true, isActive: true } },
      accounts: { select: { id: true, accountNo: true, balance: true, status: true } },
    },
    orderBy: { joinedAt: 'desc' },
    take: query,
  });
  return res.json({
    members: members.map((member) => ({
      ...member,
      portalAccess: member.portalUser
        ? { enabled: true, active: member.portalUser.isActive }
        : { enabled: false, active: false },
      portalUser: undefined,
      accounts: member.accounts.map((account) => ({ ...account, balance: Number(account.balance) })),
    })),
  });
}));

router.get('/:memberId/profile', authorizePermission('members.profile.read'), asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { id: req.params.memberId },
    include: {
      portalUser: {
        select: {
          email: true,
          isActive: true,
          membershipApplication: {
            select: {
              status: true,
              citizenship: true,
              identificationType: true,
              identificationNumber: true,
              kraPin: true,
              membershipType: true,
              commonBondDetails: true,
              nextOfKinName: true,
              nextOfKinRelationship: true,
              nextOfKinPhone: true,
              employmentStatus: true,
              occupation: true,
              employerName: true,
              monthlyIncome: true,
              applicationStatement: true,
              createdAt: true,
              reviewedAt: true,
              reviewNote: true,
            },
          },
        },
      },
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
        orderBy: { createdAt: 'desc' },
      },
      loans: {
        include: {
          repayments: { orderBy: { paidAt: 'desc' }, take: 100 },
        },
        orderBy: { appliedAt: 'desc' },
        take: 100,
      },
      shares: { orderBy: { createdAt: 'desc' }, take: 100 },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
      mpesaTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          purpose: true,
          checkoutRequestId: true,
          receiptNumber: true,
          phoneNumber: true,
          amount: true,
          status: true,
          resultCode: true,
          resultDescription: true,
          settledAt: true,
          createdAt: true,
        },
      },
    },
  });
  if (!member) return res.status(404).json({ message: 'Member not found' });

  const application = member.portalUser?.membershipApplication;
  const { portalUser, accounts, loans, shares, transactions, mpesaTransactions, ...personal } = member;
  return res.json({
    member: {
      ...personal,
      email: portalUser?.email || member.email,
      portalAccess: portalUser ? { enabled: true, active: portalUser.isActive } : { enabled: false, active: false },
      application: application ? {
        ...application,
        monthlyIncome: Number(application.monthlyIncome),
      } : null,
      accounts: accounts.map((account) => ({
        ...account,
        balance: Number(account.balance),
        minimumBalance: Number(account.minimumBalance),
      })),
      loans: loans.map((loan) => ({
        ...loan,
        principal: Number(loan.principal),
        totalInterest: Number(loan.totalInterest),
        totalRepayable: Number(loan.totalRepayable),
        outstandingBalance: Number(loan.outstandingBalance),
        repayments: loan.repayments.map((repayment) => ({ ...repayment, amount: Number(repayment.amount) })),
      })),
      shares: shares.map((share) => ({ ...share, valuePerShare: Number(share.valuePerShare) })),
      transactions: transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
        balanceAfter: transaction.balanceAfter === null ? null : Number(transaction.balanceAfter),
      })),
      mpesaTransactions: mpesaTransactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
        phoneNumber: transaction.phoneNumber ? `***${transaction.phoneNumber.slice(-3)}` : null,
      })),
    },
  });
}));

router.post('/:memberId/portal-account', authorizePermission('members.manage'), validate(portalAccountSchema), asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { id: req.params.memberId },
    select: { id: true, fullName: true, email: true, status: true, portalUser: { select: { id: true } } },
  });
  if (!member || member.status !== 'active') {
    return res.status(404).json({ message: 'Active member not found' });
  }
  if (member.portalUser) {
    return res.status(409).json({ message: 'This member already has a portal account' });
  }

  const email = req.validatedBody.confirmEmail.toLowerCase();
  if (!member.email || member.email.toLowerCase() !== email) {
    return res.status(400).json({ message: 'Confirm the email address already recorded for this member' });
  }

  const temporaryPassword = randomBytes(18).toString('base64url');
  const user = await prisma.user.create({
    data: {
      fullName: member.fullName,
      email,
      passwordHash: await bcrypt.hash(temporaryPassword, 12),
      role: 'member',
      isActive: true,
      passwordChangeRequired: true,
      memberId: member.id,
    },
    select: { id: true, email: true },
  });

  return res.status(201).json({
    portalAccount: { id: user.id, email: user.email, temporaryPassword },
    message: 'Share this temporary password securely. It is shown only once; the member must change it at first sign-in.',
  });
}));

router.post('/', authorizePermission('members.manage'), validate(createMemberSchema), asyncHandler(async (req, res) => {
  const { fullName, phone, nationalId, email, address, dob } = req.validatedBody;
  const member = await prisma.$transaction(async (tx) => {
    const created = await tx.member.create({
      data: {
        memberNo: generateRef('MEM'),
        fullName,
        phone,
        nationalId,
        email: email || null,
        address,
        dob: dob ? new Date(dob) : null,
      },
    });
    await tx.savingsAccount.create({
      data: {
        memberId: created.id,
        accountNo: generateRef('SAV'),
      },
    });
    return created;
  });
  return res.status(201).json({
    member: {
      id: member.id,
      memberNo: member.memberNo,
      fullName: member.fullName,
      phone: member.phone,
      email: member.email,
      status: member.status,
      joinedAt: member.joinedAt,
    },
  });
}));

router.patch('/:memberId', authorizePermission('members.manage'), validate(updateMemberSchema), asyncHandler(async (req, res) => {
  const data = { ...req.validatedBody };
  if (data.email === '') data.email = null;
  const member = await prisma.member.update({
    where: { id: req.params.memberId },
    data,
    select: {
      id: true,
      memberNo: true,
      fullName: true,
      phone: true,
      email: true,
      status: true,
      joinedAt: true,
    },
  });
  return res.json({ member });
}));

export default router;
