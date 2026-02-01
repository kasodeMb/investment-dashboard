import express from 'express';
import { pool } from '../index.js';
import { getCurrentPrice } from '../services/priceService.js';

const router = express.Router();

// GET portfolio summary with compounded commission (Option C)
router.get('/summary', async (req, res) => {
    try {
        const [allTransactions] = await pool.query(`
      SELECT id, asset, transaction_date, amount_usd, quantity FROM transactions
    `);

        // Get current prices
        const currentPrices = {};
        try {
            const [sp500, bitcoin] = await Promise.all([
                getCurrentPrice('SP500').catch(() => null),
                getCurrentPrice('BITCOIN').catch(() => null)
            ]);
            currentPrices.SP500 = sp500;
            currentPrices.BITCOIN = bitcoin;
        } catch (error) {
            console.error('Error fetching current prices:', error);
        }

        // Get commission settings
        const [settings] = await pool.query('SELECT annual_commission_percent FROM settings WHERE id = 1');
        const commissionPercent = settings.length > 0 ? parseFloat(settings[0].annual_commission_percent) : 0;

        // Calculate per-transaction values with compounded commission based on years held
        const now = new Date();
        const transactionDetails = allTransactions.map(tx => {
            const currentPrice = currentPrices[tx.asset] || 0;
            const quantity = parseFloat(tx.quantity);
            const invested = parseFloat(tx.amount_usd);
            const currentValue = quantity * currentPrice;

            // Years held for this transaction
            const purchaseDate = new Date(tx.transaction_date);
            const yearsHeld = (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365);

            // Compounded commission: Value * (1 - rate)^years
            const rate = commissionPercent / 100;
            const commissionMultiplier = Math.pow(1 - rate, yearsHeld);
            const valueAfterCommission = currentValue * commissionMultiplier;
            const commissionCost = currentValue - valueAfterCommission;

            return {
                ...tx, currentPrice, currentValue, yearsHeld, commissionCost, valueAfterCommission,
                unrealizedGains: currentValue - invested, gainsAfterCommission: valueAfterCommission - invested
            };
        });

        // Aggregate by asset
        const portfolioMap = {};
        transactionDetails.forEach(tx => {
            if (!portfolioMap[tx.asset]) {
                portfolioMap[tx.asset] = {
                    asset: tx.asset, totalQuantity: 0, totalInvested: 0,
                    currentPrice: tx.currentPrice, currentValue: 0, commissionCost: 0, valueAfterCommission: 0
                };
            }
            portfolioMap[tx.asset].totalQuantity += parseFloat(tx.quantity);
            portfolioMap[tx.asset].totalInvested += parseFloat(tx.amount_usd);
            portfolioMap[tx.asset].currentValue += tx.currentValue;
            portfolioMap[tx.asset].commissionCost += tx.commissionCost;
            portfolioMap[tx.asset].valueAfterCommission += tx.valueAfterCommission;
        });

        const portfolio = Object.values(portfolioMap).map(item => {
            const averageCost = item.totalQuantity > 0 ? item.totalInvested / item.totalQuantity : 0;
            const unrealizedGains = item.currentValue - item.totalInvested;
            const gainsAfterCommission = item.valueAfterCommission - item.totalInvested;
            return {
                ...item, averageCost, unrealizedGains,
                unrealizedGainsPercent: item.totalInvested > 0 ? (unrealizedGains / item.totalInvested) * 100 : 0,
                gainsAfterCommission
            };
        });

        const grandTotal = {
            totalInvested: portfolio.reduce((sum, p) => sum + p.totalInvested, 0),
            currentValue: portfolio.reduce((sum, p) => sum + p.currentValue, 0),
            unrealizedGains: portfolio.reduce((sum, p) => sum + p.unrealizedGains, 0),
            commissionCost: portfolio.reduce((sum, p) => sum + p.commissionCost, 0),
            valueAfterCommission: portfolio.reduce((sum, p) => sum + p.valueAfterCommission, 0),
            gainsAfterCommission: portfolio.reduce((sum, p) => sum + p.gainsAfterCommission, 0)
        };
        grandTotal.unrealizedGainsPercent = grandTotal.totalInvested > 0
            ? (grandTotal.unrealizedGains / grandTotal.totalInvested) * 100 : 0;

        res.json({ portfolio, grandTotal, commissionPercent, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Error calculating portfolio summary:', error);
        res.status(500).json({ error: 'Failed to calculate portfolio summary' });
    }
});

export default router;
