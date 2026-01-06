import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SplashScreen = lazy(() => import('./pages/SplashScreen'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RoleDashboard = lazy(() => import('./pages/RoleDashboard'));
const MoneyDonation = lazy(() => import('./pages/MoneyDonation'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BusinessModelCanvas = lazy(() => import('./pages/BusinessModelCanvas'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
        </div>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    <Route path="/" element={<SplashScreen />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/welcome" element={<WelcomePage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="/mobile" element={<RoleDashboard />} />
                    <Route path="/money-donation" element={<MoneyDonation />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/bmc" element={<BusinessModelCanvas />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
