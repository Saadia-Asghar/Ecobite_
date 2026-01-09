import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

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

    const verifyToken = async (tokenToVerify: string) => {
        // Preserve existing state before verification attempt
        // This ensures we can restore it if verification fails with non-auth errors
        const previousUser = user;
        const previousToken = token;
        const storedToken = localStorage.getItem('ecobite_token');
        
        try {
            const response = await fetch(`${API_URL}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${tokenToVerify}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setToken(tokenToVerify);
            } else if (response.status === 401 || response.status === 403) {
                // Only log out if token is actually invalid/unauthorized (401/403)
                // This means the token is expired or invalid, so user should be logged out
                console.warn('Token is invalid or expired, logging out');
                setUser(null);
                setToken(null);
                localStorage.removeItem('ecobite_token');
            } else {
                // For other errors (500, network issues, etc.), don't log out
                // Restore previous state if it existed, or restore token from localStorage
                console.warn('Token verification failed (non-auth error):', response.status, response.statusText);
                
                // If we had previous state, restore it to prevent UI mismatch
                if (previousUser && previousToken) {
                    setUser(previousUser);
                    setToken(previousToken);
                } else if (storedToken) {
                    // If no previous state but token exists in storage, restore token state
                    // This prevents UI mismatch where localStorage has token but state is null
                    setToken(storedToken);
                    console.warn('Restored token from localStorage due to verification failure (user state will sync on next successful verification)');
                }
                // If no previous state and no stored token, leave state as is (null)
            }
        } catch (error) {
            // Network errors, timeouts, etc. - don't log out the user
            // Restore previous state if it existed, or restore token from localStorage
            console.warn('Token verification failed (network error):', error);
            
            // If we had previous state, restore it to prevent UI mismatch
            if (previousUser && previousToken) {
                setUser(previousUser);
                setToken(previousToken);
            } else if (storedToken) {
                // If no previous state but token exists in storage, restore token state
                // This prevents UI mismatch where localStorage has token but state is null
                setToken(storedToken);
                console.warn('Restored token from localStorage due to network error (user state will sync on next successful verification)');
            }
            // If no previous state and no stored token, leave state as is (null)
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
            try {
                // Use verifyToken but it's now safe - won't log out on network errors
                await verifyToken(currentToken);
            } catch (error) {
                // Additional safety net - even if verifyToken throws, don't log out
                console.warn('User refresh encountered an error (keeping user logged in):', error);
                // Don't clear user/token - keep them logged in
            }
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
            isAuthenticated: !!(user || token || localStorage.getItem('ecobite_token')),
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