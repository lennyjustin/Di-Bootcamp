<?php
require __DIR__ . '/../app/bootstrap.php';

if (!empty($_SESSION['user_id'])) {
    redirect('dashboard.php');
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $password = (string) ($_POST['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        $error = 'Enter a valid email and password.';
    } else {
        $stmt = $pdo->prepare('SELECT id, full_name, email, password_hash, role, member_id, is_active FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && (int) $user['is_active'] === 1 && password_verify($password, $user['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int) $user['id'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['member_id'] = $user['member_id'] === null ? null : (int) $user['member_id'];
            $pdo->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);
            redirect('dashboard.php');
        }

        $error = 'Those credentials were not recognized, or the account is inactive.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in · MicroSACCO AI</title>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body class="login-page">
  <main class="login-card">
    <a class="brand login-brand" href="index.php"><span class="brand-mark">M</span><span>MicroSACCO<small>AI Banking</small></span></a>
    <p class="eyebrow">Member and staff access</p>
    <h1>Welcome back</h1>
    <p class="muted">Sign in to your SACCO account.</p>
    <?php if ($error): ?><div class="alert error"><?= e($error) ?></div><?php endif; ?>
    <form method="post" class="form-stack">
      <?= csrfField() ?>
      <label>Email address<input type="email" name="email" autocomplete="username" required value="<?= e($_POST['email'] ?? '') ?>"></label>
      <label>Password<input type="password" name="password" autocomplete="current-password" required></label>
      <button class="button button-primary button-full" type="submit">Sign in</button>
    </form>
    <p class="login-footnote">First time setting up? <a href="setup.php">Create the administrator account</a>.</p>
  </main>
</body>
</html>
