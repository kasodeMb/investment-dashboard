import express from 'express';
import { getHistoricalPrice, getCurrentPrice } from '../services/priceService.js';

const router = express.Router();

// GET historical price for a specific date
router.get('/historical', async (req, res) => {
    const { asset, date, noFallback } = req.query;

    if (!asset || !date) {
        return res.status(400).json({ error: 'Asset and date are required' });
    }

    if (!['SP500', 'BITCOIN'].includes(asset)) {
        return res.status(400).json({ error: 'Invalid asset type. Use SP500 or BITCOIN' });
    }

    try {
        const result = await getHistoricalPrice(asset, date, noFallback === 'true');
        res.json({
            asset,
            date,
            price: result.price,
            isFallback: result.isFallback,
            symbol: asset === 'SP500' ? 'SPY' : 'BTC'
        });
    } catch (error) {
        console.error('Error fetching historical price:', error.message);
        res.status(500).json({ error: error.message || 'Failed to fetch price' });
    }
});

// GET current prices
router.get('/current', async (req, res) => {
    const { asset } = req.query;

    try {
        if (asset) {
            if (!['SP500', 'BITCOIN'].includes(asset)) {
                return res.status(400).json({ error: 'Invalid asset type' });
            }
            const price = await getCurrentPrice(asset);
            return res.json({ asset, price });
        }

        const [sp500Price, bitcoinPrice] = await Promise.all([
            getCurrentPrice('SP500').catch(() => null),
            getCurrentPrice('BITCOIN').catch(() => null)
        ]);

        res.json({ SP500: sp500Price, BITCOIN: bitcoinPrice, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Error fetching current prices:', error.message);
        res.status(500).json({ error: 'Failed to fetch current prices' });
    }
});

export default router;
