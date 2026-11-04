<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
    ]);
    session_start();
}

require_once __DIR__ . '/../config/config.php';

function e(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function redirect(string $path): never
{
    header('Location: ' . $path);
    exit;
}

function csrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function csrfField(): string
{
    return '<input type="hidden" name="csrf_token" value="' . e(csrfToken()) . '">';
}

function verifyCsrf(): void
{
    $token = $_POST['csrf_token'] ?? '';
    if (!is_string($token) || !hash_equals(csrfToken(), $token)) {
        http_response_code(419);
        exit('Your session expired. Please go back and try again.');
    }
}

function requireAuth(): void
{
    if (empty($_SESSION['user_id'])) {
        redirect('index.php');
    }
}

function requireRole(string ...$roles): void
{
    requireAuth();
    if (!in_array($_SESSION['role'] ?? '', $roles, true)) {
        http_response_code(403);
        exit('You do not have permission to view this page.');
    }
}

function flash(string $key, ?string $message = null): ?string
{
    if ($message !== null) {
        $_SESSION['flash'][$key] = $message;
        return null;
    }

    $stored = $_SESSION['flash'][$key] ?? null;
    unset($_SESSION['flash'][$key]);
    return is_string($stored) ? $stored : null;
}

function moneyToCents(string $amount): ?int
{
    if (!preg_match('/^(?:0|[1-9]\d{0,12})(?:\.\d{1,2})?$/', $amount)) {
        return null;
    }

    [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '');
    return ((int) $whole * 100) + (int) str_pad($fraction, 2, '0');
}

function centsToMoney(int $amount): string
{
    return number_format($amount / 100, 2, '.', ',');
}

function amountInCents(mixed $amount): int
{
    return (int) round((float) $amount * 100);
}

function newReference(string $prefix): string
{
    return $prefix . '-' . strtoupper(bin2hex(random_bytes(6)));
}
