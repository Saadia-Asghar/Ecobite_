import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SplashScreen from './pages/SplashScreen';
import WelcomePage from './pages/WelcomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RoleDashboard from './pages/RoleDashboard';
import MoneyDonation from './pages/MoneyDonation';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import TermsPage from './pages/TermsPage';
import NotFound from './pages/NotFound';

function App() {
    return (
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
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
