import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { pool } from '../index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Generate access token (short-lived)
 */
function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name, picture: user.picture },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
}

/**
 * Generate refresh token (long-lived, for "remember me")
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
}

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow
 */
router.get('/google', (req, res, next) => {
    // Store remember_me preference in session/state
    const rememberMe = req.query.remember_me === 'true';
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: JSON.stringify({ rememberMe })
    })(req, res, next);
});

/**
 * GET /api/auth/google/callback
 * Handles OAuth callback from Google
 */
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=auth_failed' }),
    async (req, res) => {
        try {
            const user = req.user;
            let rememberMe = false;

            // Parse state to get remember_me preference
            try {
                const state = JSON.parse(req.query.state || '{}');
                rememberMe = state.rememberMe || false;
            } catch (e) {
                // State parsing failed, default to not remembering
            }

            const accessToken = generateAccessToken(user);

            if (rememberMe) {
                const refreshToken = generateRefreshToken(user);

                // Store refresh token in database
                await pool.query(
                    'UPDATE users SET refresh_token = ? WHERE id = ?',
                    [refreshToken, user.id]
                );

                // Redirect to frontend with both tokens
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refresh_token=${refreshToken}`);
            } else {
                // No refresh token for non-remember sessions
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
            }
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect('/login?error=server_error');
        }
    }
);

/**
 * GET /api/auth/me
 * Returns current authenticated user info
 */
router.get('/me', authMiddleware, (req, res) => {
    res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture
    });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token required' });
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        // Check if refresh token is still valid in database
        const [users] = await pool.query(
            'SELECT * FROM users WHERE id = ? AND refresh_token = ?',
            [decoded.id, refresh_token]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const user = users[0];

        // Generate new access token
        const accessToken = generateAccessToken(user);

        res.json({ token: accessToken });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Refresh token expired' });
        }
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate refresh token
 */
router.post('/logout', authMiddleware, async (req, res) => {
    try {
        // Clear refresh token from database
        await pool.query(
            'UPDATE users SET refresh_token = NULL WHERE id = ?',
            [req.user.id]
        );

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

export default router;
