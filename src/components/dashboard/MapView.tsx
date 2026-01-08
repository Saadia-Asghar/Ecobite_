import { MapPin, Navigation, Phone, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import RealTimeMap from '../map/RealTimeMap';

interface Location {
    id: string;
    name: string;
    type: 'donor' | 'ngo' | 'shelter';
    address: string;
    distance: string;
    phone: string;
    hours: string;
    lat: number;
    lng: number;
    demandCategory?: string;
}

export default function MapView() {
    const locations: Location[] = [
        {
            id: '1',
            name: 'Green Cafe',
            type: 'donor',
            address: '123 Main St, Downtown',
            distance: '0.5 km',
            phone: '+1234567890',
            hours: '9 AM - 9 PM',
            lat: 40.7128,
            lng: -74.0060,
            demandCategory: 'Donate'
        },
        {
            id: '2',
            name: 'Hope Shelter',
            type: 'ngo',
            address: '456 Oak Ave, Midtown',
            distance: '1.2 km',
            phone: '+1234567891',
            hours: '24/7',
            lat: 40.7580,
            lng: -73.9855,
            demandCategory: 'Prepared Meals'
        },
        {
            id: '3',
            name: 'Animal Care Center',
            type: 'shelter',
            address: '789 Pine Rd, Uptown',
            distance: '2.3 km',
            phone: '+1234567892',
            hours: '8 AM - 6 PM',
            lat: 40.7489,
            lng: -73.9680,
            demandCategory: 'Dairy Products'
        }
    ];

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'donor': return 'bg-green-100 text-green-700';
            case 'ngo': return 'bg-blue-100 text-blue-700';
            case 'shelter': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'donor': return 'Food Donor';
            case 'ngo': return 'NGO';
            case 'shelter': return 'Animal Shelter';
            default: return 'Location';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-forest-900">Nearby Locations</h2>
                <button className="px-4 py-2 bg-forest-900 text-ivory rounded-xl font-medium hover:bg-forest-800 transition-colors flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Use My Location
                </button>
            </div>

            {/* Interactive Azure Map */}
            <div className="bg-white rounded-2xl border border-forest-100 overflow-hidden shadow-sm">
                <RealTimeMap
                    items={locations.map(loc => ({
                        id: loc.id,
                        lat: loc.lat,
                        lng: loc.lng,
                        title: loc.name,
                        subtitle: `${loc.distance} • ${loc.hours}`,
                        type: loc.type as any,
                        color: loc.type === 'ngo' ? '#3b82f6' : loc.type === 'shelter' ? '#f59e0b' : '#10b981',
                        data: loc
                    }))}
                    height="500px"
                    enableLiveUpdates={false}
                    highlightCategory="Prepared Meals"
                />
            </div>

            {/* Location List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((location, index) => (
                    <motion.div
                        key={location.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-forest-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-forest-900 mb-1">{location.name}</h3>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(location.type)}`}>
                                    {getTypeLabel(location.type)}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-forest-700">{location.distance}</p>
                                <p className="text-xs text-forest-500">away</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-forest-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-forest-700">{location.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-forest-600 flex-shrink-0" />
                                <p className="text-sm text-forest-700">{location.phone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-forest-600 flex-shrink-0" />
                                <p className="text-sm text-forest-700">{location.hours}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-forest-100 flex gap-2">
                            <button className="flex-1 py-2 bg-forest-100 text-forest-900 rounded-xl font-medium hover:bg-forest-200 transition-colors text-sm">
                                Get Directions
                            </button>
                            <button className="flex-1 py-2 bg-forest-900 text-ivory rounded-xl font-medium hover:bg-forest-800 transition-colors text-sm">
                                Contact
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Distance Filter */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <h3 className="font-bold text-lg text-forest-900 mb-4">Filter by Distance</h3>
                <div className="flex gap-3">
                    {['0.5 km', '1 km', '2 km', '5 km', '10 km', 'All'].map((distance) => (
                        <button
                            key={distance}
                            className="px-4 py-2 rounded-xl bg-forest-100 text-forest-700 hover:bg-forest-900 hover:text-ivory transition-colors font-medium text-sm"
                        >
                            {distance}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
