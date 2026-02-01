import express from 'express';
import { pool } from '../index.js';

const router = express.Router();

// GET settings
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings WHERE id = 1');

        if (rows.length === 0) {
            await pool.query('INSERT INTO settings (id, annual_commission_percent) VALUES (1, 0.00)');
            return res.json({ id: 1, annual_commission_percent: 0 });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT update settings
router.put('/', async (req, res) => {
    const { annual_commission_percent } = req.body;

    if (annual_commission_percent === undefined || annual_commission_percent === null) {
        return res.status(400).json({ error: 'annual_commission_percent is required' });
    }

    if (annual_commission_percent < 0 || annual_commission_percent > 100) {
        return res.status(400).json({ error: 'Commission percent must be between 0 and 100' });
    }

    try {
        await pool.query(
            `INSERT INTO settings (id, annual_commission_percent) VALUES (1, ?)
       ON DUPLICATE KEY UPDATE annual_commission_percent = ?`,
            [annual_commission_percent, annual_commission_percent]
        );

        const [updated] = await pool.query('SELECT * FROM settings WHERE id = 1');
        res.json(updated[0]);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;
