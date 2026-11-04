<?php
$pageTitle = $pageTitle ?? 'Dashboard';
$role = $_SESSION['role'] ?? '';
$isMember = $role === 'member';
$navigation = $isMember
    ? [['Dashboard', 'dashboard.php'], ['Savings', 'savings.php'], ['Loans', 'loans.php']]
    : [['Dashboard', 'dashboard.php'], ['Members', 'members.php'], ['Savings', 'savings.php'], ['Loans', 'loans.php'], ['Transactions', 'transactions.php']];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?> · MicroSACCO AI</title>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
<div class="app-shell">
  <aside class="sidebar">
    <a class="brand" href="dashboard.php"><span class="brand-mark">M</span><span>MicroSACCO<small>AI Banking</small></span></a>
    <nav class="navigation" aria-label="Main navigation">
      <?php foreach ($navigation as [$label, $href]): ?>
        <a class="<?= $pageTitle === $label ? 'active' : '' ?>" href="<?= e($href) ?>"><?= e($label) ?></a>
      <?php endforeach; ?>
    </nav>
    <div class="sidebar-user">
      <span class="avatar"><?= e(strtoupper(substr($_SESSION['full_name'] ?? 'U', 0, 1))) ?></span>
      <span><?= e($_SESSION['full_name'] ?? 'User') ?><small><?= e(ucwords(str_replace('_', ' ', $role))) ?></small></span>
    </div>
  </aside>
  <main class="main-content">
    <header class="topbar">
      <div><p class="eyebrow">Micro-SACCO management</p><h1><?= e($pageTitle) ?></h1></div>
      <form action="logout.php" method="post">
        <?= csrfField() ?>
        <button class="button button-quiet" type="submit">Sign out</button>
      </form>
    </header>
    <?php if ($notice = flash('success')): ?><div class="alert success"><?= e($notice) ?></div><?php endif; ?>
    <?php if ($notice = flash('error')): ?><div class="alert error"><?= e($notice) ?></div><?php endif; ?>
