import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Routes
import transactionsRouter from './routes/transactions.js';
import pricesRouter from './routes/prices.js';
import settingsRouter from './routes/settings.js';
import portfolioRouter from './routes/portfolio.js';

app.use('/api/transactions', transactionsRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/portfolio', portfolioRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    testConnection();
});
