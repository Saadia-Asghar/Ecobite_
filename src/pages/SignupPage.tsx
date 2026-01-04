import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Store, Heart, Dog, Leaf, ArrowRight, Mail, Lock, Building, MapPin, HandHeart, Utensils, Camera, Truck, CheckCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { API_URL } from '../config/api';

type UserRole = 'individual' | 'restaurant' | 'ngo' | 'shelter' | 'fertilizer';
type UserCategory = 'donor' | 'beneficiary';

export default function SignupPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [step, setStep] = useState<'category' | 'role' | 'details'>('category');
    const [userCategory, setUserCategory] = useState<UserCategory | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        organization: '',
        licenseId: '',
        location: ''
    });

    const roles = [
        {
            id: 'individual' as UserRole,
            name: 'Individual',
            icon: User,
            color: 'green',
            desc: 'Donate surplus food from home',
            category: 'donor',
            needsOrg: false
        },
        {
            id: 'restaurant' as UserRole,
            name: 'Restaurant',
            icon: Store,
            color: 'orange',
            desc: 'Manage business donations & track impact',
            category: 'donor',
            needsOrg: true
        },
        {
            id: 'ngo' as UserRole,
            name: 'NGO',
            icon: Heart,
            color: 'blue',
            desc: 'Receive food for community service',
            category: 'beneficiary',
            needsOrg: true
        },
        {
            id: 'shelter' as UserRole,
            name: 'Animal Shelter',
            icon: Dog,
            color: 'amber',
            desc: 'Get food for shelter animals',
            category: 'beneficiary',
            needsOrg: true
        },
        {
            id: 'fertilizer' as UserRole,
            name: 'Waste Management',
            icon: Leaf,
            color: 'green',
            desc: 'Process organic waste into compost',
            category: 'beneficiary',
            needsOrg: true
        }
    ];

    const selectedRoleData = roles.find(r => r.id === selectedRole);

    const handleSignup = async () => {
        setError('');

        // Comprehensive validation
        if (!formData.email || !formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Check for name or organization based on role
        if (selectedRoleData?.needsOrg) {
            if (!formData.organization || formData.organization.trim() === '') {
                setError('Organization name is required');
                return;
            }
        } else {
            if (!formData.name || formData.name.trim() === '') {
                setError('Full name is required');
                return;
            }
        }

        if (!formData.location || formData.location.trim() === '') {
            setError('Location is required');
            return;
        }

        setLoading(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                name: formData.name || formData.organization,
                role: selectedRole,
                category: userCategory,
                organization: formData.organization,
                licenseId: formData.licenseId,
                location: formData.location
            });
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please check your connection and try again.');
            console.error('Signup error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'category') {
        return (
            <div className="min-h-screen bg-ivory dark:bg-forest-900 p-4">
                <div className="max-w-4xl mx-auto pt-8">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-forest-900 dark:text-ivory mb-3">Join the Movement</h1>
                        <p className="text-lg text-forest-600 dark:text-forest-300">Choose your role in creating a hunger-free world.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-10">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => {
                                setUserCategory('donor');
                                setStep('role');
                            }}
                            className="relative p-8 rounded-3xl bg-white dark:bg-forest-800 border-2 border-forest-100 dark:border-forest-700 hover:border-forest-900 dark:hover:border-mint transition-all group text-left shadow-lg hover:shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-forest-100 dark:bg-forest-700 text-forest-700 dark:text-forest-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Verified Secure
                                </span>
                            </div>

                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-forest-100 to-forest-200 dark:from-forest-700 dark:to-forest-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                                    <HandHeart className="w-8 h-8 text-forest-900 dark:text-ivory" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-forest-900 dark:text-ivory mb-2">I want to Donate</h3>
                            <p className="text-forest-600 dark:text-forest-300 mb-6">
                                Turn surplus food into social impact. Ideal for:
                                <span className="block mt-1 text-sm font-semibold opacity-80">• Households • Restaurants • Events</span>
                            </p>

                            <div className="bg-forest-50 dark:bg-forest-900/50 p-4 rounded-xl border border-forest-100 dark:border-forest-700/50">
                                <span className="text-xs font-bold text-forest-500 uppercase tracking-wider mb-3 block">Simple 3-Step Process</span>
                                <div className="flex justify-between items-center text-center gap-2">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-forest-800 flex items-center justify-center shadow-sm">
                                            <Camera className="w-4 h-4 text-forest-600 dark:text-mint" />
                                        </div>
                                        <span className="text-[10px] font-bold text-forest-700 dark:text-forest-300">1. Snap</span>
                                    </div>
                                    <div className="h-px bg-forest-200 w-full"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-forest-800 flex items-center justify-center shadow-sm">
                                            <CheckCircle className="w-4 h-4 text-forest-600 dark:text-mint" />
                                        </div>
                                        <span className="text-[10px] font-bold text-forest-700 dark:text-forest-300">2. Match</span>
                                    </div>
                                    <div className="h-px bg-forest-200 w-full"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-forest-800 flex items-center justify-center shadow-sm">
                                            <Truck className="w-4 h-4 text-forest-600 dark:text-mint" />
                                        </div>
                                        <span className="text-[10px] font-bold text-forest-700 dark:text-forest-300">3. Pickup</span>
                                    </div>
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => {
                                setUserCategory('beneficiary');
                                setStep('role');
                            }}
                            className="relative p-8 rounded-3xl bg-white dark:bg-forest-800 border-2 border-forest-100 dark:border-forest-700 hover:border-forest-900 dark:hover:border-mint transition-all group text-left shadow-lg hover:shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" /> Vetted Only
                                </span>
                            </div>

                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-forest-700 dark:to-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                                    <Utensils className="w-8 h-8 text-forest-900 dark:text-ivory" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-forest-900 dark:text-ivory mb-2">I want to Receive</h3>
                            <p className="text-forest-600 dark:text-forest-300 mb-6">
                                Get reliable food support for your community. Ideal for:
                                <span className="block mt-1 text-sm font-semibold opacity-80">• NGOs • Shelters • Charities</span>
                            </p>

                            <div className="bg-forest-50 dark:bg-forest-900/50 p-4 rounded-xl border border-forest-100 dark:border-forest-700/50">
                                <span className="text-xs font-bold text-forest-500 uppercase tracking-wider mb-3 block">Simple 3-Step Process</span>
                                <div className="flex justify-between items-center text-center gap-2">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-forest-800 flex items-center justify-center shadow-sm">
                                            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-[10px] font-bold text-forest-700 dark:text-forest-300">1. Verify</span>
                                    </div>
                                    <div className="h-px bg-forest-200 w-full"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-forest-800 flex items-center justify-center shadow-sm">
                                            <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-[10px] font-bold text-forest-700 dark:text-forest-300">2. Browse</span>
                                    </div>
                                    <div className="h-px bg-forest-200 w-full"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-forest-800 flex items-center justify-center shadow-sm">
                                            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-[10px] font-bold text-forest-700 dark:text-forest-300">3. Receive</span>
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="bg-white dark:bg-forest-800 rounded-3xl p-4 sm:p-8 shadow-xl border border-forest-100 dark:border-forest-700">
                        <div className="flex flex-col gap-6 text-center">
                            <div>
                                <h4 className="font-bold text-lg sm:text-xl text-forest-900 dark:text-ivory mb-2">Built on Trust & Transparency</h4>
                                <p className="text-xs sm:text-sm text-forest-600 dark:text-forest-400 max-w-md mx-auto">
                                    EcoBite ensures every donation is verified for quality and every beneficiary is vetted for authenticity.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                                <div className="text-center min-w-[80px]">
                                    <div className="font-bold text-2xl sm:text-3xl text-green-600 mb-1">10k+</div>
                                    <div className="text-[10px] sm:text-xs font-bold text-forest-500 uppercase tracking-wider whitespace-nowrap">Meals Saved</div>
                                </div>
                                <div className="w-px h-12 bg-forest-200 dark:bg-forest-700"></div>
                                <div className="text-center min-w-[80px]">
                                    <div className="font-bold text-2xl sm:text-3xl text-blue-600 mb-1">500+</div>
                                    <div className="text-[10px] sm:text-xs font-bold text-forest-500 uppercase tracking-wider whitespace-nowrap">Partners</div>
                                </div>
                                <div className="w-px h-12 bg-forest-200 dark:bg-forest-700"></div>
                                <div className="text-center min-w-[80px]">
                                    <div className="font-bold text-2xl sm:text-3xl text-amber-500 mb-1">100%</div>
                                    <div className="text-[10px] sm:text-xs font-bold text-forest-500 uppercase tracking-wider whitespace-nowrap">Non-Profit</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-sm text-forest-600 dark:text-forest-300 mt-8">
                        Already have an account?{' '}
                        <button onClick={() => navigate('/login')} className="text-forest-900 dark:text-ivory font-bold hover:underline">
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'role') {
        const filteredRoles = roles.filter(r => r.category === userCategory);

        return (
            <div className="min-h-screen bg-ivory dark:bg-forest-900 p-4">
                <div className="max-w-2xl mx-auto pt-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <button
                            onClick={() => setStep('category')}
                            className="mb-4 text-sm text-forest-500 hover:text-forest-900 dark:hover:text-ivory underline"
                        >
                            ← Back to Type Selection
                        </button>
                        <h1 className="text-3xl font-bold text-forest-900 dark:text-ivory mb-2">Choose Your Role</h1>
                        <p className="text-forest-600 dark:text-forest-300">Select how you'll use EcoBite as a {userCategory}</p>
                    </div>

                    {/* Role Cards */}
                    <div className="space-y-4 mb-6">
                        {filteredRoles.map((role, index) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;

                            return (
                                <motion.button
                                    key={role.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${isSelected
                                        ? 'border-forest-900 dark:border-mint bg-forest-50 dark:bg-forest-800 shadow-lg'
                                        : 'border-forest-100 dark:border-forest-700 bg-white dark:bg-forest-800 hover:border-forest-300 dark:hover:border-forest-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-xl ${isSelected ? 'bg-forest-900 dark:bg-mint' : 'bg-forest-100 dark:bg-forest-700'
                                            }`}>
                                            <Icon className={`w-8 h-8 ${isSelected ? 'text-mint dark:text-forest-900' : 'text-forest-700 dark:text-forest-300'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-forest-900 dark:text-ivory">{role.name}</h3>
                                            <p className="text-sm text-forest-600 dark:text-forest-300">{role.desc}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-6 h-6 rounded-full bg-forest-900 dark:bg-mint flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white dark:text-forest-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={() => selectedRole && setStep('details')}
                        disabled={!selectedRole}
                        className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // Details Step
    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-900 p-4">
            <div className="max-w-md mx-auto pt-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => setStep('role')}
                        className="mb-4 text-sm text-forest-500 hover:text-forest-900 dark:hover:text-ivory underline"
                    >
                        ← Back to Roles
                    </button>
                    <div className="w-16 h-16 mx-auto bg-forest-900 rounded-2xl flex items-center justify-center mb-4">
                        {selectedRoleData && <selectedRoleData.icon className="w-8 h-8 text-mint" />}
                    </div>
                    <h1 className="text-3xl font-bold text-forest-900 dark:text-ivory mb-2">Create Account</h1>
                    <p className="text-forest-600 dark:text-forest-300">{selectedRoleData?.name}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 shadow-lg space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name *
                            </div>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email *
                            </div>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Password *
                            </div>
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                            required
                        />
                    </div>

                    {selectedRoleData?.needsOrg && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        Organization Name *
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    placeholder="Green Cafe"
                                    className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                    License/Registration ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.licenseId}
                                    onChange={(e) => setFormData({ ...formData, licenseId: e.target.value })}
                                    placeholder="NGO-12345"
                                    className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Location *
                            </div>
                        </label>
                        <LocationAutocomplete
                            value={formData.location}
                            onChange={(value) => setFormData({ ...formData, location: value })}
                            placeholder="e.g., House No.92-D, Street No.54, Sector G-6/4, Islamabad"
                            required
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleSignup}
                        disabled={loading}
                        className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-forest-200 dark:border-forest-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-ivory dark:bg-forest-900 text-forest-500 dark:text-forest-400">Or sign up with</span>
                        </div>
                    </div>

                    {/* Microsoft OAuth Button */}
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                const response = await fetch(`${API_URL}/api/auth/microsoft/url`);
                                if (response.ok) {
                                    const { url } = await response.json();
                                    window.location.href = url;
                                } else {
                                    const text = await response.text();
                                    let errorMsg = response.statusText;
                                    try {
                                        const errorData = JSON.parse(text);
                                        errorMsg = errorData.message || errorData.error || errorMsg;
                                    } catch (e) {
                                        errorMsg = text || errorMsg;
                                    }
                                    alert(`Failed to get Microsoft login URL (Status ${response.status}): ${errorMsg}`);
                                }
                            } catch (error) {
                                console.error('Microsoft signup error:', error);
                                alert('An error occurred during Microsoft signup');
                            }
                        }}
                        className="w-full py-4 bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-50 dark:hover:bg-forest-600 transition-all border-2 border-forest-200 dark:border-forest-600 flex items-center justify-center gap-3 shadow-md"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                            <path d="M11 0H0V11H11V0Z" fill="#F25022" />
                            <path d="M23 0H12V11H23V0Z" fill="#7FBA00" />
                            <path d="M11 12H0V23H11V12Z" fill="#00A4EF" />
                            <path d="M23 12H12V23H23V12Z" fill="#FFB900" />
                        </svg>
                        Continue with Microsoft
                    </button>

                </div>
            </div>
        </div>
    );
}
