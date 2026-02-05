import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cookieParser from 'cookie-parser';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database connection pool
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'investment_user',
    password: process.env.DB_PASSWORD || 'investment_pass',
    database: process.env.DB_NAME || 'investments',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('Make sure MySQL is running: docker-compose up -d');
    }
}

// Passport Google OAuth Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const picture = profile.photos[0]?.value || null;

        // Check if user exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE google_id = ?',
            [googleId]
        );

        let user;
        if (existingUsers.length > 0) {
            // Update existing user
            await pool.query(
                'UPDATE users SET email = ?, name = ?, picture = ? WHERE google_id = ?',
                [email, name, picture, googleId]
            );
            user = existingUsers[0];
            user.email = email;
            user.name = name;
            user.picture = picture;
        } else {
            // Create new user
            const [result] = await pool.query(
                'INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)',
                [googleId, email, name, picture]
            );
            user = { id: result.insertId, google_id: googleId, email, name, picture };
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

app.use(passport.initialize());

// Routes
import authRouter from './routes/auth.js';
import transactionsRouter from './routes/transactions.js';
import pricesRouter from './routes/prices.js';
import settingsRouter from './routes/settings.js';
import portfolioRouter from './routes/portfolio.js';

// Auth routes (public)
app.use('/api/auth', authRouter);

// Protected routes
import { authMiddleware } from './middleware/auth.js';
app.use('/api/transactions', authMiddleware, transactionsRouter);
app.use('/api/prices', authMiddleware, pricesRouter);
app.use('/api/settings', authMiddleware, settingsRouter);
app.use('/api/portfolio', authMiddleware, portfolioRouter);

// Health check (public)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    testConnection();
});
