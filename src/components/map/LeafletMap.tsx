import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_URL } from '../../config/api';

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

const LeafletMap: React.FC = () => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const markersRef = useRef<L.Marker[]>([]);

    // Fetch donations from API
    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await fetch(`${API_URL}/api/donations/map`);
                const data = await response.json();
                setDonations(data);
            } catch (error) {
                console.error('Error fetching donations:', error);
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

        // Create map centered on Pakistan (Lahore)
        const map = L.map(mapContainerRef.current).setView([31.5204, 74.3587], 12);

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
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        donations.forEach(donation => {
            if (!donation.lat || !donation.lng) return;

            // Create custom icon based on status
            const iconColor = donation.status === 'available' ? '#10b981' : '#6b7280';
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

            // Create popup content
            const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #059669; font-size: 16px; font-weight: 600;">
            ${donation.foodType}
          </h3>
          <div style="font-size: 14px; color: #374151;">
            <p style="margin: 5px 0;">
              <strong>Quantity:</strong> ${donation.quantity}
            </p>
            <p style="margin: 5px 0;">
              <strong>Donor:</strong> ${donation.donorName}
            </p>
            <p style="margin: 5px 0;">
              <strong>Expires:</strong> ${new Date(donation.expiry).toLocaleDateString()}
            </p>
            <p style="margin: 5px 0;">
              <strong>Status:</strong> 
              <span style="
                color: ${donation.status === 'available' ? '#059669' : '#6b7280'};
                font-weight: 600;
                text-transform: uppercase;
              ">
                ${donation.status}
              </span>
            </p>
            ${donation.description ? `
              <p style="margin: 5px 0;">
                <strong>Details:</strong> ${donation.description}
              </p>
            ` : ''}
          </div>
          <button 
            onclick="window.location.href=window.location.origin + '/dashboard/browse'"
            style="
              margin-top: 10px;
              width: 100%;
              padding: 8px;
              background: #059669;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
            "
            onmouseover="this.style.background='#047857'"
            onmouseout="this.style.background='#059669'"
          >
            Browse Donations
          </button>
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
    }, [donations]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
            }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#1a4d2e' }}>
                    Legend
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}></div>
                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#6b7280',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}></div>
                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>Claimed</span>
                </div>
            </div>

            {/* Donation count */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '10px 15px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 1000,
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a4d2e',
                backdropFilter: 'blur(10px)',
            }}>
                📍 {donations.length} Donation{donations.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
};

export default LeafletMap;
