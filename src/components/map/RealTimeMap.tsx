import { useEffect, useRef, useState } from 'react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import { MapPin } from 'lucide-react';
import { API_URL } from '../../config/api';
import { getAzureMapsToken, initializeMSAL, isAzureADConfigured, isReturningFromRedirect } from '../../services/azureMapsAuth';

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
    const [mapReady, setMapReady] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Initialize MSAL and get Azure Maps token
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check if Azure AD is configured
                if (!isAzureADConfigured()) {
                    console.warn('⚠️ Azure AD not configured. Falling back to subscription key.');
                    // Fallback to subscription key if available
                    const subscriptionKey = (import.meta.env.VITE_AZURE_MAPS_KEY as string) || '';
                    if (subscriptionKey) {
                        setAccessToken(''); // Empty token means use subscription key
                        return;
                    } else {
                        setError('Azure AD or subscription key must be configured. Please set VITE_AZURE_CLIENT_ID or VITE_AZURE_MAPS_KEY');
                        return;
                    }
                }

                // Initialize MSAL first (handles redirect if returning from auth)
                await initializeMSAL();

                // Check if we're returning from a redirect
                if (isReturningFromRedirect()) {
                    console.log('🔄 Returning from authentication redirect...');
                    // Give MSAL a moment to process the redirect
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                // Get access token
                try {
                    const token = await getAzureMapsToken();
                    setAccessToken(token);
                    console.log('✅ Azure Maps token acquired via Azure AD');
                } catch (tokenError: any) {
                    // If it's a redirect error, that's expected - the redirect will happen
                    if (tokenError.message?.includes('Redirecting to login')) {
                        console.log('🔄 Redirecting to login for Azure Maps authentication...');
                        // Don't set error, the redirect will handle it
                        return;
                    }
                    throw tokenError;
                }
            } catch (err: any) {
                console.error('Failed to get Azure Maps token:', err);

                // Don't show error if it's a redirect
                if (err.message?.includes('Redirecting to login')) {
                    return;
                }

                // Fallback to subscription key
                const subscriptionKey = (import.meta.env.VITE_AZURE_MAPS_KEY as string) || '';
                if (subscriptionKey) {
                    console.log('⚠️ Falling back to subscription key');
                    setAccessToken(''); // Empty token means use subscription key
                } else {
                    // Check if we should show interactive login option
                    const errorMsg = err.message || 'Unknown error';
                    const shouldShowInteractive = isAzureADConfigured() &&
                        (errorMsg.toLowerCase().includes('interaction') ||
                            errorMsg.toLowerCase().includes('login') ||
                            errorMsg.toLowerCase().includes('consent'));

                    if (shouldShowInteractive) {
                        setError(`Authentication required: ${errorMsg}. Click "Sign In" to enable the map.`);
                    } else {
                        setError(`Failed to authenticate with Azure Maps: ${errorMsg}. Please sign in with Microsoft to use the map.`);
                    }
                }
            }
        };

        initAuth();
    }, []);

    // Initialize Azure Map
    useEffect(() => {
        // Wait for token or subscription key
        if (accessToken === null) return; // Still loading

        if (!mapContainerRef.current || mapRef.current) return;

        // Ensure container has dimensions before initializing
        const container = mapContainerRef.current;
        let mapInstance: atlas.Map | null = null;
        let resizeObserver: ResizeObserver | null = null;
        let timeoutId: number | null = null;
        let cleanupDone = false;

        const initializeMap = async () => {
            if (cleanupDone) return;

            const rect = container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                // Use requestAnimationFrame to wait for next render cycle
                requestAnimationFrame(initializeMap);
                return;
            }

            // Double-check map wasn't already initialized
            if (mapRef.current || cleanupDone) return;

            console.log('🗺️ Initializing Azure Maps...');
            console.log('📍 Container dimensions:', rect.width, 'x', rect.height);
            console.log('🔐 Using Azure AD authentication:', accessToken !== '');

            try {
                // Configure auth options based on available credentials
                let authOptions: any;

                if (accessToken && accessToken !== '') {
                    // Use Azure AD authentication
                    const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';

                    // Get fresh token initially
                    let currentToken = accessToken;

                    authOptions = {
                        authType: atlas.AuthenticationType.aad,
                        clientId: clientId,
                        aadAppId: clientId,
                        aadTenant: import.meta.env.VITE_AZURE_TENANT_ID || 'common',
                        getToken: () => {
                            // Return a Promise that gets a fresh token
                            return getAzureMapsToken()
                                .then((token) => {
                                    currentToken = token;
                                    setAccessToken(token);
                                    return {
                                        token: token,
                                        expiresOnTimestamp: Date.now() + (60 * 60 * 1000) // 1 hour from now
                                    };
                                })
                                .catch((err) => {
                                    console.error('Token refresh failed:', err);
                                    // Return current token if refresh fails (better than nothing)
                                    return {
                                        token: currentToken,
                                        expiresOnTimestamp: Date.now() + (60 * 60 * 1000)
                                    };
                                });
                        }
                    };
                } else {
                    // Fallback to subscription key
                    const subscriptionKey = (import.meta.env.VITE_AZURE_MAPS_KEY as string) || '';
                    if (!subscriptionKey) {
                        setError('No authentication method available. Please configure Azure AD or subscription key.');
                        return;
                    }
                    authOptions = {
                        authType: atlas.AuthenticationType.subscriptionKey,
                        subscriptionKey: subscriptionKey
                    };
                }

                mapInstance = new atlas.Map(container, {
                    center: center || [74.3587, 31.5204], // Default or provided [lng, lat]
                    zoom: zoom,
                    authOptions: authOptions,
                    view: 'Auto',
                    style: 'road',
                    language: 'en-US',
                    showLogo: true,
                    showFeedbackLink: true,
                    renderWorldCopies: true
                });

                // Handle map ready event
                mapInstance.events.add('ready', () => {
                    if (!mapInstance || cleanupDone) return;

                    console.log('✅ Azure Maps loaded successfully');
                    mapRef.current = mapInstance;
                    setMapReady(true);
                    setLoading(false);

                    // Trigger resize to ensure map renders correctly
                    mapInstance.resize();

                    // Add zoom controls
                    try {
                        mapInstance.controls.add([
                            new atlas.control.ZoomControl(),
                            new atlas.control.StyleControl(),
                            new atlas.control.PitchControl()
                        ], {
                            position: atlas.ControlPosition.TopRight
                        });
                    } catch (ctrlError) {
                        console.warn('Could not add map controls:', ctrlError);
                    }

                    // Initial marker render
                    if (displayItems.length > 0) {
                        renderMarkers(mapInstance, displayItems);
                    }

                    // Set up resize observer for container
                    if (window.ResizeObserver) {
                        resizeObserver = new ResizeObserver(() => {
                            if (mapInstance && !cleanupDone) {
                                mapInstance.resize();
                            }
                        });
                        resizeObserver.observe(container);
                    }
                });

                // Handle map load event (fired before ready)
                mapInstance.events.add('load', () => {
                    console.log('🗺️ Azure Maps loading...');
                });

                // Handle errors
                mapInstance.events.add('error', (e: any) => {
                    if (cleanupDone) return;
                    console.error('Azure Maps Error:', e);
                    const errorMsg = e.error?.message || e.message || 'Unknown error';

                    // Check for authentication errors
                    if (errorMsg.toLowerCase().includes('subscription') ||
                        errorMsg.toLowerCase().includes('key') ||
                        errorMsg.toLowerCase().includes('authentication') ||
                        errorMsg.toLowerCase().includes('unauthorized')) {
                        setError(`Authentication Error: Please check your Azure Maps API key. ${errorMsg}`);
                    } else {
                        setError(`Map Error: ${errorMsg}`);
                    }
                    setMapReady(false);
                });

                // Set timeout to detect if map doesn't load
                timeoutId = window.setTimeout(() => {
                    if (!mapReady && mapInstance && !cleanupDone) {
                        console.warn('⚠️ Map initialization taking longer than expected');
                        // Force a resize attempt
                        try {
                            mapInstance.resize();
                        } catch (e) {
                            console.error('Failed to resize map:', e);
                        }
                    }
                }, 5000);

                // Get user location if not provided center
                if (!center && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            if (mapInstance && !cleanupDone) {
                                const { longitude, latitude } = position.coords;
                                setUserLocation([longitude, latitude]);
                                mapInstance.setCamera({
                                    center: [longitude, latitude],
                                    zoom: 13
                                });
                            }
                        },
                        (error) => {
                            console.log('Using default location:', error);
                        }
                    );
                }

            } catch (err: any) {
                console.error('Failed to initialize map:', err);
                setError(`Failed to initialize map: ${err.message || 'Unknown error'}`);
                setMapReady(false);
            }
        };

        // Handle window resize
        const handleResize = () => {
            if (mapInstance && !cleanupDone) {
                try {
                    mapInstance.resize();
                } catch (e) {
                    console.warn('Error resizing map:', e);
                }
            }
        };
        window.addEventListener('resize', handleResize);

        // Start initialization
        initializeMap();

        // Cleanup function
        return () => {
            cleanupDone = true;
            if (timeoutId) clearTimeout(timeoutId);
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
            if (mapInstance) {
                try {
                    mapInstance.dispose();
                } catch (e) {
                    console.warn('Error disposing map:', e);
                }
            }
            mapRef.current = null;
            setMapReady(false);
        };
    }, [center, zoom, accessToken]); // Re-run if center, zoom, or token changes

    // Update markers when items change (only after map is ready)
    useEffect(() => {
        if (!mapRef.current || !mapReady) return;

        try {
            if (mapRef.current.markers) {
                renderMarkers(mapRef.current, displayItems);

                // Adjust camera to fit bounds if items exist
                if (displayItems.length > 0) {
                    // Calculate bounds
                    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
                    let hasValidBounds = false;

                    displayItems.forEach(item => {
                        if (item.lat && item.lng &&
                            !isNaN(item.lat) && !isNaN(item.lng) &&
                            item.lat >= -90 && item.lat <= 90 &&
                            item.lng >= -180 && item.lng <= 180) {
                            hasValidBounds = true;
                            if (item.lng < minLon) minLon = item.lng;
                            if (item.lng > maxLon) maxLon = item.lng;
                            if (item.lat < minLat) minLat = item.lat;
                            if (item.lat > maxLat) maxLat = item.lat;
                        }
                    });

                    // If user location exists, include it in bounds
                    if (userLocation && userLocation[0] && userLocation[1]) {
                        hasValidBounds = true;
                        if (userLocation[0] < minLon) minLon = userLocation[0];
                        if (userLocation[0] > maxLon) maxLon = userLocation[0];
                        if (userLocation[1] < minLat) minLat = userLocation[1];
                        if (userLocation[1] > maxLat) maxLat = userLocation[1];
                    }

                    // Only set camera if we have valid bounds
                    if (hasValidBounds && minLon !== 180 && minLat !== 90) {
                        mapRef.current.setCamera({
                            bounds: [minLon, minLat, maxLon, maxLat],
                            padding: 50
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error updating markers:', err);
        }
    }, [displayItems, userLocation, mapReady]);

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
            markerContainer.className = 'custom-marker';
            markerContainer.style.display = 'flex';
            markerContainer.style.flexDirection = 'column';
            markerContainer.style.alignItems = 'center';
            markerContainer.style.cursor = 'pointer';

            // Add text label ABOVE the pin
            const label = document.createElement('div');
            label.textContent = item.title || 'Location';
            label.style.marginBottom = '4px';
            label.style.padding = '2px 8px';
            label.style.backgroundColor = 'white';
            label.style.borderRadius = '10px';
            label.style.fontSize = '11px';
            label.style.fontWeight = 'bold';
            label.style.color = '#111';
            label.style.whiteSpace = 'nowrap';
            label.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            label.style.border = `1px solid ${color}`;
            label.style.pointerEvents = 'none';
            markerContainer.appendChild(label);

            const pinWrapper = document.createElement('div');
            pinWrapper.style.backgroundColor = color;
            pinWrapper.style.width = '24px';
            pinWrapper.style.height = '24px';
            pinWrapper.style.borderRadius = '50% 50% 50% 0';
            pinWrapper.style.transform = 'rotate(-45deg)';
            pinWrapper.style.border = '2px solid white';
            pinWrapper.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            markerContainer.appendChild(pinWrapper);

            const marker = new atlas.HtmlMarker({
                position: [item.lng, item.lat],
                htmlContent: markerContainer,
                anchor: 'bottom'
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
        // Check if error is about authentication - show interactive login option
        const needsAuth = error.toLowerCase().includes('authentication') ||
            error.toLowerCase().includes('sign in') ||
            error.toLowerCase().includes('login');

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

                {/* Error Message with Interactive Login Option */}
                <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-black/90 backdrop-blur px-4 py-3 rounded-lg text-xs shadow-lg flex flex-col items-end gap-2 max-w-xs">
                    <span className="font-bold text-red-600 dark:text-red-400">⚠️ {needsAuth ? 'Authentication Required' : 'Map Offline'}</span>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300 text-right">{error}</span>

                    {needsAuth && isAzureADConfigured() && (
                        <button
                            onClick={async () => {
                                try {
                                    // Force interactive login
                                    const { getAzureMapsToken, initializeMSAL } = await import('../../services/azureMapsAuth');
                                    await initializeMSAL();

                                    // Clear any existing error
                                    setError(null);

                                    // Try to get token with interactive login
                                    try {
                                        const token = await getAzureMapsToken();
                                        setAccessToken(token);
                                        console.log('✅ Azure Maps token acquired via interactive login');
                                    } catch (err: any) {
                                        // If redirect is needed, it will happen automatically
                                        if (err.message?.includes('Redirecting to login')) {
                                            console.log('🔄 Redirecting to login...');
                                        } else {
                                            throw err;
                                        }
                                    }
                                } catch (err: any) {
                                    console.error('Interactive login failed:', err);
                                    setError(`Login failed: ${err.message || 'Unknown error'}`);
                                }
                            }}
                            className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                        >
                            Sign In with Microsoft
                        </button>
                    )}
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
                style={{
                    width: '100%',
                    height,
                    borderRadius: '12px',
                    position: 'relative',
                    minHeight: '400px',
                    backgroundColor: '#f3f4f6' // Fallback background color
                }}
                className="azure-map-container"
            />
        </div>
    );
}
