/**
 * Price Service - Main Orchestrator
 * 
 * Aggregates data from multiple price providers:
 * - Finnhub: Current stock quotes (SPY)
 * - Stooq: Historical stock prices (SPY)
 * - Coinbase: Current crypto prices (BTC)
 * - CryptoCompare: Historical crypto prices (BTC)
 * 
 * Features:
 * - 10-minute cache for current prices
 * - Fallback indicator when historical price unavailable
 */
import * as finnhub from './finnhubService.js';
import * as stooq from './stooqService.js';
import * as coinbase from './coinbaseService.js';
import * as cryptoCompare from './cryptoCompareService.js';

// Price cache with 10-minute TTL
const priceCache = {
    SP500: { price: null, timestamp: 0 },
    BITCOIN: { price: null, timestamp: 0 }
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in ms

/**
 * Get historical price for an asset on a specific date
 * @param {string} asset - Asset type ('SP500' or 'BITCOIN')
 * @param {string} dateStr - Date string
 * @param {boolean} noFallback - If true, throw error instead of falling back to current price
 * @returns {Promise<{price: number, isFallback: boolean}>} Price data with fallback indicator
 */
export async function getHistoricalPrice(asset, dateStr, noFallback = false) {
    const targetDate = new Date(dateStr);
    const now = new Date();

    // If date is today or future, use current price (not a fallback)
    const targetDateOnly = new Date(targetDate.toDateString());
    const todayOnly = new Date(now.toDateString());

    if (targetDateOnly >= todayOnly) {
        console.log('Date is today/future, using current price');
        const price = await getCurrentPrice(asset);
        return { price, isFallback: false };
    }

    try {
        let price;
        if (asset === 'SP500') {
            price = await stooq.getHistoricalPrice('spy.us', targetDate);
        } else if (asset === 'BITCOIN') {
            price = await cryptoCompare.getHistoricalPrice('BTC', targetDate);
        } else {
            throw new Error(`Unknown asset: ${asset}`);
        }
        return { price, isFallback: false };
    } catch (error) {
        console.error(`Historical price failed for ${asset}:`, error.message);

        if (noFallback) {
            throw error; // Let the caller handle the error
        }

        // Fallback to current price
        console.log(`Using current price as fallback for ${asset}`);
        const price = await getCurrentPrice(asset);
        return { price, isFallback: true };
    }
}

/**
 * Get current price for an asset (cached for 10 minutes)
 * @param {string} asset - Asset type ('SP500' or 'BITCOIN')
 * @returns {Promise<number>} Current price
 */
export async function getCurrentPrice(asset) {
    const now = Date.now();
    const cached = priceCache[asset];

    // Return cached price if still valid
    if (cached?.price && (now - cached.timestamp) < CACHE_TTL) {
        console.log(`Using cached ${asset} price: $${cached.price}`);
        return cached.price;
    }

    let price;

    try {
        if (asset === 'SP500') {
            price = await finnhub.getQuote('SPY');
        } else if (asset === 'BITCOIN') {
            // Try Coinbase first, fallback to CryptoCompare
            try {
                price = await coinbase.getSpotPrice('BTC-USD');
            } catch (e) {
                console.log('Coinbase failed, trying CryptoCompare...');
                price = await cryptoCompare.getCurrentPrice('BTC');
            }
        } else {
            throw new Error(`Unknown asset: ${asset}`);
        }

        // Cache the price
        priceCache[asset] = { price, timestamp: now };
        console.log(`Fetched and cached ${asset} price: $${price}`);
        return price;
    } catch (error) {
        console.error(`Current price error for ${asset}:`, error.message);
        throw error;
    }
}

export default { getHistoricalPrice, getCurrentPrice };
