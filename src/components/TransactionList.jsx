import { useState } from 'react';
import { transactionsApi } from '../services/api';

export default function TransactionList({ transactions, onEdit, onDelete, onRefresh }) {
    const [refreshing, setRefreshing] = useState({});

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: value < 1 ? 8 : 2,
        }).format(value);
    };

    const formatQuantity = (value, asset) => {
        const num = parseFloat(value);
        return num < 1 ? num.toFixed(8) : num.toFixed(4);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleRefreshPrice = async (tx) => {
        setRefreshing(prev => ({ ...prev, [tx.id]: true }));
        try {
            const result = await transactionsApi.refreshPrice(tx.id);
            if (result.success) {
                onRefresh && onRefresh(); // Reload all data
            } else {
                alert('Historical price still unavailable. Please try again later.');
            }
        } catch (error) {
            console.error('Failed to refresh price:', error);
            alert('Failed to refresh price: ' + (error.response?.data?.error || error.message));
        } finally {
            setRefreshing(prev => ({ ...prev, [tx.id]: false }));
        }
    };

    if (!transactions || transactions.length === 0) {
        return (
            <div className="card fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No transactions yet</h3>
                <p style={{ color: 'var(--text-muted)' }}>Add your first investment above to get started</p>
            </div>
        );
    }

    return (
        <div className="card fade-in">
            <h2>Transaction History</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className={`asset-badge ${tx.asset.toLowerCase()}`}>
                                            {tx.asset === 'SP500' ? '📈 S&P 500' : '₿ Bitcoin'}
                                        </span>
                                        {(!tx.participation_value || !tx.number_of_participations) && (
                                            <span
                                                title="Banco Nacional data missing"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '0.15rem 0.4rem',
                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                    color: '#f87171',
                                                    borderRadius: '4px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                🏦 Missing
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{formatDate(tx.transaction_date)}</td>
                                <td>{formatCurrency(tx.amount_usd)}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {formatCurrency(tx.price_at_purchase)}
                                        {tx.is_fallback_price === 1 && (
                                            <span
                                                title="Using current price (historical unavailable)"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.2rem 0.5rem',
                                                    background: 'rgba(245, 158, 11, 0.15)',
                                                    color: '#fbbf24',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => !refreshing[tx.id] && handleRefreshPrice(tx)}
                                            >
                                                {refreshing[tx.id] ? (
                                                    <span className="spinner" style={{ width: 12, height: 12 }}></span>
                                                ) : (
                                                    <>⚠️ Approx</>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{formatQuantity(tx.quantity, tx.asset)}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => onEdit(tx)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => onDelete(tx.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
