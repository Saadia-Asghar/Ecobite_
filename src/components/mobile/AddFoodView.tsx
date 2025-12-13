import { useState, useEffect } from 'react';
import { Camera, Upload, MapPin, Calendar, Package, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../ImageUpload';
import LocationAutocomplete from '../LocationAutocomplete';
import { API_URL } from '../../config/api';

interface AddFoodProps {
    userRole: string;
}

export default function AddFoodView({ userRole }: AddFoodProps) {
    const { user } = useAuth();
    const [imageUrl, setImageUrl] = useState('');
    const [foodType, setFoodType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expiry, setExpiry] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');

    const [analyzing, setAnalyzing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [myRequests, setMyRequests] = useState<any[]>([]);

    // Expiry duration state
    const [expiryDuration, setExpiryDuration] = useState('');
    const [expiryUnit, setExpiryUnit] = useState<'minutes' | 'hours' | 'days'>('hours');

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

        try {
            const response = await fetch(`${API_URL}/api/donations/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl })
            });

            if (response.ok) {
                const data = await response.json();
                setFoodType(data.foodType || '');
                setDescription(data.description || '');
                setMessage('✅ Image analyzed successfully!');
            } else {
                setMessage('❌ Analysis failed. Please try again.');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            setMessage('❌ Could not connect to server');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
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

            finalExpiry = now.toISOString().split('T')[0];
        }

        const donation = {
            donorId: user?.id || 'anonymous',
            status: 'available',
            expiry: finalExpiry,
            aiFoodType: foodType,
            aiQualityScore: 85,
            imageUrl,
            description,
            quantity
        };

        try {
            const response = await fetch(`${API_URL}/api/donations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donation)
            });

            if (response.ok) {
                setMessage('✅ Donation posted successfully!');
                // Reset form
                setImageUrl('');
                setFoodType('');
                setQuantity('');
                setExpiry('');
                setExpiryDuration('');
                setExpiryUnit('hours');
                setDescription('');
                setLocation('');

                // Add EcoPoints
                if (user?.id) {
                    await fetch(`${API_URL}/api/users/${user.id}/points`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ points: 10 })
                    });
                }
            } else {
                setMessage('❌ Failed to post donation');
            }
        } catch (error) {
            console.error('Failed to post donation:', error);
            setMessage('❌ Could not connect to server');
        } finally {
            setSubmitting(false);
        }
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
                        onClick={async () => {
                            setSubmitting(true);
                            try {
                                const response = await fetch(`${API_URL}/api/requests/food`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        requesterId: user?.id,
                                        foodType,
                                        quantity
                                    })
                                });

                                if (response.ok) {
                                    setMessage('✅ Request created with AI drafts!');
                                    setFoodType('');
                                    setQuantity('');
                                    fetchRequests(); // Refresh list
                                } else {
                                    setMessage('❌ Failed to create request');
                                }
                            } catch (error) {
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
                    <ImageUpload
                        onImageSelected={(_file, url) => setImageUrl(url)}
                        currentUrl={imageUrl}
                    />
                    {imageUrl && (
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="w-full mt-3 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            {analyzing ? 'Analyzing with AI...' : 'Analyze Image with AI'}
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
                        placeholder="Address or landmark"
                    />
                </div>



                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!foodType || !quantity || (!expiry && !expiryDuration) || submitting}
                    className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Posting...' : 'Post Donation (+10 EcoPoints)'}
                </button>
            </motion.div>
        </div>
    );
}
