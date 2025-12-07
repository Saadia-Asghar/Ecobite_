import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Send, Package, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

interface MoneyRequest {
    id: string;
    amount: number;
    purpose: string;
    status: 'pending' | 'approved' | 'rejected';
    date: string;
}

interface FinanceViewProps {
    userRole?: string;
}

export default function FinanceView({ userRole }: FinanceViewProps) {
    const [availableBalance] = useState(2500);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [showDonateForm, setShowDonateForm] = useState(false);

    // Donation State
    const [donationAmount, setDonationAmount] = useState(100);
    const [customAmount, setCustomAmount] = useState('');

    // Form State
    const [packagingCount, setPackagingCount] = useState('');
    const [packagingCost, setPackagingCost] = useState('');
    const [distance, setDistance] = useState('');
    const [transportRate, setTransportRate] = useState(100); // PKR per km

    useEffect(() => {
        const storedCost = localStorage.getItem('ECOBITE_SETTINGS_DELIVERY_COST');
        if (storedCost) {
            setTransportRate(Number(storedCost));
        }
    }, []);

    const [requests, setRequests] = useState<MoneyRequest[]>([
        { id: '1', amount: 500, purpose: 'Packaging (50 x 10)', status: 'approved', date: '2024-11-20' },
        { id: '2', amount: 300, purpose: 'Transport (6km)', status: 'pending', date: '2024-11-23' },
        { id: '3', amount: 200, purpose: 'Storage containers', status: 'rejected', date: '2024-11-22' },
    ]);

    const calculateTotal = () => {
        const pkgTotal = (parseFloat(packagingCount) || 0) * (parseFloat(packagingCost) || 0);
        const transportTotal = (parseFloat(distance) || 0) * transportRate;
        return pkgTotal + transportTotal;
    };

    const handleSubmitRequest = () => {
        const total = calculateTotal();
        if (total <= 0) {
            alert('Please enter valid packaging or transportation details');
            return;
        }

        const purposeParts = [];
        if ((parseFloat(packagingCount) || 0) > 0) {
            purposeParts.push(`Packaging (${packagingCount} units)`);
        }
        if ((parseFloat(distance) || 0) > 0) {
            purposeParts.push(`Transport (${distance}km)`);
        }

        const newRequest: MoneyRequest = {
            id: Date.now().toString(),
            amount: total,
            purpose: purposeParts.join(' + '),
            status: 'pending',
            date: new Date().toISOString().split('T')[0]
        };

        setRequests([newRequest, ...requests]);
        setPackagingCount('');
        setPackagingCost('');
        setDistance('');
        setShowRequestForm(false);
        alert('✅ Request submitted successfully!');
    };

    const handleDonateMoney = () => {
        const amount = customAmount ? parseFloat(customAmount) : donationAmount;
        if (amount <= 0) {
            alert('Please enter a valid donation amount');
            return;
        }

        // Here you would typically make an API call to process the donation
        alert(`✅ Thank you for donating PKR ${amount.toLocaleString()}!`);
        setCustomAmount('');
        setDonationAmount(100);
        setShowDonateForm(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-orange-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
            case 'rejected':
                return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
            default:
                return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400';
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

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-forest-800 p-4 rounded-xl border border-forest-100 dark:border-forest-700 text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        {requests.filter(r => r.status === 'approved').length}
                    </p>
                    <p className="text-xs text-forest-600 dark:text-forest-300">Approved</p>
                </div>
                <div className="bg-white dark:bg-forest-800 p-4 rounded-xl border border-forest-100 dark:border-forest-700 text-center">
                    <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        {requests.filter(r => r.status === 'pending').length}
                    </p>
                    <p className="text-xs text-forest-600 dark:text-forest-300">Pending</p>
                </div>
                <div className="bg-white dark:bg-forest-800 p-4 rounded-xl border border-forest-100 dark:border-forest-700 text-center">
                    <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        PKR {requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0)}
                    </p>
                    <p className="text-xs text-forest-600 dark:text-forest-300">Total Received</p>
                </div>
            </div>

            {/* Request Money Button */}
            <button
                onClick={() => setShowRequestForm(!showRequestForm)}
                className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors flex items-center justify-center gap-2"
            >
                <Send className="w-5 h-5" />
                {showRequestForm ? 'Cancel Request' : 'Request Money'}
            </button>

            {/* Donate Money Button */}
            <button
                onClick={() => setShowDonateForm(!showDonateForm)}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-600 transition-colors flex items-center justify-center gap-2"
            >
                <DollarSign className="w-5 h-5" />
                {showDonateForm ? 'Cancel Donation' : '💰 Donate Money'}
            </button>

            {/* Donate Money Form */}
            {showDonateForm && (
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

                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {[500, 1000, 2500, 5000].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => {
                                        setDonationAmount(amount);
                                        setCustomAmount(amount.toString());
                                    }}
                                    className="py-2 px-3 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors text-sm"
                                >
                                    {amount}
                                </button>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleDonateMoney}
                            disabled={(customAmount ? parseFloat(customAmount) : donationAmount) <= 0}
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Donate PKR {(customAmount ? parseFloat(customAmount) : donationAmount).toLocaleString()}
                        </button>

                        <p className="text-xs text-center text-forest-500 dark:text-forest-400">
                            Your donation helps fund packaging and transportation for food donations
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Request Form */}
            {showRequestForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700"
                >
                    <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">New Money Request</h3>

                    <div className="space-y-6">
                        {/* Packaging Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-forest-900 dark:text-ivory font-medium">
                                <Package className="w-5 h-5 text-forest-600 dark:text-forest-400" />
                                Packaging Costs
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-forest-600 dark:text-forest-400 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={packagingCount}
                                        onChange={(e) => setPackagingCount(e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 rounded-lg bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-forest-600 dark:text-forest-400 mb-1">
                                        Cost/Unit (PKR)
                                    </label>
                                    <input
                                        type="number"
                                        value={packagingCost}
                                        onChange={(e) => setPackagingCost(e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 rounded-lg bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Transportation Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-forest-900 dark:text-ivory font-medium">
                                <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Transportation Costs
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-forest-600 dark:text-forest-400 mb-1">
                                        Distance (km)
                                    </label>
                                    <input
                                        type="number"
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 rounded-lg bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-forest-600 dark:text-forest-400 mb-1">
                                        Rate (PKR/km)
                                    </label>
                                    <div className="w-full px-3 py-2 rounded-lg bg-forest-100 dark:bg-forest-900/50 text-forest-500 dark:text-forest-400 border border-transparent">
                                        {transportRate}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Summary */}
                        <div className="bg-forest-50 dark:bg-forest-900/30 p-4 rounded-xl flex justify-between items-center">
                            <span className="font-medium text-forest-900 dark:text-ivory">Total Request</span>
                            <span className="text-xl font-bold text-forest-900 dark:text-ivory">
                                PKR {calculateTotal().toLocaleString()}
                            </span>
                        </div>

                        <button
                            onClick={handleSubmitRequest}
                            disabled={calculateTotal() <= 0}
                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Request
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Request History */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Request History</h3>

                <div className="space-y-3">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className={`p-4 rounded-xl border-2 ${getStatusColor(request.status)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getStatusIcon(request.status)}
                                        <p className="font-bold text-forest-900 dark:text-ivory">
                                            PKR {request.amount}
                                        </p>
                                    </div>
                                    <p className="text-sm text-forest-600 dark:text-forest-300 mb-1">
                                        {request.purpose}
                                    </p>
                                    <p className="text-xs text-forest-500 dark:text-forest-400">
                                        {new Date(request.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${request.status === 'approved' ? 'bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300' :
                                    request.status === 'rejected' ? 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300' :
                                        'bg-orange-200 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'
                                    }`}>
                                    {request.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>ℹ️ How it works:</strong> Calculate your request based on packaging needs and transportation distance.
                    Funds are reviewed and approved based on availability.
                </p>
            </div>
        </div>
    );
}
