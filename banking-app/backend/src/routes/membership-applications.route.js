import express from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/db.js';
import { privateStorageDirectory } from '../config/privateStorage.js';
import { authenticate } from '../middleware/auth.js';
import { authorizePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateRef } from '../utils/generateRef.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const documentDirectory = resolve(privateStorageDirectory, 'member-applications');
const maxDocumentSize = 5 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxDocumentSize, files: 3, fields: 24, fieldSize: 16 * 1024 },
});
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many application attempts. Please try again later.' },
});
const applicationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(20),
  password: z.string().min(12).refine(
    (password) => Buffer.byteLength(password, 'utf8') <= 72,
    'Password must be no more than 72 UTF-8 bytes'
  ),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Enter a valid date of birth').transform((value) => new Date(`${value}T00:00:00.000Z`)),
  citizenship: z.literal('Kenyan'),
  identificationType: z.enum(['national_id', 'passport']),
  identificationNumber: z.string().trim().min(4).max(32),
  kraPin: z.string().trim().min(5).max(20).transform((value) => value.toUpperCase()),
  address: z.string().trim().min(5).max(300),
  membershipType: z.enum(['common_bond', 'open']),
  commonBondDetails: z.string().trim().max(300).optional(),
  nextOfKinName: z.string().trim().min(2).max(120),
  nextOfKinRelationship: z.string().trim().min(2).max(60),
  nextOfKinPhone: z.string().trim().min(7).max(20),
  employmentStatus: z.enum(['employed', 'self_employed', 'unemployed', 'retired', 'student']),
  occupation: z.string().trim().min(2).max(120),
  employerName: z.string().trim().max(120).optional(),
  monthlyIncome: z.string().regex(/^\d{1,15}$/).transform(BigInt),
  applicationStatement: z.string().trim().min(20).max(1000),
  obligationsAcknowledged: z.literal('yes'),
  documentConsent: z.literal('yes'),
}).superRefine((data, context) => {
  const today = new Date();
  const eighteenthBirthday = new Date(Date.UTC(
    data.dateOfBirth.getUTCFullYear() + 18,
    data.dateOfBirth.getUTCMonth(),
    data.dateOfBirth.getUTCDate()
  ));
  if (Number.isNaN(data.dateOfBirth.getTime()) || eighteenthBirthday > today) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfBirth'], message: 'Applicants must be at least 18 years old' });
  }
  if (data.membershipType === 'common_bond' && !data.commonBondDetails?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['commonBondDetails'], message: 'Describe your common bond with the SACCO' });
  }
  if (data.employmentStatus === 'employed' && !data.employerName?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['employerName'], message: 'Enter your employer name' });
  }
});
const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNote: z.string().trim().max(1000).optional(),
}).superRefine((data, context) => {
  if (data.status === 'rejected' && !data.reviewNote?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['reviewNote'], message: 'Provide a reason when rejecting an application' });
  }
});
const requiredDocuments = ['passport', 'kraPinDocument', 'identificationDocument'];
const documentTypes = {
  passport: 'passportFile',
  kraPin: 'kraPinFile',
  identification: 'identificationFile',
};

function receiveUploads(req, res, next) {
  upload.fields(requiredDocuments.map((name) => ({ name, maxCount: 1 })))(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) error.statusCode = 400;
      return next(error);
    }
    return next();
  });
}

function detectDocumentType(buffer) {
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') return 'pdf';
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  return null;
}

function getUploadedFiles(req) {
  const files = {};
  for (const name of requiredDocuments) {
    const file = req.files?.[name]?.[0];
    if (!file) {
      const label = { passport: 'passport photograph', kraPinDocument: 'KRA PIN document', identificationDocument: 'identification document' }[name];
      const error = new Error(`Upload the required ${label}.`);
      error.statusCode = 400;
      throw error;
    }
    const extension = detectDocumentType(file.buffer);
    if (!extension || (name === 'passport' && extension === 'pdf')) {
      const error = new Error('Documents must be valid PDF, JPEG, or PNG files; the passport photograph must be JPEG or PNG.');
      error.statusCode = 400;
      throw error;
    }
    files[name] = { buffer: file.buffer, extension, storedName: `${randomUUID()}.${extension}` };
  }
  return files;
}

async function saveDocuments(files) {
  await mkdir(documentDirectory, { recursive: true, mode: 0o700 });
  const savedPaths = [];
  try {
    for (const file of Object.values(files)) {
      const path = join(documentDirectory, file.storedName);
      await writeFile(path, file.buffer, { flag: 'wx', mode: 0o600 });
      savedPaths.push(path);
    }
    return savedPaths;
  } catch (error) {
    await Promise.all(savedPaths.map((path) => rm(path, { force: true })));
    throw error;
  }
}

function applicationRecord(application) {
  const { passportFile, kraPinFile, identificationFile, user, phone, ...details } = application;
  return {
    ...details,
    monthlyIncome: Number(details.monthlyIncome),
    applicant: {
      fullName: user.fullName,
      email: user.email,
      phone,
    },
    documents: {
      passport: Boolean(passportFile),
      kraPin: Boolean(kraPinFile),
      identification: Boolean(identificationFile),
    },
  };
}

router.post('/', registrationLimiter, receiveUploads, asyncHandler(async (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Review the application form and correct the highlighted fields.',
      errors: parsed.error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
    });
  }

  const data = parsed.data;
  const existingAccount = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
    select: { id: true },
  });
  if (existingAccount) {
    return res.status(409).json({
      message: 'An account already uses this email. If you are already a member, sign in instead; otherwise contact the SACCO for help.',
    });
  }

  const existingMember = await prisma.member.findFirst({
    where: { OR: [{ phone: data.phone }, { nationalId: data.identificationNumber }] },
    select: { id: true },
  });
  if (existingMember) {
    return res.status(409).json({
      message: 'A member record already uses this phone number or identification number. If you are already a member, sign in instead; otherwise contact the SACCO for help.',
    });
  }
  const files = getUploadedFiles(req);
  const savedPaths = await saveDocuments(files);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email.toLowerCase(),
          passwordHash: await bcrypt.hash(data.password, 12),
          role: 'member',
          isActive: false,
        },
        select: { id: true },
      });
      const application = await tx.membershipApplication.create({
        data: {
          userId: user.id,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          citizenship: data.citizenship,
          identificationType: data.identificationType,
          identificationNumber: data.identificationNumber,
          kraPin: data.kraPin,
          address: data.address,
          membershipType: data.membershipType,
          commonBondDetails: data.membershipType === 'common_bond' ? data.commonBondDetails : null,
          nextOfKinName: data.nextOfKinName,
          nextOfKinRelationship: data.nextOfKinRelationship,
          nextOfKinPhone: data.nextOfKinPhone,
          employmentStatus: data.employmentStatus,
          occupation: data.occupation,
          employerName: data.employerName || null,
          monthlyIncome: data.monthlyIncome,
          applicationStatement: data.applicationStatement,
          passportFile: files.passport.storedName,
          kraPinFile: files.kraPinDocument.storedName,
          identificationFile: files.identificationDocument.storedName,
        },
        select: { id: true, status: true, createdAt: true },
      });
      return application;
    });
    return res.status(201).json({
      application: result,
      message: 'Your membership application has been submitted for SACCO review. No membership or portal access is active yet.',
    });
  } catch (error) {
    await Promise.all(savedPaths.map((path) => rm(path, { force: true })));
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'An account or membership already exists with one of these details. If you are already a member, sign in instead; otherwise contact the SACCO for help.',
      });
    }
    throw error;
  }
}));

router.get('/', authenticate, authorizePermission('applications.manage'), asyncHandler(async (req, res) => {
  const applications = await prisma.membershipApplication.findMany({
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return res.json({ applications: applications.map(applicationRecord) });
}));

router.get('/:applicationId/documents/:documentType', authenticate, authorizePermission('applications.manage'), asyncHandler(async (req, res) => {
  const field = documentTypes[req.params.documentType];
  if (!field) return res.status(404).json({ message: 'Application document not found' });

  const application = await prisma.membershipApplication.findUnique({
    where: { id: req.params.applicationId },
    select: { [field]: true },
  });
  const storedName = application?.[field];
  if (!storedName) return res.status(404).json({ message: 'Application document not found' });

  const path = resolve(documentDirectory, storedName);
  if (dirname(path) !== documentDirectory) return res.status(404).json({ message: 'Application document not found' });
  const extension = storedName.split('.').pop();
  const contentType = { jpg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf' }[extension] || 'application/octet-stream';
  const content = await readFile(path);
  res.set({
    'Cache-Control': 'private, no-store',
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
  });
  return res.attachment(`${req.params.documentType}-document.${extension}`).send(content);
}));

router.patch('/:applicationId/review', authenticate, authorizePermission('applications.manage'), validate(reviewSchema), asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.validatedBody;
  const application = await prisma.membershipApplication.findUnique({
    where: { id: req.params.applicationId },
    include: { user: true },
  });
  if (!application) return res.status(404).json({ message: 'Membership application not found' });
  if (application.status !== 'pending') return res.status(409).json({ message: 'This application has already been reviewed' });

  await prisma.$transaction(async (tx) => {
    const updated = await tx.membershipApplication.updateMany({
      where: { id: application.id, status: 'pending' },
      data: { status, reviewNote: reviewNote || null, reviewedBy: req.user.id, reviewedAt: new Date() },
    });
    if (updated.count !== 1) {
      const error = new Error('This application has already been reviewed');
      error.statusCode = 409;
      throw error;
    }
    if (status === 'rejected') return;

    const member = await tx.member.create({
      data: {
        memberNo: generateRef('MEM'),
        fullName: application.user.fullName,
        phone: application.phone,
        email: application.user.email,
        nationalId: application.identificationNumber,
        dob: application.dateOfBirth,
        address: application.address,
        status: 'active',
      },
    });
    await tx.savingsAccount.create({
      data: { memberId: member.id, accountNo: generateRef('SAV') },
    });
    await tx.user.update({
      where: { id: application.userId },
      data: { isActive: true, memberId: member.id },
    });
  });
  return res.json({
    message: status === 'approved'
      ? 'Membership approved. The member account and savings account are now active.'
      : 'Membership application rejected',
    status,
  });
}));

export default router;
