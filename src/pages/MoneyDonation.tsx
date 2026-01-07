import { useState } from 'react';
import { DollarSign, CreditCard, Smartphone, Building, ArrowLeft, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

type PaymentMethod = 'jazzcash' | 'easypaisa' | 'card' | 'bank' | null;

export default function MoneyDonation() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [customAmount, setCustomAmount] = useState('');
    const [sliderAmount, setSliderAmount] = useState(100);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');

    // Payment details
    const [jazzCashNumber, setJazzCashNumber] = useState('');
    const [easyPaisaNumber, setEasyPaisaNumber] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);

    const paymentMethods = [
        {
            id: 'jazzcash',
            name: 'JazzCash',
            icon: Smartphone,
            color: 'bg-red-500',
            description: 'Automatic mobile wallet payment'
        },
        {
            id: 'easypaisa',
            name: 'EasyPaisa',
            icon: Smartphone,
            color: 'bg-green-500',
            description: 'Manual verification with proof'
        },
        {
            id: 'card',
            name: 'Debit/Credit Card (Stripe)',
            icon: CreditCard,
            color: 'bg-blue-500',
            description: 'Secure card payment'
        },
        {
            id: 'bank',
            name: 'Bank Transfer',
            icon: Building,
            color: 'bg-purple-500',
            description: 'Manual verification with proof'
        }
    ];

    const banks = [
        'HBL - Habib Bank Limited',
        'UBL - United Bank Limited',
        'MCB - Muslim Commercial Bank',
        'Allied Bank',
        'Bank Alfalah',
        'Meezan Bank',
        'Faysal Bank',
        'Standard Chartered',
        'JS Bank',
        'Askari Bank'
    ];

    const quickAmounts = [500, 1000, 2500, 5000];

    const finalAmount = customAmount || sliderAmount;

    const handleDonate = async () => {
        if (!finalAmount || parseFloat(String(finalAmount)) <= 0) {
            setMessage('❌ Please enter a valid amount');
            return;
        }

        if (!selectedMethod) {
            setMessage('❌ Please select a payment method');
            return;
        }

        setProcessing(true);
        setMessage('');

        try {
            if (selectedMethod === 'jazzcash') {
                if (!jazzCashNumber || !/^03\d{9}$/.test(jazzCashNumber)) {
                    throw new Error('Please enter a valid 11-digit JazzCash number (03XXXXXXXXX)');
                }

                const response = await fetch(`${API_URL}/api/payment/jazzcash/initiate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: finalAmount,
                        phoneNumber: jazzCashNumber,
                        userId: user?.id
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to initiate JazzCash');

                setMessage(`✅ JazzCash payment initiated! Transaction ID: ${data.transactionId}. Please complete it on your phone.`);
            }
            else if (selectedMethod === 'bank' || selectedMethod === 'easypaisa') {
                if (!proofFile) {
                    throw new Error('Please upload a proof of payment (screenshot)');
                }

                const formData = new FormData();
                formData.append('userId', user?.id || '');
                formData.append('amount', String(finalAmount));
                formData.append('paymentMethod', selectedMethod);
                formData.append('notes', selectedMethod === 'bank' ? `Bank: ${selectedBank}` : 'EasyPaisa manual');
                formData.append('proofImage', proofFile);

                const response = await fetch(`${API_URL}/api/payment/manual/submit`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to submit proof');

                setMessage(`✅ Payment proof submitted! Admin will verify it shortly.`);
            }
            else if (selectedMethod === 'card') {
                // Stripe implementation (Stripe component usually handles this)
                setMessage('ℹ️ Stripe integration is being initialized. Please use JazzCash or Bank for now.');
                setProcessing(false);
                return;
            }

            // Success common logic
            setCustomAmount('');
            setSliderAmount(100);
            setSelectedMethod(null);
            setSelectedBank('');
            setProofFile(null);

            // Redirect after 5 seconds for manual/initiate
            setTimeout(() => {
                navigate('/mobile');
            }, 5000);

        } catch (error: any) {
            console.error('Payment error:', error);
            setMessage(`❌ ${error.message || 'Failed to process donation. Please try again.'}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-900 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/mobile')}
                        className="p-2 hover:bg-forest-100 dark:hover:bg-forest-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-forest-900 dark:text-ivory" />
                    </button>
                    <h1 className="text-2xl font-bold text-forest-900 dark:text-ivory">Donate to Support EcoBite</h1>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl ${message.includes('✅')
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            }`}
                    >
                        {message}
                    </motion.div>
                )}

                {/* Amount Selection */}
                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 mb-6">
                    <h2 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Enter Amount (PKR)
                    </h2>

                    {/* Custom Amount Input */}
                    <div className="mb-6">
                        <input
                            type="number"
                            min="100"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            placeholder="Enter custom amount"
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory text-lg"
                        />
                    </div>

                    {/* Slider */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-forest-600 dark:text-forest-400">Or use slider</span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">PKR {sliderAmount}</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="10000"
                            step="100"
                            value={sliderAmount}
                            onChange={(e) => {
                                setSliderAmount(parseInt(e.target.value));
                                setCustomAmount(''); // Clear custom amount when using slider
                            }}
                            className="w-full h-2 bg-forest-200 dark:bg-forest-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="flex justify-between text-xs text-forest-500 dark:text-forest-400 mt-1">
                            <span>PKR 100</span>
                            <span>PKR 10,000</span>
                        </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-3">
                        {quickAmounts.map(amt => (
                            <button
                                key={amt}
                                onClick={() => {
                                    setSliderAmount(amt);
                                    setCustomAmount('');
                                }}
                                className={`py-3 rounded-xl font-bold transition-all ${sliderAmount === amt && !customAmount
                                    ? 'bg-green-600 text-white'
                                    : 'bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory hover:bg-green-100 dark:hover:bg-green-900/30'
                                    }`}
                            >
                                {amt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 mb-6">
                    <h2 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">
                        Select Payment Method
                    </h2>

                    <div className="space-y-3">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedMethod === method.id
                                        ? 'border-forest-900 dark:border-forest-500 bg-forest-50 dark:bg-forest-700'
                                        : 'border-forest-200 dark:border-forest-600 hover:border-forest-400 dark:hover:border-forest-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-forest-900 dark:text-ivory">{method.name}</p>
                                            <p className="text-sm text-forest-600 dark:text-forest-300">{method.description}</p>
                                        </div>
                                        {selectedMethod === method.id && (
                                            <div className="w-6 h-6 bg-forest-900 dark:bg-forest-500 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Payment Details Forms */}
                {selectedMethod && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 mb-6"
                    >
                        <h2 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">
                            Payment Details
                        </h2>

                        {/* JazzCash Form */}
                        {selectedMethod === 'jazzcash' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        JazzCash Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={jazzCashNumber}
                                        onChange={(e) => setJazzCashNumber(e.target.value)}
                                        placeholder="03XX-XXXXXXX"
                                        maxLength={11}
                                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                                        required
                                    />
                                    <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                        Enter your 11-digit JazzCash mobile number
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* EasyPaisa Form */}
                        {selectedMethod === 'easypaisa' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        EasyPaisa Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={easyPaisaNumber}
                                        onChange={(e) => setEasyPaisaNumber(e.target.value)}
                                        placeholder="03XX-XXXXXXX"
                                        maxLength={11}
                                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                                        required
                                    />
                                    <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                        Enter your 11-digit EasyPaisa mobile number
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        Upload Payment Proof (Screenshot)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 outline-none text-black dark:text-ivory"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Card Form */}
                        {selectedMethod === 'card' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        Card Number
                                    </label>
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={19}
                                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="text"
                                            value={cardExpiry}
                                            onChange={(e) => setCardExpiry(e.target.value)}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            value={cardCVV}
                                            onChange={(e) => setCardCVV(e.target.value)}
                                            placeholder="123"
                                            maxLength={3}
                                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                                            required
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-forest-500 dark:text-forest-400">
                                    🔒 Your card information is encrypted and secure
                                </p>
                            </div>
                        )}

                        {/* Bank Transfer Form */}
                        {selectedMethod === 'bank' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        Select Your Bank
                                    </label>
                                    <select
                                        value={selectedBank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                                        required
                                    >
                                        <option value="">Choose a bank...</option>
                                        {banks.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                        You'll receive bank transfer instructions after confirmation
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        Upload Payment Proof (Screenshot)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 outline-none text-black dark:text-ivory"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Impact Preview */}
                {finalAmount && parseFloat(String(finalAmount)) > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white mb-6"
                    >
                        <h3 className="font-bold text-lg mb-2">Your Impact 💚</h3>
                        <p className="text-white/90 text-sm mb-3">
                            Your donation of PKR {finalAmount} will help:
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li>• 🍽️ Feed families in need</li>
                            <li>• 🚚 Support food rescue operations</li>
                            <li>• 📦 Provide packaging and logistics</li>
                            <li>• 🌍 Reduce food waste and help the environment</li>
                        </ul>
                    </motion.div>
                )}

                {/* Donate Button */}
                <button
                    onClick={handleDonate}
                    disabled={!finalAmount || !selectedMethod || processing}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                    {processing ? (
                        <>
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <DollarSign className="w-5 h-5" />
                            Donate PKR {finalAmount || '0'}
                        </>
                    )}
                </button>

                {/* Info */}
                <p className="text-center text-sm text-forest-600 dark:text-forest-400 mt-4">
                    Your donation helps fund packaging and transportation for food donations
                </p>
            </div>
        </div>
    );
}
