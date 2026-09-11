import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ roles, children }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        user = null;
    }

    if (!token || !user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/explore" replace />;
    }

    return children;
};

export default ProtectedRoute;
