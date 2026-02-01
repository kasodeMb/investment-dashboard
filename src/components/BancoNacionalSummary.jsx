export default function BancoNacionalSummary({ transactions }) {
    // Filter transactions that have Banco Nacional data
    const bnTransactions = transactions.filter(
        tx => tx.participation_value && tx.number_of_participations
    );

    if (bnTransactions.length === 0) {
        return null; // Don't show section if no Banco Nacional data
    }

    // Calculate totals per asset
    const assetTotals = {};
    bnTransactions.forEach(tx => {
        const key = tx.asset;
        if (!assetTotals[key]) {
            assetTotals[key] = {
                asset: tx.asset,
                totalParticipations: 0,
                totalValue: 0,
                transactions: []
            };
        }
        const value = parseFloat(tx.participation_value);
        const participations = parseFloat(tx.number_of_participations);
        assetTotals[key].totalParticipations += participations;
        assetTotals[key].totalValue += value * participations;
        assetTotals[key].transactions.push(tx);
    });

    const assets = Object.values(assetTotals);
    const grandTotal = assets.reduce((sum, a) => sum + a.totalValue, 0);

    const formatCurrency = (value, currency = 'CRC') => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-CR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 10,
        }).format(value);
    };

    return (
        <div className="card fade-in">
            <h2>🏦 Banco Nacional Details</h2>

            <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                {assets.map(assetData => (
                    <div
                        key={assetData.asset}
                        style={{
                            padding: '1.25rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span className={`asset-badge ${assetData.asset.toLowerCase()}`}>
                                {assetData.asset === 'SP500' ? '📈 S&P 500' : '₿ Bitcoin'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {assetData.transactions.length} transaction(s)
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div className="value-label">Total Participations</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                    {formatNumber(assetData.totalParticipations)}
                                </div>
                            </div>
                            <div>
                                <div className="value-label">Total Value (CRC)</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {formatCurrency(assetData.totalValue)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grand Total */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
                borderRadius: '12px',
                textAlign: 'center'
            }}>
                <div className="value-label" style={{ marginBottom: '0.5rem' }}>Grand Total Banco Nacional</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                    {formatCurrency(grandTotal)}
                </div>
            </div>
        </div>
    );
}
