export function assessLoanRisk(member, loans, transactions) {
  let score = 100;

  const activeLoans = loans.filter((loan) => ['active', 'disbursed'].includes(loan.status));
  const overdue = loans.filter((loan) => loan.status === 'defaulted').length;
  const totalDeposits = transactions
    .filter((tx) => tx.type === 'deposit')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const savingsRatio = member.savingsBalance / (member.requestedAmount || 1);

  if (activeLoans.length > 0) score -= 15;
  if (overdue > 0) score -= 35;
  if (savingsRatio < 0.2) score -= 20;
  if (totalDeposits < 500000) score -= 10;
  if (member.status !== 'active') score -= 25;

  score = Math.max(0, Math.min(100, score));

  return {
    riskScore: score,
    riskLevel: score >= 75 ? 'low' : score >= 50 ? 'medium' : 'high',
    recommendation: score >= 75 ? 'Approve with standard terms' : score >= 50 ? 'Review manually' : 'Decline or require guarantor'
  };
}
