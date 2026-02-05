import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = '/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token'));

    // Set up axios interceptor for auth header
    useEffect(() => {
        const interceptor = axios.interceptors.request.use((config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        return () => axios.interceptors.request.eject(interceptor);
    }, [token]);

    // Set up axios interceptor for token refresh on 401
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 &&
                    error.response?.data?.code === 'TOKEN_EXPIRED' &&
                    refreshToken &&
                    !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const response = await axios.post(`${API_BASE}/auth/refresh`, {
                            refresh_token: refreshToken
                        });

                        const newToken = response.data.token;
                        setToken(newToken);
                        localStorage.setItem('token', newToken);

                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        logout();
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [refreshToken]);

    // Check auth status on mount
    useEffect(() => {
        async function checkAuth() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                // Token invalid, clear it
                if (refreshToken) {
                    // Try refresh
                    try {
                        const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
                            refresh_token: refreshToken
                        });
                        const newToken = refreshResponse.data.token;
                        setToken(newToken);
                        localStorage.setItem('token', newToken);

                        const userResponse = await axios.get(`${API_BASE}/auth/me`, {
                            headers: { Authorization: `Bearer ${newToken}` }
                        });
                        setUser(userResponse.data);
                    } catch (refreshError) {
                        logout();
                    }
                } else {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    // Handle OAuth callback
    const handleCallback = (accessToken, refreshTkn = null) => {
        setToken(accessToken);
        localStorage.setItem('token', accessToken);

        if (refreshTkn) {
            setRefreshToken(refreshTkn);
            localStorage.setItem('refresh_token', refreshTkn);
        }

        // Fetch user info
        axios.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        }).then(response => {
            setUser(response.data);
        }).catch(error => {
            console.error('Failed to fetch user:', error);
        });
    };

    // Initiate Google login
    const login = (rememberMe = false) => {
        const authUrl = `${API_BASE}/auth/google?remember_me=${rememberMe}`;
        window.location.href = authUrl;
    };

    // Logout
    const logout = async () => {
        try {
            if (token) {
                await axios.post(`${API_BASE}/auth/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            // Ignore logout errors
        }

        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        handleCallback
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
