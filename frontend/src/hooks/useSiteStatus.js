import { useState, useEffect } from 'react';
import axios from 'axios';

const useSiteStatus = () => {
    const [siteStatus, setSiteStatus] = useState({
        isClosed: false,
        hasAccess: true,
        isAuthenticated: false,
        loading: true
    });

    const checkSiteStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = token ? {
                headers: { Authorization: `Bearer ${token}` }
            } : {};

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/dashboard/site-status`,
                config
            );

            if (response.data.success) {
                setSiteStatus({
                    ...response.data.data,
                    loading: false
                });
            }
        } catch (error) {
            console.error('Failed to check site status:', error);
            // On error, default to open site
            setSiteStatus({
                isClosed: false,
                hasAccess: true,
                isAuthenticated: false,
                loading: false
            });
        }
    };

    useEffect(() => {
        checkSiteStatus();

        // Listen for auth changes (login/signup/logout)
        const handleStorageChange = () => {
            checkSiteStatus();
        };

        window.addEventListener('storage', handleStorageChange);
        // Also check periodically in case of same-tab changes
        const interval = setInterval(checkSiteStatus, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    return { ...siteStatus, refetch: checkSiteStatus };
};

export default useSiteStatus;
