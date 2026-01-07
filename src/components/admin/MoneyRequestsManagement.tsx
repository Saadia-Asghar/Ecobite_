import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, XCircle, Clock, Eye, TrendingUp, AlertCircle, Upload } from 'lucide-react';
import { API_ENDPOINTS, API_URL } from '../../config/api';

interface MoneyRequest {
    id: string;
    requester_id: string;
    requesterName: string;
    requesterEmail: string;
    requesterOrganization: string;
    requester_role: 'ngo' | 'shelter' | 'fertilizer';
    amount: number;
    purpose: string;
    distance?: number;
    transport_rate?: number;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    created_at: string;
    reviewed_at?: string;
    reviewedByName?: string;
}

interface RequestStats {
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
    total_approved_amount: number;
    pending_amount: number;
    available_balance: number;
    total_donations: number;
    total_withdrawals: number;
}

export default function MoneyRequestsManagement() {
    const [requests, setRequests] = useState<MoneyRequest[]>([]);
    const [stats, setStats] = useState<RequestStats | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<MoneyRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            const url = filter === 'all'
                ? API_ENDPOINTS.moneyRequests.list
                : `${API_ENDPOINTS.moneyRequests.list}?status=${filter}`;

            const response = await fetch(url);
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.moneyRequests.stats);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const [showTransferPanel, setShowTransferPanel] = useState(false);
    const [transferRequest, setTransferRequest] = useState<MoneyRequest | null>(null);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
    const [selectedAccountType, setSelectedAccountType] = useState<'savings' | 'current'>('savings');
    const [transferring, setTransferring] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);

    const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProofPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleApproveClick = async (request: MoneyRequest) => {
        // Fetch bank accounts for the requester
        try {
            const response = await fetch(`${API_URL}/api/bank-accounts?userId=${request.requester_id}`);
            if (response.ok) {
                const accounts = await response.json();
                if (accounts.length === 0) {
                    alert('❌ No bank account found for this user. Please ask them to add a bank account first.');
                    return;
                }
                setBankAccounts(accounts);
                setTransferRequest(request);
                setSelectedBankAccount(accounts.find((a: any) => a.isDefault === 1)?.id || accounts[0]?.id || '');
                setShowTransferPanel(true);
                setSelectedRequest(null); // Close details modal
            } else {
                alert('❌ Failed to fetch bank accounts');
            }
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            alert('❌ Failed to fetch bank accounts');
        }
    };

    const handleApprove = async (requestId: string) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        handleApproveClick(request);
    };

    const processTransfer = async () => {
        if (!transferRequest || !selectedBankAccount) return;
        if (!proofFile) {
            alert('❌ Please upload a proof of transfer (receipt/screenshot)');
            return;
        }

        if (!confirm(`Confirm transfer of PKR ${transferRequest.amount.toLocaleString()}? Proof will be saved.`)) return;

        setTransferring(true);

        try {
            // First upload proof
            const formData = new FormData();
            formData.append('image', proofFile);
            const uploadRes = await fetch(`${API_URL}/api/images/upload`, {
                method: 'POST',
                body: formData
            });
            const { imageUrl } = await uploadRes.json();

            const response = await fetch(API_ENDPOINTS.moneyRequests.approve(transferRequest.id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminId: 'admin',
                    bankAccountId: selectedBankAccount,
                    accountType: selectedAccountType,
                    withdrawalProof: imageUrl
                })
            });

            if (response.ok) {
                const selectedAccount = bankAccounts.find(a => a.id === selectedBankAccount);
                alert(`✅ Request approved and transfer initiated!\n\nTransfer Details:\nBank: ${selectedAccount?.bankName}\nAccount: ${selectedAccount?.accountNumber}\nType: ${selectedAccountType}\nAmount: PKR ${transferRequest.amount.toLocaleString()}\n\n📧 Email notification sent to ${transferRequest.requesterEmail}\n🔔 App notification sent`);
                fetchRequests();
                fetchStats();
                setShowTransferPanel(false);
                setTransferRequest(null);
                setBankAccounts([]);
                setSelectedBankAccount('');
                setProofFile(null);
                setProofPreview(null);
            } else {
                const error = await response.json();
                alert(`❌ ${error.error}`);
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('❌ Failed to approve request');
        } finally {
            setTransferring(false);
        }
    };

    const handleReject = async (requestId: string) => {
        if (!rejectionReason) {
            alert('Please enter a rejection reason');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.moneyRequests.reject(requestId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminId: 'admin',
                    reason: rejectionReason
                })
            });

            if (response.ok) {
                alert('✅ Request rejected');
                fetchRequests();
                fetchStats();
                setSelectedRequest(null);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('❌ Failed to reject request');
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ngo': return 'bg-blue-100 text-blue-700';
            case 'shelter': return 'bg-purple-100 text-purple-700';
            case 'fertilizer': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return null;
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        💰 Money Requests Management
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review and approve funding requests from beneficiaries
                    </p>
                </div>
                <button
                    onClick={() => { fetchRequests(); fetchStats(); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Available Balance</p>
                                <p className="text-3xl font-bold">PKR {stats.available_balance.toLocaleString()}</p>
                            </div>
                            <DollarSign className="w-12 h-12 text-blue-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Pending Requests</p>
                                <p className="text-3xl font-bold">{stats.pending_requests}</p>
                                <p className="text-yellow-100 text-xs mt-1">
                                    PKR {stats.pending_amount.toLocaleString()}
                                </p>
                            </div>
                            <Clock className="w-12 h-12 text-yellow-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Approved</p>
                                <p className="text-3xl font-bold">{stats.approved_requests}</p>
                                <p className="text-green-100 text-xs mt-1">
                                    PKR {stats.total_approved_amount.toLocaleString()}
                                </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Total Requests</p>
                                <p className="text-3xl font-bold">{stats.total_requests}</p>
                                <p className="text-purple-100 text-xs mt-1">
                                    {stats.rejected_requests} rejected
                                </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-purple-200" />
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab as any)}
                        className={`px-4 py-2 font-medium capitalize ${filter === tab
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        {tab}
                        {tab === 'pending' && stats && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                {stats.pending_requests}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div className="grid gap-4">
                {requests.map((request) => (
                    <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex justify-between items-start">
                            {/* Request Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${request.status === 'pending' ? 'bg-yellow-100' :
                                        request.status === 'approved' ? 'bg-green-100' :
                                            'bg-red-100'
                                        }`}>
                                        {getStatusIcon(request.status)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                            PKR {request.amount.toLocaleString()}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {request.requesterName} • {request.requesterOrganization}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(request.requester_role)}`}>
                                        {request.requester_role.toUpperCase()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Purpose:</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {request.purpose}
                                        </p>
                                    </div>

                                    {request.distance && (
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Distance:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {request.distance} km
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Requested:</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {request.reviewed_at && (
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Reviewed:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {new Date(request.reviewed_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {request.rejection_reason && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            <strong>Rejection Reason:</strong> {request.rejection_reason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedRequest(request)}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>

                                {request.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(request.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setSelectedRequest(request)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {requests.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No {filter !== 'all' && filter} requests found</p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Request Details
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    PKR {selectedRequest.amount.toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400">Requester</label>
                                    <p className="font-medium">{selectedRequest.requesterName}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400">Organization</label>
                                    <p className="font-medium">{selectedRequest.requesterOrganization}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                                    <p className="font-medium">{selectedRequest.requesterEmail}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400">Type</label>
                                    <p className="font-medium capitalize">{selectedRequest.requester_role}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Purpose</label>
                                <p className="font-medium">{selectedRequest.purpose}</p>
                            </div>

                            {selectedRequest.status === 'pending' && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Rejection Reason (if rejecting)
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            rows={3}
                                            placeholder="e.g., Insufficient funds, Invalid purpose, etc."
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(selectedRequest.id)}
                                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve Request
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedRequest.id)}
                                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject Request
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Transfer Panel Modal */}
            {showTransferPanel && transferRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    💸 Transfer Money
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Complete the transfer to {transferRequest.requesterName}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowTransferPanel(false);
                                    setTransferRequest(null);
                                    setBankAccounts([]);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                disabled={transferring}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Request Summary */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount to Transfer</p>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        PKR {transferRequest.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Purpose</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{transferRequest.purpose}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bank Account Selection */}
                        <div className="space-y-4 mb-6">
                            <label className="block text-sm font-bold text-gray-900 dark:text-white">
                                Select Bank Account
                            </label>
                            <div className="space-y-3">
                                {bankAccounts.map((account) => (
                                    <div
                                        key={account.id}
                                        onClick={() => setSelectedBankAccount(account.id)}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedBankAccount === account.id
                                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                                        {account.bankName}
                                                    </h4>
                                                    {account.isDefault === 1 && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                    {account.isVerified === 1 && (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        <strong>Account Holder:</strong> {account.accountHolderName}
                                                    </p>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        <strong>Account Number:</strong> {account.accountNumber}
                                                    </p>
                                                    {account.iban && (
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            <strong>IBAN:</strong> {account.iban}
                                                        </p>
                                                    )}
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        <strong>Type:</strong> <span className="capitalize">{account.accountType}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedBankAccount === account.id
                                                    ? 'border-purple-600 bg-purple-600'
                                                    : 'border-gray-300'
                                                    }`}>
                                                    {selectedBankAccount === account.id && (
                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Account Type Selection */}
                        <div className="space-y-3 mb-6">
                            <label className="block text-sm font-bold text-gray-900 dark:text-white">
                                Transfer to Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSelectedAccountType('savings')}
                                    className={`p-4 border-2 rounded-xl font-medium transition-all ${selectedAccountType === 'savings'
                                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                                        }`}
                                >
                                    💰 Savings Account
                                </button>
                                <button
                                    onClick={() => setSelectedAccountType('current')}
                                    className={`p-4 border-2 rounded-xl font-medium transition-all ${selectedAccountType === 'current'
                                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                                        }`}
                                >
                                    🏦 Current Account
                                </button>
                            </div>
                        </div>

                        {/* Withdrawal Proof */}
                        <div className="space-y-3 mb-6">
                            <label className="block text-sm font-bold text-gray-900 dark:text-white">
                                📄 Upload Transfer Proof
                            </label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProofChange}
                                    className="hidden"
                                    id="proof-upload"
                                />
                                <label
                                    htmlFor="proof-upload"
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${proofPreview ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 hover:border-purple-400'}`}
                                >
                                    {proofPreview ? (
                                        <div className="relative w-full h-full p-2">
                                            <img src={proofPreview} alt="Proof" className="w-full h-full object-contain rounded-lg" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                <p className="text-white text-xs font-bold">Change Proof</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="text-xs text-gray-500">Tap to upload receipt/screenshot</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Transfer Summary */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Transfer Summary</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        PKR {transferRequest.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
                                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                                        {selectedAccountType}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Recipient:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {transferRequest.requesterName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowTransferPanel(false);
                                    setTransferRequest(null);
                                    setBankAccounts([]);
                                }}
                                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                disabled={transferring}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={processTransfer}
                                disabled={!selectedBankAccount || transferring}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {transferring ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Confirm Transfer
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Info Notice */}
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                ℹ️ <strong>Note:</strong> Upon confirmation, the funds will be transferred to the selected account,
                                and both email and app notifications will be sent to {transferRequest.requesterEmail}.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
