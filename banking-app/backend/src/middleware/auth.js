import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { getRolePermissions } from '../config/roles.js';

export function authenticate(req, res, next) {
  const token = req.cookies?.sacco_session;
  if (!token) {
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
      return res.status(401).json({ message: 'Invalid session' });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Invalid or expired session' });
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
      return res.status(401).json({ message: 'Session is no longer active' });
    }
    if ((decoded.ver ?? 0) !== user.tokenVersion) {
      return res.status(401).json({ message: 'Session is no longer active' });
    }
    if (user.role === 'member' && (!user.memberId || user.member?.status !== 'active')) {
      return res.status(401).json({ message: 'Member portal access is unavailable' });
    }
    req.user = user;
    req.user.permissions = getRolePermissions(user.role, user.permissionOverrides);
    return next();
  }).catch(next);
}

export function optionalAuthenticate(req, res, next) {
  if (!req.cookies?.sacco_session) {
    return next();
  }
  return authenticate(req, res, next);
}

export function requirePasswordChangeComplete(req, res, next) {
  if (req.user?.passwordChangeRequired) {
    return res.status(403).json({ message: 'Change your temporary password before using the member portal' });
  }
  return next();
}
