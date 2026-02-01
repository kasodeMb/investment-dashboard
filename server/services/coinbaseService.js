/**
 * Coinbase Service
 * Used for: Current Bitcoin price
 * Free, no auth required
 * Docs: https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices
 */
import axios from 'axios';

const BASE_URL = 'https://api.coinbase.com/v2';

/**
 * Get current spot price for a cryptocurrency
 * @param {string} pair - Currency pair (e.g., 'BTC-USD')
 * @returns {Promise<number>} Current price
 */
export async function getSpotPrice(pair = 'BTC-USD') {
    try {
        const response = await axios.get(`${BASE_URL}/prices/${pair}/spot`);

        if (response.data?.data?.amount) {
            return parseFloat(response.data.data.amount);
        }
        throw new Error(`No spot price for ${pair}`);
    } catch (error) {
        console.error(`Coinbase error (${pair}):`, error.message);
        throw error;
    }
}

export default { getSpotPrice };
