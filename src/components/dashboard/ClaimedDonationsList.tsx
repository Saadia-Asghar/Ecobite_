import { useState, useEffect } from 'react';
import { Package, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Donation {
    id: string;
    donorId: string;
    status: string;
    expiry: string;
    aiFoodType: string;
    aiQualityScore: number;
    imageUrl: string;
    description: string;
    quantity: string;
    claimedById: string;
    senderConfirmed?: number;
    receiverConfirmed?: number;
}

export default function ClaimedDonationsList() {
    const { user, token } = useAuth();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDonations();
        }
    }, [user]);

    const fetchDonations = async () => {
        try {
            const response = await fetch(`http://localhost:3002/api/donations?claimedById=${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                // Filter for active claimed donations (not completed/expired unless recent)
                // Actually, let's show all claimed ones that are not fully completed?
                // Or just the ones needing action.
                // The user wants to see "Delivered" button.
                // So we show 'Claimed' and 'Pending Pickup'.
                const active = data.filter((d: Donation) =>
                    d.status === 'Claimed' ||
                    d.status === 'Pending Pickup' ||
                    (d.status === 'Pending' && d.claimedById === user?.id)
                );
                setDonations(active);
            }
        } catch (error) {
            console.error('Failed to fetch claimed donations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReceived = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3002/api/donations/${id}/confirm-received`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                fetchDonations();
                alert('✅ Confirmed delivery!');
            }
        } catch (error) {
            console.error('Failed to confirm received', error);
        }
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;

    if (donations.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No active claimed donations.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {donations.map((donation) => (
                <div key={donation.id} className="p-4 rounded-xl border border-forest-100 dark:border-forest-700 bg-white dark:bg-forest-800 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h4 className="font-bold text-forest-900 dark:text-ivory">{donation.aiFoodType}</h4>
                            <p className="text-xs text-forest-600 dark:text-forest-400 line-clamp-1">{donation.description}</p>
                        </div>
                        {donation.aiQualityScore && (
                            <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">
                                <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{donation.aiQualityScore}%</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-forest-600 dark:text-forest-400 mb-3">
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>{donation.quantity}</span>
                        </div>
                        {donation.expiry && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Exp: {new Date(donation.expiry).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                        {!donation.receiverConfirmed ? (
                            <button
                                onClick={() => handleConfirmReceived(donation.id)}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
                            >
                                Mark as Received
                            </button>
                        ) : (
                            <div className="text-center text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg">
                                ✅ You marked as received
                            </div>
                        )}

                        {donation.receiverConfirmed && !donation.senderConfirmed && (
                            <p className="text-xs text-center text-orange-500 dark:text-orange-400 mt-2">Waiting for sender confirmation...</p>
                        )}

                        {donation.receiverConfirmed && donation.senderConfirmed && (
                            <p className="text-xs text-center text-green-600 dark:text-green-400 font-bold mt-2">✅ Completed!</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
