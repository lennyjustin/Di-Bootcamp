import { randomBytes } from 'node:crypto';
import { isIP } from 'node:net';
import prisma from '../config/db.js';

let cachedToken = null;

class DarajaConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 503;
  }
}

function configuredValue(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (!value || /^your(?:[_\s-]|$)|^placeholder(?:[_\s-]|$)|_here$/i.test(value)) continue;
    return value;
  }
  return undefined;
}

function configuredEndpoint(value, fallback, settingName, expectedHostname) {
  let endpoint;
  try {
    endpoint = new URL(value || fallback);
  } catch {
    throw new DarajaConfigurationError(`${settingName} must be a valid public HTTPS URL.`);
  }
  if (endpoint.protocol !== 'https:'
    || endpoint.username
    || endpoint.password
    || endpoint.hostname === 'localhost'
    || endpoint.hostname.endsWith('.localhost')
    || endpoint.hostname.endsWith('.local')
    || isIP(endpoint.hostname)) {
    throw new DarajaConfigurationError(`${settingName} must be a public HTTPS URL.`);
  }
  if (endpoint.hostname !== expectedHostname) {
    throw new DarajaConfigurationError(`${settingName} must use ${expectedHostname} for the selected environment.`);
  }
  return endpoint;
}

function getDarajaConfig() {
  const consumerKey = configuredValue('DARAJA_CONSUMER_KEY', 'mpesa_consumer_key');
  const consumerSecret = configuredValue('DARAJA_CONSUMER_SECRET', 'mpesa_consumer_secret');
  const environment = configuredValue('DARAJA_ENV', 'mpesa_environment') || 'sandbox';
  const shortcode = configuredValue('DARAJA_SHORTCODE', 'mpesa_short_code');
  const passkey = configuredValue('DARAJA_PASSKEY', 'mpesa_passkey');
  const callbackUrl = configuredValue('DARAJA_CALLBACK_URL', 'mpesa_callback_url');
  const transactionType = configuredValue('DARAJA_TRANSACTION_TYPE', 'mpesa_transaction_type') || 'CustomerPayBillOnline';

  if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
    throw new DarajaConfigurationError('Daraja credentials and callback URL are not configured.');
  }
  if (!['sandbox', 'production'].includes(environment)) {
    throw new DarajaConfigurationError('DARAJA_ENV or mpesa_environment must be sandbox or production.');
  }
  if (!['CustomerPayBillOnline', 'CustomerBuyGoodsOnline'].includes(transactionType)) {
    throw new DarajaConfigurationError('DARAJA_TRANSACTION_TYPE or mpesa_transaction_type must be CustomerPayBillOnline or CustomerBuyGoodsOnline.');
  }
  let callback;
  try {
    callback = new URL(callbackUrl);
  } catch {
    throw new DarajaConfigurationError('DARAJA_CALLBACK_URL or mpesa_callback_url must be a valid public HTTPS URL.');
  }
  if (callback.protocol !== 'https:'
    || callback.hostname === 'your-domain.com'
    || callback.hostname === 'localhost'
    || callback.hostname.endsWith('.localhost')
    || callback.hostname.endsWith('.local')
    || isIP(callback.hostname)) {
    throw new DarajaConfigurationError('DARAJA_CALLBACK_URL or mpesa_callback_url must be configured as a public HTTPS URL.');
  }
  if (environment === 'production' && shortcode === '174379') {
    throw new DarajaConfigurationError('The sandbox test shortcode cannot be used in production.');
  }
  if (!callback.pathname.endsWith('/api/mpesa/stk/callback')) {
    throw new DarajaConfigurationError('DARAJA_CALLBACK_URL or mpesa_callback_url must end in /api/mpesa/stk/callback.');
  }

  const baseUrl = environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
  const expectedHostname = new URL(baseUrl).hostname;
  const accessTokenEndpoint = configuredEndpoint(
    configuredValue('DARAJA_ACCESS_TOKEN_URL', 'mpesa_access_token_url'),
    `${baseUrl}/oauth/v1/generate`,
    'DARAJA_ACCESS_TOKEN_URL or mpesa_access_token_url',
    expectedHostname,
  );
  accessTokenEndpoint.searchParams.set('grant_type', 'client_credentials');

  return {
    consumerKey,
    consumerSecret,
    environment,
    shortcode,
    passkey,
    callbackUrl,
    transactionType,
    accessTokenUrl: accessTokenEndpoint.toString(),
    stkPushUrl: configuredEndpoint(
      configuredValue('DARAJA_STK_PUSH_URL', 'mpesa_stk_push_url'),
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      'DARAJA_STK_PUSH_URL or mpesa_stk_push_url',
      expectedHostname,
    ).toString(),
    stkQueryUrl: configuredEndpoint(
      configuredValue('DARAJA_STK_QUERY_URL', 'mpesa_query_url'),
      `${baseUrl}/mpesa/stkpushquery/v1/query`,
      'DARAJA_STK_QUERY_URL or mpesa_query_url',
      expectedHostname,
    ).toString(),
  };
}

export function assertDarajaConfigured() {
  getDarajaConfig();
}

export function isDarajaConfigured() {
  try {
    getDarajaConfig();
    return true;
  } catch (error) {
    if (error instanceof DarajaConfigurationError) return false;
    throw error;
  }
}

async function requestJson(url, options, { ambiguousOnNetworkError = false } = {}) {
  let response;
  try {
    response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  } catch {
    const error = new Error(ambiguousOnNetworkError
      ? 'Daraja could not be reached. The payment request may need reconciliation.'
      : 'Daraja could not be reached; no payment was confirmed.');
    if (ambiguousOnNetworkError) error.ambiguous = true;
    else error.statusCode = 502;
    throw error;
  }
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const error = new Error(data?.errorMessage || data?.ResponseDescription || `Daraja request failed (${response.status}).`);
    error.statusCode = 502;
    throw error;
  }
  return data;
}

async function getDarajaToken(config = getDarajaConfig()) {
  if (cachedToken?.environment === config.environment
    && cachedToken.consumerKey === config.consumerKey
    && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  const authorization = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  const data = await requestJson(
    config.accessTokenUrl,
    { headers: { Authorization: `Basic ${authorization}` } },
  );
  if (typeof data?.access_token !== 'string' || !data.access_token) {
    throw new Error('Daraja returned an invalid access token response.');
  }
  const expiresIn = Number(data.expires_in);
  cachedToken = {
    environment: config.environment,
    consumerKey: config.consumerKey,
    token: data.access_token,
    expiresAt: Date.now() + Math.max(5, (Number.isFinite(expiresIn) ? expiresIn : 3600) - 60) * 1000,
  };
  return cachedToken.token;
}

function darajaTimestamp() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
}

function stkPassword(config, timestamp) {
  return Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString('base64');
}

export function normalizeKenyanPhone(phone) {
  const digits = phone.replace(/[\s()-]/g, '').replace(/^\+/, '');
  const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
  if (!/^254[17]\d{8}$/.test(normalized)) {
    const error = new Error('Enter a valid Kenyan mobile number, such as 0712345678 or 254712345678.');
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

export async function initiateStkPush({ phone, amount, accountReference, description }) {
  const config = getDarajaConfig();
  const token = await getDarajaToken(config);
  const timestamp = darajaTimestamp();
  const normalizedPhone = normalizeKenyanPhone(phone);
  const data = await requestJson(
    config.stkPushUrl,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: config.shortcode,
        Password: stkPassword(config, timestamp),
        Timestamp: timestamp,
        TransactionType: config.transactionType,
        Amount: amount,
        PartyA: normalizedPhone,
        PartyB: config.shortcode,
        PhoneNumber: normalizedPhone,
        CallBackURL: config.callbackUrl,
        AccountReference: accountReference.slice(0, 12),
        TransactionDesc: description.slice(0, 13),
      }),
    },
    { ambiguousOnNetworkError: true },
  );
  if (typeof data?.CheckoutRequestID !== 'string' || typeof data?.MerchantRequestID !== 'string') {
    throw new Error('Daraja accepted an incomplete STK response; payment requires reconciliation.');
  }
  return data;
}

export async function queryStkStatus(checkoutRequestId) {
  const config = getDarajaConfig();
  const token = await getDarajaToken(config);
  const timestamp = darajaTimestamp();
  return requestJson(config.stkQueryUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: config.shortcode,
      Password: stkPassword(config, timestamp),
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });
}

function parseCallbackPayload(payload) {
  if (!payload) return null;
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
  return payload;
}

function callbackMetadata(payload) {
  const callback = parseCallbackPayload(payload)?.Body?.stkCallback;
  const items = callback?.CallbackMetadata?.Item;
  if (!Array.isArray(items)) return null;
  const values = Object.fromEntries(
    items.filter((item) => typeof item?.Name === 'string').map((item) => [item.Name, item.Value]),
  );
  return {
    amount: Number(values.Amount),
    receipt: typeof values.MpesaReceiptNumber === 'string' ? values.MpesaReceiptNumber.trim() : '',
    phone: typeof values.PhoneNumber === 'number' || typeof values.PhoneNumber === 'string'
      ? String(values.PhoneNumber)
      : '',
  };
}

async function settleConfirmedPayment(paymentId, providerStatus) {
  const payment = await prisma.mpesaTransaction.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status !== 'pending') return payment;

  const callback = parseCallbackPayload(payment.callbackPayload)?.Body?.stkCallback;
  const callbackResultCode = Number(callback?.ResultCode);
  const queryResultCode = Number(providerStatus?.ResultCode);
  if (providerStatus?.ResultCode === undefined || providerStatus?.ResultCode === null
    || Number(providerStatus.ResponseCode) !== 0
    || providerStatus?.CheckoutRequestID !== payment.checkoutRequestId
    || providerStatus?.MerchantRequestID !== payment.merchantRequestId) return payment;

  if (Number.isInteger(queryResultCode) && queryResultCode !== 0) {
    await prisma.mpesaTransaction.updateMany({
      where: { id: payment.id, status: 'pending' },
      data: {
        status: 'failed',
        resultCode: queryResultCode,
        resultDescription: String(providerStatus.ResultDesc || callback?.ResultDesc || 'Payment was not completed.').slice(0, 500),
      },
    });
    return prisma.mpesaTransaction.findUnique({ where: { id: payment.id } });
  }

  if (queryResultCode !== 0) return payment;
  if (!Number.isInteger(callbackResultCode) || callbackResultCode !== 0) {
    await prisma.mpesaTransaction.updateMany({
      where: { id: payment.id, status: 'pending' },
      data: {
        status: 'review',
        resultCode: 0,
        resultDescription: 'Daraja confirmed payment, but callback details need manual reconciliation.',
      },
    });
    return prisma.mpesaTransaction.findUnique({ where: { id: payment.id } });
  }
  const metadata = callbackMetadata(payment.callbackPayload);
  let normalizedPhone = '';
  try {
    normalizedPhone = metadata?.phone ? normalizeKenyanPhone(metadata.phone) : '';
  } catch {
    normalizedPhone = '';
  }
  if (!metadata?.receipt || !/^[A-Z0-9]{6,20}$/i.test(metadata.receipt)
    || metadata.amount !== Number(payment.amount)
    || normalizedPhone !== payment.phoneNumber) {
    await prisma.mpesaTransaction.updateMany({
      where: { id: payment.id, status: 'pending' },
      data: {
        status: 'review',
        resultCode: 0,
        resultDescription: 'Payment confirmation details require manual reconciliation.',
      },
    });
    return prisma.mpesaTransaction.findUnique({ where: { id: payment.id } });
  }

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.mpesaTransaction.updateMany({
      where: { id: payment.id, status: 'pending' },
      data: { status: 'processing' },
    });
    if (claimed.count !== 1) {
      return tx.mpesaTransaction.findUnique({ where: { id: payment.id } });
    }
    const duplicateReceipt = await tx.mpesaTransaction.findFirst({
      where: { receiptNumber: metadata.receipt, id: { not: payment.id } },
      select: { id: true },
    });
    const duplicateLedgerReference = await tx.transaction.findUnique({
      where: { reference: metadata.receipt },
      select: { id: true },
    });
    if (duplicateReceipt || duplicateLedgerReference) {
      return tx.mpesaTransaction.update({
        where: { id: payment.id },
        data: { status: 'review', resultDescription: 'M-Pesa receipt was already used; manual reconciliation required.' },
      });
    }

    if (payment.purpose === 'savings_deposit') {
      const account = await tx.savingsAccount.findFirst({
        where: { id: payment.accountId, memberId: payment.memberId, status: 'active' },
      });
      if (!account) {
        return tx.mpesaTransaction.update({
          where: { id: payment.id },
          data: { status: 'review', resultDescription: 'Savings account is no longer active; manual reconciliation required.' },
        });
      }
      const update = await tx.savingsAccount.updateMany({
        where: { id: account.id, status: 'active' },
        data: { balance: { increment: payment.amount } },
      });
      if (update.count !== 1) throw new Error('Savings account changed while settling an M-Pesa payment.');
      await tx.transaction.create({
        data: {
          reference: metadata.receipt,
          memberId: payment.memberId,
          savingsAccountId: account.id,
          type: 'deposit',
          amount: payment.amount,
          balanceAfter: account.balance + payment.amount,
          channel: 'mpesa',
          description: `M-Pesa savings deposit (${metadata.receipt})`,
        },
      });
    } else if (payment.purpose === 'loan_repayment') {
      const loan = await tx.loan.findFirst({
        where: { id: payment.loanId, memberId: payment.memberId, status: 'active' },
      });
      if (!loan || payment.amount > loan.outstandingBalance) {
        return tx.mpesaTransaction.update({
          where: { id: payment.id },
          data: { status: 'review', resultDescription: 'Loan balance needs manual reconciliation before applying payment.' },
        });
      }
      const update = await tx.loan.updateMany({
        where: { id: loan.id, status: 'active', outstandingBalance: { gte: payment.amount } },
        data: { outstandingBalance: { decrement: payment.amount } },
      });
      if (update.count !== 1) throw new Error('Loan balance changed while settling an M-Pesa payment.');
      const remaining = loan.outstandingBalance - payment.amount;
      await tx.loanRepayment.create({
        data: { loanId: loan.id, amount: payment.amount, reference: metadata.receipt },
      });
      await tx.transaction.create({
        data: {
          reference: metadata.receipt,
          memberId: payment.memberId,
          loanId: loan.id,
          type: 'loan_repayment',
          amount: payment.amount,
          balanceAfter: remaining,
          channel: 'mpesa',
          description: `M-Pesa loan repayment (${metadata.receipt})`,
        },
      });
      if (remaining === 0n) {
        await tx.loan.update({ where: { id: loan.id }, data: { status: 'repaid' } });
        await tx.guaranteeRequest.updateMany({
          where: { loanId: loan.id, status: 'approved' },
          data: { status: 'released', reviewedAt: new Date(), reviewNote: 'Related loan was fully repaid.' },
        });
      }
    } else {
      return tx.mpesaTransaction.update({
        where: { id: payment.id },
        data: { status: 'review', resultDescription: 'Unknown payment purpose; manual reconciliation required.' },
      });
    }

    return tx.mpesaTransaction.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        receiptNumber: metadata.receipt,
        resultCode: 0,
        resultDescription: 'Payment confirmed by Daraja status query.',
        settledAt: new Date(),
      },
    });
  });
}

export async function saveDarajaCallback(payload) {
  const callback = payload?.Body?.stkCallback;
  if (typeof callback?.CheckoutRequestID !== 'string') {
    const error = new Error('Invalid Daraja callback payload.');
    error.statusCode = 400;
    throw error;
  }
  const payment = await prisma.mpesaTransaction.findUnique({
    where: { checkoutRequestId: callback.CheckoutRequestID },
    select: { id: true, status: true },
  });
  if (!payment) return { accepted: true, matched: false };
  if (payment.status === 'completed' || payment.status === 'failed') {
    return { accepted: true, matched: true, status: payment.status };
  }
  if (payment.status === 'review') {
    await prisma.mpesaTransaction.updateMany({
      where: { id: payment.id, status: 'review' },
      data: { status: 'pending', callbackPayload: JSON.stringify(payload) },
    });
  } else {
    await prisma.mpesaTransaction.update({
      where: { id: payment.id },
      data: { callbackPayload: JSON.stringify(payload) },
    });
  }
  const providerStatus = await queryStkStatus(callback.CheckoutRequestID);
  const updated = await settleConfirmedPayment(payment.id, providerStatus);
  return { accepted: true, matched: true, status: updated.status };
}

export async function refreshMemberPayment(paymentId, memberId) {
  const payment = await prisma.mpesaTransaction.findFirst({
    where: { id: paymentId, memberId },
  });
  if (!payment) return null;
  if (payment.checkoutRequestId && payment.status === 'pending') {
    const providerStatus = await queryStkStatus(payment.checkoutRequestId);
    await settleConfirmedPayment(payment.id, providerStatus);
  }
  return prisma.mpesaTransaction.findUnique({
    where: { id: payment.id },
    select: { id: true, purpose: true, amount: true, status: true, resultDescription: true, receiptNumber: true, createdAt: true },
  });
}

export async function createMemberStkPayment({ memberId, purpose, accountId, loanId, phone, amount }) {
  assertDarajaConfigured();
  const normalizedPhone = normalizeKenyanPhone(phone);
  const amountValue = BigInt(amount);
  const member = await prisma.member.findFirst({
    where: { id: memberId, status: 'active' },
    select: { id: true },
  });
  if (!member) {
    const error = new Error('Active membership is required to make an M-Pesa payment.');
    error.statusCode = 403;
    throw error;
  }

  let accountReference;
  if (purpose === 'savings_deposit') {
    const account = await prisma.savingsAccount.findFirst({
      where: { id: accountId, memberId, status: 'active' },
      select: { id: true, accountNo: true },
    });
    if (!account) {
      const error = new Error('Active savings account not found.');
      error.statusCode = 404;
      throw error;
    }
    accountReference = account.accountNo;
  } else {
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, memberId, status: 'active' },
      select: { id: true, loanNo: true, outstandingBalance: true },
    });
    if (!loan) {
      const error = new Error('Active loan not found.');
      error.statusCode = 404;
      throw error;
    }
    if (amountValue > loan.outstandingBalance) {
      const error = new Error('Repayment exceeds the outstanding loan balance.');
      error.statusCode = 400;
      throw error;
    }
    accountReference = loan.loanNo;
  }

  const intent = await prisma.mpesaTransaction.create({
    data: {
      id: randomBytes(16).toString('hex'),
      memberId,
      accountId: purpose === 'savings_deposit' ? accountId : null,
      loanId: purpose === 'loan_repayment' ? loanId : null,
      purpose,
      phoneNumber: normalizedPhone,
      amount: amountValue,
      status: 'initiating',
    },
  });

  try {
    const response = await initiateStkPush({
      phone: normalizedPhone,
      amount,
      accountReference,
      description: purpose === 'savings_deposit' ? 'Sacco savings deposit' : 'Sacco loan repayment',
    });
    const payment = await prisma.mpesaTransaction.update({
      where: { id: intent.id },
      data: {
        checkoutRequestId: response.CheckoutRequestID,
        merchantRequestId: response.MerchantRequestID,
        status: 'pending',
      },
      select: { id: true, checkoutRequestId: true, amount: true, purpose: true, status: true, createdAt: true },
    });
    return { ...payment, amount: Number(payment.amount) };
  } catch (error) {
    await prisma.mpesaTransaction.update({
      where: { id: intent.id },
      data: {
        status: error.statusCode ? 'failed' : 'review',
        resultDescription: (error.message || 'Daraja request failed.').slice(0, 500),
      },
    });
    throw error;
  }
}
