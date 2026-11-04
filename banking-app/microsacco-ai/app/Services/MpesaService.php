<?php
namespace App\Services;

class MpesaService
{
    public function generateToken(): string
    {
        $consumerKey = getenv('DARAJA_CONSUMER_KEY') ?: '';
        $consumerSecret = getenv('DARAJA_CONSUMER_SECRET') ?: '';

        if ($consumerKey === '' || $consumerSecret === '') {
            throw new \RuntimeException('Daraja credentials are not configured.');
        }

        $auth = base64_encode($consumerKey . ':' . $consumerSecret);

        $ch = curl_init('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials');
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Basic ' . $auth]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($status !== 200) {
            throw new \RuntimeException('Failed to fetch Daraja access token.');
        }

        $data = json_decode($response, true);
        return $data['access_token'] ?? '';
    }
}
