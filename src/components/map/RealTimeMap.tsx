import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { MapPin, Package, Clock } from 'lucide-react';

interface Donation {
    id: string;
    lat: number;
    lng: number;
    foodType: string;
    quantity: string;
    donorName: string;
    donorRole: string;
    expiry: string;
    status: string;
    description?: string;
}

const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '12px'
};

// Default center: Lahore, Pakistan
const defaultCenter = {
    lat: 31.5204,
    lng: 74.3587
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
    ]
};

export default function RealTimeMap() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [selected, setSelected] = useState<Donation | null>(null);
    const [center, setCenter] = useState(defaultCenter);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDonations();
        // Update every 30 seconds
        const interval = setInterval(fetchDonations, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    console.log('Using default location');
                }
            );
        }
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await fetch('http://localhost:3002/api/donations/map');
            const data = await response.json();
            setDonations(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching donations:', error);
            setLoading(false);
        }
    };

    const getMarkerIcon = (status: string) => {
        return {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: status === 'available' ? '#10b981' : '#6b7280',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 10
        };
    };

    if (loading) {
        return (
            <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Map Header */}
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            Live Donations Map
                        </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-600"></div>
                            <span className="text-gray-600 dark:text-gray-400">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <span className="text-gray-600 dark:text-gray-400">Claimed</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                            {donations.length} donations
                        </span>
                    </div>
                </div>
            </div>

            {/* Google Map */}
            <LoadScript
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'}
                loadingElement={
                    <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                        <p>Loading Google Maps...</p>
                    </div>
                }
            >
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={13}
                    options={mapOptions}
                >
                    {/* Donation Markers */}
                    {donations.map(donation => (
                        <Marker
                            key={donation.id}
                            position={{ lat: donation.lat, lng: donation.lng }}
                            onClick={() => setSelected(donation)}
                            icon={getMarkerIcon(donation.status)}
                            animation={donation.status === 'available' ? google.maps.Animation.DROP : undefined}
                        />
                    ))}

                    {/* Info Window */}
                    {selected && (
                        <InfoWindow
                            position={{ lat: selected.lat, lng: selected.lng }}
                            onCloseClick={() => setSelected(null)}
                        >
                            <div className="p-3 max-w-xs">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Package className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1">
                                            {selected.foodType}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {selected.quantity}
                                        </p>
                                    </div>
                                </div>

                                {selected.description && (
                                    <p className="text-sm text-gray-700 mb-3">
                                        {selected.description}
                                    </p>
                                )}

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="font-medium">From:</span>
                                        <span>{selected.donorName}</span>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                            {selected.donorRole}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span>Expires: {new Date(selected.expiry).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${selected.status === 'available'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {selected.status === 'available' ? '✅ Available' : '⏳ Claimed'}
                                        </span>
                                    </div>
                                </div>

                                {selected.status === 'available' && (
                                    <button
                                        onClick={() => window.location.href = `/donations/${selected.id}`}
                                        className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                    >
                                        View Details
                                    </button>
                                )}
                            </div>
                        </InfoWindow>
                    )}

                    {/* User Location Marker (if available) */}
                    {center.lat !== defaultCenter.lat && (
                        <Marker
                            position={center}
                            icon={{
                                path: google.maps.SymbolPath.CIRCLE,
                                fillColor: '#3b82f6',
                                fillOpacity: 1,
                                strokeColor: '#ffffff',
                                strokeWeight: 2,
                                scale: 8
                            }}
                            title="Your Location"
                        />
                    )}
                </GoogleMap>
            </LoadScript>

            {/* Legend */}
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    💡 <strong>Tip:</strong> Click on any marker to see donation details.
                    Green markers are available donations, gray markers are already claimed.
                    {center.lat !== defaultCenter.lat && ' Blue marker shows your current location.'}
                </p>
            </div>
        </div>
    );
}
