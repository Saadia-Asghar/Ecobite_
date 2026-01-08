import { useState, useEffect } from 'react';
import { Clock, Package, Sparkles, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import RealTimeMap from '../map/RealTimeMap';
import { API_URL } from '../../config/api';

import { MOCK_DONATIONS, Donation } from '../../data/mockData';

export default function DonationsList() {
    const { user, token } = useAuth();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'available' | 'pending' | 'completed' | 'expired' | 'recycled'>('all');
    const [, setClaimingId] = useState<string | null>(null);
    const [myDonationsOnly, setMyDonationsOnly] = useState(false);

    // Claim Modal State
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [distance, setDistance] = useState('');
    const [transportCost, setTransportCost] = useState(0);
    const [requestFunds, setRequestFunds] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [transportRate, setTransportRate] = useState(100);

    useEffect(() => {
        const storedCost = localStorage.getItem('ECOBITE_SETTINGS_DELIVERY_COST');
        if (storedCost) {
            setTransportRate(Number(storedCost));
        }
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Fallback to Islamabad (center of mock activity) to ensure distance calc works
                    setUserLocation({
                        lat: 33.6844,
                        lng: 73.0479
                    });
                }
            );
        } else {
            // Fallback if geolocation is not supported
            setUserLocation({
                lat: 33.6844,
                lng: 73.0479
            });
        }
    }, []);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/donations`);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setDonations(data);
                } else {
                    setDonations(MOCK_DONATIONS);
                }
            } else {
                setDonations(MOCK_DONATIONS);
            }
        } catch (error) {
            console.error('Failed to fetch donations:', error);
            setDonations(MOCK_DONATIONS);
        } finally {
            setLoading(false);
        }
    };



    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d.toFixed(1);
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    const handleClaimClick = (donation: Donation) => {
        if (!user) {
            alert('Please login to claim donations');
            return;
        }
        setSelectedDonation(donation);
        setRequestFunds(false);

        if (userLocation && donation.lat && donation.lng) {
            const dist = calculateDistance(userLocation.lat, userLocation.lng, donation.lat, donation.lng);
            setDistance(dist);
            setTransportCost(parseFloat(dist) * transportRate);
        } else {
            setDistance('');
            setTransportCost(0);
        }

        setShowClaimModal(true);
    };

    const confirmClaim = async () => {
        if (!selectedDonation || !user) return;

        setClaimingId(selectedDonation.id);
        setShowClaimModal(false);

        try {
            const response = await fetch(`${API_URL}/api/donations/${selectedDonation.id}/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    claimedById: user.id,
                    transportDistance: distance,
                    transportCost: requestFunds ? transportCost : 0
                })
            });

            if (response.ok) {
                alert(`✅ Donation claimed successfully! Requested PKR ${transportCost} for transportation.`);
                fetchDonations(); // Refresh the list
            } else {
                throw new Error('Failed to claim donation');
            }
        } catch (error) {
            console.error('Failed to claim donation, using mock update', error);
            setDonations(prev => prev.map(d => {
                if (d.id === selectedDonation.id) {
                    return { ...d, status: 'Pending Pickup', claimedById: user.id };
                }
                return d;
            }));
            alert(`✅ (Offline Mode) Donation claimed successfully! Requested PKR ${transportCost} for transportation.`);
        } finally {
            setClaimingId(null);
            setSelectedDonation(null);
        }
    };

    const handleConfirmSent = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/donations/${id}/confirm-sent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                fetchDonations();
                alert('✅ Confirmed as sent!');
            } else {
                throw new Error('Failed to confirm sent');
            }
        } catch (error) {
            console.error('Failed to confirm sent, using mock update', error);
            setDonations(prev => prev.map(d => {
                if (d.id === id) {
                    const updated = { ...d, senderConfirmed: 1 };
                    // If receiver also confirmed, it's Received (or Completed if that's preferred, but let's use the explicit statuses)
                    // Actually, if receiver confirmed, it implies it was already 'received'? 
                    // Let's say: Pending -> Delivered -> Received.
                    if (updated.receiverConfirmed) {
                        updated.status = 'Completed'; // Both confirmed
                    } else {
                        updated.status = 'Delivered'; // Only sender confirmed
                    }
                    return updated as Donation;
                }
                return d;
            }));
            alert('✅ Confirmed as sent (Mock)!');
        }
    };

    const handleConfirmReceived = async (id: string) => {
        try {
            const donation = donations.find(d => d.id === id);
            if (!donation?.senderConfirmed) {
                alert("Cannot mark as received until donor confirms delivery!");
                return;
            }

            const response = await fetch(`${API_URL}/api/donations/${id}/confirm-received`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                fetchDonations();
                alert('✅ Confirmed receipt!');
            } else {
                throw new Error('Failed to confirm received');
            }
        } catch (error) {
            console.error('Failed to confirm received, using mock update', error);
            setDonations(prev => prev.map(d => {
                if (d.id === id) {
                    if (!d.senderConfirmed) return d; // Safety check
                    const updated = { ...d, receiverConfirmed: 1, status: 'Completed' } as Donation;
                    return updated;
                }
                return d;
            }));
            alert('✅ Confirmed receipt (Mock)!');
        }
    };

    // Check if donation is expired
    const isExpired = (donation: Donation) => {
        if (!donation.expiry) return false;
        return new Date(donation.expiry) < new Date();
    };

    const filteredDonations = donations.filter(d => {
        // First filter by "My Donations" if enabled
        if (myDonationsOnly && d.donorId !== user?.id) {
            return false;
        }

        const isItemExpired = isExpired(d);

        switch (filter) {
            case 'all':
                return true;
            case 'available':
                return (d.status === 'Available' || d.status === 'available') && !isItemExpired;
            case 'pending':
                // Pending includes Claimed, Pending Pickup, and Delivered (until received)
                return (d.status === 'Claimed' || d.status === 'Pending' || d.status === 'Pending Pickup' || d.status === 'Delivered')
                    && !d.receiverConfirmed;
            case 'completed':
                // Completed is only when explicitly marked or receiver has confirmed
                return d.status === 'Completed' || d.receiverConfirmed === 1 || (d.senderConfirmed && d.receiverConfirmed);
            case 'expired':
                return d.status === 'Expired' || ((d.status === 'Available' || d.status === 'available') && isItemExpired);
            case 'recycled':
                return d.status === 'Recycled';
            default:
                return true;
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Pending':
            case 'Pending Pickup':
            case 'Claimed':
            case 'Delivered': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-900 dark:border-ivory"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Donations</h2>

                {/* My Donations Toggle */}
                <button
                    onClick={() => setMyDonationsOnly(!myDonationsOnly)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all text-sm ${myDonationsOnly
                        ? 'bg-blue-600 text-white'
                        : 'bg-forest-100 dark:bg-forest-700 text-forest-700 dark:text-forest-300 hover:bg-forest-200 dark:hover:bg-forest-600'
                        }`}
                >
                    {myDonationsOnly ? '✓ My Donations' : 'Show My Donations'}
                </button>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
                {(['all', 'available', 'pending', 'completed', 'expired', 'recycled'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${filter === f
                            ? 'bg-forest-900 text-ivory dark:bg-forest-500'
                            : 'bg-forest-100 text-forest-700 hover:bg-forest-200 dark:bg-forest-800 dark:text-forest-300 dark:hover:bg-forest-700'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Donations Grid */}
            {filteredDonations.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-forest-800 rounded-3xl border border-forest-100 dark:border-forest-700">
                    <Package className="w-16 h-16 text-forest-300 dark:text-forest-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-forest-900 dark:text-ivory mb-2">No donations found</h3>
                    <p className="text-forest-600 dark:text-forest-400">Check back later or adjust your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDonations.map((donation, index) => (
                        <motion.div
                            key={donation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-forest-800 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="relative h-48">
                                <img
                                    src={donation.imageUrl || 'https://via.placeholder.com/400x300?text=Food+Donation'}
                                    alt={donation.aiFoodType}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(donation.status)}`}>
                                        {donation.status}
                                    </span>
                                    {donation.recommendations?.split(',').map((rec, i) => (
                                        <span key={i} className={`px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur shadow-sm ${rec.trim() === 'Food' ? 'bg-mint/80 border-mint/20 text-forest-900' :
                                            rec.trim() === 'Animal' ? 'bg-orange-100/80 border-orange-200 text-orange-900' :
                                                'bg-amber-100/80 border-amber-200 text-amber-900'
                                            }`}>
                                            For {rec.trim() === 'Food' ? 'Humans' : rec.trim() === 'Animal' ? 'Animals' : 'Fertilizer'}
                                        </span>
                                    ))}
                                    {/* Highlight if recommended for this user type */}
                                    {((user?.role === 'ngo' && donation.recommendations?.includes('Food')) ||
                                        ((user?.role === 'shelter' || user?.role === 'animal_shelter') && donation.recommendations?.includes('Animal')) ||
                                        (user?.role === 'fertilizer' && donation.recommendations?.includes('Fertilizer'))) && (
                                            <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-purple-600 text-white shadow-lg animate-pulse whitespace-nowrap">
                                                ✨ Recommended for You
                                            </div>
                                        )}
                                </div>
                                {donation.aiQualityScore && (
                                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-forest-900/90 backdrop-blur px-3 py-1 rounded-lg flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                        <span className="text-xs font-bold text-forest-900 dark:text-ivory">
                                            AI Quality: {donation.aiQualityScore}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-2 flex items-center gap-2">
                                    {donation.aiFoodType || 'Food Item'}
                                    {donation.recommendations?.includes('Fertilizer') && <span className="text-lg">🌱</span>}
                                    {donation.recommendations?.includes('Animal') && <span className="text-lg">🐾</span>}
                                </h3>
                                <p className="text-sm text-forest-600 dark:text-forest-300 mb-3 line-clamp-2">
                                    {donation.description || 'No description provided'}
                                </p>
                                <div className="space-y-2 text-sm text-forest-500 dark:text-forest-400">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        <span>{donation.quantity || 'N/A'}</span>
                                    </div>
                                    {donation.expiry && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>Expires: {new Date(donation.expiry).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {donation.status === 'Available' && user?.role !== 'individual' && user?.role !== 'restaurant' && (
                                    <button
                                        onClick={() => handleClaimClick(donation)}
                                        className="w-full mt-4 py-2 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors"
                                    >
                                        Claim Donation
                                    </button>
                                )}

                                {(donation.status === 'Claimed' || donation.status === 'Pending Pickup') && user && (
                                    <div className="mt-4 space-y-2">
                                        {/* Donor Actions */}
                                        {user.id === donation.donorId && !donation.senderConfirmed && (
                                            <button
                                                onClick={() => handleConfirmSent(donation.id)}
                                                className="w-full py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors text-sm"
                                            >
                                                Mark as Delivered
                                            </button>
                                        )}
                                        {user.id === donation.donorId && !!donation.senderConfirmed && (
                                            <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 py-2 rounded-lg">
                                                ✅ You marked as delivered
                                            </div>
                                        )}

                                        {/* Receiver Actions */}
                                        {user.id === donation.claimedById && !donation.receiverConfirmed && (
                                            donation.senderConfirmed ? (
                                                <button
                                                    onClick={() => handleConfirmReceived(donation.id)}
                                                    className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    Mark as Received
                                                </button>
                                            ) : (
                                                <p className="text-xs text-center text-orange-500 dark:text-orange-400 font-medium py-2">
                                                    ⏳ Waiting for donor to send...
                                                </p>
                                            )
                                        )}
                                        {user.id === donation.claimedById && !!donation.receiverConfirmed && (
                                            <div className="text-center text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg">
                                                ✅ You marked as received
                                            </div>
                                        )}

                                        {/* Status Messages for Counterparty */}
                                        {user.id === donation.donorId && !!donation.senderConfirmed && !donation.receiverConfirmed && (
                                            <p className="text-xs text-center text-orange-500 dark:text-orange-400">Waiting for receiver confirmation...</p>
                                        )}

                                        {/* Both Confirmed - Completed */}
                                        {!!donation.senderConfirmed && !!donation.receiverConfirmed && (
                                            <p className="text-xs text-center text-green-600 dark:text-green-400 font-bold">✅ Completed!</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Real-Time Map - Footer */}
            <div className="mt-8 bg-white dark:bg-forest-800 rounded-3xl p-6 border border-forest-100 dark:border-forest-700 relative" style={{ zIndex: 1 }}>
                <h3 className="text-xl font-bold text-forest-900 dark:text-ivory mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-forest-600 dark:text-forest-400" />
                    Live Donation Map
                </h3>
                <RealTimeMap
                    items={filteredDonations.map(d => ({
                        id: d.id,
                        lat: d.lat || 0,
                        lng: d.lng || 0,
                        title: d.aiFoodType || 'Food Donation',
                        subtitle: `${d.quantity}`,
                        type: 'donation',
                        color: d.status === 'Available' ? '#10b981' : '#6b7280',
                        data: d
                    }))}
                    height="500px"
                    enableLiveUpdates={false}
                />
            </div>

            {/* Claim Modal */}
            <AnimatePresence>
                {showClaimModal && selectedDonation && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-forest-800 rounded-2xl p-6 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-forest-900 dark:text-ivory">Claim Donation</h3>
                                <button
                                    onClick={() => setShowClaimModal(false)}
                                    className="p-2 hover:bg-forest-100 dark:hover:bg-forest-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-forest-600 dark:text-forest-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Distance (km) (Auto-calculated)
                                        </div>
                                    </label>
                                    <input
                                        type="number"
                                        value={distance}
                                        readOnly
                                        className="w-full px-4 py-2 border border-forest-200 dark:border-forest-600 rounded-xl bg-gray-100 dark:bg-forest-900/50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        Estimated Transport Cost
                                    </label>
                                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                                        Rs. {transportCost.toFixed(2)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="requestFunds"
                                        checked={requestFunds}
                                        onChange={(e) => setRequestFunds(e.target.checked)}
                                        className="w-4 h-4 text-forest-600 rounded focus:ring-forest-500"
                                    />
                                    <label htmlFor="requestFunds" className="text-sm text-forest-700 dark:text-forest-300">
                                        Request transport funding
                                    </label>
                                </div>

                                <button
                                    onClick={confirmClaim}
                                    disabled={!distance}
                                    className="w-full py-3 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors disabled:opacity-50"
                                >
                                    Confirm Claim
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
