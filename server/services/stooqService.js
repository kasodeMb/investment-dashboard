/**
 * Stooq Service
 * Used for: Historical stock prices (SPY)
 * Free, no auth required
 * Docs: https://stooq.com/
 */
import axios from 'axios';

/**
 * Get historical closing price for a stock on a specific date
 * @param {string} symbol - Stock symbol (e.g., 'spy.us')
 * @param {Date} date - Target date
 * @returns {Promise<number>} Closing price
 */
export async function getHistoricalPrice(symbol, date) {
    const dateStr = date.toISOString().slice(0, 10);
    const formattedDate = dateStr.replace(/-/g, ''); // YYYYMMDD format

    try {
        const response = await axios.get(
            `https://stooq.com/q/d/l/?s=${symbol}&d1=${formattedDate}&d2=${formattedDate}&i=d`,
            {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                responseType: 'text'
            }
        );

        // Parse CSV: Date,Open,High,Low,Close,Volume
        const lines = response.data.trim().split('\n');
        if (lines.length > 1) {
            const dataLine = lines[1];
            const columns = dataLine.split(',');
            const closePrice = parseFloat(columns[4]);
            if (!isNaN(closePrice) && closePrice > 0) {
                console.log(`Stooq ${symbol} price for ${dateStr}: $${closePrice}`);
                return closePrice;
            }
        }
        throw new Error(`No data for ${symbol} on ${dateStr}`);
    } catch (error) {
        console.error(`Stooq error (${symbol}):`, error.message);
        throw error;
    }
}

export default { getHistoricalPrice };
