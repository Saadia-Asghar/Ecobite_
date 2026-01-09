import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Copy, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config/api';

interface PendingDonation {
    id: string;
    donorId: string;
    donorName: string;
    donorEmail: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    proofImage?: string;
    accountUsed?: string;
    submittedAt: string;
    status: 'pending' | 'verified' | 'rejected';
    notes?: string;
}

export default function ManualPaymentVerification() {
    const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([]);
    const [selectedDonation, setSelectedDonation] = useState<PendingDonation | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');

    // Fetch pending donations
    const fetchPendingDonations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/payment/manual/pending`);
            const data = await response.json();
            setPendingDonations(data);
        } catch (error) {
            console.error('Error fetching pending donations:', error);
        }
    };

    // Verify and approve donation
    const handleApprove = async (donationId: string) => {
        try {
            const token = localStorage.getItem('ecobite_token');
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/api/payment/manual/${donationId}/approve`, {
                method: 'POST',
                headers,
            });

            if (response.ok) {
                const result = await response.json();
                alert(`✅ Donation verified and approved! User earned ${result.ecoPointsEarned} EcoPoints.`);
                fetchPendingDonations();
                setSelectedDonation(null);

                // Dispatch event to update stats in real-time for the user
                if (result.userId) {
                    window.dispatchEvent(new CustomEvent('paymentApproved', {
                        detail: {
                            userId: result.userId,
                            ecoPointsEarned: result.ecoPointsEarned,
                            updatedEcoPoints: result.updatedEcoPoints
                        }
                    }));
                    console.log('📢 Dispatched paymentApproved event for user:', result.userId);
                }
            } else {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                alert(`❌ Failed to approve donation: ${error.error}`);
            }
        } catch (error) {
            console.error('Error approving donation:', error);
            alert('❌ Failed to approve donation');
        }
    };

    // Reject donation
    const handleReject = async (donationId: string) => {
        if (!rejectionReason) {
            alert('Please enter a rejection reason');
            return;
        }

        try {
            const token = localStorage.getItem('ecobite_token');
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/api/payment/manual/${donationId}/reject`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ reason: rejectionReason }),
            });

            if (response.ok) {
                alert('❌ Donation rejected');
                fetchPendingDonations();
                setSelectedDonation(null);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Error rejecting donation:', error);
            alert('❌ Failed to reject donation');
        }
    };

    // Copy transaction ID
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('✅ Copied to clipboard!');
    };

    const filteredDonations = pendingDonations.filter(d =>
        filter === 'all' ? true : d.status === filter
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Manual Payment Verification
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review and verify payment proofs from donors
                    </p>
                </div>
                <button
                    onClick={fetchPendingDonations}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {['all', 'pending', 'verified', 'rejected'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab as any)}
                        className={`px-4 py-2 font-medium capitalize ${filter === tab
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        {tab}
                        {tab === 'pending' && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                {pendingDonations.filter(d => d.status === 'pending').length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Donations List */}
            <div className="grid gap-4">
                {filteredDonations.map((donation) => (
                    <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex justify-between items-start">
                            {/* Donation Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${donation.status === 'pending' ? 'bg-yellow-100' :
                                        donation.status === 'verified' ? 'bg-green-100' :
                                            'bg-red-100'
                                        }`}>
                                        {donation.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                                        {donation.status === 'verified' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                        {donation.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                            PKR {donation.amount.toLocaleString()}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {donation.donorName} • {donation.donorEmail}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {donation.paymentMethod}
                                        </p>
                                    </div>

                                    {donation.transactionId && (
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {donation.transactionId}
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(donation.transactionId!)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {donation.accountUsed && (
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Account Used:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {donation.accountUsed}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {new Date(donation.submittedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {donation.notes && (
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <strong>Notes:</strong> {donation.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {donation.proofImage && (
                                    <button
                                        onClick={() => setSelectedDonation(donation)}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Proof
                                    </button>
                                )}

                                {donation.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(donation.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setSelectedDonation(donation)}
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

                {filteredDonations.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No {filter !== 'all' && filter} donations found
                    </div>
                )}
            </div>

            {/* Proof Modal */}
            {selectedDonation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Payment Proof
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    PKR {selectedDonation.amount.toLocaleString()} from {selectedDonation.donorName}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedDonation(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Proof Image */}
                        {selectedDonation.proofImage && (
                            <div className="mb-4">
                                <img
                                    src={selectedDonation.proofImage}
                                    alt="Payment Proof"
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                                <a
                                    href={selectedDonation.proofImage}
                                    download
                                    className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Image
                                </a>
                            </div>
                        )}

                        {/* Rejection Form */}
                        {selectedDonation.status === 'pending' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Rejection Reason (if rejecting)
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        rows={3}
                                        placeholder="e.g., Payment not received, Invalid transaction ID, etc."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(selectedDonation.id)}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Verify & Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedDonation.id)}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
