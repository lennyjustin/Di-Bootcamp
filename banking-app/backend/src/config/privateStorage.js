import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const privateStorageDirectory = resolve(
  process.env.SACCO_PRIVATE_STORAGE_DIR
    || resolve(dirname(fileURLToPath(import.meta.url)), '../../private')
);
