/**
 * Finnhub API Service
 * Used for: Current SPY stock quotes
 * Docs: https://finnhub.io/docs/api
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

/**
 * Get current quote for a stock symbol
 * @param {string} symbol - Stock symbol (e.g., 'SPY')
 * @returns {Promise<number>} Current price
 */
export async function getQuote(symbol) {
    try {
        const response = await axios.get(`${BASE_URL}/quote`, {
            params: { symbol, token: API_KEY }
        });

        if (response.data?.c) {
            return response.data.c; // Current price
        }
        throw new Error(`No quote data for ${symbol}`);
    } catch (error) {
        console.error(`Finnhub quote error (${symbol}):`, error.message);
        throw error;
    }
}

export default { getQuote };
