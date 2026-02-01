import { useState, useEffect } from 'react';
import AssetChart from '../components/AssetChart';
import { transactionsApi } from '../services/api';

export default function Charts() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState('SP500');

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                const data = await transactionsApi.getAll();
                setTransactions(data);
            } catch (err) {
                console.error('Failed to load transactions:', err);
            } finally {
                setLoading(false);
            }
        };
        loadTransactions();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        );
    }

    return (
        <div>
            <header className="dashboard-header">
                <h1>📈 Historical Charts</h1>
                <p>View transaction price history and average cost trends</p>
            </header>

            <section className="section">
                <div className="card fade-in">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <h2 style={{ margin: 0 }}>
                            {selectedAsset === 'SP500' ? '📊 S&P 500' : '₿ Bitcoin'} Price History
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className={`btn ${selectedAsset === 'SP500' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSelectedAsset('SP500')}
                            >
                                S&P 500
                            </button>
                            <button
                                className={`btn ${selectedAsset === 'BTC' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSelectedAsset('BTC')}
                            >
                                Bitcoin
                            </button>
                        </div>
                    </div>

                    <AssetChart transactions={transactions} asset={selectedAsset} />

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)'
                    }}>
                        <strong>Legend:</strong>
                        <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                            <li><span style={{ color: '#6366f1' }}>●</span> Purchase Price — Price at each transaction date</li>
                            <li><span style={{ color: '#10b981' }}>---</span> Running Avg Cost — Cumulative weighted average</li>
                            <li><span style={{ color: '#f59e0b' }}>---</span> Current Avg Cost — Your current cost basis</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}
