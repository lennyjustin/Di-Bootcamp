function addMonths(date, months) {
  const targetMonth = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(targetMonth / 12);
  const month = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
}

export function buildFlatRateSchedule(loan) {
  const termMonths = loan.termMonths;
  const totalRepayable = loan.totalRepayable;
  const baseInstallment = totalRepayable / BigInt(termMonths);
  const remainder = Number(totalRepayable % BigInt(termMonths));
  const maximumInstallment = baseInstallment + (remainder > 0 ? 1n : 0n);
  const amountPaid = loan.status === 'active' || loan.status === 'repaid'
    ? totalRepayable - loan.outstandingBalance
    : 0n;
  const paidToDate = amountPaid < 0n ? 0n : amountPaid > totalRepayable ? totalRepayable : amountPaid;
  const startDate = loan.disbursedAt || loan.appliedAt;
  let scheduledBefore = 0n;

  const installments = Array.from({ length: termMonths }, (_, index) => {
    const amount = baseInstallment + (index < remainder ? 1n : 0n);
    const paid = paidToDate > scheduledBefore
      ? (paidToDate - scheduledBefore < amount ? paidToDate - scheduledBefore : amount)
      : 0n;
    const dueDate = addMonths(startDate, index + 1);
    const dueBeforeToday = dueDate < new Date(new Date().toISOString().slice(0, 10));
    const status = paid === amount
      ? 'paid'
      : paid > 0n
        ? 'partial'
        : dueBeforeToday && loan.status === 'active'
          ? 'overdue'
          : 'upcoming';
    const installment = {
      number: index + 1,
      dueDate: dueDate.toISOString(),
      amount: Number(amount),
      paid: Number(paid),
      remaining: Number(amount - paid),
      status,
    };
    scheduledBefore += amount;
    return installment;
  });

  return {
    calculation: 'flat_rate_equal_monthly',
    isProjection: !loan.disbursedAt,
    notice: 'Illustrative flat-rate schedule only. Recorded repayments are allocated to installments oldest-first for display; this is not a contractual due-date or arrears calculation.',
    totalRepayable: Number(totalRepayable),
    monthlyInstallmentRange: {
      minimum: Number(baseInstallment),
      maximum: Number(maximumInstallment),
    },
    installments,
  };
}
