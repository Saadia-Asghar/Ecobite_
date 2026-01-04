import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Award, Settings, LogOut, HandHeart, List, BarChart3, Map, Menu, X } from 'lucide-react';
import DonationForm from '../components/dashboard/DonationForm';
import RequestForm from '../components/dashboard/RequestForm';
import DonationsList from '../components/dashboard/DonationsList';
import HistoryView from '../components/dashboard/HistoryView';
import RewardsView from '../components/dashboard/RewardsView';
import SettingsView from '../components/dashboard/SettingsView';
import AnalyticsView from '../components/dashboard/AnalyticsView';
import MapView from '../components/dashboard/MapView';
import PromotionalBanner from '../components/PromotionalBanner';
import { mockBanners } from '../data/mockData';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const DashboardHome = () => {
    const { user } = useAuth();
    const [impactStory, setImpactStory] = useState<string>('');
    const [welcomeMessage, setWelcomeMessage] = useState<string>('');
    const [ecoQuote, setEcoQuote] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Impact Story
                const stats = { donations: 12, peopleFed: 45, co2Saved: 128 };
                const storyRes = await fetch(`${API_URL}/api/donations/impact-story`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stats })
                });

                // Fetch Personalized Welcome
                const welcomeRes = await fetch(`${API_URL}/api/ai/welcome`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ name: user?.name, role: user?.role })
                });

                // Fetch Eco Quote
                const quoteRes = await fetch(`${API_URL}/api/ai/eco-quote`);

                const storyData = await storyRes.json();
                const welcomeData = await welcomeRes.json();
                const quoteData = await quoteRes.json();

                setImpactStory(storyData.story);
                setWelcomeMessage(welcomeData.message || `Welcome back, ${user?.name}!`);
                setEcoQuote(quoteData.quote);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                setImpactStory("You are making a difference!");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-forest-900 dark:text-ivory">
                    {welcomeMessage || `Welcome back, ${user?.name}!`}
                </h1>
                {ecoQuote && (
                    <p className="text-forest-600 dark:text-forest-400 mt-2 italic flex items-center gap-2">
                        <span className="text-forest-400">"</span>
                        {ecoQuote}
                        <span className="text-forest-400">"</span>
                    </p>
                )}
            </div>

            {/* AI Impact Story Card */}
            <div className="bg-gradient-to-r from-forest-900 to-forest-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-lg mb-6 md:mb-8 text-ivory relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-mint/20 rounded-lg">
                            <Award className="w-5 h-5 text-mint" />
                        </div>
                        <h3 className="text-mint font-bold uppercase tracking-wider text-xs md:text-sm">Weekly Impact Insights</h3>
                    </div>
                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-6 animate-pulse bg-white/10 rounded-lg w-3/4"></div>
                            <div className="h-6 animate-pulse bg-white/10 rounded-lg w-1/2"></div>
                        </div>
                    ) : (
                        <p className="text-lg md:text-xl lg:text-2xl font-serif leading-relaxed italic">
                            "{impactStory}"
                        </p>
                    )}
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-mint/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-mint/10 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-forest-400/10 rounded-full -ml-8 -mb-8 blur-2xl"></div>
            </div>

            {/* Sponsor Banners */}
            <div className="mb-8">
                {mockBanners
                    .filter(b => b.active && (b.placement === 'dashboard' || !b.placement))
                    .map(banner => (
                        <PromotionalBanner key={banner.id} banner={banner} />
                    ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {[
                    { label: 'Total Impact', value: '128 kg', sub: 'CO2 Saved', icon: BarChart3 },
                    { label: 'Meals Shared', value: '45', sub: 'People Fed', icon: HandHeart },
                    { label: 'EcoPoints', value: '1,250', sub: 'Redeemable', icon: Award },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-forest-800 p-6 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-forest-500 dark:text-forest-400 text-sm font-medium uppercase tracking-wider">{stat.label}</h3>
                            <stat.icon className="w-5 h-5 text-forest-300 dark:text-forest-500" />
                        </div>
                        <p className="text-3xl font-bold text-forest-900 dark:text-ivory">{stat.value}</p>
                        <p className="text-sm text-mint-600 dark:text-forest-400 mt-1 font-medium">{stat.sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: PlusCircle, label: 'Donate Food', path: '/dashboard/donate' },
        { icon: List, label: 'Browse Donations', path: '/dashboard/browse' },
        { icon: HandHeart, label: 'Request Food', path: '/dashboard/request' },
        { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
        { icon: Map, label: 'Map', path: '/dashboard/map' },
        { icon: History, label: 'History', path: '/dashboard/history' },
        { icon: Award, label: 'Rewards', path: '/dashboard/rewards' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-ivory">
            {/* Mobile Header with Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-forest-900 text-ivory z-40 px-4 py-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 hover:bg-forest-800 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                    <h2 className="text-xl font-bold">EcoBite</h2>
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Responsive */}
            <div className={`
                fixed h-full bg-forest-900 text-ivory z-50 transition-transform duration-300 ease-in-out
                w-64 md:w-64
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                flex flex-col
            `}>
                <div className="p-6 hidden md:block">
                    <h2 className="text-2xl font-bold tracking-tight">EcoBite</h2>
                    <p className="text-forest-300 text-sm mt-1">Food Waste Platform</p>
                </div>

                {/* Mobile Header inside Sidebar */}
                <div className="p-6 md:hidden border-b border-forest-800">
                    <h2 className="text-2xl font-bold tracking-tight">EcoBite</h2>
                    <p className="text-forest-300 text-sm mt-1">Food Waste Platform</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all min-h-[44px] ${isActive
                                    ? 'bg-mint text-forest-900 font-medium shadow-lg'
                                    : 'text-forest-200 hover:bg-forest-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className="text-base">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-forest-800">
                    <button
                        onClick={() => {
                            logout();
                            navigate('/welcome');
                        }}
                        className="flex items-center gap-3 px-4 py-3.5 text-forest-300 hover:text-white hover:bg-forest-800 w-full transition-colors rounded-xl min-h-[44px]"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span className="text-base">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 pt-16 md:pt-0">
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/donate" element={<div className="p-4 md:p-8"><DonationForm /></div>} />
                    <Route path="/browse" element={<div className="p-4 md:p-8"><DonationsList /></div>} />
                    <Route path="/request" element={<div className="p-4 md:p-8"><RequestForm /></div>} />
                    <Route path="/analytics" element={<div className="p-4 md:p-8"><AnalyticsView /></div>} />
                    <Route path="/map" element={<div className="p-4 md:p-8"><MapView /></div>} />
                    <Route path="/history" element={<div className="p-4 md:p-8"><HistoryView /></div>} />
                    <Route path="/rewards" element={<div className="p-4 md:p-8"><RewardsView /></div>} />
                    <Route path="/settings" element={<div className="p-4 md:p-8"><SettingsView /></div>} />
                    <Route path="*" element={<div className="p-4 md:p-8">Page not found</div>} />
                </Routes>
            </div>
        </div>
    );
}
