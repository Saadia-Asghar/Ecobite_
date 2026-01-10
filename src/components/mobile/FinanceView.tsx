import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Send, Building2, Copy, CreditCard, Smartphone, Wallet, Globe, Heart, Truck, PawPrint, Users, TrendingUp, History, Info, MessageSquare, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getActiveDonationAccount } from '../admin/AdminBankSettings';
import { API_URL } from '../../config/api';



interface FinanceViewProps {
    userRole?: string;
}

export default function FinanceView({ userRole }: FinanceViewProps) {
    const { user } = useAuth();
    const [availableBalance] = useState(2500);
    const [showDonateForm, setShowDonateForm] = useState(false);
    const [adminBankAccount, setAdminBankAccount] = useState<any>(null);

    // Donation State
    const [donationAmount, setDonationAmount] = useState(100);
    const [customAmount, setCustomAmount] = useState('');

    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'jazzcash' | 'easypaisa' | 'paypal'>('card');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [accountUsed, setAccountUsed] = useState('');
    const [notes, setNotes] = useState('');
    const [donationHistory, setDonationHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState<any>(null);
    const [reviewReasonInput, setReviewReasonInput] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const account = getActiveDonationAccount();
        setAdminBankAccount(account);
        fetchHistory();
    }, [user?.id]);

    const fetchHistory = async () => {
        if (!user?.id) return;
        setLoadingHistory(true);
        try {
            const response = await fetch(`${API_URL}/api/payment/manual/my-donations?userId=${user.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('ecobite_token') || localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDonationHistory(data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleRequestReview = async () => {
        if (!reviewTarget || !reviewReasonInput.trim()) return;

        setSubmittingReview(true);
        try {
            const response = await fetch(`${API_URL}/api/payment/manual/${reviewTarget.id}/request-review`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('ecobite_token') || localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user?.id,
                    reason: reviewReasonInput
                })
            });

            if (response.ok) {
                alert('✅ Review request submitted successfully!');
                setShowReviewModal(false);
                setReviewReasonInput('');
                fetchHistory(); // Refresh history
            } else {
                const data = await response.json();
                alert(`❌ Failed to submit review: ${data.error || 'Please try again'}`);
            }
        } catch (error) {
            console.error('Review request error:', error);
            alert('❌ An error occurred. Please try again.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleProcessPayment = async () => {
        const amount = customAmount ? parseFloat(customAmount) : donationAmount;
        if (amount <= 0) {
            alert('Please enter a valid donation amount');
            return;
        }

        // Require proof file for all payment methods
        if (!proofFile) {
            alert('Please upload payment proof');
            return;
        }

        setProcessing(true);

        try {
            const token = localStorage.getItem('ecobite_token') || localStorage.getItem('token');

            // Prepare form data for file upload
            const formData = new FormData();
            formData.append('proofImage', proofFile);
            formData.append('userId', user?.id || '');
            formData.append('amount', amount.toString());
            formData.append('paymentMethod', selectedMethod);
            if (transactionId) formData.append('transactionId', transactionId);
            if (accountUsed) formData.append('accountUsed', accountUsed);
            if (notes) formData.append('notes', notes);

            // Submit to manual payment endpoint
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/api/payment/manual/submit`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (response.ok) {
                await response.json();
                alert(`✅ Payment Submitted!\n\nYour donation of PKR ${amount.toLocaleString()} has been submitted for admin verification. You will receive EcoPoints once it's approved.`);

                // Reset form
                setCustomAmount('');
                setDonationAmount(100);
                setProofFile(null);
                setTransactionId('');
                setAccountUsed('');
                setNotes('');
                setShowDonateForm(false);
                fetchHistory();
            } else {
                const result = await response.json().catch(() => ({ error: 'Unknown error' }));
                alert(`❌ Payment Submission Failed: ${result.error || 'Please try again'}`);
            }
        } catch (error) {
            console.error('Donation error:', error);
            alert('❌ Failed to submit payment. Please check your connection and try again.');
        } finally {
            setProcessing(false);
        }
    };



    return (
        <div className="space-y-6 p-4">
            {/* Available Balance - Hidden for Individuals */}
            {userRole !== 'individual' && (
                <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-6 h-6" />
                        <h3 className="text-lg font-bold">Available Balance</h3>
                    </div>
                    <p className="text-4xl font-bold mb-2">PKR {availableBalance.toLocaleString()}</p>
                    <p className="text-green-100 text-sm">From donation pool</p>
                </div>
            )}




            {/* Request Money Button - Removed for NGO, Animal Shelter, and Waste roles */}

            {/* Instructions Section */}
            {userRole === 'individual' && !showDonateForm && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-ivory dark:bg-forest-800/80 p-5 rounded-3xl border-2 border-green-100 dark:border-green-900/30 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Info className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-bold text-forest-900 dark:text-ivory">How to Donate</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-forest-900 dark:bg-mint text-white dark:text-forest-900 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                            <p className="text-sm text-forest-700 dark:text-forest-300">Choose your amount and payment method below.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-forest-900 dark:bg-mint text-white dark:text-forest-900 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                            <p className="text-sm text-forest-700 dark:text-forest-300">Transfer money to the provided bank account or via digital wallet.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-forest-900 dark:bg-mint text-white dark:text-forest-900 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                            <p className="text-sm text-forest-700 dark:text-forest-300">Upload a screenshot of your payment receipt as proof.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-forest-900 dark:bg-mint text-white dark:text-forest-900 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                            <p className="text-sm text-forest-700 dark:text-forest-300">Wait for admin verification. Once verified, you'll receive <strong>EcoPoints</strong>!</p>
                        </div>
                    </div>

                    <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                            Your donation helps us maintain logistics, packaging, and fuel for food pickups. 100% of your contribution goes directly to the food rescue operations.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Donate Money Button - Only for Individual Users */}
            {userRole === 'individual' && (
                <div className="space-y-6">
                    {/* Welcome & Impact Hero */}
                    {!showDonateForm && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4 py-4"
                        >
                            <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 bg-forest-50 dark:bg-forest-900/40">
                                <img
                                    src="/images/donation_impact.png"
                                    alt="Community Impact"
                                    className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <h2 className="text-2xl font-black text-forest-900 dark:text-ivory">Every Penny Makes a Difference! 🌟</h2>
                            <p className="text-forest-600 dark:text-forest-400 max-w-xs mx-auto">
                                Your contributions fund the logistics that turn potential waste into a meal for someone in need.
                            </p>
                        </motion.div>
                    )}

                    <button
                        onClick={() => setShowDonateForm(!showDonateForm)}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <Heart className={`w-5 h-5 transition-transform ${showDonateForm ? '' : 'group-hover:scale-125'}`} />
                        {showDonateForm ? 'Cancel Donation' : '💰 Start My Donation'}
                    </button>

                    {/* Impact Cards - Visible when not donating */}
                    {!showDonateForm && (
                        <div className="grid grid-cols-1 gap-4 mt-6">
                            <div className="bg-white dark:bg-forest-800/50 p-5 rounded-2xl border border-forest-100 dark:border-forest-700/50 flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-forest-900 dark:text-ivory">Logistic Support</h4>
                                    <p className="text-sm text-forest-600 dark:text-forest-400">Funds fuel and transport for volunteer pickups from remote donor locations.</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-forest-800/50 p-5 rounded-2xl border border-forest-100 dark:border-forest-700/50 flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                                    <PawPrint className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-forest-900 dark:text-ivory">Animal Welfare</h4>
                                    <p className="text-sm text-forest-600 dark:text-forest-400">Redirects non-human consumable food to registered animal shelters across the city.</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-forest-800/50 p-5 rounded-2xl border border-forest-100 dark:border-forest-700/50 flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-forest-900 dark:text-ivory">Community Kitchens</h4>
                                    <p className="text-sm text-forest-600 dark:text-forest-400">Helps local NGOs maintain hygienic storage and refrigeration for surplus food.</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-ivory dark:from-green-900/20 dark:to-forest-800 p-5 rounded-2xl border border-green-200 dark:border-green-800/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <h4 className="font-bold text-green-900 dark:text-green-400">Earn EcoPoints!</h4>
                                </div>
                                <p className="text-sm text-green-800 dark:text-green-300">
                                    Every 100 PKR donated earns you 10 EcoPoints to boost your community ranking!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Donate Money Form - Only for Individual Users */}
            {userRole === 'individual' && showDonateForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700"
                >
                    <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Donate to Support EcoBite</h3>

                    <div className="space-y-6">
                        {/* Custom Amount Input */}
                        <div>
                            <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                Enter Amount (PKR)
                            </label>
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => {
                                    setCustomAmount(e.target.value);
                                    if (e.target.value) {
                                        setDonationAmount(parseFloat(e.target.value) || 100);
                                    }
                                }}
                                placeholder="Enter custom amount"
                                className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-green-500 outline-none text-forest-900 dark:text-ivory text-lg font-bold"
                            />
                        </div>

                        {/* Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-forest-700 dark:text-forest-300">
                                    Or use slider
                                </label>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                    PKR {(customAmount ? parseFloat(customAmount) : donationAmount).toLocaleString()}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="10000"
                                step="100"
                                value={customAmount ? parseFloat(customAmount) : donationAmount}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setDonationAmount(value);
                                    setCustomAmount(value.toString());
                                }}
                                className="w-full h-3 bg-forest-200 dark:bg-forest-700 rounded-lg appearance-none cursor-pointer slider-green"
                                style={{
                                    background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((customAmount ? parseFloat(customAmount) : donationAmount) - 100) / 99}%, #e5e7eb ${((customAmount ? parseFloat(customAmount) : donationAmount) - 100) / 99}%, #e5e7eb 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-forest-500 dark:text-forest-400 mt-1">
                                <span>PKR 100</span>
                                <span>PKR 10,000</span>
                            </div>
                        </div>

                        {/* Admin Bank Account Info */}
                        {adminBankAccount && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-bold text-blue-900 dark:text-blue-300">Transfer to:</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 dark:text-blue-400">Account Holder:</span>
                                        <span className="font-bold text-blue-900 dark:text-blue-200">{adminBankAccount.accountHolderName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 dark:text-blue-400">Bank:</span>
                                        <span className="font-bold text-blue-900 dark:text-blue-200">{adminBankAccount.bankName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 dark:text-blue-400">Account Number:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-blue-900 dark:text-blue-200">{adminBankAccount.accountNumber}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(adminBankAccount.accountNumber);
                                                    alert('✅ Account number copied!');
                                                }}
                                                className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
                                            >
                                                <Copy className="w-4 h-4 text-blue-600" />
                                            </button>
                                        </div>
                                    </div>
                                    {adminBankAccount.iban && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700 dark:text-blue-400">IBAN:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-blue-900 dark:text-blue-200">{adminBankAccount.iban}</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(adminBankAccount.iban);
                                                        alert('✅ IBAN copied!');
                                                    }}
                                                    className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
                                                >
                                                    <Copy className="w-4 h-4 text-blue-600" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-blue-700 dark:text-blue-400 mt-3">
                                    💡 Transfer the amount above to this account, then click "Donate Money" below
                                </p>
                            </div>
                        )}

                        {/* Payment Method Selector */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 space-y-4">
                            <h4 className="font-bold text-sm text-forest-900 dark:text-ivory flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Select Payment Method
                            </h4>

                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => setSelectedMethod('card')}
                                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${selectedMethod === 'card'
                                        ? 'bg-white dark:bg-forest-600 border-green-500 shadow-sm'
                                        : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <CreditCard className={`w-6 h-6 ${selectedMethod === 'card' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                    <span className={`text-[10px] font-bold ${selectedMethod === 'card' ? 'text-green-700 dark:text-green-300' : 'text-gray-500'}`}>Card</span>
                                </button>
                                <button
                                    onClick={() => setSelectedMethod('jazzcash')}
                                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${selectedMethod === 'jazzcash'
                                        ? 'bg-white dark:bg-forest-600 border-red-500 shadow-sm'
                                        : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Smartphone className={`w-6 h-6 ${selectedMethod === 'jazzcash' ? 'text-red-600' : 'text-gray-400'}`} />
                                    <span className={`text-[10px] font-bold ${selectedMethod === 'jazzcash' ? 'text-red-700 dark:text-red-300' : 'text-gray-500'}`}>JazzCash</span>
                                </button>
                                <button
                                    onClick={() => setSelectedMethod('easypaisa')}
                                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${selectedMethod === 'easypaisa'
                                        ? 'bg-white dark:bg-forest-600 border-green-500 shadow-sm'
                                        : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Wallet className={`w-6 h-6 ${selectedMethod === 'easypaisa' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                    <span className={`text-[10px] font-bold ${selectedMethod === 'easypaisa' ? 'text-green-700 dark:text-green-300' : 'text-gray-500'}`}>EasyPaisa</span>
                                </button>
                                <button
                                    onClick={() => setSelectedMethod('paypal')}
                                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${selectedMethod === 'paypal'
                                        ? 'bg-white dark:bg-forest-600 border-blue-500 shadow-sm'
                                        : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Globe className={`w-6 h-6 ${selectedMethod === 'paypal' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className={`text-[10px] font-bold ${selectedMethod === 'paypal' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500'}`}>PayPal</span>
                                </button>
                            </div>

                            {/* Payment Proof Upload - Required for all methods */}
                            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-600">
                                <div>
                                    <label className="block text-xs font-medium text-forest-600 dark:text-forest-400 mb-1">
                                        Payment Proof <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        alert('File size must be less than 5MB');
                                                        return;
                                                    }
                                                    setProofFile(file);
                                                }
                                            }}
                                            className="hidden"
                                            id="proof-upload"
                                            required
                                        />
                                        <label htmlFor="proof-upload" className="cursor-pointer">
                                            {proofFile ? (
                                                <div className="text-green-600 dark:text-green-400">
                                                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                                    <p className="text-sm font-medium">{proofFile.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Click to change</p>
                                                </div>
                                            ) : (
                                                <div className="text-gray-500">
                                                    <CreditCard className="w-8 h-8 mx-auto mb-2" />
                                                    <p className="text-sm">Upload screenshot/receipt</p>
                                                    <p className="text-xs mt-1">PNG, JPG, or PDF (Max 5MB)</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-forest-600 dark:text-forest-400 mb-1">
                                        Transaction ID (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Enter transaction/reference number"
                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-forest-800 border border-gray-200 dark:border-gray-600 text-forest-900 dark:text-ivory text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>

                                {selectedMethod === 'card' && (
                                    <div>
                                        <label className="block text-xs font-medium text-forest-600 dark:text-forest-400 mb-1">
                                            Bank/Card Last 4 Digits (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={accountUsed}
                                            onChange={(e) => setAccountUsed(e.target.value)}
                                            placeholder="e.g., 1234"
                                            maxLength={4}
                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-forest-800 border border-gray-200 dark:border-gray-600 text-forest-900 dark:text-ivory text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                )}

                                {(selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') && (
                                    <div>
                                        <label className="block text-xs font-medium text-forest-600 dark:text-forest-400 mb-1">
                                            Mobile Number Used (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={accountUsed}
                                            onChange={(e) => setAccountUsed(e.target.value)}
                                            placeholder="03XX XXXXXXX"
                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-forest-800 border border-gray-200 dark:border-gray-600 text-forest-900 dark:text-ivory text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-forest-600 dark:text-forest-400 mb-1">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any additional information..."
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-forest-800 border border-gray-200 dark:border-gray-600 text-forest-900 dark:text-ivory text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleProcessPayment}
                            disabled={(customAmount ? parseFloat(customAmount) : donationAmount) <= 0 || processing || !proofFile}
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Submit for Verification</span>
                                </>
                            )}
                        </button>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs text-center text-yellow-800 dark:text-yellow-300">
                                <strong>📋 Manual Verification:</strong> All payments require admin approval. Upload payment proof (screenshot/receipt) and submit. You'll receive EcoPoints once approved.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Recent Donations History */}
            {userRole === 'individual' && !showDonateForm && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-bold text-lg text-forest-900 dark:text-ivory flex items-center gap-2">
                            <History className="w-5 h-5 text-forest-600" />
                            Recent Donations
                        </h3>
                        <button
                            onClick={fetchHistory}
                            className="p-2 hover:bg-forest-100 dark:hover:bg-forest-800 rounded-full transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 text-forest-500 ${loadingHistory ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="space-y-3 pb-20">
                        {loadingHistory ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-20 bg-forest-50 dark:bg-forest-800/50 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : donationHistory.length > 0 ? (
                            donationHistory.map(donation => (
                                <div key={donation.id} className="bg-white dark:bg-forest-800 p-4 rounded-2xl border border-forest-100 dark:border-forest-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl shrink-0 ${donation.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                donation.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-forest-900 dark:text-ivory">PKR {donation.amount.toLocaleString()}</p>
                                                <p className="text-xs text-forest-500 dark:text-forest-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(donation.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${donation.status === 'completed' ? 'bg-green-500 text-white' :
                                            donation.status === 'rejected' ? 'bg-red-500 text-white' :
                                                'bg-yellow-500 text-white'
                                            }`}>
                                            {donation.status}
                                        </span>
                                    </div>

                                    {donation.status === 'rejected' && (
                                        <div className="mt-3 pt-3 border-t border-red-50 dark:border-red-900/20">
                                            <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                                                <strong>Rejection Reason:</strong> {donation.rejectionReason || 'No reason specified.'}
                                            </p>
                                            {!donation.reviewRequested ? (
                                                <button
                                                    onClick={() => {
                                                        setReviewTarget(donation);
                                                        setShowReviewModal(true);
                                                    }}
                                                    className="w-full py-2 bg-forest-900 dark:bg-forest-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-forest-800 transition-colors"
                                                >
                                                    <MessageSquare className="w-3 h-3" />
                                                    Request Review
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-forest-500 uppercase">
                                                    <Clock className="w-3 h-3" />
                                                    Review Requested
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {donation.status === 'completed' && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-bold uppercase">
                                            <CheckCircle className="w-3 h-3" />
                                            EcoPoints Awarded
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-forest-50 dark:bg-forest-900/20 rounded-3xl border-2 border-dashed border-forest-100 dark:border-forest-800">
                                <div className="p-3 bg-white dark:bg-forest-800 rounded-full w-fit mx-auto shadow-sm mb-3">
                                    <Heart className="w-6 h-6 text-forest-300" />
                                </div>
                                <p className="text-forest-600 dark:text-forest-400 font-medium">No donations yet. Be the first to help!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="bg-white dark:bg-forest-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl border border-forest-100 dark:border-forest-800"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-forest-900 dark:text-ivory">Request Review</h3>
                            <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-forest-100 rounded-full">
                                <XCircle className="w-6 h-6 text-forest-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    Rejected: <strong>PKR {reviewTarget?.amount?.toLocaleString()}</strong>
                                </p>
                                <p className="text-xs text-red-600/80 mt-1 italic">
                                    "{reviewTarget?.rejectionReason}"
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-forest-800 dark:text-forest-200 mb-2">
                                    Why should we reconsider?
                                </label>
                                <textarea
                                    value={reviewReasonInput}
                                    onChange={(e) => setReviewReasonInput(e.target.value)}
                                    placeholder="Explain any details that might have been missed or correct information..."
                                    className="w-full h-32 p-4 rounded-3xl bg-forest-50 dark:bg-forest-800 border-none focus:ring-2 focus:ring-green-500 outline-none text-forest-900 dark:text-ivory text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="flex-1 py-4 font-bold text-forest-600 dark:text-forest-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestReview}
                                disabled={submittingReview || !reviewReasonInput.trim()}
                                className="flex-[2] py-4 bg-forest-900 dark:bg-forest-600 text-white rounded-2xl font-black shadow-lg shadow-forest-200 dark:shadow-none disabled:opacity-50 transition-all active:scale-95"
                            >
                                {submittingReview ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
