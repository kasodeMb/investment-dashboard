import express from 'express';
import { pool } from '../index.js';
import { getHistoricalPrice } from '../services/priceService.js';

const router = express.Router();

// GET all transactions
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM transactions ORDER BY transaction_date DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// GET single transaction
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});

// POST create transaction
router.post('/', async (req, res) => {
    const { asset, transaction_date, amount_usd, price_at_purchase, quantity, is_fallback_price, participation_value, number_of_participations } = req.body;

    if (!asset || !transaction_date || !amount_usd || !price_at_purchase || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['SP500', 'BITCOIN'].includes(asset)) {
        return res.status(400).json({ error: 'Invalid asset type' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO transactions (asset, transaction_date, amount_usd, price_at_purchase, quantity, is_fallback_price, participation_value, number_of_participations)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [asset, transaction_date, amount_usd, price_at_purchase, quantity, is_fallback_price ? 1 : 0, participation_value || null, number_of_participations || null]
        );

        const [newTransaction] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newTransaction[0]);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
    const { asset, transaction_date, amount_usd, price_at_purchase, quantity, is_fallback_price, participation_value, number_of_participations } = req.body;

    try {
        const [existing] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        await pool.query(
            `UPDATE transactions 
             SET asset = ?, transaction_date = ?, amount_usd = ?, price_at_purchase = ?, quantity = ?, is_fallback_price = ?, participation_value = ?, number_of_participations = ?
             WHERE id = ?`,
            [
                asset || existing[0].asset,
                transaction_date || existing[0].transaction_date,
                amount_usd || existing[0].amount_usd,
                price_at_purchase || existing[0].price_at_purchase,
                quantity || existing[0].quantity,
                is_fallback_price !== undefined ? (is_fallback_price ? 1 : 0) : existing[0].is_fallback_price,
                participation_value !== undefined ? (participation_value || null) : existing[0].participation_value,
                number_of_participations !== undefined ? (number_of_participations || null) : existing[0].number_of_participations,
                req.params.id
            ]
        );

        const [updated] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [req.params.id]
        );

        res.json(updated[0]);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

// POST refresh price for a transaction (retry historical price fetch)
router.post('/:id/refresh-price', async (req, res) => {
    try {
        const [existing] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const tx = existing[0];

        // Try to get historical price without fallback
        const result = await getHistoricalPrice(tx.asset, tx.transaction_date, true);

        if (!result.isFallback) {
            // Got real historical price, update the transaction
            const newQuantity = parseFloat(tx.amount_usd) / result.price;

            await pool.query(
                `UPDATE transactions 
                 SET price_at_purchase = ?, quantity = ?, is_fallback_price = 0
                 WHERE id = ?`,
                [result.price, newQuantity, req.params.id]
            );

            const [updated] = await pool.query(
                'SELECT * FROM transactions WHERE id = ?',
                [req.params.id]
            );

            res.json({ success: true, transaction: updated[0] });
        } else {
            res.json({ success: false, message: 'Historical price still unavailable' });
        }
    } catch (error) {
        console.error('Error refreshing price:', error);
        res.status(500).json({ error: 'Failed to refresh price: ' + error.message });
    }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
    try {
        const [existing] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

export default router;
