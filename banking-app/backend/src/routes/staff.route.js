import express from 'express';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/db.js';
import { getRolePermissions, permissionCatalog, roleDefinitions } from '../config/roles.js';
import { authenticate } from '../middleware/auth.js';
import { auditRequest } from '../middleware/audit.js';
import { authorizePermission } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
const staffRoles = Object.keys(roleDefinitions);
const permissionNames = Object.keys(permissionCatalog);
const permissionSchema = z.array(z.enum(permissionNames)).max(permissionNames.length);
const createStaffSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  role: z.enum(staffRoles),
});
const updateStaffSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(staffRoles).optional(),
  permissionOverrides: permissionSchema.nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, 'Provide a role, permission set, or account status');

function isSuperAdmin(req) {
  return req.user.role === 'super_admin';
}

router.use(authenticate, auditRequest({ includeReads: true }));

router.get('/roles', authorizePermission('staff.read'), (req, res) => (
  res.json({
    roles: Object.entries(roleDefinitions).map(([id, definition]) => ({ id, ...definition })),
    permissionCatalog,
  })
));

router.get('/users', authorizePermission('staff.read'), asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: { in: Object.keys(roleDefinitions) } },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      passwordChangeRequired: true,
      permissionOverrides: true,
      createdAt: true,
    },
    orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
  });
  return res.json({
    users: users.map((user) => ({
      ...user,
      permissions: getRolePermissions(user.role, user.permissionOverrides),
    })),
  });
}));

router.post('/', authorizePermission('staff.manage'), validate(createStaffSchema), asyncHandler(async (req, res) => {
  const { fullName, role } = req.validatedBody;
  if (['admin', 'super_admin'].includes(role) && !isSuperAdmin(req)) {
    return res.status(403).json({ message: 'Only a super administrator can create administrator accounts' });
  }
  const email = req.validatedBody.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return res.status(409).json({ message: 'An account already exists for that email address' });
  }

  const temporaryPassword = randomBytes(24).toString('base64url');
  try {
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        role,
        passwordHash: await bcrypt.hash(temporaryPassword, 12),
        passwordChangeRequired: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        passwordChangeRequired: true,
        permissionOverrides: true,
        createdAt: true,
      },
    });
    return res.status(201).json({
      user: { ...user, permissions: getRolePermissions(user.role, user.permissionOverrides) },
      temporaryPassword,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'An account already exists for that email address' });
    }
    throw error;
  }
}));

router.patch('/:userId', authorizePermission('staff.manage'), validate(updateStaffSchema), asyncHandler(async (req, res) => {
  if (req.params.userId === req.user.id) {
    return res.status(409).json({ message: 'You cannot change your own staff account' });
  }
  const target = await prisma.user.findUnique({
    where: { id: req.params.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!target || !staffRoles.includes(target.role)) {
    return res.status(404).json({ message: 'Staff account not found' });
  }
  const { role, isActive, permissionOverrides } = req.validatedBody;
  if (!isSuperAdmin(req) && ['admin', 'super_admin'].includes(target.role)) {
    return res.status(403).json({ message: 'Only a super administrator can manage administrator accounts' });
  }
  if (!isSuperAdmin(req) && ['admin', 'super_admin'].includes(role)) {
    return res.status(403).json({ message: 'Only a super administrator can assign administrator roles' });
  }
  if (permissionOverrides !== undefined && !isSuperAdmin(req)) {
    return res.status(403).json({ message: 'Only a super administrator can customize individual permissions' });
  }
  if ((role === 'super_admin' || (!role && target.role === 'super_admin')) && permissionOverrides) {
    return res.status(400).json({ message: 'A super administrator always retains full system permissions' });
  }
  const protectedSuperAdmin = target.role === 'super_admin'
    && ((role !== undefined && role !== 'super_admin') || isActive === false);
  const result = await prisma.$transaction(async (tx) => {
    if (protectedSuperAdmin) {
      const activeSuperAdmins = await tx.user.count({
        where: { role: 'super_admin', isActive: true },
      });
      if (activeSuperAdmins <= 1) return { count: 0, lastSuperAdmin: true };
    }

    return {
      ...(await tx.user.updateMany({
        where: {
          id: req.params.userId,
          role: target.role,
          isActive: target.isActive,
        },
        data: {
          ...(isActive === undefined ? {} : { isActive }),
          ...(role ? { role } : {}),
          ...(role === 'super_admin' ? { permissionOverrides: null } : {}),
          ...(permissionOverrides === undefined ? {} : {
            permissionOverrides: permissionOverrides === null ? null : JSON.stringify(permissionOverrides),
          }),
          tokenVersion: { increment: 1 },
        },
      })),
      lastSuperAdmin: false,
    };
  });
  if (result.count !== 1) {
    if (result.lastSuperAdmin) {
      return res.status(409).json({ message: 'The last active super administrator cannot be disabled or demoted' });
    }
    return res.status(404).json({ message: 'Staff account not found' });
  }
  return res.json({ message: 'Staff account updated' });
}));

export default router;
