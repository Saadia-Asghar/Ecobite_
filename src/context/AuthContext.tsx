import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS } from '../data/mockData';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    category?: 'donor' | 'beneficiary';
    organization?: string;
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
    completeProfile: (data: any) => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
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
            console.warn('Token verification failed, trying mock...', error);
            // Mock verification
            const mockUser = MOCK_USERS.find(u => u.id === 'u1'); // Default to first mock user for demo
            if (mockUser && token.startsWith('mock-token')) {
                // Map mock user to AuthContext User type (handling optional fields)
                const userToSet: User = {
                    id: mockUser.id,
                    email: mockUser.email,
                    name: mockUser.name,
                    role: mockUser.type,
                    category: mockUser.category,
                    organization: mockUser.organization,
                    ecoPoints: mockUser.ecoPoints,
                    avatar: undefined
                };
                setUser(userToSet);
                setToken(token);
            } else {
                localStorage.removeItem('ecobite_token');
            }
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: any) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

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
            navigate('/mobile', { replace: true });
        } catch (error: any) {
            console.error('Registration error, falling back to mock:', error);

            // Mock Registration
            const newUser: User = {
                id: `u${Date.now()}`,
                email: data.email,
                name: data.name,
                role: data.role || 'individual',
                category: data.category,
                organization: data.organization,
                ecoPoints: 0
            };

            setUser(newUser);
            const mockToken = `mock-token-${Date.now()}`;
            setToken(mockToken);
            localStorage.setItem('ecobite_token', mockToken);
            alert('⚠️ Backend unavailable. Registered in Demo Mode.');
            navigate('/mobile', { replace: true });
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const result = await response.json();
            setUser(result.user);
            setToken(result.token);
            localStorage.setItem('ecobite_token', result.token);
            navigate('/mobile', { replace: true });
        } catch (error: any) {
            console.error('Login error, falling back to mock:', error);

            // Mock Login
            const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (mockUser) {
                // Map mock user to AuthContext User type
                const userToSet: User = {
                    id: mockUser.id,
                    email: mockUser.email,
                    name: mockUser.name,
                    role: mockUser.type,
                    category: mockUser.category,
                    organization: mockUser.organization,
                    ecoPoints: mockUser.ecoPoints,
                    avatar: undefined
                };

                setUser(userToSet);
                const mockToken = `mock-token-${mockUser.id}`;
                setToken(mockToken);
                localStorage.setItem('ecobite_token', mockToken);
                alert('⚠️ Backend unavailable. Logged in via Demo Mode.');
                navigate('/mobile', { replace: true });
            } else {
                // If it's the admin email from the screenshot
                if (email === 'admin@ecobite.com') {
                    const adminUser: User = {
                        id: 'admin1',
                        email: 'admin@ecobite.com',
                        name: 'System Admin',
                        role: 'admin',
                        ecoPoints: 0
                    };
                    setUser(adminUser);
                    const mockToken = `mock-token-admin`;
                    setToken(mockToken);
                    localStorage.setItem('ecobite_token', mockToken);
                    alert('⚠️ Backend unavailable. Logged in as Admin (Demo Mode).');
                    navigate('/mobile', { replace: true });
                } else {
                    throw new Error('Invalid credentials (and backend is unavailable)');
                }
            }
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

    const completeProfile = async (data: any) => {
        try {
            const currentToken = token || localStorage.getItem('ecobite_token');
            const response = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update profile');
            }

            const result = await response.json();
            setUser(result.user);
            navigate('/mobile', { replace: true });
        } catch (error: any) {
            console.error('Profile completion error:', error);
            // Mock fallback
            if (user) {
                setUser({ ...user, ...data });
                alert('⚠️ Profile updated in Demo Mode (Backend unavailable).');
                navigate('/mobile', { replace: true });
            } else {
                throw error;
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
            completeProfile,
            isAuthenticated: !!user,
            loading
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
