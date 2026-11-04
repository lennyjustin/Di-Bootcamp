<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$response = [
    'ResultCode' => 0,
    'ResultDesc' => 'Accepted'
];

if ($data === null) {
    echo json_encode($response);
    exit;
}

// Placeholder callback handler for Daraja sandbox testing.
// In a real implementation: validate callback token, check idempotency, update transaction records.
http_response_code(200);
echo json_encode($response);
