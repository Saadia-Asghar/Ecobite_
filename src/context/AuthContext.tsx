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
            const response = await fetch('http://localhost:3002/api/auth/verify', {
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
            console.error('Token verification failed:', error);
            localStorage.removeItem('ecobite_token');
        }
    };

    const register = async (data: any) => {
        try {
            const response = await fetch('http://localhost:3002/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Registration failed');
            }

            const result = await response.json();
            setUser(result.user);
            setToken(result.token);
            localStorage.setItem('ecobite_token', result.token);
            navigate('/mobile', { replace: true });
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.message === 'Failed to fetch') {
                throw new Error('Cannot connect to server. Please make sure the backend is running on port 3002.');
            }
            throw new Error(error.message || 'Registration failed');
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('http://localhost:3002/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const result = await response.json();
            setUser(result.user);
            setToken(result.token);
            localStorage.setItem('ecobite_token', result.token);
            navigate('/mobile', { replace: true });
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.message === 'Failed to fetch') {
                throw new Error('Cannot connect to server. Please make sure the backend is running on port 3002.');
            }
            throw new Error(error.message || 'Login failed');
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
