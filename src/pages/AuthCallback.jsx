import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Handles OAuth callback - extracts tokens from URL and processes them
 */
function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handleCallback } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh_token');
        const error = searchParams.get('error');

        if (error) {
            console.error('Auth error:', error);
            navigate('/login?error=' + error);
            return;
        }

        if (token) {
            handleCallback(token, refreshToken);
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [searchParams, handleCallback, navigate]);

    return (
        <div className="auth-callback">
            <div className="loading-spinner"></div>
            <p>Signing you in...</p>
        </div>
    );
}

export default AuthCallback;
