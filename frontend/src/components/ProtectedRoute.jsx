import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SiteStatusContext } from '../App';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const siteStatus = useContext(SiteStatusContext);

    if (loading || siteStatus?.loading) {
        // You can replace this with a proper loading spinner component
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 text-sm font-medium">Loading...</span>
                </div>
            </div>
        );
    }

    // Check if site is closed and user doesn't have access
    if (siteStatus?.isClosed && !siteStatus?.hasAccess) {
        return <Navigate to="/" replace />;
    }

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;











