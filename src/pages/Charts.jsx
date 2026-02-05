import { useState, useEffect, useMemo } from 'react';
import AssetChart from '../components/AssetChart';
import BNAssetChart from '../components/BNAssetChart';
import { transactionsApi } from '../services/api';

export default function Charts() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState('SP500');
    const [selectedBNAsset, setSelectedBNAsset] = useState(null);

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

    // Get unique BN assets (sorted: SP500 first, then others)
    const bnAssets = useMemo(() => {
        const assets = new Set();
        transactions.forEach(tx => {
            if (tx.participation_value && tx.number_of_participations) {
                assets.add(tx.asset);
            }
        });
        return Array.from(assets).sort((a, b) => {
            if (a === 'SP500') return -1;
            if (b === 'SP500') return 1;
            return a.localeCompare(b);
        });
    }, [transactions]);

    // Set default BN asset on load
    useEffect(() => {
        if (bnAssets.length > 0 && !selectedBNAsset) {
            setSelectedBNAsset(bnAssets[0]);
        }
    }, [bnAssets, selectedBNAsset]);

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

            {/* Standard Asset Charts */}
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
                                className={`btn ${selectedAsset === 'BITCOIN' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSelectedAsset('BITCOIN')}
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
                        </ul>
                    </div>
                </div>
            </section>

            {/* Banco Nacional Charts */}
            {bnAssets.length > 0 && (
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
                                🏦 Banco Nacional - {selectedBNAsset} Participation History
                            </h2>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {bnAssets.map(asset => (
                                    <button
                                        key={asset}
                                        className={`btn ${selectedBNAsset === asset ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setSelectedBNAsset(asset)}
                                    >
                                        {asset === 'SP500' ? 'S&P 500' : asset === 'BITCOIN' ? 'Bitcoin' : asset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <BNAssetChart transactions={transactions} asset={selectedBNAsset} />

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
                                <li><span style={{ color: '#8b5cf6' }}>●</span> Participation Value — Value at each transaction date</li>
                                <li><span style={{ color: '#10b981' }}>---</span> Running Avg Participation Value — Cumulative weighted average</li>
                            </ul>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

