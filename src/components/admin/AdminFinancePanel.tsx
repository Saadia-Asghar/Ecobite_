import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, CheckCircle, Clock, XCircle, Building2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config/api';

interface MoneyDonation {
    id: string;
    donorId: string;
    donorName: string;
    donorEmail: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    status: string;
    createdAt: string;
}

interface MoneyRequest {
    id: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    organization: string;
    amount: number;
    purpose: string;
    status: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

interface BankAccount {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    organization: string;
    userType: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    iban?: string;
    branchCode?: string;
    accountType: string;
    isDefault: number;
    isVerified: number;
    status: string;
    createdAt: string;
}

export default function AdminFinancePanel() {
    const [activeTab, setActiveTab] = useState<'donations' | 'requests' | 'accounts' | 'summary'>('summary');
    const [donations, setDonations] = useState<MoneyDonation[]>([]);
    const [requests, setRequests] = useState<MoneyRequest[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [fundBalance, setFundBalance] = useState({ totalBalance: 0, totalDonations: 0, totalWithdrawals: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            // Fetch money donations
            const donationsRes = await fetch(`${API_URL}/api/finance/money-donations`);
            if (donationsRes.ok) {
                const donationsData = await donationsRes.json();
                setDonations(donationsData);
            }

            // Fetch money requests
            const requestsRes = await fetch(`${API_URL}/api/finance/money-requests`);
            if (requestsRes.ok) {
                const requestsData = await requestsRes.json();
                setRequests(requestsData);
            }

            // Fetch bank accounts
            const accountsRes = await fetch(`${API_URL}/api/bank-accounts/admin/all`);
            if (accountsRes.ok) {
                const accountsData = await accountsRes.json();
                setBankAccounts(accountsData);
            }

            // Fetch fund balance
            const balanceRes = await fetch(`${API_URL}/api/finance/balance`);
            if (balanceRes.ok) {
                const balanceData = await balanceRes.json();
                setFundBalance(balanceData);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        const adminId = localStorage.getItem('userId'); // Get admin ID from auth

        try {
            const response = await fetch(`${API_URL}/api/finance/money-request/${requestId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId })
            });

            if (response.ok) {
                const result = await response.json();
                alert(`✅ Request approved!\n\nTransfer Details:\nBank: ${result.bankAccount.bankName}\nAccount: ${result.bankAccount.accountNumber}\nAmount: PKR ${result.request.amount}`);
                fetchAllData();
            } else {
                const error = await response.json();
                alert(`❌ ${error.error}`);
            }
        } catch (error) {
            console.error('Approve error:', error);
            alert('❌ Failed to approve request');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        const adminId = localStorage.getItem('userId');

        try {
            const response = await fetch(`${API_URL}/api/finance/money-request/${requestId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId, reason })
            });

            if (response.ok) {
                alert('✅ Request rejected');
                fetchAllData();
            } else {
                const error = await response.json();
                alert(`❌ ${error.error}`);
            }
        } catch (error) {
            console.error('Reject error:', error);
            alert('❌ Failed to reject request');
        }
    };

    const handleVerifyAccount = async (accountId: string) => {
        const adminId = localStorage.getItem('userId');

        try {
            const response = await fetch(`${API_URL}/api/bank-accounts/${accountId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId })
            });

            if (response.ok) {
                alert('✅ Account verified');
                fetchAllData();
            }
        } catch (error) {
            console.error('Verify error:', error);
            alert('❌ Failed to verify account');
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`✅ ${label} copied to clipboard!`);
    };

    if (loading) {
        return <div className="p-8 text-center">Loading finance data...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-2xl text-white">
                <h2 className="text-2xl font-bold mb-2">Finance Management</h2>
                <p className="text-purple-100">Manage donations, requests, and bank accounts</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        PKR {fundBalance.totalBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Available Balance</p>
                </div>

                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        PKR {fundBalance.totalDonations.toLocaleString()}
                    </p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Total Donations</p>
                </div>

                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingDown className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        PKR {fundBalance.totalWithdrawals.toLocaleString()}
                    </p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Total Disbursed</p>
                </div>

                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        {requests.filter(r => r.status === 'pending').length}
                    </p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Pending Requests</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-forest-200 dark:border-forest-700">
                {[
                    { id: 'summary', label: 'Summary', icon: DollarSign },
                    { id: 'donations', label: 'Donations', icon: TrendingUp },
                    { id: 'requests', label: 'Requests', icon: Clock },
                    { id: 'accounts', label: 'Bank Accounts', icon: CreditCard }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-forest-600 dark:text-forest-300 hover:text-purple-600'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Summary Tab */}
            {activeTab === 'summary' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {[...donations.slice(0, 5)].map((donation) => (
                                <div key={donation.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                    <div>
                                        <p className="font-medium text-forest-900 dark:text-ivory">{donation.donorName}</p>
                                        <p className="text-sm text-forest-600 dark:text-forest-300">Donation via {donation.paymentMethod}</p>
                                    </div>
                                    <p className="font-bold text-green-600">+PKR {donation.amount.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
                <div className="space-y-3">
                    {donations.length === 0 ? (
                        <div className="bg-white dark:bg-forest-800 p-8 rounded-2xl text-center">
                            <p className="text-forest-500">No donations yet</p>
                        </div>
                    ) : (
                        donations.map((donation) => (
                            <motion.div
                                key={donation.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-forest-800 p-4 rounded-2xl border border-forest-100 dark:border-forest-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-forest-900 dark:text-ivory">{donation.donorName}</h4>
                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                                                {donation.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-forest-600 dark:text-forest-300">{donation.donorEmail}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                            <span className="text-forest-500">Method: {donation.paymentMethod}</span>
                                            <span className="text-forest-500">
                                                TxID: {donation.transactionId}
                                                <button
                                                    onClick={() => copyToClipboard(donation.transactionId, 'Transaction ID')}
                                                    className="ml-1 p-1 hover:bg-forest-100 dark:hover:bg-forest-700 rounded"
                                                >
                                                    <Copy className="w-3 h-3 inline" />
                                                </button>
                                            </span>
                                        </div>
                                        <p className="text-xs text-forest-400 mt-1">{new Date(donation.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-600">PKR {donation.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-3">
                    {requests.length === 0 ? (
                        <div className="bg-white dark:bg-forest-800 p-8 rounded-2xl text-center">
                            <p className="text-forest-500">No money requests yet</p>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-forest-800 p-4 rounded-2xl border border-forest-100 dark:border-forest-700"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-forest-900 dark:text-ivory">{request.organization || request.requesterName}</h4>
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-forest-600 dark:text-forest-300">{request.requesterEmail}</p>
                                        <p className="text-sm text-forest-700 dark:text-forest-200 mt-2">
                                            <strong>Purpose:</strong> {request.purpose}
                                        </p>
                                        <p className="text-xs text-forest-400 mt-1">{new Date(request.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-purple-600">PKR {request.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                {request.status === 'pending' && (
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-forest-100 dark:border-forest-700">
                                        <button
                                            onClick={() => handleApproveRequest(request.id)}
                                            className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve & Transfer
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request.id)}
                                            className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Bank Accounts Tab */}
            {activeTab === 'accounts' && (
                <div className="space-y-3">
                    {bankAccounts.length === 0 ? (
                        <div className="bg-white dark:bg-forest-800 p-8 rounded-2xl text-center">
                            <p className="text-forest-500">No bank accounts registered yet</p>
                        </div>
                    ) : (
                        bankAccounts.map((account) => (
                            <motion.div
                                key={account.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-forest-800 p-4 rounded-2xl border border-forest-100 dark:border-forest-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                            <h4 className="font-bold text-forest-900 dark:text-ivory">{account.organization || account.userName}</h4>
                                            {account.isDefault === 1 && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                    Default
                                                </span>
                                            )}
                                            {account.isVerified === 1 && (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            )}
                                        </div>
                                        <p className="text-sm text-forest-600 dark:text-forest-300 mb-2">{account.userEmail}</p>

                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-forest-500">Account Holder:</span>
                                                <span className="font-medium">{account.accountHolderName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-forest-500">Bank:</span>
                                                <span className="font-medium">{account.bankName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-forest-500">Account Number:</span>
                                                <span className="font-mono font-medium">{account.accountNumber}</span>
                                                <button
                                                    onClick={() => copyToClipboard(account.accountNumber, 'Account number')}
                                                    className="p-1 hover:bg-forest-100 dark:hover:bg-forest-700 rounded"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                            {account.iban && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-forest-500">IBAN:</span>
                                                    <span className="font-mono text-xs font-medium">{account.iban}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(account.iban!, 'IBAN')}
                                                        className="p-1 hover:bg-forest-100 dark:hover:bg-forest-700 rounded"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="text-forest-500">Type:</span>
                                                <span className="capitalize">{account.accountType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {account.isVerified === 0 && (
                                        <button
                                            onClick={() => handleVerifyAccount(account.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors text-sm"
                                        >
                                            Verify Account
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
