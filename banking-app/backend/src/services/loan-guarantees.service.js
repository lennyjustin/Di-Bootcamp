function requestError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function createPendingGuaranteeRequests(tx, loanId, borrowerMemberId, principal, guarantors) {
  if (!guarantors.length) return 0;

  const memberNumbers = guarantors.map(({ memberNo }) => memberNo);
  if (new Set(memberNumbers.map((memberNo) => memberNo.toLowerCase())).size !== memberNumbers.length) {
    throw requestError('Each guarantor can only be listed once.', 400);
  }

  const requestedTotal = guarantors.reduce((total, guarantor) => total + BigInt(guarantor.amount), 0n);
  if (requestedTotal > BigInt(principal)) {
    throw requestError('Total requested guarantor coverage cannot exceed the loan principal.', 400);
  }

  const members = await tx.member.findMany({
    where: { memberNo: { in: memberNumbers } },
    select: {
      id: true,
      memberNo: true,
      status: true,
      portalUser: { select: { isActive: true, role: true } },
    },
  });
  const membersByNumber = new Map(members.map((member) => [member.memberNo, member]));

  for (const guarantor of guarantors) {
    const member = membersByNumber.get(guarantor.memberNo);
    if (!member || member.status !== 'active' || !member.portalUser?.isActive || member.portalUser.role !== 'member') {
      throw requestError(`An active member portal account was not found for member number ${guarantor.memberNo}.`, 404);
    }
    if (member.id === borrowerMemberId) {
      throw requestError('A borrower cannot guarantee their own loan.', 400);
    }
  }

  for (const guarantor of guarantors) {
    const member = membersByNumber.get(guarantor.memberNo);
    await tx.guaranteeRequest.create({
      data: {
        loanId,
        borrowerMemberId,
        guarantorMemberId: member.id,
        amount: BigInt(guarantor.amount),
      },
    });
  }

  return guarantors.length;
}
