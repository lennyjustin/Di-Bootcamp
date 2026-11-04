import { randomBytes } from 'node:crypto';

export function generateRef(prefix = 'TX') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(6).toString('hex').toUpperCase()}`;
}
