import express from 'express';
import { z } from 'zod';
import {
  changePassword,
  currentSession,
  currentUser,
  googleLogin,
  linkGoogleAccount,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.controller.js';
import { authenticate, optionalAuthenticate, requirePasswordChangeComplete } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts; please try again later' },
});
const resetRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Please try again later.' },
});
const googleLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
const accountTypeSchema = z.enum(['member', 'staff', 'admin', 'super_admin']);
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).refine(
    (password) => Buffer.byteLength(password, 'utf8') <= 72,
    'Password is too long'
  ),
  accountType: accountTypeSchema,
});
const resetRequestSchema = z.object({
  email: z.string().trim().email().max(254),
});
const resetPasswordSchema = z.object({
  token: z.string().min(32).max(128),
  password: z.string().min(12).refine(
    (password) => Buffer.byteLength(password, 'utf8') <= 72,
    'Password must be no more than 72 UTF-8 bytes'
  ),
});
const googleLoginSchema = z.object({
  credential: z.string().min(100).max(10000),
  accountType: accountTypeSchema,
});
const googleLinkSchema = z.object({
  credential: z.string().min(100).max(10000),
});
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).refine((password) => Buffer.byteLength(password, 'utf8') <= 72),
  newPassword: z.string().min(12).refine((password) => Buffer.byteLength(password, 'utf8') <= 72),
}).refine((passwords) => passwords.currentPassword !== passwords.newPassword, {
  message: 'Choose a new password different from your current password',
  path: ['newPassword'],
});

router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(login));
router.post('/google', googleLoginLimiter, validate(googleLoginSchema), asyncHandler(googleLogin));
router.post('/google/link', authenticate, requirePasswordChangeComplete, googleLoginLimiter, validate(googleLinkSchema), asyncHandler(linkGoogleAccount));
router.post('/forgot-password', resetRequestLimiter, validate(resetRequestSchema), asyncHandler(requestPasswordReset));
router.post('/reset-password', resetRequestLimiter, validate(resetPasswordSchema), asyncHandler(resetPassword));
router.post('/logout', logout);
router.get('/session', optionalAuthenticate, currentSession);
router.get('/me', authenticate, currentUser);
router.post('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(changePassword));

export default router;
