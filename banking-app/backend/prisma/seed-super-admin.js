import bcrypt from 'bcryptjs';
import 'dotenv/config';
import prisma from '../src/config/db.js';

const { SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!SUPER_ADMIN_NAME?.trim() || !SUPER_ADMIN_EMAIL?.trim() || !SUPER_ADMIN_PASSWORD
  || SUPER_ADMIN_PASSWORD.length < 16
  || Buffer.byteLength(SUPER_ADMIN_PASSWORD, 'utf8') > 72) {
  throw new Error('Set SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, and a unique SUPER_ADMIN_PASSWORD of 16–72 UTF-8 bytes in backend/.env.');
}

const email = SUPER_ADMIN_EMAIL.trim().toLowerCase();
if (email === ADMIN_EMAIL?.trim().toLowerCase() || SUPER_ADMIN_PASSWORD === ADMIN_PASSWORD) {
  throw new Error('Use a separate email and password for the super administrator.');
}

try {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === 'super_admin') {
      console.log('The configured super administrator already exists; no account or password was changed.');
    } else {
      throw new Error('The configured super administrator email already belongs to a different account.');
    }
  } else {
    await prisma.user.create({
      data: {
        fullName: SUPER_ADMIN_NAME.trim(),
        email,
        passwordHash: await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12),
        role: 'super_admin',
      },
    });
    console.log(`Created super administrator account: ${email}`);
  }
} finally {
  await prisma.$disconnect();
}
