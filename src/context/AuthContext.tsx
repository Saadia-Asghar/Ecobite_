import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    organization?: string;
    ecoPoints: number;
    avatar?: string;
}

import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for existing token
        const storedToken = localStorage.getItem('ecobite_token');
        if (storedToken) {
            verifyToken(storedToken);
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
                localStorage.removeItem('ecobite_token');
            }
        } catch (error) {
            console.warn('Token verification failed (Offline Mode):', error);
            // In offline mode, we can't verify the token, but we can keep the session if we had a user.
            // For now, let's just clear it to be safe, or maybe we can persist user in localStorage too.
            // Let's try to restore user from localStorage if available
            const savedUser = localStorage.getItem('ecobite_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
                setToken(token);
            } else {
                localStorage.removeItem('ecobite_token');
            }
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
                // If backend is missing (404) or erroring (5xx), treat as offline/demo mode
                if (response.status === 404 || response.status >= 500) {
                    throw new Error('Backend unreachable');
                }

                let error;
                try {
                    error = await response.json();
                } catch (e) {
                    throw new Error('Backend unreachable');
                }
                throw new Error(error.error || 'Registration failed');
            }

            const result = await response.json();
            setUser(result.user);
            setToken(result.token);
            localStorage.setItem('ecobite_token', result.token);
            localStorage.setItem('ecobite_user', JSON.stringify(result.user));
            navigate('/mobile', { replace: true });
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message === 'Backend unreachable' || error.message.includes('Unexpected token')) {
                console.log('Falling back to Mock Registration');
                const newUser: User = {
                    id: `u${Date.now()}`,
                    email: data.email,
                    name: data.name,
                    role: data.role || 'individual',
                    organization: data.organization,
                    ecoPoints: 0
                };
                setUser(newUser);
                setToken('mock-token');
                localStorage.setItem('ecobite_token', 'mock-token');
                localStorage.setItem('ecobite_user', JSON.stringify(newUser));
                navigate('/mobile', { replace: true });
                alert('⚠️ Running in Demo Mode (Backend unreachable)');
                return;
            }
            throw new Error(error.message || 'Registration failed');
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
                // If backend is missing (404) or erroring (5xx), treat as offline/demo mode
                if (response.status === 404 || response.status >= 500) {
                    throw new Error('Backend unreachable');
                }

                let error;
                try {
                    error = await response.json();
                } catch (e) {
                    throw new Error('Backend unreachable');
                }
                throw new Error(error.error || 'Login failed');
            }

            const result = await response.json();
            setUser(result.user);
            setToken(result.token);
            localStorage.setItem('ecobite_token', result.token);
            localStorage.setItem('ecobite_user', JSON.stringify(result.user));
            navigate('/mobile', { replace: true });
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message === 'Backend unreachable' || error.message.includes('Unexpected token')) {
                console.log('Falling back to Mock Login');
                const mockUser = MOCK_USERS.find(u => u.email === email);
                if (mockUser) {
                    const userObj: User = {
                        id: mockUser.id,
                        email: mockUser.email,
                        name: mockUser.name,
                        role: mockUser.type, // Map 'type' to 'role'
                        organization: mockUser.organization,
                        ecoPoints: mockUser.ecoPoints
                    };
                    setUser(userObj);
                    setToken('mock-token');
                    localStorage.setItem('ecobite_token', 'mock-token');
                    localStorage.setItem('ecobite_user', JSON.stringify(userObj));
                    navigate('/mobile', { replace: true });
                    alert('⚠️ Running in Demo Mode (Backend unreachable)');
                    return;
                } else {
                    throw new Error('Invalid credentials (Demo Mode)');
                }
            }
            throw new Error(error.message || 'Login failed');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('ecobite_token');
        localStorage.removeItem('ecobite_user');
        navigate('/welcome');
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...data });
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
            isAuthenticated: !!user
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
