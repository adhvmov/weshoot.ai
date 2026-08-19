import api from './api';

export const getDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getUsageAnalytics = async (period = '30d') => {
    try {
        const response = await api.get(`/dashboard/analytics?period=${period}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getUsageLog = async (params = {}) => {
    try {
        const response = await api.get('/dashboard/usage-log', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
