import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            console.error('Auth error:', error);
            alert('Authentication failed: ' + error);
            navigate('/login');
            return;
        }

        if (token) {
            // Save token
            localStorage.setItem('ecobite_token', token);

            // In a real app, we'd fetch the full user profile here
            // For now, we'll try to trigger the verifyToken in AuthContext or just redirect
            window.location.href = '/dashboard'; // Force a reload to trigger AuthContext initialization
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, updateUser]);

    return (
        <div className="min-h-screen bg-ivory flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-forest-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-forest-900">Completing Sign In...</h2>
            <p className="text-forest-600">Please wait while we set up your secure session.</p>
        </div>
    );
}
