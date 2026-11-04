import { Prisma } from '@prisma/client';

export function notFound(req, res) {
  return res.status(404).json({ message: 'Endpoint not found' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({ message: 'A record with this value already exists' });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' });
  }

  if (Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode <= 599) {
    if (error.statusCode >= 500) console.error('Request failed:', error);
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error('Request failed:', error);
  return res.status(500).json({ message: 'An unexpected error occurred' });
}
