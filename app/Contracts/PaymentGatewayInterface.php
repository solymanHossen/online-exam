<?php

namespace App\Contracts;

interface PaymentGatewayInterface
{
    /**
     * Initiate a charge/checkout process.
     *
     * @param  float  $amount  The amount to charge.
     * @param  string  $currency  The currency code (e.g., 'USD').
     * @param  array  $options  Additional options (e.g., return_url, cancel_url, metadata).
     * @return array Returns an array containing at least a 'redirect_url' to send the user to, and a 'transaction_id'.
     */
    public function charge(float $amount, string $currency, array $options = []): array;

    /**
     * Verify a payment transaction.
     *
     * @param  string  $transactionId  The transaction ID to verify.
     * @param  array  $options  Additional options if required.
     * @return bool Returns true if the payment is verified/successful, false otherwise.
     */
    public function verify(string $transactionId, array $options = []): bool;
}
