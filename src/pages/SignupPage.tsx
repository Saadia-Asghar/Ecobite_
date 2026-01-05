import { useState, useEffect } from 'react';

import { motion } from 'framer-motion';
import { User, Store, Heart, Dog, Leaf, ArrowRight, Mail, Lock, Building, MapPin, HandHeart, Utensils, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { API_URL } from '../config/api';

type UserRole = 'individual' | 'restaurant' | 'ngo' | 'shelter' | 'fertilizer';
type UserCategory = 'donor' | 'beneficiary';

const ROLES_CONFIG = [
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

export default function SignupPage() {
    const { register, completeProfile } = useAuth();
    const [step, setStep] = useState<'category' | 'role' | 'details'>('category');
    const [userCategory, setUserCategory] = useState<UserCategory | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMicrosoft, setIsMicrosoft] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        organization: '',
        licenseId: '',
        location: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const email = params.get('email');
        const name = params.get('name');
        const ms = params.get('microsoft');
        const role = params.get('role') as UserRole;

        if (ms === 'true') {
            setIsMicrosoft(true);
            setFormData(prev => ({
                ...prev,
                email: email || '',
                name: name || '',
                password: 'microsoft-auth'
            }));

            if (role) {
                const r = ROLES_CONFIG.find(rem => rem.id === role);
                if (r) {
                    setSelectedRole(role);
                    setUserCategory(r.category as UserCategory);
                    setStep('details');
                } else {
                    setStep('category');
                }
            } else {
                setStep('category');
            }
        }
    }, []);

    const selectedRoleData = ROLES_CONFIG.find(r => r.id === selectedRole);

    const handleSignup = async () => {
        setError('');

        if (!formData.email || !formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        if (!isMicrosoft && (!formData.password || formData.password.length < 6)) {
            setError('Password must be at least 6 characters');
            return;
        }

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
            const signupData = {
                email: formData.email,
                password: formData.password,
                name: formData.name || formData.organization,
                role: selectedRole,
                category: userCategory,
                organization: formData.organization,
                licenseId: formData.licenseId,
                location: formData.location
            };

            if (isMicrosoft) {
                await completeProfile(signupData);
            } else {
                await register(signupData);
            }
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please check your connection and try again.');
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

                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => {
                                setUserCategory('donor');
                                setStep('role');
                            }}
                            className="relative p-8 rounded-3xl bg-white dark:bg-forest-800 border-2 border-forest-100 dark:border-forest-700 hover:border-forest-900 dark:hover:border-mint transition-all group text-left shadow-lg hover:shadow-2xl overflow-hidden flex flex-col h-full"
                        >
                            <div className="relative z-10 flex-1">
                                <div className="w-16 h-16 bg-forest-900 dark:bg-forest-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Utensils className="w-8 h-8 text-mint" />
                                </div>
                                <h3 className="text-2xl font-bold text-forest-900 dark:text-ivory mb-2">I want to Give</h3>
                                <p className="text-forest-600 dark:text-forest-400 mb-6 font-medium">Share excess food with those in need</p>

                                <div className="space-y-3 pt-4 border-t border-forest-50 dark:border-forest-700">
                                    <div className="flex items-start gap-2 text-sm text-forest-500 dark:text-forest-400">
                                        <div className="w-1.5 h-1.5 bg-mint rounded-full mt-1.5 shrink-0" />
                                        <p>List surplus items in seconds</p>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-forest-500 dark:text-forest-400">
                                        <div className="w-1.5 h-1.5 bg-mint rounded-full mt-1.5 shrink-0" />
                                        <p>Get AI quality certification</p>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-forest-500 dark:text-forest-400">
                                        <div className="w-1.5 h-1.5 bg-mint rounded-full mt-1.5 shrink-0" />
                                        <p>Track your CO2 & waste impact</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex items-center text-forest-900 dark:text-mint font-bold text-sm">
                                Start Giving <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => {
                                setUserCategory('beneficiary');
                                setStep('role');
                            }}
                            className="relative p-8 rounded-3xl bg-white dark:bg-forest-800 border-2 border-forest-100 dark:border-forest-700 hover:border-forest-900 dark:hover:border-mint transition-all group text-left shadow-lg hover:shadow-2xl overflow-hidden flex flex-col h-full"
                        >
                            <div className="relative z-10 flex-1">
                                <div className="w-16 h-16 bg-mint rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <HandHeart className="w-8 h-8 text-forest-900" />
                                </div>
                                <h3 className="text-2xl font-bold text-forest-900 dark:text-ivory mb-2">I want to Receive</h3>
                                <p className="text-forest-600 dark:text-forest-400 mb-6 font-medium">Get food support for your community</p>

                                <div className="space-y-3 pt-4 border-t border-forest-50 dark:border-forest-700">
                                    <div className="flex items-start gap-2 text-sm text-forest-500 dark:text-forest-400">
                                        <div className="w-1.5 h-1.5 bg-forest-900 rounded-full mt-1.5 shrink-0" />
                                        <p>Browse live donations map</p>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-forest-500 dark:text-forest-400">
                                        <div className="w-1.5 h-1.5 bg-forest-900 rounded-full mt-1.5 shrink-0" />
                                        <p>Claim food for NGOs & shelters</p>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-forest-500 dark:text-forest-400">
                                        <div className="w-1.5 h-1.5 bg-forest-900 rounded-full mt-1.5 shrink-0" />
                                        <p>Request logistics & funding</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex items-center text-forest-900 dark:text-ivory font-bold text-sm">
                                Explore Feed <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>
                    </div>

                    <p className="text-center text-forest-500 dark:text-forest-400 mt-10 text-sm font-medium">
                        Already have an account? <a href="/login" className="text-forest-900 dark:text-mint underline">Login here</a>
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'role') {
        const filteredRoles = ROLES_CONFIG.filter(r => r.category === userCategory);

        return (
            <div className="min-h-screen bg-ivory dark:bg-forest-900 p-4">
                <div className="max-w-2xl mx-auto pt-8">
                    <button
                        onClick={() => setStep('category')}
                        className="mb-8 text-sm text-forest-500 hover:text-forest-900 dark:hover:text-ivory underline"
                    >
                        ← Back to Categories
                    </button>

                    <h1 className="text-3xl font-bold text-forest-900 dark:text-ivory mb-8">What describes you best?</h1>

                    <div className="space-y-4 mb-8">
                        {filteredRoles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-6 ${selectedRole === role.id
                                    ? 'bg-forest-900 border-forest-900 text-ivory'
                                    : 'bg-white dark:bg-forest-800 border-forest-100 dark:border-forest-700 hover:border-forest-300'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole === role.id ? 'bg-mint text-forest-900' : 'bg-forest-50 dark:bg-forest-700 text-forest-600'
                                    }`}>
                                    <role.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{role.name}</h3>
                                    <p className={selectedRole === role.id ? 'text-forest-200' : 'text-forest-500 dark:text-forest-400'}>
                                        {role.desc}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => selectedRole && setStep('details')}
                        disabled={!selectedRole}
                        className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                    >
                        Continue with Email
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-forest-200 dark:border-forest-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-ivory dark:bg-forest-900 text-forest-500 dark:text-forest-400">Or use identity provider</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={!selectedRole}
                        onClick={async () => {
                            if (!selectedRole) return;
                            try {
                                const response = await fetch(`${API_URL}/api/auth/microsoft/url?type=${selectedRole}`);
                                if (response.ok) {
                                    const { url } = await response.json();
                                    window.location.href = url;
                                }
                            } catch (e) {
                                alert('Failed to start Microsoft login');
                            }
                        }}
                        className={`w-full py-4 bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold transition-all border-2 border-forest-200 dark:border-forest-600 flex items-center justify-center gap-3 shadow-md ${!selectedRole ? 'opacity-50 cursor-not-allowed' : 'hover:bg-forest-50 dark:hover:bg-forest-600'}`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                            <path d="M11 0H0V11H11V0Z" fill="#F25022" />
                            <path d="M23 0H12V11H23V0Z" fill="#7FBA00" />
                            <path d="M11 12H0V23H11V12Z" fill="#00A4EF" />
                            <path d="M23 12H12V23H23V12Z" fill="#FFB900" />
                        </svg>
                        Continue with Microsoft
                    </button>
                    {!selectedRole && <p className="text-center text-xs text-forest-400 mt-2">Please select a role first</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-900 p-4">
            <div className="max-w-md mx-auto pt-8">
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
                    <h1 className="text-3xl font-bold text-forest-900 dark:text-ivory mb-2">
                        {isMicrosoft ? 'Complete Profile' : 'Create Account'}
                    </h1>
                    <p className="text-forest-600 dark:text-forest-300">{selectedRoleData?.name}</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 shadow-lg space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {isMicrosoft ? 'Verified Name' : 'Full Name *'}
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

                    {!isMicrosoft && (
                        <>
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
                        </>
                    )}

                    {isMicrosoft && (
                        <div className="p-4 bg-mint/10 border border-mint/20 rounded-xl flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-forest-600" />
                            <div>
                                <p className="text-sm font-bold text-forest-900">Microsoft Account Linked</p>
                                <p className="text-xs text-forest-600">{formData.email}</p>
                            </div>
                        </div>
                    )}

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
                            placeholder="e.g., house/sector, city"
                            required
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSignup}
                        disabled={loading}
                        className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all shadow-lg disabled:opacity-50"
                    >
                        {loading ? (isMicrosoft ? 'Updating...' : 'Creating...') : 'Finish Signup'}
                    </button>
                </div>
            </div>
        </div>
    );
}
