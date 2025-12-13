import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix default marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

export default function RealTimeMap() {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const markersRef = useRef<L.Marker[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch donations from API
    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
                const response = await fetch(`${apiUrl}/api/donations/map`);
                const data = await response.json();
                setDonations(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching donations:', error);
                setLoading(false);
            }
        };

        fetchDonations();
        // Refresh every 30 seconds
        const interval = setInterval(fetchDonations, 30000);
        return () => clearInterval(interval);
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Try to get user's location, fallback to Lahore, Pakistan
        let center: [number, number] = [31.5204, 74.3587];

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    center = [position.coords.latitude, position.coords.longitude];
                    if (mapRef.current) {
                        mapRef.current.setView(center, 13);
                    }
                },
                () => {
                    console.log('Using default location (Lahore, Pakistan)');
                }
            );
        }

        // Create map
        const map = L.map(mapContainerRef.current).setView(center, 12);

        // Add OpenStreetMap tiles (100% FREE!)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update markers when donations change
    useEffect(() => {
        if (!mapRef.current || loading) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        donations.forEach(donation => {
            if (!donation.lat || !donation.lng) return;

            // Create custom icon based on status
            const iconColor = donation.status === 'available' || donation.status === 'Available' ? '#10b981' : '#6b7280';
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div style="
                        background-color: ${iconColor};
                        width: 30px;
                        height: 30px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    "></div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
            });

            // Create marker
            const marker = L.marker([donation.lat, donation.lng], { icon })
                .addTo(mapRef.current!);

            // Create popup content with better styling
            const isAvailable = donation.status === 'available' || donation.status === 'Available';
            const popupContent = `
                <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
                    <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 12px;">
                        <div style="padding: 8px; background: #d1fae5; border-radius: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 4px 0; color: #059669; font-size: 18px; font-weight: 600;">
                                ${donation.foodType}
                            </h3>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                ${donation.quantity}
                            </p>
                        </div>
                    </div>
                    ${donation.description ? `
                        <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                            ${donation.description}
                        </p>
                    ` : ''}
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; font-size: 13px;">
                        <div style="display: flex; align-items: center; gap: 6px; color: #6b7280;">
                            <span style="font-weight: 600;">From:</span>
                            <span>${donation.donorName}</span>
                            <span style="padding: 2px 8px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 11px; font-weight: 600;">
                                ${donation.donorRole}
                            </span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px; color: #6b7280;">
                            <span style="font-weight: 600;">Expires:</span>
                            <span>${new Date(donation.expiry).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span style="
                                padding: 4px 10px;
                                background: ${isAvailable ? '#d1fae5' : '#f3f4f6'};
                                color: ${isAvailable ? '#059669' : '#6b7280'};
                                border-radius: 6px;
                                font-size: 12px;
                                font-weight: 600;
                                text-transform: uppercase;
                            ">
                                ${isAvailable ? '✅ Available' : '⏳ Claimed'}
                            </span>
                        </div>
                    </div>
                    ${isAvailable ? `
                        <button 
                            onclick="window.location.href='/donations?id=${donation.id}'"
                            style="
                                width: 100%;
                                padding: 10px;
                                background: #059669;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                                font-size: 14px;
                                transition: background 0.2s;
                            "
                            onmouseover="this.style.background='#047857'"
                            onmouseout="this.style.background='#059669'"
                        >
                            View Details
                        </button>
                    ` : ''}
                </div>
            `;

            marker.bindPopup(popupContent);
            markersRef.current.push(marker);
        });

        // Fit bounds to show all markers
        if (markersRef.current.length > 0) {
            const group = L.featureGroup(markersRef.current);
            mapRef.current.fitBounds(group.getBounds().pad(0.1));
        }
    }, [donations, loading]);

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
                            {donations.length} donation{donations.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Leaflet Map */}
            <div
                ref={mapContainerRef}
                style={{
                    width: '100%',
                    height: '600px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            />

            {/* Legend */}
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    💡 <strong>Tip:</strong> Click on any marker to see donation details.
                    Green markers are available donations, gray markers are already claimed.
                    Powered by OpenStreetMap (100% FREE, no API key required).
                </p>
            </div>
        </div>
    );
}
