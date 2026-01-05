import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

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

            const isNewUser = searchParams.get('isNewUser') === 'true';
            const email = searchParams.get('email') || '';
            const name = searchParams.get('name') || '';
            const role = searchParams.get('role') || '';

            if (isNewUser) {
                // Redirect to signup page but with pre-filled details - Force reload to ensure context update
                window.location.href = `/signup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&microsoft=true&role=${encodeURIComponent(role)}`;
            } else {
                // Return to dashboard
                window.location.href = '/dashboard';
            }
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-ivory flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-forest-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-forest-900">Completing Sign In...</h2>
            <p className="text-forest-600">Please wait while we set up your secure session.</p>
        </div>
    );
}
