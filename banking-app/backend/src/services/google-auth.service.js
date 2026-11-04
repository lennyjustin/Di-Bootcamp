import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/db.js';

export async function verifyGoogleCredential(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const error = new Error('Google sign-in is not configured. Contact your administrator.');
    error.statusCode = 503;
    throw error;
  }

  const client = new OAuth2Client(clientId);
  let ticket;
  try {
    ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
  } catch {
    const error = new Error('Google sign-in could not verify your account.');
    error.statusCode = 401;
    throw error;
  }

  const payload = ticket.getPayload();
  if (!payload?.email || payload.email_verified !== true || !payload.sub) {
    const error = new Error('Use a Google account with a verified email address.');
    error.statusCode = 401;
    throw error;
  }

  return {
    googleSub: payload.sub,
    email: payload.email.toLowerCase(),
  };
}

export async function authenticateGoogleCredential(credential) {
  const { googleSub, email } = await verifyGoogleCredential(credential);
  const linkedUser = await prisma.user.findUnique({
    where: { googleSub },
  });
  const user = linkedUser || await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    const error = new Error('No active SaccoBanking account is linked to this Google email.');
    error.statusCode = 401;
    throw error;
  }

  if (user.role === 'member') {
    const member = await prisma.member.findUnique({
      where: { id: user.memberId || '' },
      select: { status: true },
    });
    if (!member || member.status !== 'active') {
      const error = new Error('Member portal access is unavailable for this account.');
      error.statusCode = 403;
      throw error;
    }
  }

  return user;
}

export async function linkGoogleCredential(userId, credential) {
  const { googleSub, email } = await verifyGoogleCredential(credential);
  const [linkedUser, emailUser] = await Promise.all([
    prisma.user.findUnique({ where: { googleSub }, select: { id: true } }),
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (linkedUser && linkedUser.id !== userId) {
    const error = new Error('This Google account is already linked to another SaccoBanking account.');
    error.statusCode = 409;
    throw error;
  }
  if (emailUser && emailUser.id !== userId) {
    const error = new Error('This Google email belongs to another SaccoBanking account. Contact your SACCO administrator.');
    error.statusCode = 409;
    throw error;
  }

  try {
    const result = await prisma.user.updateMany({
      where: {
        id: userId,
        OR: [{ googleSub: null }, { googleSub }],
      },
      data: { googleSub },
    });
    if (result.count !== 1) {
      const error = new Error('A different Google account is already linked. Contact your SACCO administrator.');
      error.statusCode = 409;
      throw error;
    }
  } catch (error) {
    if (error.code === 'P2002') {
      const conflict = new Error('This Google account is already linked to another SaccoBanking account.');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }

  return { email };
}
