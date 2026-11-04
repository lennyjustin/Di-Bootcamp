import { createHash, randomBytes } from 'node:crypto';
import nodemailer from 'nodemailer';
import prisma from '../config/db.js';

const resetLifetimeMs = 30 * 60 * 1000;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function getSmtpConfig() {
  const { SMTP_HOST: host, SMTP_USER: user, SMTP_PASSWORD: password, SMTP_FROM: from } = process.env;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  if (!host || !user || !password || !from || !Number.isInteger(port) || port < 1 || port > 65535) {
    const error = new Error('Password reset email is not configured. Contact your administrator.');
    error.statusCode = 503;
    throw error;
  }
  return { host, port, secure, auth: { user, pass: password }, from };
}

export function assertPasswordResetConfigured() {
  getSmtpConfig();
}

export async function sendPasswordReset(userId, email) {
  const smtp = getSmtpConfig();
  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + resetLifetimeMs);
  const frontendOrigin = process.env.FRONTEND_ORIGIN?.split(',')[0]?.trim();
  if (!frontendOrigin) {
    const error = new Error('Password reset link origin is not configured.');
    error.statusCode = 503;
    throw error;
  }
  const resetUrl = new URL('/', frontendOrigin);
  resetUrl.searchParams.set('resetToken', token);

  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({ where: { userId } });
    await tx.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  });

  try {
    await transport.sendMail({
      from: smtp.from,
      to: email,
      subject: 'Reset your SaccoBanking password',
      text: `Use this link within 30 minutes to reset your password:\n\n${resetUrl.toString()}\n\nIf you did not request a reset, ignore this email.`,
      html: `<p>Use this link within 30 minutes to reset your password:</p><p><a href="${resetUrl.toString()}">Reset password</a></p><p>If you did not request a reset, ignore this email.</p>`,
    });
  } catch (error) {
    await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
    throw error;
  } finally {
    transport.close();
  }
}

export async function completePasswordReset(token, passwordHash) {
  const tokenHash = hashToken(token);
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const resetToken = await tx.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true },
    });
    if (!resetToken || resetToken.expiresAt <= now) {
      if (resetToken) {
        await tx.passwordResetToken.delete({ where: { id: resetToken.id } });
      }
      return false;
    }

    const claimed = await tx.passwordResetToken.deleteMany({
      where: { id: resetToken.id, tokenHash, expiresAt: { gt: now } },
    });
    if (claimed.count !== 1) return false;

    await tx.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        passwordChangeRequired: false,
        tokenVersion: { increment: 1 },
      },
    });
    await tx.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } });
    return true;
  });
}
