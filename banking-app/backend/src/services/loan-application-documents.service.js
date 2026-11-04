import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const documentDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../../private/loan-applications');
const maxDocumentSize = 5 * 1024 * 1024;
const documentTypes = ['incomeProof', 'bankStatement', 'guarantorConsent'];
const extensions = { pdf: 'application/pdf', jpg: 'image/jpeg', png: 'image/png' };
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxDocumentSize, files: 3, fields: 16, fieldSize: 16 * 1024 },
});

export function receiveLoanDocuments(req, res, next) {
  upload.fields(documentTypes.map((name) => ({ name, maxCount: 1 })))(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) error.statusCode = 400;
      return next(error);
    }
    return next();
  });
}

function detectExtension(buffer) {
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') return 'pdf';
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  return null;
}

function invalidDocument(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export function getLoanDocuments(req) {
  const files = [];
  for (const documentType of documentTypes) {
    const file = req.files?.[documentType]?.[0];
    if (!file) continue;
    const extension = detectExtension(file.buffer);
    if (!extension) {
      throw invalidDocument('Supporting documents must be valid PDF, JPEG, or PNG files.');
    }
    files.push({
      documentType,
      extension,
      buffer: file.buffer,
      storedName: `${randomUUID()}.${extension}`,
    });
  }
  return files;
}

export async function saveLoanDocuments(files) {
  if (!files.length) return [];
  await mkdir(documentDirectory, { recursive: true, mode: 0o700 });
  const savedPaths = [];
  try {
    for (const file of files) {
      const path = join(documentDirectory, file.storedName);
      await writeFile(path, file.buffer, { flag: 'wx', mode: 0o600 });
      savedPaths.push(path);
    }
    return savedPaths;
  } catch (error) {
    await Promise.all(savedPaths.map((path) => rm(path, { force: true })));
    throw error;
  }
}

export async function removeLoanDocuments(paths) {
  await Promise.all(paths.map((path) => rm(path, { force: true })));
}

export async function readLoanDocument(storedName) {
  if (!/^[0-9a-f-]{36}\.(pdf|jpg|png)$/.test(storedName)) return null;
  const path = resolve(documentDirectory, storedName);
  if (dirname(path) !== documentDirectory) return null;
  return { content: await readFile(path), contentType: extensions[storedName.split('.').pop()] };
}
