import { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';

interface LocationAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

export default function LocationAutocomplete({ value, onChange, placeholder, required }: LocationAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Mock location suggestions - In production, use Google Places API
    const mockLocations = [
        'Karachi, Sindh, Pakistan',
        'Lahore, Punjab, Pakistan',
        'Islamabad, Pakistan',
        'Rawalpindi, Punjab, Pakistan',
        'Faisalabad, Punjab, Pakistan',
        'Multan, Punjab, Pakistan',
        'Peshawar, Khyber Pakhtunkhwa, Pakistan',
        'Quetta, Balochistan, Pakistan',
        'Sialkot, Punjab, Pakistan',
        'Gujranwala, Punjab, Pakistan',
        'DHA Phase 5, Karachi',
        'Gulberg, Lahore',
        'F-7 Markaz, Islamabad',
        'Bahria Town, Rawalpindi',
        'Model Town, Lahore',
        'Clifton, Karachi',
        'Blue Area, Islamabad',
        'Saddar, Karachi',
        'Mall Road, Lahore',
        'Jinnah Avenue, Islamabad'
    ];

    useEffect(() => {
        if (value.length > 2) {
            const filtered = mockLocations.filter(loc =>
                loc.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [value]);

    const handleSelect = (location: string) => {
        onChange(location);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-600 dark:text-forest-300" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Address or landmark"}
                    required={required}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-400" />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-forest-800 border border-forest-200 dark:border-forest-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelect(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-forest-50 dark:hover:bg-forest-700 transition-colors flex items-center gap-2 border-b border-forest-100 dark:border-forest-700 last:border-0"
                        >
                            <MapPin className="w-4 h-4 text-forest-600 dark:text-forest-300 flex-shrink-0" />
                            <span className="text-sm text-forest-900 dark:text-ivory">{suggestion}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* No results */}
            {showSuggestions && value.length > 2 && suggestions.length === 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-forest-800 border border-forest-200 dark:border-forest-600 rounded-xl shadow-lg p-4">
                    <p className="text-sm text-forest-600 dark:text-forest-300 text-center">
                        No locations found. Type your address manually.
                    </p>
                </div>
            )}
        </div>
    );
}
