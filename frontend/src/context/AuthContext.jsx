import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.get('/auth/me');
                if (response.data.success) {
                    setUser(response.data.data);
                    localStorage.setItem('user', JSON.stringify(response.data.data));
                }
                return response.data;
            } catch (error) {
                console.error('Refresh user failed:', error);
                // Don't log out on refresh failure unless it's a 401
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                    setLoading(false);
                } catch (e) {
                    console.error('Failed to parse stored user data', e);
                }
            }

            if (token) {
                await refreshUser();
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            const userData = response.data.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return response.data;
        }
    };

    const register = async (email, password, fullName) => {
        const response = await api.post('/auth/register', { email, password, full_name: fullName });
        return response.data;
    };

    const verifyEmail = async (email, code) => {
        const response = await api.post('/auth/verify-email', { email, code });
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            const userData = response.data.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return response.data;
        }
    };

    const resendVerification = async (email) => {
        const response = await api.post('/auth/resend-verification', { email });
        return response.data;
    };

    const forgotPassword = async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    };

    const verifyResetCode = async (email, code) => {
        const response = await api.post('/auth/verify-reset-code', { email, code });
        return response.data;
    };

    const resetPassword = async (email, code, newPassword) => {
        const response = await api.post('/auth/reset-password', { email, code, newPassword });
        return response.data;
    };

    const googleLogin = async (credentialResponse) => {
        try {
            // Send the credential directly to backend for secure verification
            const response = await api.post('/auth/google', {
                credential: credentialResponse.credential
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                const userData = response.data.data.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return response.data;
            }

        } catch (err) {
            console.error('Google Login Error:', err);
            throw err;
        }
    };

    const deleteAccount = async () => {
        const response = await api.delete('/auth/account');
        if (response.data.success) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
        return response.data;
    };

    const getSessions = async () => {
        const response = await api.get('/auth/sessions');
        return response.data;
    };

    const revokeSession = async (sessionId) => {
        const response = await api.delete(`/auth/sessions/${sessionId}`);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Server logout failed:', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            googleLogin,
            verifyEmail,
            resendVerification,
            forgotPassword,
            verifyResetCode,
            resetPassword,
            deleteAccount,
            getSessions,
            revokeSession,
            logout,
            refreshUser,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
