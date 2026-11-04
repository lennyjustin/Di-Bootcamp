import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { assertPasswordResetConfigured, completePasswordReset, sendPasswordReset } from '../services/password-reset.service.js';
import { authenticateGoogleCredential, linkGoogleCredential } from '../services/google-auth.service.js';
import { getRolePermissions, roleDefinitions } from '../config/roles.js';

const accountTypeRoles = {
  member: ['member'],
  staff: Object.keys(roleDefinitions).filter((role) => !['admin', 'super_admin'].includes(role)),
  admin: ['admin'],
  super_admin: ['super_admin'],
};

function accountMatchesType(role, accountType) {
  return accountTypeRoles[accountType]?.includes(role) ?? false;
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

function issueSession(user, res) {
  const token = jwt.sign(
    { sub: user.id, ver: user.tokenVersion },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '8h', issuer: 'microsacco-api', audience: 'microsacco-dashboard' }
  );
  res.cookie('sacco_session', token, cookieOptions);
}

export async function login(req, res, next) {
  try {
    const { email, password, accountType } = req.validatedBody;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { membershipApplication: { select: { status: true } } },
    });

    if (!user) {
      await bcrypt.hash(password, 12);
      return res.status(401).json({ message: 'Email or password is incorrect' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Email or password is incorrect' });
    }

    if (!accountMatchesType(user.role, accountType)) {
      return res.status(401).json({ message: 'Email or password is incorrect for the selected account type' });
    }

    if (!user.isActive) {
      if (user.membershipApplication?.status === 'pending') {
        return res.status(403).json({ message: 'Your membership application is awaiting SACCO approval.' });
      }
      return res.status(403).json({ message: 'This account is not active. Contact your SACCO administrator.' });
    }

    if (user.role === 'member') {
      const linkedMember = await prisma.member.findUnique({
        where: { id: user.memberId || '' },
        select: { status: true },
      });
      if (!linkedMember || linkedMember.status !== 'active') {
        return res.status(401).json({ message: 'Email or password is incorrect' });
      }
    }

    issueSession(user, res);
    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: getRolePermissions(user.role, user.permissionOverrides),
        googleLinked: Boolean(user.googleSub),
        passwordChangeRequired: user.passwordChangeRequired,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function requestPasswordReset(req, res, next) {
  try {
    assertPasswordResetConfigured();
    const user = await prisma.user.findUnique({
      where: { email: req.validatedBody.email.toLowerCase() },
      select: { id: true, email: true, isActive: true },
    });
    if (user?.isActive) await sendPasswordReset(user.id, user.email);
    return res.json({ message: 'If an active account exists for that email, a password reset link has been sent.' });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const passwordHash = await bcrypt.hash(req.validatedBody.password, 12);
    const reset = await completePasswordReset(req.validatedBody.token, passwordHash);
    if (!reset) {
      return res.status(400).json({ message: 'This password reset link is invalid or expired. Request a new one.' });
    }
    return res.json({ message: 'Password reset successfully. Sign in with your new password.' });
  } catch (error) {
    return next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const user = await authenticateGoogleCredential(req.validatedBody.credential);
    if (!accountMatchesType(user.role, req.validatedBody.accountType)) {
      return res.status(401).json({ message: 'Google account does not match the selected account type' });
    }
    issueSession(user, res);
    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: getRolePermissions(user.role, user.permissionOverrides),
        googleLinked: Boolean(user.googleSub),
        passwordChangeRequired: user.passwordChangeRequired,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function linkGoogleAccount(req, res, next) {
  try {
    await linkGoogleCredential(req.user.id, req.validatedBody.credential);
    return res.json({ googleLinked: true });
  } catch (error) {
    return next(error);
  }
}

export function logout(req, res) {
  res.clearCookie('sacco_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return res.status(204).end();
}

export function currentUser(req, res) {
  return res.json({
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions,
      googleLinked: Boolean(req.user.googleSub),
      passwordChangeRequired: req.user.passwordChangeRequired,
    },
  });
}

export function currentSession(req, res) {
  if (!req.user) {
    return res.json({ user: null });
  }

  return currentUser(req, res);
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.validatedBody;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { passwordHash: true, tokenVersion: true },
    });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { id: req.user.id, tokenVersion: user.tokenVersion },
        data: {
          passwordHash: await bcrypt.hash(newPassword, 12),
          passwordChangeRequired: false,
          tokenVersion: { increment: 1 },
        },
      });
      if (updated.count === 1) {
        await tx.passwordResetToken.deleteMany({ where: { userId: req.user.id } });
      }
      return updated;
    });
    if (result.count !== 1) {
      return res.status(409).json({ message: 'Password changed in another session; sign in again' });
    }

    issueSession({ id: req.user.id, tokenVersion: user.tokenVersion + 1 }, res);
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return next(error);
  }
}
