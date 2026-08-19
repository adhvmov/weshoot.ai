import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // For admin, we use a specific dashboard stats or kpi check 
                // as a way to verify token and get admin info
                const response = await api.get('/admin/dashboard/kpis');
                if (response.data.success) {
                    // Logic: if we can access admin KPIs, we are authenticated as admin
                    // We might need a specific /admin/auth/me endpoint for better clarity
                    // But for now, let's assume if token is valid and returns data, it's admin
                    const savedAdmin = localStorage.getItem('admin_info');
                    if (savedAdmin) {
                        setUser(JSON.parse(savedAdmin));
                    }
                }
            } catch (error) {
                console.error('Admin Auth check failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('admin_info');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/admin/auth/login', { username, password });
            if (response.data.success) {
                const { token, admin } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('admin_info', JSON.stringify(admin));
                setUser(admin);
                return response.data;
            }
        } catch (error) {
            console.error('Login error:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_info');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
