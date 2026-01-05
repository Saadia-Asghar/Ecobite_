import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Users, Package, Calendar, Truck, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RealTimeMap from '../map/RealTimeMap';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

interface NGO {
    id: string;
    name: string;
    address: string;
    phone: string;
    distance: number;
    openHours: string;
    capacity: number;
    lat: number;
    lng: number;
}

interface Donation {
    id: string;
    aiFoodType: string;
    quantity: string;
    expiry: string;
    status: string;
    lat?: number;
    lng?: number;
    distance?: number;
    description?: string;
}

interface NearbyViewProps {
    mode?: 'ngos' | 'donations';
    userRole?: string;
}

export default function NearbyNGOsView({ mode = 'ngos', userRole }: NearbyViewProps) {
    const { user, token } = useAuth();
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [loading, setLoading] = useState(true);
    const [donations, setDonations] = useState<Donation[]>([]);

    // Claim Modal State
    const [claimModalOpen, setClaimModalOpen] = useState(false);
    const [claimingDonation, setClaimingDonation] = useState<Donation | null>(null);
    const [transportCost, setTransportCost] = useState(0);
    const [transportRate, setTransportRate] = useState(100); // PKR per km
    const [requestFunds, setRequestFunds] = useState(false);

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

    useEffect(() => {
        const storedCost = localStorage.getItem('ECOBITE_SETTINGS_DELIVERY_COST');
        if (storedCost) {
            setTransportRate(Number(storedCost));
        }
    }, []);

    // Mock NGO data (in production, fetch from backend based on user location)
    const [ngos] = useState<NGO[]>([
        {
            id: '1',
            name: 'Edhi Foundation',
            address: 'Shahrah-e-Faisal, Karachi',
            phone: '+92-21-111-113-344',
            distance: 2.3,
            openHours: '24/7',
            capacity: 500,
            lat: 24.8607,
            lng: 67.0011
        },
        {
            id: '2',
            name: 'Saylani Welfare Trust',
            address: 'Bahadurabad, Karachi',
            phone: '+92-21-111-729-526',
            distance: 3.5,
            openHours: '9 AM - 6 PM',
            capacity: 300,
            lat: 24.8738,
            lng: 67.0644
        },
        {
            id: '3',
            name: 'Al-Khidmat Foundation',
            address: 'Gulshan-e-Iqbal, Karachi',
            phone: '+92-21-111-253-462',
            distance: 4.2,
            openHours: '8 AM - 8 PM',
            capacity: 400,
            lat: 24.9207,
            lng: 67.0827
        },
        {
            id: '4',
            name: 'Chhipa Welfare Association',
            address: 'Korangi, Karachi',
            phone: '+92-21-111-244-472',
            distance: 5.8,
            openHours: '24/7',
            capacity: 250,
            lat: 24.8256,
            lng: 67.1064
        },
        {
            id: '5',
            name: 'JDC Foundation',
            address: 'North Nazimabad, Karachi',
            phone: '+92-21-111-532-000',
            distance: 6.1,
            openHours: '9 AM - 5 PM',
            capacity: 350,
            lat: 24.9324,
            lng: 67.0336
        }
    ]);

    useEffect(() => {
        // Get user's live location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    if (mode === 'donations') {
                        fetchDonations(position.coords.latitude, position.coords.longitude);
                    } else {
                        setLoading(false);
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Default to Karachi
                    const defaultLat = 24.8607;
                    const defaultLng = 67.0011;
                    setUserLocation({ lat: defaultLat, lng: defaultLng });
                    if (mode === 'donations') {
                        fetchDonations(defaultLat, defaultLng);
                    } else {
                        setLoading(false);
                    }
                }
            );
        } else {
            // Default location if geolocation not supported
            const defaultLat = 24.8607;
            const defaultLng = 67.0011;
            setUserLocation({ lat: defaultLat, lng: defaultLng });
            if (mode === 'donations') {
                fetchDonations(defaultLat, defaultLng);
            } else {
                setLoading(false);
            }
        }
    }, [mode]);

    const fetchDonations = async (lat: number, lng: number) => {
        try {
            // If user is fertilizer, fetch 'Expired' donations (waste). Otherwise 'Available'.
            const status = userRole === 'fertilizer' ? 'Expired' : 'Available';
            const response = await fetch(`${API_URL}/api/donations?status=${status}`);

            if (response.ok) {
                const data = await response.json();
                // Mock coordinates for donations since backend might not have them yet
                // Spread them around the user's location
                const donationsWithLoc = data.map((d: any) => {
                    const dLat = lat + (Math.random() - 0.5) * 0.1;
                    const dLng = lng + (Math.random() - 0.5) * 0.1;
                    return {
                        ...d,
                        lat: dLat,
                        lng: dLng,
                        distance: calculateDistance(lat, lng, dLat, dLng)
                    };
                });
                setDonations(donationsWithLoc);
            }
        } catch (error) {
            console.error('Failed to fetch donations:', error);
        } finally {
            setLoading(false);
        }
    };

    const openInMaps = (lat: number, lng: number) => {
        // Open in Google Maps
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const handleClaimClick = (donation: Donation, e: React.MouseEvent) => {
        e.stopPropagation();
        setClaimingDonation(donation);
        const dist = donation.distance || 0;
        setTransportCost(Math.ceil(Number(dist) * transportRate));
        setRequestFunds(false);
        setClaimModalOpen(true);
    };

    const confirmClaim = async () => {
        if (!claimingDonation || !user) return;

        try {
            const response = await fetch(`${API_URL}/api/donations/${claimingDonation.id}/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    claimedById: user.id,
                    transportCost: requestFunds ? transportCost : 0,
                    transportDistance: claimingDonation.distance
                })
            });

            if (response.ok) {
                // Remove from list
                setDonations(donations.filter(d => d.id !== claimingDonation.id));
                setClaimModalOpen(false);
                setClaimingDonation(null);
                alert(`✅ Donation claimed successfully! A notification has been sent to the donor.`);
            } else {
                const error = await response.json();
                alert(`Failed to claim: ${error.error}`);
            }
        } catch (error) {
            console.error('Claim error:', error);
            alert('Failed to claim donation. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-forest-900 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const items = mode === 'ngos' ? ngos : donations;
    const title = mode === 'ngos' ? 'Nearby NGOs' : 'Live Donations';
    const subtitle = mode === 'ngos' ? 'NGOs found near your location' : 'Available donations near you on the map';

    return (
        <div className="space-y-4 p-4 relative">
            {/* Header */}
            <div className={`bg-gradient-to-br ${mode === 'ngos' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'} dark:from-blue-700 dark:to-blue-800 p-6 rounded-2xl text-white`}>
                <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-6 h-6" />
                    <h3 className="text-lg font-bold">{title}</h3>
                </div>
                <p className="text-white/90 text-sm font-medium mb-1">
                    {subtitle}
                </p>
                <p className="text-white/80 text-xs">
                    {items.length} {mode === 'ngos' ? 'NGOs' : 'donations'} found
                </p>
                {userLocation && (
                    <p className="text-white/80 text-xs mt-1">
                        📍 Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </p>
                )}
            </div>

            {/* Interactive Azure Map */}
            <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden shadow-sm">
                <RealTimeMap
                    items={mode === 'ngos'
                        ? ngos.map(ngo => ({
                            id: ngo.id,
                            lat: ngo.lat,
                            lng: ngo.lng,
                            title: ngo.name,
                            subtitle: `${ngo.distance} km • ${ngo.phone}`,
                            type: 'ngo',
                            color: '#3b82f6',
                            data: ngo
                        }))
                        : donations.map(d => ({
                            id: d.id,
                            lat: d.lat || 0,
                            lng: d.lng || 0,
                            title: d.aiFoodType,
                            subtitle: `${d.quantity} • ${d.distance} km`,
                            type: 'donation',
                            color: '#10b981',
                            data: d
                        }))
                    }
                    center={userLocation ? [userLocation.lng, userLocation.lat] : undefined}
                    height="350px"
                    enableLiveUpdates={false}
                    onMarkerClick={(item) => {
                        if (mode === 'ngos') setSelectedNGO(item.data);
                        else setSelectedDonation(item.data);
                    }}
                />
                <div className={`p-4 ${mode === 'ngos' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                    <p className={`text-xs ${mode === 'ngos' ? 'text-blue-800 dark:text-blue-300' : 'text-green-800 dark:text-green-300'}`}>
                        💡 <strong>Tip:</strong> Click a marker to see details, or "Directions" to navigate.
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {mode === 'ngos' ? (
                    // NGO List
                    ngos.map((ngo) => (
                        <motion.div
                            key={ngo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white dark:bg-forest-800 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedNGO?.id === ngo.id
                                ? 'border-blue-500 dark:border-blue-400'
                                : 'border-forest-100 dark:border-forest-700'
                                }`}
                            onClick={() => setSelectedNGO(ngo)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-bold text-forest-900 dark:text-ivory mb-1">
                                        {ngo.name}
                                    </h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-forest-600 dark:text-forest-300">
                                            <MapPin className="w-4 h-4" />
                                            <span>{ngo.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-forest-600 dark:text-forest-300">
                                            <Phone className="w-4 h-4" />
                                            <span>{ngo.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-forest-600 dark:text-forest-300">
                                            <Clock className="w-4 h-4" />
                                            <span>{ngo.openHours}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-forest-600 dark:text-forest-300">
                                            <Users className="w-4 h-4" />
                                            <span>Capacity: {ngo.capacity} people</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold mb-2">
                                        {ngo.distance} km
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openInMaps(ngo.lat, ngo.lng);
                                }}
                                className="w-full py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Navigation className="w-4 h-4" />
                                Get Directions
                            </button>
                        </motion.div>
                    ))
                ) : (
                    // Donation List
                    donations.map((donation) => (
                        <motion.div
                            key={donation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white dark:bg-forest-800 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedDonation?.id === donation.id
                                ? 'border-green-500 dark:border-green-400'
                                : 'border-forest-100 dark:border-forest-700'
                                }`}
                            onClick={() => setSelectedDonation(donation)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-bold text-forest-900 dark:text-ivory mb-1">
                                        {donation.aiFoodType}
                                    </h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-forest-600 dark:text-forest-300">
                                            <Package className="w-4 h-4" />
                                            <span>{donation.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-forest-600 dark:text-forest-300">
                                            <Calendar className="w-4 h-4" />
                                            <span>Expires: {donation.expiry}</span>
                                        </div>
                                        {donation.description && (
                                            <p className="text-sm text-forest-500 italic mt-1">
                                                "{donation.description}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-bold mb-2">
                                        {donation.distance} km
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (donation.lat && donation.lng) {
                                            openInMaps(donation.lat, donation.lng);
                                        }
                                    }}
                                    className="flex-1 py-2 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-lg font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Directions
                                </button>
                                {user?.role !== 'individual' && user?.role !== 'restaurant' && (
                                    <button
                                        onClick={(e) => handleClaimClick(donation, e)}
                                        className="flex-1 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg font-bold hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Claim
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}

                {mode === 'donations' && donations.length === 0 && (
                    <div className="text-center py-8 bg-forest-50 dark:bg-forest-900/20 rounded-xl border-dashed border-2 border-forest-200 dark:border-forest-700">
                        <p className="text-forest-500 dark:text-forest-400">No available donations found nearby.</p>
                    </div>
                )}
            </div>

            {/* Claim Modal */}
            <AnimatePresence>
                {claimModalOpen && claimingDonation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-forest-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-forest-100 dark:border-forest-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-forest-900 dark:text-ivory">Confirm Claim</h3>
                                <button
                                    onClick={() => setClaimModalOpen(false)}
                                    className="p-1 rounded-full hover:bg-forest-100 dark:hover:bg-forest-700 text-forest-500"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="p-4 bg-forest-50 dark:bg-forest-900/30 rounded-xl">
                                    <p className="font-bold text-forest-900 dark:text-ivory mb-1">
                                        {claimingDonation.aiFoodType}
                                    </p>
                                    <p className="text-sm text-forest-600 dark:text-forest-300">
                                        Quantity: {claimingDonation.quantity}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="requestFunds"
                                        checked={requestFunds}
                                        onChange={(e) => setRequestFunds(e.target.checked)}
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                    <label htmlFor="requestFunds" className="text-sm font-medium text-forest-900 dark:text-ivory">
                                        Request delivery cost coverage
                                    </label>
                                </div>
                            </div>


                            {requestFunds && (
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-forest-600 dark:text-forest-300">Distance</span>
                                        <span className="font-bold text-forest-900 dark:text-ivory">{claimingDonation.distance} km</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-forest-600 dark:text-forest-300">Rate</span>
                                        <span className="font-bold text-forest-900 dark:text-ivory">PKR {transportRate}/km</span>
                                    </div>
                                    <div className="h-px bg-green-200 dark:bg-green-700 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-forest-900 dark:text-ivory flex items-center gap-2">
                                            <Truck className="w-4 h-4" />
                                            Total Claim
                                        </span>
                                        <span className="text-xl font-bold text-green-700 dark:text-green-400">
                                            PKR {transportCost}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setClaimModalOpen(false)}
                                    className="flex-1 py-3 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmClaim}
                                    className="flex-1 py-3 bg-green-600 dark:bg-green-700 text-white rounded-xl font-bold hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
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
