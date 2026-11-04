import { randomBytes } from 'node:crypto';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/db.js';
import { generateRef } from '../src/utils/generateRef.js';

const staff = [
  { fullName: 'Demo Cashier', role: 'cashier', slug: 'cashier' },
  { fullName: 'Demo Credit Officer', role: 'credit_officer', slug: 'credit-officer' },
  { fullName: 'Demo Accountant', role: 'accountant', slug: 'accountant' },
  { fullName: 'Demo Board Member', role: 'board', slug: 'board' },
  { fullName: 'Demo Internal Auditor', role: 'auditor', slug: 'auditor' },
  { fullName: 'Demo IT Support', role: 'it_support', slug: 'it-support' },
].map((person) => ({ ...person, email: `demo.${person.slug}@example.test` }));

const memberNames = ['Lenny', 'Jane', 'Justin', 'Alice', 'Manu', 'Telvin', 'Malivin'];
const members = memberNames.map((firstName, index) => {
  const code = String(index + 1).padStart(4, '0');
  return {
    fullName: `${firstName} Demo`,
    email: `${firstName.toLowerCase()}.demo@example.test`,
    phone: `DEMO-${code}`,
    nationalId: `DEMO-ID-${code}`,
    address: 'Demo data only',
  };
});

const allEmails = [...staff, ...members].map(({ email }) => email);

async function ensureLoanForMember(tx, member, principal, status = 'pending') {
  const existingLoan = await tx.loan.findFirst({
    where: { memberId: member.id, principal: { gte: BigInt(principal) }, status },
    select: { id: true, principal: true, status: true },
  });

  if (existingLoan) return existingLoan;

  return tx.loan.create({
    data: {
      loanNo: generateRef('LOAN'),
      memberId: member.id,
      principal: BigInt(principal),
      interestRate: Number(process.env.DEFAULT_LOAN_INTEREST_RATE || 12),
      termMonths: 12,
      totalInterest: BigInt(Math.round(principal * (Number(process.env.DEFAULT_LOAN_INTEREST_RATE || 12) / 100))),
      totalRepayable: BigInt(principal + Math.round(principal * (Number(process.env.DEFAULT_LOAN_INTEREST_RATE || 12) / 100))),
      outstandingBalance: BigInt(principal),
      status,
      applicationNote: 'Demo data for guarantor workflow.',
    },
    select: { id: true, principal: true, status: true },
  });
}

try {
  const [existingUsers, existingMembers] = await Promise.all([
    prisma.user.findMany({
      where: { email: { in: allEmails } },
      select: { fullName: true, email: true, role: true, memberId: true },
    }),
    prisma.member.findMany({
      where: {
        OR: [
          { email: { in: members.map(({ email }) => email) } },
          { phone: { in: members.map(({ phone }) => phone) } },
          { nationalId: { in: members.map(({ nationalId }) => nationalId) } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        nationalId: true,
        accounts: { select: { id: true } },
      },
    }),
  ]);

  if (existingUsers.length || existingMembers.length) {
    const expectedAccounts = [
      ...staff.map(({ fullName, email, role }) => ({ fullName, email, role, memberId: null })),
      ...members.map(({ fullName, email }) => ({ fullName, email, role: 'member' })),
    ];
    const accountsMatch = expectedAccounts.every((expected) => {
      const actual = existingUsers.find((user) => user.email === expected.email);
      return actual
        && actual.fullName === expected.fullName
        && actual.role === expected.role;
    });
    const membersMatch = members.every((expected) => {
      const actual = existingMembers.find((member) => member.email === expected.email);
      const portalUser = existingUsers.find((user) => user.email === expected.email);
      return actual
        && actual.fullName === expected.fullName
        && actual.phone === expected.phone
        && actual.nationalId === expected.nationalId
        && actual.accounts.length === 1
        && portalUser?.role === 'member'
        && portalUser.memberId === actual.id;
    });

    const demoGuarantees = await prisma.guaranteeRequest.findMany({
      select: { id: true },
      take: 10,
    });

    if (existingUsers.length === expectedAccounts.length
      && existingMembers.length === members.length
      && accountsMatch
      && membersMatch
      && demoGuarantees.length > 0) {
      console.log(`Demo data is already set up: ${staff.length} staff accounts, ${members.length} member accounts, and ${demoGuarantees.length} guarantor records.`);
      console.log('No passwords or account data were changed. Existing temporary passwords cannot be recovered; use the password reset flow if needed.');
    } else if (existingUsers.length === expectedAccounts.length
      && existingMembers.length === members.length
      && accountsMatch
      && membersMatch) {
      console.log('Demo member accounts are present. Creating demo guarantor requests for the guarantor workflow.');
    } else {
      throw new Error('Some demo account identifiers already exist but do not match the complete expected demo set. No records were changed.');
    }
  } else {
    const credentials = [
      ...staff.map((person) => ({ ...person, password: randomBytes(18).toString('base64url'), kind: 'Staff' })),
      ...members.map((person) => ({ ...person, role: 'member', password: randomBytes(18).toString('base64url'), kind: 'Member' })),
    ];

    for (const account of credentials) {
      account.passwordHash = await bcrypt.hash(account.password, 12);
    }

    await prisma.$transaction(async (tx) => {
      for (const account of credentials.slice(0, staff.length)) {
        await tx.user.create({
          data: {
            fullName: account.fullName,
            email: account.email,
            role: account.role,
            isActive: true,
            passwordChangeRequired: true,
            passwordHash: account.passwordHash,
          },
        });
      }

      for (const account of credentials.slice(staff.length)) {
        const member = await tx.member.create({
          data: {
            memberNo: generateRef('MEM'),
            fullName: account.fullName,
            phone: account.phone,
            email: account.email,
            nationalId: account.nationalId,
            address: account.address,
            status: 'active',
          },
        });
        await tx.savingsAccount.create({
          data: { memberId: member.id, accountNo: generateRef('SAV') },
        });
        await tx.user.create({
          data: {
            fullName: account.fullName,
            email: account.email,
            role: 'member',
            isActive: true,
            passwordChangeRequired: true,
            passwordHash: account.passwordHash,
            memberId: member.id,
          },
        });
      }
    });

    console.log(`Created ${staff.length} demo staff accounts and ${members.length} demo members.`);
    console.log('Demo member savings accounts have zero balances; no transactions were fabricated.');
    console.log('One-time sign-in credentials (change password at first sign-in):');
    for (const account of credentials) {
      console.log(`${account.kind}\t${account.fullName}\t${account.email}\t${account.role}\t${account.password}`);
    }
  }

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@sacco.local' }, select: { id: true } });
  const justin = await prisma.member.findFirst({ where: { email: 'justin.demo@example.test' }, select: { id: true, memberNo: true, fullName: true } });
  const jane = await prisma.member.findFirst({ where: { email: 'jane.demo@example.test' }, select: { id: true, memberNo: true, fullName: true } });
  const alice = await prisma.member.findFirst({ where: { email: 'alice.demo@example.test' }, select: { id: true, memberNo: true, fullName: true } });

  if (adminUser && justin && jane && alice) {
    const existingGuarantees = await prisma.guaranteeRequest.findMany({
      where: {
        OR: [
          { borrowerMemberId: alice.id, guarantorMemberId: jane.id },
          { borrowerMemberId: justin.id, guarantorMemberId: jane.id },
        ],
      },
      select: { id: true },
    });

    if (!existingGuarantees.length) {
      const aliceLoan = await ensureLoanForMember(prisma, alice, 35000, 'pending');
      const justinLoan = await prisma.loan.findFirst({ where: { memberId: justin.id }, select: { id: true, principal: true, status: true } });

      if (aliceLoan && justinLoan) {
        await prisma.$transaction(async (tx) => {
          await tx.guaranteeRequest.create({
            data: {
              loanId: aliceLoan.id,
              borrowerMemberId: alice.id,
              guarantorMemberId: jane.id,
              amount: 18000n,
              status: 'pending',
            },
          });

          await tx.guaranteeRequest.create({
            data: {
              loanId: justinLoan.id,
              borrowerMemberId: justin.id,
              guarantorMemberId: jane.id,
              amount: 20000n,
              status: 'approved',
              respondedAt: new Date(),
              reviewedBy: adminUser.id,
              reviewedAt: new Date(),
              reviewNote: 'Demo approval for guarantor workflow.',
            },
          });
        });

        console.log('Created demo guarantor requests for the member portal demonstration.');
        console.log('Demo guarantor workflow: Justin Demo requested Jane Demo as guarantor; Jane also has an approved guarantor record.');
      }
    } else {
      console.log('Demo guarantor requests already exist; keeping the current workflow records.');
    }
  }
} finally {
  await prisma.$disconnect();
}
