import bcrypt from 'bcryptjs';
import 'dotenv/config';
import prisma from '../src/config/db.js';

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD
  || ADMIN_PASSWORD.length < 12
  || Buffer.byteLength(ADMIN_PASSWORD, 'utf8') > 72) {
  throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of 12–72 UTF-8 bytes before seeding.');
}

try {
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    throw new Error(`Administrator ${email} already exists; refusing to replace the account or password.`);
  }

  await prisma.user.create({
    data: {
      fullName: ADMIN_NAME.trim(),
      email,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
      role: 'admin',
    },
  });
  console.log(`Created administrator account: ${email}`);
} finally {
  await prisma.$disconnect();
}
