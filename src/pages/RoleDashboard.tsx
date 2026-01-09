import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Store, Heart, Dog, Leaf, LogOut, Home, PlusCircle, Settings, DollarSign, MapPin, Shield, Gift, Moon, Sun, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import IndividualDashboard from '../components/roles/IndividualDashboard';
import RestaurantDashboard from '../components/roles/RestaurantDashboard';
import NGODashboard from '../components/roles/NGODashboard';
import AnimalShelterDashboard from '../components/roles/AnimalShelterDashboard';
import FertilizerDashboard from '../components/roles/FertilizerDashboard';
import AdminDashboard from '../components/roles/AdminDashboard';
import AddFoodView from '../components/mobile/AddFoodView';
import StatsView from '../components/mobile/StatsView';
import ProfileView from '../components/mobile/ProfileView';
import FinanceView from '../components/mobile/FinanceView';
import NearbyNGOsView from '../components/mobile/NearbyNGOsView';
import DonationsList from '../components/dashboard/DonationsList';

type UserRole = 'individual' | 'restaurant' | 'ngo' | 'shelter' | 'fertilizer' | 'admin';

export default function RoleDashboard() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, logout, isAuthenticated, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const activeTab = (searchParams.get('tab') as 'home' | 'add' | 'stats' | 'finance' | 'nearby' | 'profile' | 'donations') || 'home';

    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
    };

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/welcome');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (user.role === 'admin') {
        return <AdminDashboard />;
    }

    const roles = {
        individual: { name: 'Individual', icon: User, color: 'green' },
        restaurant: { name: 'Restaurant', icon: Store, color: 'orange' },
        ngo: { name: 'NGO', icon: Heart, color: 'blue' },
        shelter: { name: 'Animal Shelter', icon: Dog, color: 'amber' },
        fertilizer: { name: 'Waste Management', icon: Leaf, color: 'green' },
        admin: { name: 'Admin', icon: Shield, color: 'purple' }
    };

    const currentRole = roles[user.role as UserRole] || roles.individual;
    const RoleIcon = currentRole.icon;

    const renderDashboard = () => {
        switch (activeTab) {
            case 'home':
                switch (user.role) {
                    case 'individual':
                        return <IndividualDashboard onNavigate={setActiveTab} />;
                    case 'restaurant':
                        return <RestaurantDashboard onNavigate={setActiveTab} />;
                    case 'ngo':
                        return <NGODashboard onNavigate={setActiveTab} />;
                    case 'shelter':
                        return <AnimalShelterDashboard onNavigate={setActiveTab} />;
                    case 'fertilizer':
                        return <FertilizerDashboard onNavigate={setActiveTab} />;
                    default:
                        return <IndividualDashboard onNavigate={setActiveTab} />;
                }
            case 'add':
                // Fertilizer role should not have access to add donations (they only collect)
                if (user.role === 'fertilizer') {
                    return (
                        <div className="text-center py-12">
                            <p className="text-forest-600 dark:text-forest-400">Waste Management partners collect donations, not create them.</p>
                        </div>
                    );
                }
                return <AddFoodView userRole={user.role} />;
            case 'stats':
                return <StatsView />;
            case 'finance':
                return <FinanceView userRole={user.role} />;
            case 'nearby':
                const nearbyMode = ['ngo', 'shelter', 'fertilizer'].includes(user.role) ? 'donations' : 'ngos';
                return <NearbyNGOsView mode={nearbyMode} userRole={user.role} />;
            case 'donations':
                return <DonationsList />;
            case 'profile':
                return <ProfileView />;
            default:
                return <IndividualDashboard />;
        }
    };

    const isProfileIncomplete = user.role !== 'individual' && user.role !== 'admin' && (!user.organization || !user.licenseId);

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-950 pb-20">
            {/* Profile Completion Warning */}
            {isProfileIncomplete && (
                <div className="bg-amber-100 border-b border-amber-200 p-3 flex items-center justify-between text-amber-800">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        Please complete your organization profile (Name & License ID)
                    </div>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className="text-xs font-bold bg-amber-200 px-3 py-1 rounded-lg hover:bg-amber-300 transition-colors"
                    >
                        Complete Now
                    </button>
                </div>
            )}
            {/* Mobile-Optimized Header */}
            <div className="sticky top-0 z-50 bg-forest-900 dark:bg-forest-950 text-ivory p-4 shadow-lg">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-mint dark:bg-forest-800 rounded-xl flex items-center justify-center">
                            <RoleIcon className="w-6 h-6 text-forest-900 dark:text-mint" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">{user.name || user.organization}</h1>
                            <p className="text-xs text-forest-300 dark:text-forest-400">{currentRole.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-forest-800 dark:hover:bg-forest-900 rounded-xl transition-colors"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={logout}
                            className="p-2 hover:bg-forest-800 dark:hover:bg-forest-900 rounded-xl transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-2xl mx-auto p-4 pb-24">
                {renderDashboard()}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-forest-800 border-t border-forest-200 dark:border-forest-700 shadow-lg z-50">
                <div className="max-w-2xl mx-auto flex justify-around items-center p-2">
                    <button
                        onClick={() => setActiveTab('home')}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors flex-1 ${activeTab === 'home' ? 'text-forest-900 dark:text-ivory' : 'text-forest-500 dark:text-forest-400'
                            }`}
                    >
                        <Home className="w-5 h-5" />
                        <span className="text-xs font-medium">Home</span>
                    </button>
                    {/* Add tab - hidden for fertilizer role (they only collect, not donate) */}
                    {user.role !== 'fertilizer' && (
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex flex-col items-center gap-1 p-2 transition-colors flex-1 ${activeTab === 'add' ? 'text-forest-900 dark:text-ivory' : 'text-forest-500 dark:text-forest-400'
                                }`}
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span className="text-xs font-medium">Add</span>
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('donations')}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors flex-1 ${activeTab === 'donations' ? 'text-forest-900 dark:text-ivory' : 'text-forest-500 dark:text-forest-400'
                            }`}
                    >
                        <Package className="w-5 h-5" />
                        <span className="text-xs font-medium">Donations</span>
                    </button>
                    {/* Finance tab - hidden for restaurants */}
                    {user.role !== 'restaurant' && (
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`flex flex-col items-center gap-1 p-2 transition-colors flex-1 ${activeTab === 'finance' ? 'text-forest-900 dark:text-ivory' : 'text-forest-500 dark:text-forest-400'
                                }`}
                        >
                            <DollarSign className="w-5 h-5" />
                            <span className="text-xs font-medium">Finance</span>
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('nearby')}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors flex-1 ${activeTab === 'nearby' ? 'text-forest-900 dark:text-ivory' : 'text-forest-500 dark:text-forest-400'
                            }`}
                    >
                        {['ngo', 'shelter', 'fertilizer'].includes(user.role) ? (
                            <Gift className="w-5 h-5" />
                        ) : (
                            <MapPin className="w-5 h-5" />
                        )}
                        <span className="text-xs font-medium">
                            {['ngo', 'shelter', 'fertilizer'].includes(user.role) ? 'Live' : 'NGOs'}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors flex-1 ${activeTab === 'profile' ? 'text-forest-900 dark:text-ivory' : 'text-forest-500 dark:text-forest-400'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-xs font-medium">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
