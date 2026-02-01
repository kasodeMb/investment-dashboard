export default function InvestmentSummary({ grandTotal, commissionPercent, bancoNacionalTotal, bancoNacionalTotalInvested }) {
    const formatCurrency = (value, currency = 'USD') => {
        return new Intl.NumberFormat(currency === 'CRC' ? 'es-CR' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatPercent = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value / 100);
    };

    // Use unrealizedGains from backend (matches "pl")
    const isProfit = grandTotal.unrealizedGains >= 0;

    return (
        <div className="card fade-in" style={{
            background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
            border: '1px solid rgba(255,255,255,0.08)'
        }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                📊 Total Portfolio Performance
                <span style={{
                    fontSize: '0.8rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    fontWeight: 'normal'
                }}>
                    Annual Fee: {commissionPercent}%
                </span>
            </h2>

            <div className="grid grid-3" style={{ gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="value-label" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Total Invested</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                        {formatCurrency(grandTotal.totalInvested)}
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div className="value-label" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Current Value</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                        {formatCurrency(grandTotal.currentValue)}
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div className="value-label" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Total Profit/Loss</div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: isProfit ? 'var(--success)' : 'var(--danger)'
                    }}>
                        {isProfit ? '+' : ''}{formatCurrency(grandTotal.unrealizedGains)}
                        <span style={{ fontSize: '1rem', marginLeft: '0.5rem', opacity: 0.9 }}>
                            ({isProfit ? '+' : ''}{formatPercent(grandTotal.unrealizedGainsPercent)})
                        </span>
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                flexWrap: 'wrap',
                fontSize: '0.9rem',
                color: 'var(--text-muted)'
            }}>
                <div>
                    Compounded Commissions: <span style={{ color: '#f87171' }}>-{formatCurrency(grandTotal.commissionCost)}</span>
                </div>
                <div>
                    Net Return: <span style={{ color: grandTotal.gainsAfterCommission >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {formatCurrency(grandTotal.gainsAfterCommission)}
                    </span>
                </div>
            </div>

            {bancoNacionalTotal > 0 && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    <div className="value-label" style={{ marginBottom: '1rem', textAlign: 'center', fontWeight: 600 }}>
                        🏦 Banco Nacional
                    </div>
                    <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="value-label" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Invested</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                {formatCurrency(bancoNacionalTotalInvested)}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div className="value-label" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Current Value</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                                {formatCurrency(bancoNacionalTotal)}
                            </div>
                        </div>

                        {(() => {
                            const profit = bancoNacionalTotal - bancoNacionalTotalInvested;
                            const profitPercent = bancoNacionalTotalInvested > 0 ? (profit / bancoNacionalTotalInvested) * 100 : 0;
                            const isProfitable = profit >= 0;
                            return (
                                <div style={{ textAlign: 'center' }}>
                                    <div className="value-label" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Profit/Loss</div>
                                    <div style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        color: isProfitable ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {isProfitable ? '+' : ''}{formatCurrency(profit)}
                                        <span style={{ fontSize: '0.85rem', marginLeft: '0.35rem', opacity: 0.9 }}>
                                            ({isProfitable ? '+' : ''}{profitPercent.toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
