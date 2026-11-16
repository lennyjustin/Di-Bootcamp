import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { getRolePermissions } from '../config/roles.js';

function rejectSession(req, res, next, message, optional) {
  if (optional) {
    res.clearCookie('sacco_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    if (req.cookies) delete req.cookies.sacco_session;
    req.user = null;
    return next();
  }

  return res.status(401).json({ message });
}

export function authenticate(req, res, next, { optional = false } = {}) {
  const token = req.cookies?.sacco_session;
  if (!token) {
    if (optional) return next();
    return res.status(401).json({ message: 'Authentication required' });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'microsacco-api',
      audience: 'microsacco-dashboard',
    });
    if (typeof decoded !== 'object' || typeof decoded.sub !== 'string') {
      return rejectSession(req, res, next, 'Invalid session', optional);
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return rejectSession(req, res, next, 'Invalid or expired session', optional);
    }
    return next(error);
  }

  return prisma.user.findUnique({
    where: { id: decoded.sub },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      googleSub: true,
      passwordChangeRequired: true,
      tokenVersion: true,
      memberId: true,
      permissionOverrides: true,
      member: { select: { status: true } },
    },
  }).then((user) => {
    if (!user?.isActive) {
      return rejectSession(req, res, next, 'Session is no longer active', optional);
    }
    if ((decoded.ver ?? 0) !== user.tokenVersion) {
      return rejectSession(req, res, next, 'Session is no longer active', optional);
    }
    if (user.role === 'member' && (!user.memberId || user.member?.status !== 'active')) {
      return rejectSession(req, res, next, 'Member portal access is unavailable', optional);
    }
    req.user = user;
    req.user.permissions = getRolePermissions(user.role, user.permissionOverrides);
    return next();
  }).catch(next);
}

export function optionalAuthenticate(req, res, next) {
  return authenticate(req, res, next, { optional: true });
}

export function requirePasswordChangeComplete(req, res, next) {
  if (req.user?.passwordChangeRequired) {
    return res.status(403).json({ message: 'Change your temporary password before using the member portal' });
  }
  return next();
}
