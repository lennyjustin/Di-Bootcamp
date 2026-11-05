import 'dotenv/config';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import prisma from './config/db.js';
import healthRoute from './routes/health.route.js';
import authRoute from './routes/auth.route.js';
import membershipApplicationsRoute from './routes/membership-applications.route.js';
import membersRoute from './routes/members.route.js';
import savingsRoute from './routes/savings.route.js';
import loansRoute from './routes/loans.route.js';
import mpesaRoute from './routes/mpesa.route.js';
import dashboardRoute from './routes/dashboard.route.js';
import transactionsRoute from './routes/transactions.route.js';
import sharesRoute from './routes/shares.route.js';
import memberPortalRoute from './routes/member-portal.route.js';
import staffRoute from './routes/staff.route.js';
import auditRoute from './routes/audit.route.js';
import { optionalAuthenticate } from './middleware/auth.js';
import { auditRequest } from './middleware/audit.js';
import { allowedOrigins, originGuard } from './middleware/originGuard.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port.');
}
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
process.env.DATABASE_URL = databaseUrl;
const frontendDist = resolve(dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
  throw new Error('JWT_SECRET must contain at least 32 bytes of random secret material.');
}

const app = express();
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
    },
  },
}));
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist));
}
app.use(originGuard);
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
}));
app.use(cookieParser());
app.use(auditRequest({ includeReads: true, excludePaths: ['/api/audit'] }));
app.use(express.json({ limit: '32kb' }));
app.use(optionalAuthenticate);

app.use('/api', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/staff', staffRoute);
app.use('/api/audit', auditRoute);
app.use('/api/membership-applications', membershipApplicationsRoute);
app.use('/api/member-portal', memberPortalRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/transactions', transactionsRoute);
app.use('/api/shares', sharesRoute);
app.use('/api/members', membersRoute);
app.use('/api/savings', savingsRoute);
app.use('/api/loans', loansRoute);
app.use('/api/mpesa', mpesaRoute);
app.use('/api', notFound);
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res, next) => {
    if (!req.accepts('html')) return next();
    return res.sendFile(resolve(frontendDist, 'index.html'), (error) => {
      if (error) next(error);
    });
  });
}
app.use(notFound);
app.use(errorHandler);

await prisma.$connect();
const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}
