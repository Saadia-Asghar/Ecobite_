import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, XCircle, Clock, Eye, TrendingUp, AlertCircle } from 'lucide-react';

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
                ? 'http://localhost:3002/api/money-requests'
                : `http://localhost:3002/api/money-requests?status=${filter}`;

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
            const response = await fetch('http://localhost:3002/api/money-requests/stats/summary');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleApprove = async (requestId: string) => {
        if (!confirm('Are you sure you want to approve this request?')) return;

        try {
            const response = await fetch(`http://localhost:3002/api/money-requests/${requestId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: 'admin' })
            });

            if (response.ok) {
                alert('✅ Request approved successfully!');
                fetchRequests();
                fetchStats();
                setSelectedRequest(null);
            } else {
                const error = await response.json();
                alert(`❌ ${error.error}`);
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('❌ Failed to approve request');
        }
    };

    const handleReject = async (requestId: string) => {
        if (!rejectionReason) {
            alert('Please enter a rejection reason');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3002/api/money-requests/${requestId}/reject`, {
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
        </div>
    );
}
