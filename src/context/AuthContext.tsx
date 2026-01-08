import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    category?: 'donor' | 'beneficiary';
    organization?: string;
    licenseId?: string;
    isVerified?: number;
    ecoPoints: number;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    updateProfile: (data: any, redirectToMobile?: boolean) => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for existing token
        const storedToken = localStorage.getItem('ecobite_token');
        if (storedToken) {
            verifyToken(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async (token: string) => {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setToken(token);
            } else {
                throw new Error('Token verification failed');
            }
        } catch (error) {
            console.warn('Token verification failed:', error);
            setUser(null);
            setToken(null);
            localStorage.removeItem('ecobite_token');
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: any) => {
        try {
            // Add timeout to prevent long waits
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const text = await response.text();
                let error;
                try {
                    error = JSON.parse(text);
                } catch (e) {
                    throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
                }
                throw new Error(error.error || 'Registration failed');
            }

            const result = await response.json();
            setUser(result.user);
            setToken(result.token);
            localStorage.setItem('ecobite_token', result.token);
            // Use navigate for smooth SPA transition
            navigate('/mobile');
        } catch (error: any) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            // Add timeout to prevent long waits
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const text = await response.text();
                let error;
                try {
                    error = JSON.parse(text);
                } catch (e) {
                    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
                }
                throw new Error(error.error || error.message || 'Login failed');
            }

            const result = await response.json();
            setUser(result.user);
            setToken(result.token);
            localStorage.setItem('ecobite_token', result.token);
            // Use navigate for smooth SPA transition
            navigate('/mobile');
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('ecobite_token');
        navigate('/welcome');
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...data });
        }
    };

    const updateProfile = async (data: any, redirectToMobile: boolean = false) => {
        try {
            const currentToken = token || localStorage.getItem('ecobite_token');

            // Add timeout to prevent long waits
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update profile');
            }

            const result = await response.json();
            setUser(result.user);

            // Only navigate if explicitly requested AND not already on /mobile
            // This prevents resetting the tab state when editing from the Profile tab
            if (redirectToMobile && !window.location.pathname.startsWith('/mobile')) {
                navigate('/mobile');
            }
        } catch (error: any) {
            console.error('Profile update error:', error);
            throw error;
        }
    };

    const refreshUser = async () => {
        const currentToken = token || localStorage.getItem('ecobite_token');
        if (currentToken) {
            await verifyToken(currentToken);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            register,
            logout,
            updateUser,
            updateProfile,
            isAuthenticated: !!user,
            loading,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
