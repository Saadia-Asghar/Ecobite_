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
    claimedById?: string;
    senderConfirmed?: number;
    receiverConfirmed?: number;
    createdAt: string;
    category?: string; // 'animal' or 'human'
}

export default function AnimalFoodDonationsList() {
    const { user, token } = useAuth();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'available' | 'claimed' | 'pending' | 'completed'>('all');

    useEffect(() => {
        if (user) {
            fetchDonations();
        }
    }, [user]);

    const fetchDonations = async () => {
        try {
            const response = await fetch(`http://localhost:3002/api/donations?claimedById=${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter for animal food only
                const animalFood = data.filter((d: Donation) => isAnimalFood(d));
                setDonations(animalFood);
            }
        } catch (error) {
            console.error('Failed to fetch donations', error);
        } finally {
            setLoading(false);
        }
    };

    // Check if food is suitable for animals
    const isAnimalFood = (donation: Donation) => {
        const animalFoodKeywords = [
            'vegetable scraps', 'meat trimmings', 'bread', 'rice', 'grains',
            'vegetables', 'fruits', 'meat', 'chicken', 'fish', 'bones',
            'leftovers', 'food waste', 'scraps', 'animal', 'pet food'
        ];

        const foodType = (donation.aiFoodType || '').toLowerCase();
        const description = (donation.description || '').toLowerCase();

        return animalFoodKeywords.some(keyword =>
            foodType.includes(keyword) || description.includes(keyword)
        );
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

    // Filter donations by status
    const filteredDonations = donations.filter(d => {
        if (filter === 'all') return true;
        if (filter === 'available') return d.status === 'Available';
        if (filter === 'claimed') return d.status === 'Claimed' && d.claimedById === user?.id;
        if (filter === 'pending') return (d.status === 'Claimed' || d.status === 'Pending Pickup')
            && (!d.senderConfirmed || !d.receiverConfirmed);
        if (filter === 'completed') return (d.status === 'Delivered' || d.status === 'Completed')
            || (d.senderConfirmed && d.receiverConfirmed);
        return true;
    });

    if (loading) return <div className="text-center py-4 text-forest-500 dark:text-forest-400">Loading...</div>;

    return (
        <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {(['all', 'available', 'claimed', 'pending', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${filter === f
                            ? 'bg-amber-600 text-white'
                            : 'bg-forest-100 dark:bg-forest-700 text-forest-700 dark:text-forest-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Donations List */}
            {filteredDonations.length === 0 ? (
                <div className="text-center py-8 bg-forest-50 dark:bg-forest-900/20 rounded-xl border-dashed border-2 border-forest-200 dark:border-forest-700">
                    <Package className="w-12 h-12 text-forest-300 dark:text-forest-600 mx-auto mb-2" />
                    <p className="text-forest-500 dark:text-forest-400 text-sm">
                        No {filter !== 'all' ? filter : ''} animal food donations found.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredDonations.map((donation) => (
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

                            {/* Status Badge */}
                            <div className="mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${donation.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    donation.status === 'Pending Pickup' || donation.status === 'Claimed' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                        donation.status === 'Available' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {donation.status}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                {!donation.receiverConfirmed && donation.claimedById === user?.id ? (
                                    <button
                                        onClick={() => handleConfirmReceived(donation.id)}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Mark as Received
                                    </button>
                                ) : donation.receiverConfirmed ? (
                                    <div className="text-center text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg">
                                        ✅ You marked as received
                                    </div>
                                ) : null}

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
            )}
        </div>
    );
}
