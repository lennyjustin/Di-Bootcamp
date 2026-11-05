const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(body?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.errors = body?.errors;
    throw error;
  }
  return body;
}

export async function apiDownload(path, fileName) {
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include' });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  const disposition = response.headers.get('content-disposition') || '';
  const serverFileName = disposition.match(/filename="([^"]+)"/i)?.[1];
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = serverFileName || fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function currency(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function dateTime(value) {
  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
