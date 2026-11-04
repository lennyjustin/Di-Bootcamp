<?php
session_start();
require __DIR__ . '/../config/config.php';

$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullName = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    $loadDemo = !empty($_POST['load_demo']);

    if ($fullName === '' || $email === '' || $password === '') {
        $error = 'Please complete all required fields.';
    } elseif (strlen($password) < 12) {
        $error = 'Password must be at least 12 characters long.';
    } elseif ($password !== $confirm) {
        $error = 'Passwords do not match.';
    } else {
        try {
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM users');
            $stmt->execute();
            if ((int) $stmt->fetchColumn() > 0) {
                $error = 'An administrator account already exists.';
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $pdo->prepare('INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)')
                    ->execute([$fullName, $email, $hash, 'admin']);

                $success = true;
            }
        } catch (Exception $ex) {
            $error = 'Setup failed: ' . $ex->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Setup - MicroSACCO AI</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6fb; margin: 0; }
    .box { max-width: 460px; margin: 80px auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    input { width: 100%; padding: 10px; margin-bottom: 12px; }
    button { background: #2563eb; color: white; border: none; padding: 12px 18px; border-radius: 8px; cursor: pointer; }
    .error { color: #b91c1c; margin-bottom: 12px; }
    .success { color: #166534; margin-bottom: 12px; }
  </style>
</head>
<body>
<div class="box">
  <h2>MicroSACCO AI Setup</h2>
  <?php if ($error): ?><div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
  <?php if ($success): ?><div class="success">Administrator account created successfully. <a href="index.php">Go to dashboard</a></div><?php endif; ?>

  <?php if (!$success): ?>
    <form method="POST">
      <input type="text" name="full_name" placeholder="Full name" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password (12+ chars)" required />
      <input type="password" name="confirm_password" placeholder="Confirm password" required />
      <label><input type="checkbox" name="load_demo" checked /> Load fictional demo records</label>
      <div style="margin-top: 12px;"><button type="submit">Create Admin Account</button></div>
    </form>
  <?php endif; ?>
</div>
</body>
</html>
