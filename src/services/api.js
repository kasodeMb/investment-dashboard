import axios from 'axios';

const API_BASE = '/api';

// Transactions API
export const transactionsApi = {
    getAll: () => axios.get(`${API_BASE}/transactions`).then(res => res.data),

    getById: (id) => axios.get(`${API_BASE}/transactions/${id}`).then(res => res.data),

    create: (transaction) => axios.post(`${API_BASE}/transactions`, transaction).then(res => res.data),

    update: (id, transaction) => axios.put(`${API_BASE}/transactions/${id}`, transaction).then(res => res.data),

    delete: (id) => axios.delete(`${API_BASE}/transactions/${id}`).then(res => res.data),

    refreshPrice: (id) => axios.post(`${API_BASE}/transactions/${id}/refresh-price`).then(res => res.data),
};

// Prices API
export const pricesApi = {
    getHistorical: (asset, date) =>
        axios.get(`${API_BASE}/prices/historical`, { params: { asset, date } }).then(res => res.data),

    getCurrent: (asset) =>
        axios.get(`${API_BASE}/prices/current`, { params: { asset } }).then(res => res.data),

    getAllCurrent: () =>
        axios.get(`${API_BASE}/prices/current`).then(res => res.data),
};

// Settings API
export const settingsApi = {
    get: () => axios.get(`${API_BASE}/settings`).then(res => res.data),

    update: (annual_commission_percent) =>
        axios.put(`${API_BASE}/settings`, { annual_commission_percent }).then(res => res.data),
};

// Portfolio API
export const portfolioApi = {
    getSummary: () => axios.get(`${API_BASE}/portfolio/summary`).then(res => res.data),
};

export default {
    transactions: transactionsApi,
    prices: pricesApi,
    settings: settingsApi,
    portfolio: portfolioApi,
};
