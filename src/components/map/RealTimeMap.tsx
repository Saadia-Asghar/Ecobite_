import { useEffect, useRef, useState } from 'react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import { MapPin } from 'lucide-react';
import { API_URL } from '../../config/api';

export interface MapItem {
    id: string;
    lat: number;
    lng: number;
    title?: string;
    subtitle?: string;
    type?: 'donation' | 'ngo' | 'shelter' | 'donor' | 'other';
    color?: string;
    data?: any;
}

interface RealTimeMapProps {
    items?: MapItem[];
    center?: [number, number]; // [lng, lat]
    zoom?: number;
    height?: string;
    enableLiveUpdates?: boolean;
    onMarkerClick?: (item: MapItem) => void;
}

export default function RealTimeMap({
    items: propItems,
    center,
    zoom = 12,
    height = '600px',
    enableLiveUpdates = true,
    onMarkerClick
}: RealTimeMapProps = {}) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<atlas.Map | null>(null);
    const [donations, setDonations] = useState<MapItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // Determine which items to show
    const displayItems = propItems || donations;

    // Fetch donations from API if no items provided and live updates enabled
    useEffect(() => {
        if (propItems) {
            setLoading(false);
            return;
        }

        if (!enableLiveUpdates) {
            setLoading(false);
            return;
        }

        const fetchDonations = async () => {
            try {
                const response = await fetch(`${API_URL}/api/donations/map`);
                const data = await response.json();

                // Transform data to MapItem
                const mappedData: MapItem[] = data.map((d: any) => ({
                    id: d.id,
                    lat: d.lat,
                    lng: d.lng,
                    title: d.foodType,
                    subtitle: `${d.quantity} • ${d.donorName}`,
                    type: 'donation',
                    color: d.status?.toLowerCase() === 'available' ? '#10b981' : '#6b7280',
                    data: d
                }));

                setDonations(mappedData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching donations:', error);
                setLoading(false);
            }
        };

        fetchDonations();
        const interval = setInterval(fetchDonations, 30000);
        return () => clearInterval(interval);
    }, [propItems, enableLiveUpdates]);

    const [error, setError] = useState<string | null>(null);

    // Initialize Azure Map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const azureKey = import.meta.env.VITE_AZURE_MAPS_KEY;

        if (!azureKey) {
            console.error('❌ Missing VITE_AZURE_MAPS_KEY. Map will not load correctly.');
            setError('Missing Azure Maps API Key. Please configure VITE_AZURE_MAPS_KEY in your environment.');
            return;
        }

        try {
            const map = new atlas.Map(mapContainerRef.current, {
                center: center || [74.3587, 31.5204], // Default or provided
                zoom: zoom,
                authOptions: {
                    authType: atlas.AuthenticationType.subscriptionKey,
                    subscriptionKey: azureKey
                },
                view: 'Auto'
            });

            // Get user location if not provided center
            if (!center && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { longitude, latitude } = position.coords;
                        setUserLocation([longitude, latitude]);
                        map.setCamera({
                            center: [longitude, latitude],
                            zoom: 13
                        });
                    },
                    (error) => {
                        console.log('Using default location:', error);
                    }
                );
            }

            map.events.add('ready', () => {
                mapRef.current = map;

                // Add zoom controls
                map.controls.add([
                    new atlas.control.ZoomControl(),
                    new atlas.control.StyleControl(),
                    new atlas.control.PitchControl()
                ], {
                    position: atlas.ControlPosition.TopRight
                });

                // Initial marker render
                if (displayItems.length > 0) {
                    renderMarkers(map, displayItems);
                }
            });

            map.events.add('error', (e) => {
                console.error('Azure Maps Error:', e);
                setError(`Map Error: ${e.error?.message || 'Unknown error'}`);
            });

        } catch (err: any) {
            console.error('Failed to initialize map:', err);
            setError(`Failed to initialize map: ${err.message}`);
        }

        return () => {
            // Cleanup if needed
        };
    }, []); // Run once on mount

    // Update markers when items change
    useEffect(() => {
        if (!mapRef.current || !mapRef.current.markers) return;
        renderMarkers(mapRef.current, displayItems);

        // Adjust camera to fit bounds if items exist
        if (displayItems.length > 0) {
            // Calculate bounds
            let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
            displayItems.forEach(item => {
                if (item.lng < minLon) minLon = item.lng;
                if (item.lng > maxLon) maxLon = item.lng;
                if (item.lat < minLat) minLat = item.lat;
                if (item.lat > maxLat) maxLat = item.lat;
            });

            // If user location exists, include it in bounds
            if (userLocation) {
                if (userLocation[0] < minLon) minLon = userLocation[0];
                if (userLocation[0] > maxLon) maxLon = userLocation[0];
                if (userLocation[1] < minLat) minLat = userLocation[1];
                if (userLocation[1] > maxLat) maxLat = userLocation[1];
            }

            // Only set camera if we have valid bounds
            if (minLon !== 180) {
                mapRef.current.setCamera({
                    bounds: [minLon, minLat, maxLon, maxLat],
                    padding: 50
                });
            }
        }
    }, [displayItems, userLocation]);

    const renderMarkers = (map: atlas.Map, items: MapItem[]) => {
        // Clear existing markers
        map.markers.clear();

        items.forEach(item => {
            if (!item.lat || !item.lng) return;

            // Default color logic
            let color = item.color || '#3b82f6';
            if (!item.color) {
                if (item.type === 'ngo') color = '#3b82f6'; // Blue
                else if (item.type === 'shelter') color = '#f59e0b'; // Amber
                else if (item.type === 'donor') color = '#10b981'; // Green
                else if (item.type === 'donation') color = '#10b981';
            }

            // Create custom marker element
            const markerContainer = document.createElement('div');
            markerContainer.style.backgroundColor = color;
            markerContainer.style.width = '30px';
            markerContainer.style.height = '30px';
            markerContainer.style.borderRadius = '50% 50% 50% 0';
            markerContainer.style.transform = 'rotate(-45deg)';
            markerContainer.style.border = '3px solid white';
            markerContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            markerContainer.style.cursor = 'pointer';

            const marker = new atlas.HtmlMarker({
                position: [item.lng, item.lat],
                htmlContent: markerContainer,
                pixelOffset: [0, -15]
            });

            // Popup
            const popupContent = `
                 <div style="padding:12px; min-width:200px; font-family:sans-serif;">
                     <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                         <div style="width:10px; height:10px; background:${color}; border-radius:50%;"></div>
                         <strong style="font-size:16px; color:#111;">${item.title || 'Location'}</strong>
                     </div>
                     ${item.subtitle ? `<div style="font-size:14px; color:#555; margin-bottom:4px;">${item.subtitle}</div>` : ''}
                     <div style="font-size:12px; color:#888; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px;">
                         ${item.type || 'Location'}
                     </div>
                 </div>
             `;

            const popup = new atlas.Popup({
                content: popupContent,
                pixelOffset: [0, -30]
            });

            // Attach click event directly to the marker container element
            markerContainer.onclick = () => {
                popup.setOptions({ position: marker.getOptions().position });
                popup.open(map);
                if (onMarkerClick) onMarkerClick(item);
            };

            map.markers.add(marker);
        });
    };

    if (loading) {
        return (
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center" style={{ height }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-blue-50 dark:bg-slate-900 relative overflow-hidden rounded-xl border border-blue-100 dark:border-slate-800" style={{ height }}>
                {/* Fallback Static Map for Demo if API Key fails */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 dark:opacity-40 grayscale-[20%]"
                    style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/74.3587,31.5204,12,0/800x600?access_token=pk.mock')`, backgroundColor: '#e2e8f0' }}
                >
                    {/* Fallback Pattern if image fails to load */}
                    <div className="w-full h-full opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>

                {/* Mock Markers */}
                {displayItems.slice(0, 5).map((item, i) => (
                    <div
                        key={i}
                        className="absolute w-8 h-8 -ml-4 -mt-8 transition-transform hover:scale-110 cursor-pointer"
                        style={{
                            top: `${40 + (Math.random() * 20)}%`,
                            left: `${40 + (Math.random() * 20)}%`
                        }}
                        onClick={() => onMarkerClick && onMarkerClick(item)}
                    >
                        <MapPin
                            className="w-full h-full drop-shadow-md"
                            style={{ color: item.color || '#ef4444', fill: 'currentColor' }}
                        />
                    </div>
                ))}

                {/* Center Marker (User) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse ring-4 ring-blue-500/30"></div>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-2 rounded-lg text-xs shadow-sm flex flex-col items-end">
                    <span className="font-bold text-red-600 dark:text-red-400">⚠️ Live Map Offline</span>
                    <span className="text-[10px] text-gray-500">Azure Maps Key Missing or Invalid</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="mb-4 p-3 bg-white dark:bg-forest-800 rounded-xl border border-forest-200 dark:border-forest-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-forest-600" />
                    <h3 className="font-bold text-forest-900 dark:text-ivory">Live Map</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <img src="https://azure.microsoft.com/svghandler/maps/?width=20&height=20" alt="Azure" className="w-5 h-5" />
                    <span>Azure Maps</span>
                </div>
            </div>

            <div
                ref={mapContainerRef}
                style={{ width: '100%', height, borderRadius: '12px', position: 'relative' }}
            />
        </div>
    );
}
