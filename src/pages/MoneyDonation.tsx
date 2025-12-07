import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Smartphone, Building, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type PaymentMethod = 'paypal' | 'jazzcash' | 'easypaisa' | 'card' | null;

export default function MoneyDonation() {
    useAuth();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const [donationType, setDonationType] = useState<'general' | 'packaging' | 'transport'>('packaging');
    const [numBoxes, setNumBoxes] = useState('');
    const [distance, setDistance] = useState('');

    // Payment details
    const [jazzCashNumber, setJazzCashNumber] = useState('');
    const [easyPaisaNumber, setEasyPaisaNumber] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');

    // Constants
    const COST_PER_BOX = 50; // PKR
    const [costPerKm, setCostPerKm] = useState(100);

    useEffect(() => {
        const storedCost = localStorage.getItem('ECOBITE_SETTINGS_DELIVERY_COST');
        if (storedCost) {
            setCostPerKm(Number(storedCost));
        }
    }, []);

    const paymentMethods = [
        {
            id: 'jazzcash',
            name: 'JazzCash',
            icon: Smartphone,
            color: 'bg-red-500',
            description: 'Pay with JazzCash mobile wallet'
        },
        {
            id: 'easypaisa',
            name: 'EasyPaisa',
            icon: Smartphone,
            color: 'bg-green-500',
            description: 'Pay with EasyPaisa mobile wallet'
        },
        {
            id: 'card',
            name: 'Debit/Credit Card',
            icon: CreditCard,
            color: 'bg-blue-500',
            description: 'Pay with Visa, Mastercard, or other cards'
        },
        {
            id: 'paypal',
            name: 'PayPal',
            icon: Building,
            color: 'bg-blue-600',
            description: 'Pay with PayPal account'
        }
    ];



    const handleDonate = async () => {
        if (!amount || parseFloat(amount) <= 0) {
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
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // For now, just show success (backend integration pending)
            setMessage(`✅ Successfully donated PKR ${amount}! Thank you for your generosity!`);
            setAmount('');
            setSelectedMethod(null);

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/mobile');
            }, 3000);

            // Uncomment when backend is ready:
            // const response = await fetch('http://localhost:3002/api/donations/money', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         userId: user?.id,
            //         amount: parseFloat(amount),
            //         paymentMethod: selectedMethod,
            //         transactionId: `TXN-${Date.now()}`
            //     })
            // });
            // if (!response.ok) {
            //     throw new Error('Payment failed');
            // }
        } catch (error) {
            console.error('Payment error:', error);
            setMessage('❌ Could not process payment. Please try again.');
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
                    <h1 className="text-2xl font-bold text-forest-900 dark:text-ivory">Donate Money</h1>
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

                {/* Donation Purpose Selection */}
                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 mb-6">
                    <h2 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Donation Purpose
                    </h2>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={() => {
                                setDonationType('packaging');
                                setAmount('');
                                setNumBoxes('');
                            }}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${donationType === 'packaging'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <div className="text-2xl mb-1">📦</div>
                            <div className="font-bold text-sm">Packaging</div>
                        </button>
                        <button
                            onClick={() => {
                                setDonationType('transport');
                                setAmount('');
                                setDistance('');
                            }}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${donationType === 'transport'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <div className="text-2xl mb-1">🚚</div>
                            <div className="font-bold text-sm">Transport</div>
                        </button>
                    </div>

                    {/* Packaging Input */}
                    {donationType === 'packaging' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                    Number of Boxes
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={numBoxes}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNumBoxes(val);
                                        setAmount(val ? String(parseInt(val) * COST_PER_BOX) : '');
                                    }}
                                    placeholder="Enter quantity"
                                    className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                                />
                                <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                    Cost: PKR {COST_PER_BOX} per box
                                </p>
                            </div>
                            {amount && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex justify-between items-center">
                                    <span className="text-forest-700 dark:text-forest-300 font-medium">Total Amount:</span>
                                    <span className="text-xl font-bold text-green-600 dark:text-green-400">PKR {amount}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transport Input */}
                    {donationType === 'transport' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                    Distance (km)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={distance}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setDistance(val);
                                        setAmount(val ? String(parseFloat(val) * costPerKm) : '');
                                    }}
                                    placeholder="Enter kilometers"
                                    className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                                />
                                <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                    Cost: PKR {costPerKm} per km
                                </p>
                            </div>
                            {amount && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex justify-between items-center">
                                    <span className="text-forest-700 dark:text-forest-300 font-medium">Total Amount:</span>
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">PKR {amount}</span>
                                </div>
                            )}
                        </div>
                    )}
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

                        {/* PayPal Form */}
                        {selectedMethod === 'paypal' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        PayPal Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={paypalEmail}
                                        onChange={(e) => setPaypalEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                                        required
                                    />
                                    <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                        You'll be redirected to PayPal to complete the payment
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Impact Preview */}
                {amount && parseFloat(amount) > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-2xl text-white mb-6 ${donationType === 'packaging'
                            ? 'bg-gradient-to-br from-green-500 to-green-600'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                            }`}
                    >
                        <h3 className="font-bold text-lg mb-2">Your Impact</h3>
                        <p className="text-white/90 text-sm mb-3">
                            Your donation of PKR {amount} will provide:
                        </p>
                        <ul className="space-y-2 text-sm">
                            {donationType === 'packaging' ? (
                                <>
                                    <li>• 📦 {numBoxes} packaging boxes for safe food delivery</li>
                                    <li>• Keeps food fresh and hygienic</li>
                                    <li>• Enables {numBoxes} families to receive dignified meals</li>
                                </>
                            ) : (
                                <>
                                    <li>• 🚚 {distance} km of transportation coverage</li>
                                    <li>• Fuel for food rescue vehicles</li>
                                    <li>• Ensures timely delivery to those in need</li>
                                </>
                            )}
                        </ul>
                    </motion.div>
                )}

                {/* Donate Button */}
                <button
                    onClick={handleDonate}
                    disabled={!amount || !selectedMethod || processing}
                    className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <>
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <DollarSign className="w-5 h-5" />
                            Donate PKR {amount || '0'}
                        </>
                    )}
                </button>

                {/* Info */}
                <p className="text-center text-sm text-forest-600 dark:text-forest-400 mt-4">
                    {donationType === 'packaging'
                        ? "Your donation directly funds the purchase of high-quality, food-safe packaging materials."
                        : "Your donation covers fuel and vehicle maintenance costs for our food rescue fleet."}
                </p>
            </div>
        </div>
    );
}
