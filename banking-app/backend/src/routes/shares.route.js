import express from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { authorizePermission } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
router.use(authenticate);

router.get('/', authorizePermission('shares.read'), asyncHandler(async (req, res) => {
  const shares = await prisma.share.findMany({
    include: { member: { select: { memberNo: true, fullName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return res.json({
    shares: shares.map((share) => ({
      ...share,
      valuePerShare: Number(share.valuePerShare),
    })),
  });
}));

router.get('/report', authorizePermission('shares.report'), asyncHandler(async (req, res) => {
  const groupedShares = await prisma.share.groupBy({
    by: ['memberId', 'valuePerShare'],
    _sum: { units: true },
    _count: { _all: true },
  });
  const memberIds = [...new Set(groupedShares.map((share) => share.memberId))];
  const members = memberIds.length
    ? await prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, memberNo: true, fullName: true },
    })
    : [];
  const memberById = new Map(members.map((member) => [member.id, member]));
  const byMember = new Map();
  let totalUnits = 0;
  let totalValue = 0n;
  let holdingRecords = 0;

  for (const group of groupedShares) {
    const units = group._sum.units || 0;
    const value = BigInt(units) * group.valuePerShare;
    totalUnits += units;
    totalValue += value;
    holdingRecords += group._count._all;
    const aggregate = byMember.get(group.memberId) || {
      member: memberById.get(group.memberId),
      units: 0,
      value: 0n,
      records: 0,
    };
    aggregate.units += units;
    aggregate.value += value;
    aggregate.records += group._count._all;
    byMember.set(group.memberId, aggregate);
  }

  return res.json({
    summary: {
      membersWithShares: byMember.size,
      holdingRecords,
      totalUnits,
      totalValue: Number(totalValue),
      dividendsCalculated: false,
    },
    holdings: [...byMember.values()]
      .sort((left, right) => right.value > left.value ? 1 : right.value < left.value ? -1 : left.member.fullName.localeCompare(right.member.fullName))
      .map((holding) => ({
        member: holding.member,
        units: holding.units,
        shareValue: Number(holding.value),
        records: holding.records,
      })),
  });
}));

export default router;
