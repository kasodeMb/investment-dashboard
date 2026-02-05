import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
    const { user, logout } = useAuth();

    return (
        <nav style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem 2rem',
            background: 'rgba(17, 24, 39, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(10px)',
            alignItems: 'center'
        }}>
            <NavLink
                to="/"
                style={({ isActive }) => ({
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    transition: 'all 0.2s ease'
                })}
            >
                📊 Dashboard
            </NavLink>
            <NavLink
                to="/charts"
                style={({ isActive }) => ({
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    transition: 'all 0.2s ease'
                })}
            >
                📈 Charts
            </NavLink>

            {user && (
                <div className="user-menu">
                    {user.picture && (
                        <img src={user.picture} alt={user.name} className="user-avatar" />
                    )}
                    <span className="user-name">{user.name}</span>
                    <button onClick={logout} className="logout-btn">
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
