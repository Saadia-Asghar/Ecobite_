import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Store, Heart, Dog, Leaf, ArrowRight, Mail, Lock, Building, MapPin, HandHeart, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LocationAutocomplete from '../components/LocationAutocomplete';

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
            desc: 'Manage business donations & vouchers',
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
                <div className="max-w-2xl mx-auto pt-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-forest-900 dark:text-ivory mb-2">Welcome to EcoBite</h1>
                        <p className="text-forest-600 dark:text-forest-300">How would you like to contribute?</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => {
                                setUserCategory('donor');
                                setStep('role');
                            }}
                            className="relative p-8 rounded-2xl bg-white dark:bg-forest-800 border-2 border-forest-100 dark:border-forest-700 hover:border-forest-900 dark:hover:border-mint transition-all group text-left shadow-md hover:shadow-xl"
                        >
                            <div className="absolute top-4 right-4 bg-forest-100 dark:bg-forest-700 text-xs px-2 py-1 rounded-full font-bold text-forest-700 dark:text-forest-300 group-hover:bg-forest-900 group-hover:text-white dark:group-hover:bg-mint dark:group-hover:text-forest-900 transition-colors">
                                Give Food
                            </div>
                            <div className="w-16 h-16 bg-forest-100 dark:bg-forest-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <HandHeart className="w-8 h-8 text-forest-900 dark:text-ivory group-hover:text-forest-700 dark:group-hover:text-mint" />
                            </div>
                            <h3 className="text-xl font-bold text-forest-900 dark:text-ivory mb-2">I want to Donate</h3>
                            <p className="text-forest-600 dark:text-forest-300 text-sm mb-4">
                                Share surplus food, reduce waste, and help your community.
                            </p>
                            <div className="bg-forest-50 dark:bg-forest-900/50 p-3 rounded-lg text-xs text-forest-700 dark:text-forest-400">
                                <span className="font-bold block mb-1">How it works:</span>
                                1. Post food details<br />
                                2. Beneficiaries claim it<br />
                                3. Food is picked up
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
                            className="relative p-8 rounded-2xl bg-white dark:bg-forest-800 border-2 border-forest-100 dark:border-forest-700 hover:border-forest-900 dark:hover:border-mint transition-all group text-left shadow-md hover:shadow-xl"
                        >
                            <div className="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900/30 text-xs px-2 py-1 rounded-full font-bold text-blue-700 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                Receive Food
                            </div>
                            <div className="w-16 h-16 bg-forest-100 dark:bg-forest-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Utensils className="w-8 h-8 text-forest-900 dark:text-ivory group-hover:text-blue-600 dark:group-hover:text-blue-300" />
                            </div>
                            <h3 className="text-xl font-bold text-forest-900 dark:text-ivory mb-2">I want to Receive</h3>
                            <p className="text-forest-600 dark:text-forest-300 text-sm mb-4">
                                Connect with donors to receive food support for your cause.
                            </p>
                            <div className="bg-forest-50 dark:bg-forest-900/50 p-3 rounded-lg text-xs text-forest-700 dark:text-forest-400">
                                <span className="font-bold block mb-1">How it works:</span>
                                1. Browse nearby donations<br />
                                2. Claim available items<br />
                                3. Coordinate pickup
                            </div>
                        </motion.button>
                    </div>

                    <div className="bg-forest-50 dark:bg-forest-900/30 rounded-2xl p-6 text-center shadow-inner">
                        <h4 className="font-bold text-forest-900 dark:text-ivory mb-2">Why Join EcoBite?</h4>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                                <div className="font-bold text-2xl text-green-600 mb-1">10k+</div>
                                <div className="text-forest-600 dark:text-forest-400">Meals Saved</div>
                            </div>
                            <div>
                                <div className="font-bold text-2xl text-blue-600 mb-1">500+</div>
                                <div className="text-forest-600 dark:text-forest-400">Active Partners</div>
                            </div>
                            <div>
                                <div className="font-bold text-2xl text-amber-600 mb-1">0%</div>
                                <div className="text-forest-600 dark:text-forest-400">Platform Fees</div>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-sm text-forest-600 dark:text-forest-300">
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
                        onClick={() => alert('Microsoft OAuth integration coming soon! For now, use email/password signup.')}
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
