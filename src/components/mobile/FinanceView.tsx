import { useState, useEffect } from 'react';
import { DollarSign, Building2, CreditCard, Smartphone, Wallet, Globe, Heart, Truck, PawPrint, TrendingUp, History, Info, AlertCircle, RefreshCw, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getActiveDonationAccount } from '../admin/AdminBankSettings';
import { API_URL } from '../../config/api';
import BankAccountSettings from '../settings/BankAccountSettings';

interface FinanceViewProps {
    userRole?: string;
}

export default function FinanceView({ userRole }: FinanceViewProps) {
    const { user, token } = useAuth();
    const [availableBalance, setAvailableBalance] = useState(0);
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

    const [fundingRequests, setFundingRequests] = useState<any[]>([]);
    const [loadingFunding, setLoadingFunding] = useState(false);

    useEffect(() => {
        const account = getActiveDonationAccount();
        setAdminBankAccount(account);
        fetchHistory();
        fetchBalance();
        if (userRole !== 'individual') {
            fetchLogisticsFunding();
        }
    }, [user?.id, userRole]);

    const fetchBalance = async () => {
        try {
            const response = await fetch(`${API_URL}/api/finance/balance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableBalance(data.totalBalance || 0);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const fetchLogisticsFunding = async () => {
        if (!user?.id) return;
        setLoadingFunding(true);
        try {
            const response = await fetch(`${API_URL}/api/money-requests?userId=${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFundingRequests(data);
            }
        } catch (error) {
            console.error('Error fetching funding requests:', error);
        } finally {
            setLoadingFunding(false);
        }
    };

    const fetchHistory = async () => {
        if (!user?.id) return;
        setLoadingHistory(true);
        try {
            const response = await fetch(`${API_URL}/api/payment/manual/my-donations?userId=${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
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
                    'Authorization': `Bearer ${token}`,
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
                fetchHistory();
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

        if (!proofFile) {
            alert('Please upload payment proof');
            return;
        }

        setProcessing(true);

        try {
            const formData = new FormData();
            formData.append('proofImage', proofFile);
            formData.append('userId', user?.id || '');
            formData.append('amount', amount.toString());
            formData.append('paymentMethod', selectedMethod);
            if (transactionId) formData.append('transactionId', transactionId);
            if (accountUsed) formData.append('accountUsed', accountUsed);
            if (notes) formData.append('notes', notes);

            const response = await fetch(`${API_URL}/api/payment/manual/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert(`✅ Payment Submitted!\n\nYour donation of PKR ${amount.toLocaleString()} has been submitted for admin verification.`);
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
            alert('❌ Failed to submit payment.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6 p-4 pb-24">
            {/* Header / Pool Info for NGOs/Beneficiaries */}
            {userRole !== 'individual' && (
                <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-6 h-6" />
                        <h3 className="text-lg font-bold">Global Funding Pool</h3>
                    </div>
                    <p className="text-4xl font-bold mb-2">PKR {availableBalance.toLocaleString()}</p>
                    <p className="text-green-100 text-sm">Available for logistics support</p>
                </div>
            )}

            {/* NGO/Shelter: Manage Bank Accounts */}
            {userRole !== 'individual' && (
                <div className="bg-white dark:bg-forest-800 p-6 rounded-3xl border border-forest-100 dark:border-forest-700 shadow-sm">
                    <h3 className="text-xl font-black text-forest-900 dark:text-ivory mb-6 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-green-600" />
                        Receive Funding
                    </h3>
                    <BankAccountSettings />
                </div>
            )}

            {/* NGO/Shelter: Logistics Funding History */}
            {userRole !== 'individual' && (
                <div className="bg-white dark:bg-forest-800 p-6 rounded-3xl border border-forest-100 dark:border-forest-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-forest-900 dark:text-ivory flex items-center gap-2">
                            <Truck className="w-6 h-6 text-blue-600" />
                            Logistics Funding
                        </h3>
                        <button onClick={fetchLogisticsFunding} className="p-2 hover:bg-forest-100 dark:hover:bg-forest-700 rounded-full">
                            <RefreshCw className={`w-4 h-4 text-forest-400 ${loadingFunding ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {loadingFunding ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => <div key={i} className="h-24 bg-forest-50 dark:bg-forest-700/50 rounded-2xl animate-pulse"></div>)}
                            </div>
                        ) : fundingRequests.length > 0 ? (
                            fundingRequests.map(req => (
                                <div key={req.id} className="p-4 rounded-2xl border border-forest-50 dark:border-forest-700 bg-forest-50/30 dark:bg-forest-800/30 font-display">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-forest-900 dark:text-ivory">PKR {req.amount.toLocaleString()}</p>
                                            <p className="text-[10px] text-forest-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-forest-700 dark:text-forest-400">
                                        <div className="flex items-center gap-1 font-bold">
                                            <Package className="w-3 h-3 text-green-600" />
                                            {req.donationFoodType || 'General Logistics'}
                                        </div>
                                        {req.donorName && (
                                            <p className="ml-4 text-forest-500">From: {req.donorName}</p>
                                        )}
                                        <p className="mt-1 ml-4 italic border-l-2 border-forest-100 dark:border-forest-700 pl-2">"{req.purpose}"</p>
                                    </div>
                                    {req.status === 'rejected' && req.rejectionReason && (
                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg text-[10px] text-red-600 flex items-start gap-1">
                                            <AlertCircle className="w-3 h-3 shrink-0" />
                                            <span>Reason: {req.rejectionReason}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-forest-500">
                                <Truck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No logistics funding claimed yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Individual: Instructions */}
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
                        {[
                            "Choose your amount and payment method below.",
                            "Transfer money to the provided bank account.",
                            "Upload a screenshot of your payment receipt.",
                            "Wait for admin verification to receive EcoPoints!"
                        ].map((step, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-forest-900 dark:bg-mint text-white dark:text-forest-900 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                                <p className="text-sm text-forest-700 dark:text-forest-300">{step}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                            Your donation helps us maintain logistics and fuel for food pickups. 100% goes to food rescue.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Individual: Donate Section */}
            {userRole === 'individual' && (
                <div className="space-y-6">
                    {!showDonateForm && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4 py-4"
                        >
                            <h2 className="text-2xl font-black text-forest-900 dark:text-ivory">Every Penny Makes a Difference! 🌟</h2>
                            <p className="text-forest-600 dark:text-forest-400 max-w-xs mx-auto">
                                Your contributions fund the logistics that turn potential waste into a meal.
                            </p>
                        </motion.div>
                    )}

                    <button
                        onClick={() => setShowDonateForm(!showDonateForm)}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <Heart className={`w-5 h-5 ${showDonateForm ? '' : 'animate-pulse'}`} />
                        {showDonateForm ? 'Cancel Donation' : '💰 Start My Donation'}
                    </button>

                    {showDonateForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700"
                        >
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">Amount (PKR)</label>
                                    <input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 text-lg font-bold"
                                    />
                                </div>

                                {adminBankAccount && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                            <h4 className="font-bold text-blue-900 text-sm">Transfer to:</h4>
                                        </div>
                                        <div className="space-y-1 text-xs">
                                            <p><span className="text-blue-700">Bank:</span> <strong>{adminBankAccount.bankName}</strong></p>
                                            <p><span className="text-blue-700">Account:</span> <strong>{adminBankAccount.accountNumber}</strong></p>
                                            <p><span className="text-blue-700">Name:</span> <strong>{adminBankAccount.accountHolderName}</strong></p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-4 gap-2">
                                    {['card', 'jazzcash', 'easypaisa', 'paypal'].map((m: any) => (
                                        <button
                                            key={m}
                                            onClick={() => setSelectedMethod(m)}
                                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${selectedMethod === m ? 'border-green-500 bg-green-50' : 'border-transparent bg-gray-50'}`}
                                        >
                                            {m === 'card' && <CreditCard className="w-5 h-5" />}
                                            {m === 'jazzcash' && <Smartphone className="w-5 h-5 text-red-600" />}
                                            {m === 'easypaisa' && <Wallet className="w-5 h-5 text-green-600" />}
                                            {m === 'paypal' && <Globe className="w-5 h-5 text-blue-600" />}
                                            <span className="text-[8px] uppercase font-bold">{m}</span>
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold mb-1">Proof Screenshot</label>
                                    <input type="file" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="w-full text-xs" />
                                </div>

                                <button
                                    onClick={handleProcessPayment}
                                    disabled={processing || !proofFile}
                                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    {processing ? 'Submitting...' : 'Submit Proof'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {!showDonateForm && (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white dark:bg-forest-800 p-4 rounded-xl border border-forest-100 flex gap-3">
                                <Truck className="w-8 h-8 text-blue-500" />
                                <div><h4 className="font-bold text-sm">Logistics</h4><p className="text-xs text-forest-500">Fuel for volunteer pickups.</p></div>
                            </div>
                            <div className="bg-white dark:bg-forest-800 p-4 rounded-xl border border-forest-100 flex gap-3">
                                <PawPrint className="w-8 h-8 text-orange-500" />
                                <div><h4 className="font-bold text-sm">Animal Welfare</h4><p className="text-xs text-forest-500">Redirecting food to shelters.</p></div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex gap-3">
                                <TrendingUp className="w-8 h-8 text-green-600" />
                                <div><h4 className="font-bold text-sm text-green-700">EcoPoints</h4><p className="text-xs text-green-600">Earn 10 points per PKR 100 donated.</p></div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* History Section (Generic) */}
            {userRole === 'individual' && !showDonateForm && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg flex items-center gap-2"><History className="w-5 h-5" /> Recent Donations</h3>
                        <RefreshCw onClick={fetchHistory} className={`w-4 h-4 cursor-pointer ${loadingHistory ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="space-y-3">
                        {donationHistory.map(d => (
                            <div key={d.id} className="bg-white dark:bg-forest-800 p-4 rounded-2xl border border-forest-100">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${d.status === 'completed' ? 'bg-green-100 text-green-600' : d.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold">PKR {d.amount.toLocaleString()}</p>
                                            <p className="text-[10px] text-forest-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${d.status === 'completed' ? 'bg-green-100 text-green-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status}</span>
                                </div>
                                {d.status === 'rejected' && (
                                    <div className="mt-3 pt-3 border-t border-red-50">
                                        <p className="text-[10px] text-red-600 mb-2">Reason: {d.rejectionReason || 'No reason specified'}</p>
                                        {!d.reviewRequested ? (
                                            <button
                                                onClick={() => { setReviewTarget(d); setShowReviewModal(true); }}
                                                className="w-full py-2 bg-red-600 text-white text-[10px] font-bold rounded-lg"
                                            >
                                                Request Review
                                            </button>
                                        ) : (
                                            <p className="text-[10px] text-forest-400 font-bold uppercase italic">Review Requested</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-forest-900 w-full max-w-sm rounded-[2rem] p-6">
                        <h3 className="text-xl font-black mb-4">Request Review</h3>
                        <textarea
                            value={reviewReasonInput}
                            onChange={(e) => setReviewReasonInput(e.target.value)}
                            className="w-full h-32 p-4 bg-forest-50 rounded-2xl mb-4 text-sm outline-none"
                            placeholder="Why should we reconsider?"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowReviewModal(false)} className="flex-1 py-3 font-bold text-forest-400">Cancel</button>
                            <button
                                onClick={handleRequestReview}
                                disabled={submittingReview || !reviewReasonInput.trim()}
                                className="flex-[2] py-3 bg-forest-900 text-white rounded-xl font-bold disabled:opacity-50"
                            >
                                {submittingReview ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
