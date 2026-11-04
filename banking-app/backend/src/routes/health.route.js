import express from 'express';
import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/health', asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  return res.json({ status: 'ok', database: 'connected' });
}));

export default router;
