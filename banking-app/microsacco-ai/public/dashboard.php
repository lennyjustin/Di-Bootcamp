<?php
require __DIR__ . '/../app/bootstrap.php';
requireAuth();

$isMember = $_SESSION['role'] === 'member';
$memberId = $_SESSION['member_id'] ?? null;
if ($isMember && !$memberId) {
    http_response_code(403);
    exit('This member login is not linked to a member record.');
}

if ($isMember) {
    $stmt = $pdo->prepare('SELECT COALESCE(SUM(balance), 0) FROM savings_accounts WHERE member_id = ? AND status = "active"');
    $stmt->execute([$memberId]);
    $savingsCents = amountInCents($stmt->fetchColumn());

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM loans WHERE member_id = ? AND status IN ("approved", "disbursed")');
    $stmt->execute([$memberId]);
    $activeLoans = (int) $stmt->fetchColumn();

    $stmt = $pdo->prepare('SELECT id, type, amount, channel, created_at, reference FROM transactions WHERE member_id = ? ORDER BY created_at DESC LIMIT 8');
    $stmt->execute([$memberId]);
    $transactions = $stmt->fetchAll();
    $cards = [['Savings balance', 'KES ' . centsToMoney($savingsCents)], ['Active loans', (string) $activeLoans]];
} else {
    $memberCount = (int) $pdo->query('SELECT COUNT(*) FROM members')->fetchColumn();
    $savingsCents = amountInCents($pdo->query('SELECT COALESCE(SUM(balance), 0) FROM savings_accounts WHERE status = "active"')->fetchColumn());
    $loanCount = (int) $pdo->query('SELECT COUNT(*) FROM loans WHERE status IN ("approved", "disbursed")')->fetchColumn();
    $arrearsCount = (int) $pdo->query('SELECT COUNT(DISTINCT loan_id) FROM loan_schedules WHERE due_date < CURDATE() AND amount_paid < amount_due')->fetchColumn();
    $transactions = $pdo->query('SELECT t.id, t.type, t.amount, t.channel, t.created_at, t.reference, m.full_name FROM transactions t JOIN members m ON m.id = t.member_id ORDER BY t.created_at DESC LIMIT 8')->fetchAll();
    $cards = [['Members', (string) $memberCount], ['Savings', 'KES ' . centsToMoney($savingsCents)], ['Active loans', (string) $loanCount], ['Loans in arrears', (string) $arrearsCount]];
}

$pageTitle = 'Dashboard';
require __DIR__ . '/../app/views/header.php';
?>
<section class="stat-grid">
  <?php foreach ($cards as [$label, $value]): ?>
    <article class="stat-card"><span><?= e($label) ?></span><strong><?= e($value) ?></strong></article>
  <?php endforeach; ?>
</section>
<section class="panel">
  <div class="panel-heading"><div><p class="eyebrow">Account activity</p><h2>Recent transactions</h2></div>
    <?php if (!$isMember): ?><a class="button button-primary" href="members.php">Register member</a><?php endif; ?>
  </div>
  <?php if (!$transactions): ?>
    <div class="empty-state"><strong>No transactions yet</strong><span>Once activity is recorded, it will appear here.</span></div>
  <?php else: ?>
    <div class="table-wrap"><table>
      <thead><tr><?php if (!$isMember): ?><th>Member</th><?php endif; ?><th>Transaction</th><th>Reference</th><th>Amount</th><th>Channel</th><th>Date</th></tr></thead>
      <tbody>
      <?php foreach ($transactions as $transaction): ?>
        <tr>
          <?php if (!$isMember): ?><td><?= e($transaction['full_name']) ?></td><?php endif; ?>
          <td><span class="type-label"><?= e(ucwords(str_replace('_', ' ', $transaction['type']))) ?></span></td>
          <td><?= e($transaction['reference']) ?></td>
          <td>KES <?= e(number_format((float) $transaction['amount'], 2)) ?></td>
          <td><?= e(ucfirst($transaction['channel'])) ?></td>
          <td><?= e(date('d M Y, H:i', strtotime($transaction['created_at']))) ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table></div>
  <?php endif; ?>
</section>
<?php require __DIR__ . '/../app/views/footer.php'; ?>
