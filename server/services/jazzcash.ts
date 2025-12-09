/**
 * JazzCash Payment Gateway Integration
 * Real implementation for production use
 * Documentation: https://sandbox.jazzcash.com.pk/documentation
 */

import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface JazzCashConfig {
    merchantId: string;
    password: string;
    integritySalt: string;
    returnUrl: string;
    apiUrl: string;
}

const jazzCashConfig: JazzCashConfig = {
    merchantId: process.env.JAZZCASH_MERCHANT_ID || '',
    password: process.env.JAZZCASH_PASSWORD || '',
    integritySalt: process.env.JAZZCASH_INTEGRITY_SALT || '',
    returnUrl: process.env.JAZZCASH_RETURN_URL || 'http://localhost:5173/payment/jazzcash/return',
    apiUrl: process.env.JAZZCASH_API_URL || 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform'
};

/**
 * Generate secure hash for JazzCash API
 */
function generateJazzCashHash(data: Record<string, any>): string {
    // Sort keys alphabetically
    const sortedKeys = Object.keys(data).sort();

    // Create hash string by concatenating values
    const hashString = sortedKeys
        .map(key => data[key])
        .join('&') + '&' + jazzCashConfig.integritySalt;

    // Generate HMAC SHA256 hash
    const hash = crypto
        .createHmac('sha256', jazzCashConfig.integritySalt)
        .update(hashString)
        .digest('hex');

    return hash.toUpperCase();
}

/**
 * Generate unique transaction reference
 */
function generateTransactionRef(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `T${timestamp}${random}`;
}

/**
 * Format date for JazzCash API (YYYYMMDDHHMMSS)
 */
function formatJazzCashDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Initiate JazzCash Mobile Wallet payment
 */
export async function initiateJazzCashPayment(
    userId: string,
    amount: number,
    phoneNumber: string
): Promise<{
    success: boolean;
    transactionId: string;
    paymentUrl?: string;
    formData?: Record<string, string>;
    error?: string;
}> {
    try {
        // Validate inputs
        if (!phoneNumber || !phoneNumber.match(/^03\d{9}$/)) {
            return {
                success: false,
                transactionId: '',
                error: 'Invalid phone number. Must be in format: 03XXXXXXXXX'
            };
        }

        if (amount < 10) {
            return {
                success: false,
                transactionId: '',
                error: 'Minimum amount is PKR 10'
            };
        }

        if (amount > 1000000) {
            return {
                success: false,
                transactionId: '',
                error: 'Maximum amount is PKR 1,000,000'
            };
        }

        // Generate transaction reference
        const txnRefNo = generateTransactionRef();
        const billReference = `ECOBITE-${userId.substring(0, 8)}-${Date.now()}`;

        // Calculate expiry (24 hours from now)
        const expiryDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const formattedExpiry = formatJazzCashDate(expiryDateTime);
        const formattedDateTime = formatJazzCashDate(new Date());

        // Prepare payment data (order matters for hash generation)
        const paymentData: Record<string, string> = {
            pp_Amount: (amount * 100).toString(), // Amount in paisas
            pp_BankID: 'TBANK', // JazzCash bank ID
            pp_BillReference: billReference,
            pp_Description: 'EcoBite Money Donation',
            pp_Language: 'EN',
            pp_MerchantID: jazzCashConfig.merchantId,
            pp_Password: jazzCashConfig.password,
            pp_ProductID: 'RETL', // Retail
            pp_ReturnURL: jazzCashConfig.returnUrl,
            pp_SubMerchantID: '',
            pp_TxnCurrency: 'PKR',
            pp_TxnDateTime: formattedDateTime,
            pp_TxnExpiryDateTime: formattedExpiry,
            pp_TxnRefNo: txnRefNo,
            pp_TxnType: 'MWALLET', // Mobile Wallet
            pp_Version: '1.1',
            ppmpf_1: phoneNumber, // Mobile number
            ppmpf_2: '', // CNIC (optional)
            ppmpf_3: '', // Email (optional)
            ppmpf_4: userId, // User ID for reference
            ppmpf_5: '' // Reserved
        };

        // Generate secure hash
        const secureHash = generateJazzCashHash(paymentData);
        paymentData.pp_SecureHash = secureHash;

        console.log('JazzCash Payment Initiated:', {
            txnRefNo,
            amount,
            phoneNumber,
            userId
        });

        // Return form data for frontend to submit
        return {
            success: true,
            transactionId: txnRefNo,
            paymentUrl: jazzCashConfig.apiUrl,
            formData: paymentData
        };
    } catch (error) {
        console.error('JazzCash initiation error:', error);
        return {
            success: false,
            transactionId: '',
            error: 'Failed to initiate JazzCash payment'
        };
    }
}

/**
 * Verify JazzCash payment callback
 */
export async function verifyJazzCashPayment(callbackData: Record<string, any>): Promise<{
    success: boolean;
    transactionId: string;
    amount: number;
    status: string;
    responseCode?: string;
    responseMessage?: string;
    error?: string;
}> {
    try {
        // Extract hash from callback
        const receivedHash = callbackData.pp_SecureHash;

        // Create copy without hash for verification
        const dataForHash = { ...callbackData };
        delete dataForHash.pp_SecureHash;

        // Generate hash from callback data
        const calculatedHash = generateJazzCashHash(dataForHash);

        // Verify hash
        if (receivedHash !== calculatedHash) {
            console.error('Hash mismatch:', {
                received: receivedHash,
                calculated: calculatedHash
            });

            return {
                success: false,
                transactionId: callbackData.pp_TxnRefNo || '',
                amount: 0,
                status: 'failed',
                error: 'Invalid secure hash - possible tampering detected'
            };
        }

        // Extract response details
        const responseCode = callbackData.pp_ResponseCode;
        const responseMessage = callbackData.pp_ResponseMessage;
        const transactionId = callbackData.pp_TxnRefNo;
        const amount = parseInt(callbackData.pp_Amount) / 100; // Convert from paisas

        console.log('JazzCash Callback Verified:', {
            transactionId,
            responseCode,
            responseMessage,
            amount
        });

        // Check response code
        if (responseCode === '000') {
            // Success
            return {
                success: true,
                transactionId,
                amount,
                status: 'completed',
                responseCode,
                responseMessage
            };
        } else {
            // Failed
            return {
                success: false,
                transactionId,
                amount,
                status: 'failed',
                responseCode,
                responseMessage,
                error: responseMessage || 'Payment failed'
            };
        }
    } catch (error) {
        console.error('JazzCash verification error:', error);
        return {
            success: false,
            transactionId: '',
            amount: 0,
            status: 'error',
            error: 'Failed to verify JazzCash payment'
        };
    }
}

/**
 * Query JazzCash transaction status
 */
export async function queryJazzCashTransaction(transactionId: string): Promise<{
    success: boolean;
    status: string;
    amount?: number;
    responseCode?: string;
    responseMessage?: string;
    error?: string;
}> {
    try {
        const queryData: Record<string, string> = {
            pp_MerchantID: jazzCashConfig.merchantId,
            pp_Password: jazzCashConfig.password,
            pp_TxnRefNo: transactionId,
            pp_TxnType: 'INQUIRY',
            pp_Version: '1.1'
        };

        // Generate hash
        const secureHash = generateJazzCashHash(queryData);
        queryData.pp_SecureHash = secureHash;

        // Make API call
        const response = await axios.post(
            jazzCashConfig.apiUrl,
            new URLSearchParams(queryData).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const result = response.data;

        console.log('JazzCash Query Result:', {
            transactionId,
            responseCode: result.pp_ResponseCode,
            responseMessage: result.pp_ResponseMessage
        });

        if (result.pp_ResponseCode === '000') {
            return {
                success: true,
                status: 'completed',
                amount: parseInt(result.pp_Amount) / 100,
                responseCode: result.pp_ResponseCode,
                responseMessage: result.pp_ResponseMessage
            };
        } else {
            return {
                success: false,
                status: 'failed',
                responseCode: result.pp_ResponseCode,
                responseMessage: result.pp_ResponseMessage,
                error: result.pp_ResponseMessage
            };
        }
    } catch (error) {
        console.error('JazzCash query error:', error);
        return {
            success: false,
            status: 'error',
            error: 'Failed to query transaction status'
        };
    }
}

/**
 * Refund JazzCash transaction
 */
export async function refundJazzCashTransaction(
    transactionId: string,
    amount: number
): Promise<{
    success: boolean;
    refundId?: string;
    error?: string;
}> {
    try {
        const refundData: Record<string, string> = {
            pp_Amount: (amount * 100).toString(),
            pp_MerchantID: jazzCashConfig.merchantId,
            pp_Password: jazzCashConfig.password,
            pp_TxnRefNo: generateTransactionRef(), // New ref for refund
            pp_TxnType: 'REFUND',
            pp_Version: '1.1',
            pp_OriginalTxnRefNo: transactionId // Original transaction to refund
        };

        // Generate hash
        const secureHash = generateJazzCashHash(refundData);
        refundData.pp_SecureHash = secureHash;

        // Make API call
        const response = await axios.post(
            jazzCashConfig.apiUrl,
            new URLSearchParams(refundData).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const result = response.data;

        if (result.pp_ResponseCode === '000') {
            return {
                success: true,
                refundId: refundData.pp_TxnRefNo
            };
        } else {
            return {
                success: false,
                error: result.pp_ResponseMessage
            };
        }
    } catch (error) {
        console.error('JazzCash refund error:', error);
        return {
            success: false,
            error: 'Failed to process refund'
        };
    }
}

export default {
    initiateJazzCashPayment,
    verifyJazzCashPayment,
    queryJazzCashTransaction,
    refundJazzCashTransaction
};
