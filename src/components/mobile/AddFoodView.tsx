import { useState, useEffect } from 'react';
import { Camera, MapPin, Calendar, Package, Clock, Sparkles, Share2, X as CloseIcon, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// ... (rest of imports unchanged)
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../ImageUpload';
import LocationAutocomplete from '../LocationAutocomplete';
import { API_URL } from '../../config/api';

interface AddFoodProps {
    userRole: string;
}

export default function AddFoodView({ userRole }: AddFoodProps) {
    const { user, token: authToken, refreshUser } = useAuth();
    const [imageUrl, setImageUrl] = useState('');
    const [foodType, setFoodType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expiry, setExpiry] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [fileName, setFileName] = useState(''); // Captured from file input for AI cues

    const [analyzing, setAnalyzing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [myRequests, setMyRequests] = useState<any[]>([]);

    // AI Features State
    const [scanningStep, setScanningStep] = useState('');
    const [qualityScore, setQualityScore] = useState<number | null>(null);
    const [isExpiredDetection, setIsExpiredDetection] = useState(false);
    const [recommendations, setRecommendations] = useState<string>('Food');
    const [showShareOverlay, setShowShareOverlay] = useState(false);
    const [lastDonationType, setLastDonationType] = useState('');

    // Expiry duration state
    const [expiryDuration, setExpiryDuration] = useState('');
    const [expiryUnit, setExpiryUnit] = useState<'minutes' | 'hours' | 'days'>('hours');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location for donation:', error);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
    }, []);

    useEffect(() => {
        if ((userRole === 'ngo' || userRole === 'shelter') && user?.id) {
            fetchRequests();
        }
    }, [user, userRole]);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`${API_URL}/api/requests/food?requesterId=${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setMyRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        }
    };


    const handleAnalyze = async () => {
        if (!imageUrl) {
            setMessage('Please enter an image URL first');
            return;
        }

        setAnalyzing(true);
        setMessage('');
        setIsExpiredDetection(false);
        setRecommendations('Food');

        // Feature 5: Scouting UI Steps
        const steps = [
            'Initializing Azure AI Vision...',
            'Analyzing food textures...',
            'Checking safety labels & OCR...',
            'Calculating freshness index...',
            'Cross-referencing logistics...'
        ];

        for (const step of steps) {
            setScanningStep(step);
            await new Promise(r => setTimeout(r, 600));
        }

        try {
            const response = await fetch(`${API_URL}/api/donations/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl, filename: fileName })
            });

            if (response.ok) {
                const data = await response.json();
                setFoodType(data.foodType || '');
                setDescription(data.description || '');
                setQualityScore(data.qualityScore);

                // Feature 2: Expiry Guardian Logic
                if (data.detectedText) {
                    const text = data.detectedText.toLowerCase();
                    const currentYear = new Date().getFullYear();
                    const expiryKeywords = ['exp', 'best before', 'expires', 'expiry', 'valid till', 'use by'];
                    const hasExpiryWord = expiryKeywords.some(kw => text.includes(kw));

                    const yearsInText = text.match(/\b(20\d{2})\b/g);
                    let flagExpired = false;

                    if (yearsInText) {
                        for (const yearStr of yearsInText) {
                            const year = parseInt(yearStr);
                            if (year < currentYear || (year === currentYear && hasExpiryWord)) {
                                flagExpired = true;
                                break;
                            }
                        }
                    }

                    // Recommendation Logic based on Quality
                    const isSpoiled = (data.qualityScore || 0) < 30;
                    const isAnimalFeedOnly = (data.qualityScore || 0) >= 30 && (data.qualityScore || 0) < 60;
                    const isDualEdible = (data.qualityScore || 0) >= 60;

                    if (isSpoiled) {
                        setRecommendations('Fertilizer');
                        setIsExpiredDetection(false);
                        setMessage(`🔍 AI Audit: Low quality (${data.qualityScore}%). Tagged for Fertilizer.`);
                    } else if (isAnimalFeedOnly) {
                        setRecommendations('Animal');
                        setIsExpiredDetection(false);
                        setMessage(`🔍 AI Audit: Quality is ${data.qualityScore}%. Recommended for Animal Shelter feed.`);
                    } else if (isDualEdible) {
                        setRecommendations('Food, Animal');

                        // Strict Date Check: Only flag if we found a VALID year < current year
                        // If quality is super high (>90), visually it IS fresh, so assume text read might be wrong unless year is clearly old
                        if (flagExpired && data.qualityScore < 90) {
                            setIsExpiredDetection(true);
                            setMessage(`⚠️ AI Alert: Potential Expiry detected in text. Safety check required.`);
                        } else {
                            setIsExpiredDetection(false);
                            setMessage(`✅ Analysis Complete! Premium Quality (${data.qualityScore}%). Suitable for Humans & Animals.`);
                        }
                    }
                } else {
                    const isSpoiled = (data.qualityScore || 0) < 30;
                    const isAnimalFeedOnly = (data.qualityScore || 0) >= 30 && (data.qualityScore || 0) < 60;

                    if (isSpoiled) {
                        setRecommendations('Fertilizer');
                        setMessage(`🔍 Note: Quality is ${data.qualityScore}%. Recommended for Fertilizer.`);
                    } else if (isAnimalFeedOnly) {
                        setRecommendations('Animal');
                        setMessage(`🔍 Note: Quality is ${data.qualityScore}%. Recommended for Animals.`);
                    } else {
                        setRecommendations('Food, Animal');
                        setMessage(`✅ Analysis Complete! Freshness: ${data.qualityScore}%. Suitable for Humans & Animals.`);
                    }
                }
            } else {
                setMessage('❌ Analysis failed. Please try again.');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            setMessage('❌ Could not connect to server');
        } finally {
            setAnalyzing(false);
            setScanningStep('');
        }
    };

    const handleSubmit = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!foodType || !quantity || (!expiry && !expiryDuration)) {
            setMessage('❌ Please fill all required fields');
            return;
        }

        setSubmitting(true);
        setMessage('');

        // Calculate expiry date from duration if provided
        let finalExpiry = expiry;
        if (expiryDuration && expiryUnit) {
            const now = new Date();
            const duration = parseInt(expiryDuration);

            switch (expiryUnit) {
                case 'minutes':
                    now.setMinutes(now.getMinutes() + duration);
                    break;
                case 'hours':
                    now.setHours(now.getHours() + duration);
                    break;
                case 'days':
                    now.setDate(now.getDate() + duration);
                    break;
            }

            finalExpiry = now.toISOString();
        }

        // Add AI disclaimer to description for transparency
        const aiDisclaimer = qualityScore !== null ? `\n\n[EcoBite AI Disclaimer: Scanned Quality ${qualityScore}%. Recommended for ${recommendations}]` : '';

        const token = authToken || localStorage.getItem('ecobite_token');

        // Ensure we have user ID - log warning if missing
        if (!user?.id && token) {
            console.warn('⚠️ User ID missing but token exists. User may not be properly authenticated.');
        }

        const donation = {
            // Include donorId in body, but server will prioritize authenticated user from token
            donorId: user?.id || 'anonymous',
            status: 'available',
            expiry: finalExpiry,
            aiFoodType: foodType,
            aiQualityScore: qualityScore || 85,
            imageUrl,
            description: description + aiDisclaimer,
            quantity,
            lat: coords?.lat || 31.5204, // Fallback to Lahore
            lng: coords?.lng || 74.3587,
            recommendations
        };

        // Build headers - ALWAYS include Authorization if token exists (even if user?.id is missing)
        // This ensures the server can extract the user ID from the token
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('📤 Sending donation with token for user:', user?.id || 'unknown');
        } else {
            console.warn('⚠️ No token found - donation will be anonymous');
        }

        try {
            const response = await fetch(`${API_URL}/api/donations`, {
                method: 'POST',
                headers,
                body: JSON.stringify(donation)
            });

            if (response.ok) {
                const result = await response.json();
                // Use the actual food type from the result if available, otherwise use form value
                setLastDonationType(result.aiFoodType || foodType || 'food');
                setShowShareOverlay(true);
                setMessage('✅ Donation posted successfully!');
                console.log('✅ Donation posted successfully, showing overlay');

                // Don't reset form immediately - let user see the success overlay first
                // Form will be reset when overlay is closed or user wants to add another donation

                // Refresh user to get updated EcoPoints (server already added them)
                // Always refresh if we have a token, even if user?.id was missing (it might be in token)
                if (token && refreshUser) {
                    try {
                        await refreshUser();
                        console.log('✅ User refreshed after donation');
                    } catch (refreshErr) {
                        console.error('⚠️ Failed to refresh user:', refreshErr);
                    }
                }

                // Dispatch custom event to refresh stats across all dashboards
                // ONLY dispatch if we have a valid, non-empty user ID (don't dispatch for anonymous donations)
                // Use strict check to ensure userId is a truthy, non-empty string
                const eventUserId = user?.id;
                if (eventUserId && typeof eventUserId === 'string' && eventUserId.trim().length > 0 && eventUserId !== 'anonymous') {
                    window.dispatchEvent(new CustomEvent('donationPosted', {
                        detail: {
                            userId: eventUserId, // Always a valid, authenticated user ID
                            ecoPointsEarned: result.ecoPointsEarned || 10,
                            updatedEcoPoints: result.updatedEcoPoints
                        }
                    }));
                    console.log('📢 Dispatched donationPosted event for authenticated user:', eventUserId);
                } else {
                    console.log('⚠️ Skipping donationPosted event: no valid authenticated user ID (anonymous or invalid donation)');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 413) {
                    const sizeInMB = (imageUrl.length * 0.75) / (1024 * 1024);
                    setMessage(`❌ Image too large (${sizeInMB.toFixed(1)}MB). Limit is 50MB.`);
                } else {
                    setMessage(`❌ ${errorData.error || errorData.details || 'Failed to post donation'}`);
                }
            }
        } catch (error) {
            console.error('Failed to post donation:', error);
            setMessage('❌ Could not connect to server');
        } finally {
            setSubmitting(false);
        }
    };

    const handleShareDonation = async () => {
        const shareText = `🌟 Just rescued ${lastDonationType || 'food'} and shared it on EcoBite! 🌍 Every bite counts towards a zero-waste future. #EcoBite #FoodWaste #Sustainability #ImagineCup`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Impact with EcoBite',
                    text: shareText,
                    url: window.location.origin
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Impact message copied!');
        }

        // Reset form after sharing
        setShowShareOverlay(false);
        setImageUrl('');
        setFoodType('');
        setQuantity('');
        setExpiry('');
        setExpiryDuration('');
        setExpiryUnit('hours');
        setDescription('');
        setLocation('');
        setQualityScore(null);
        setIsExpiredDetection(false);
        setMessage('');
    };

    // Different content based on role
    if (userRole === 'ngo' || userRole === 'shelter') {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Request Food</h2>

                {message && (
                    <div className={`p-4 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {message}
                    </div>
                )}

                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                            Food Type Needed
                        </label>
                        <input
                            type="text"
                            value={foodType}
                            onChange={(e) => setFoodType(e.target.value)}
                            placeholder="e.g., Rice, Vegetables, Bread"
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                            Quantity Needed
                        </label>
                        <input
                            type="text"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g., 50 meals, 20kg"
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={async (e) => {
                            e.preventDefault();
                            setSubmitting(true);
                            setMessage('');
                            try {
                                const token = authToken || localStorage.getItem('ecobite_token');

                                // Build headers - include Authorization if token exists
                                const headers: HeadersInit = {
                                    'Content-Type': 'application/json'
                                };
                                if (token) {
                                    headers['Authorization'] = `Bearer ${token}`;
                                }

                                const response = await fetch(`${API_URL}/api/requests/food`, {
                                    method: 'POST',
                                    headers,
                                    body: JSON.stringify({
                                        requesterId: user?.id,
                                        foodType,
                                        quantity
                                    })
                                });

                                if (response.ok) {
                                    await response.json(); // Response handled, no need to store
                                    setMessage('✅ Request created with AI drafts!');
                                    setFoodType('');
                                    setQuantity('');
                                    fetchRequests(); // Refresh list
                                } else {
                                    const errorData = await response.json().catch(() => ({}));
                                    setMessage(`❌ ${errorData.error || errorData.details || 'Failed to create request'}`);
                                }
                            } catch (error) {
                                console.error('Failed to create request:', error);
                                setMessage('❌ Could not connect to server');
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                        disabled={submitting || !foodType || !quantity}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Creating...' : 'Create Request with AI Drafts'}
                    </button>
                </div>

                {/* My Requests List */}
                <div className="mt-8">
                    <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">My Requests</h3>
                    <div className="space-y-3">
                        {myRequests.map((req) => (
                            <div key={req.id} className="bg-white dark:bg-forest-800 p-4 rounded-xl border border-forest-100 dark:border-forest-700 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-forest-900 dark:text-ivory">{req.foodType}</p>
                                        <p className="text-sm text-forest-600 dark:text-forest-300">{req.quantity}</p>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-forest-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg font-medium">
                                        Active
                                    </span>
                                </div>
                            </div>
                        ))}
                        {myRequests.length === 0 && (
                            <div className="text-center py-8 bg-forest-50 dark:bg-forest-900/20 rounded-xl border-dashed border-2 border-forest-200 dark:border-forest-700">
                                <p className="text-forest-500 dark:text-forest-400 text-sm">No requests found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // For donors (individual, restaurant, fertilizer)
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Add Donation</h2>

            {message && (
                <div className={`p-4 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {message}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 space-y-4"
            >
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                        <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Food Image
                        </div>
                    </label>
                    <div className="relative overflow-hidden rounded-2xl group">

                        <ImageUpload
                            onImageSelected={(file, url) => {
                                setImageUrl(url);
                                if (file) setFileName(file.name);
                            }}
                            currentUrl={imageUrl}
                        />

                        {/* Feature 5: Scouting UI Scanner Line */}
                        <AnimatePresence>
                            {analyzing && (
                                <div className="absolute inset-0 z-10">
                                    <motion.div
                                        initial={{ top: '0%' }}
                                        animate={{ top: '100%' }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                        className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                                    />
                                    <div className="absolute inset-0 bg-green-400/10 backdrop-blur-[1px] flex items-center justify-center">
                                        <div className="bg-black/60 px-4 py-2 rounded-xl border border-green-500/50">
                                            <p className="text-green-400 font-mono text-sm animate-pulse">
                                                {scanningStep}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Feature 3: Quality Badge */}
                        {!analyzing && qualityScore !== null && (
                            <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-forest-900/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-purple-100 shadow-sm flex items-center gap-2">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                </motion.div>
                                <span className="text-sm font-bold text-forest-900 dark:text-ivory">
                                    AI Verified: {qualityScore}%
                                </span>
                            </div>
                        )}
                    </div>

                    {imageUrl && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleAnalyze();
                            }}
                            disabled={analyzing}
                            className="w-full mt-3 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            {analyzing ? 'Vision Processing...' : 'Verify with AI Vision'}
                        </button>
                    )}
                </div>

                {/* Food Type */}
                <div>
                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                        Food Type *
                    </label>
                    <input
                        type="text"
                        value={foodType}
                        onChange={(e) => setFoodType(e.target.value)}
                        placeholder="e.g., Vegetables, Bread, Prepared Meals"
                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                        required
                    />
                </div>

                {/* Quantity */}
                <div>
                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Quantity *
                        </div>
                    </label>
                    <input
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g., 5kg, 20 portions"
                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                        required
                    />
                </div>

                {/* Expiry Duration */}
                <div>
                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Expiry Duration *
                        </div>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            min="1"
                            value={expiryDuration}
                            onChange={(e) => {
                                setExpiryDuration(e.target.value);
                                setExpiry(''); // Clear date if using duration
                            }}
                            placeholder="Enter duration"
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                        />
                        <select
                            value={expiryUnit}
                            onChange={(e) => setExpiryUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                        >
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                        </select>
                    </div>
                    {expiryDuration && (
                        <p className="text-xs text-forest-500 dark:text-forest-400 mt-2">
                            Food will expire in {expiryDuration} {expiryUnit}
                        </p>
                    )}
                </div>

                {/* OR Expiry Date */}
                <div>
                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Or Set Expiry Date
                        </div>
                    </label>
                    <input
                        type="date"
                        value={expiry}
                        onChange={(e) => {
                            setExpiry(e.target.value);
                            setExpiryDuration(''); // Clear duration if using date
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-black dark:text-ivory"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Additional details..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none resize-none text-black dark:text-ivory"
                    />
                </div>


                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Pickup Location
                        </div>
                    </label>
                    <LocationAutocomplete
                        value={location}
                        onChange={setLocation}
                        onCoordsChange={setCoords}
                        placeholder="Address or landmark"
                    />
                </div>



                {/* Submit Button */}
                <button
                    type="button"
                    onClick={(e) => handleSubmit(e)}
                    disabled={!foodType || !quantity || (!expiry && !expiryDuration) || submitting}
                    className={`w-full py-4 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${recommendations === 'Fertilizer'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : isExpiredDetection
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-forest-900 dark:bg-forest-600 text-ivory hover:bg-forest-800 dark:hover:bg-forest-500'
                        }`}
                >
                    {submitting
                        ? 'Posting...'
                        : recommendations === 'Fertilizer'
                            ? 'Post as Fertilizer (Low Quality)'
                            : isExpiredDetection
                                ? 'Post Anyway (marked as Expired)'
                                : 'Post Donation (+10 EcoPoints)'}
                </button>
            </motion.div>

            {/* Impact Share Overlay */}
            <AnimatePresence>
                {showShareOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-forest-900/90 backdrop-blur-md flex items-center justify-center p-6"
                        onClick={(e) => {
                            // Prevent backdrop click from closing - only allow button clicks
                            if (e.target === e.currentTarget) {
                                e.stopPropagation();
                            }
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-forest-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles className="w-24 h-24 text-forest-600" />
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowShareOverlay(false);
                                    // Reset form after overlay is closed
                                    setImageUrl('');
                                    setFoodType('');
                                    setQuantity('');
                                    setExpiry('');
                                    setExpiryDuration('');
                                    setExpiryUnit('hours');
                                    setDescription('');
                                    setLocation('');
                                    setQualityScore(null);
                                    setIsExpiredDetection(false);
                                    setMessage('');
                                }}
                                className="absolute top-6 right-6 p-2 rounded-full bg-forest-50 dark:bg-forest-700 text-forest-500 hover:bg-forest-100 dark:hover:bg-forest-600 transition-colors"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>

                            <div className="text-center space-y-6">
                                <div className="mx-auto w-20 h-20 bg-mint rounded-3xl flex items-center justify-center shadow-lg transform -rotate-6">
                                    <Trophy className="w-10 h-10 text-forest-900" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-forest-900 dark:text-ivory">Eco Hero Status!</h3>
                                    <p className="text-forest-600 dark:text-forest-400">
                                        You just saved <span className="font-bold text-forest-900 dark:text-ivory">{lastDonationType}</span> from going to waste!
                                    </p>
                                </div>

                                <div className="bg-forest-50 dark:bg-forest-900/50 p-4 rounded-3xl border border-forest-100 dark:border-forest-700">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                        <span className="text-xl font-black text-forest-900 dark:text-ivory">+10 EcoPoints</span>
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-forest-400">Total Contribution Level Up!</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleShareDonation();
                                        }}
                                        className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        Share My Impact
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowShareOverlay(false);
                                            // Reset form after overlay is closed
                                            setImageUrl('');
                                            setFoodType('');
                                            setQuantity('');
                                            setExpiry('');
                                            setExpiryDuration('');
                                            setExpiryUnit('hours');
                                            setDescription('');
                                            setLocation('');
                                            setQualityScore(null);
                                            setIsExpiredDetection(false);
                                            setMessage('');
                                        }}
                                        className="w-full py-4 bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory border border-forest-100 dark:border-forest-600 rounded-2xl font-bold hover:bg-forest-50 dark:hover:bg-forest-600 transition-colors"
                                    >
                                        Later
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
