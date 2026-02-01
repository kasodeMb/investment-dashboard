/**
 * CryptoCompare Service
 * Used for: Historical and current cryptocurrency prices
 * Free tier available, no auth required for basic usage
 * Docs: https://min-api.cryptocompare.com/documentation
 */
import axios from 'axios';

const BASE_URL = 'https://min-api.cryptocompare.com/data';

/**
 * Get historical price for a cryptocurrency on a specific date
 * @param {string} symbol - Crypto symbol (e.g., 'BTC')
 * @param {Date} date - Target date
 * @param {string} currency - Target currency (default: 'USD')
 * @returns {Promise<number>} Price on that date
 */
export async function getHistoricalPrice(symbol, date, currency = 'USD') {
    const timestamp = Math.floor(date.getTime() / 1000);
    const dateStr = date.toISOString().slice(0, 10);

    try {
        const response = await axios.get(`${BASE_URL}/pricehistorical`, {
            params: {
                fsym: symbol,
                tsyms: currency,
                ts: timestamp
            }
        });

        if (response.data?.[symbol]?.[currency]) {
            const price = response.data[symbol][currency];
            console.log(`CryptoCompare ${symbol} price for ${dateStr}: $${price}`);
            return price;
        }
        throw new Error(`No historical data for ${symbol} on ${dateStr}`);
    } catch (error) {
        console.error(`CryptoCompare historical error (${symbol}):`, error.message);
        throw error;
    }
}

/**
 * Get current price for a cryptocurrency
 * @param {string} symbol - Crypto symbol (e.g., 'BTC')
 * @param {string} currency - Target currency (default: 'USD')
 * @returns {Promise<number>} Current price
 */
export async function getCurrentPrice(symbol, currency = 'USD') {
    try {
        const response = await axios.get(`${BASE_URL}/price`, {
            params: { fsym: symbol, tsyms: currency }
        });

        if (response.data?.[currency]) {
            return response.data[currency];
        }
        throw new Error(`No current price for ${symbol}`);
    } catch (error) {
        console.error(`CryptoCompare current price error (${symbol}):`, error.message);
        throw error;
    }
}

export default { getHistoricalPrice, getCurrentPrice };
