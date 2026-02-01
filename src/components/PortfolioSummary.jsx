import React, { useState } from 'react';

export default function PortfolioSummary({ portfolio, bancoNacionalData }) {
    const [expandedRows, setExpandedRows] = useState({});

    if (!portfolio || portfolio.length === 0) return null;

    const toggleRow = (asset) => {
        setExpandedRows(prev => ({ ...prev, [asset]: !prev[asset] }));
    };

    const formatCurrency = (value, currency = 'USD') => {
        return new Intl.NumberFormat(currency === 'CRC' ? 'es-CR' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 10,
        }).format(value);
    };

    return (
        <div className="card fade-in">
            <h2>Portfolio Breakdown</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Total Quantity</th>
                            <th>Total Invested USD</th>
                            <th>Average Cost USD</th>
                            <th>Current Price USD</th>
                            <th>Current Value USD</th>
                            <th>Unrealized Gains USD</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {portfolio.map((item) => {
                            const bnData = bancoNacionalData ? bancoNacionalData[item.asset] : null;
                            const isExpanded = expandedRows[item.asset];

                            // Calculate User-Defined Metrics for Table Row

                            // 1. Total Quantity: Sum of all number of participations (already in bnData.totalParticipations)

                            // 2. Total Invested USD = Sum(Participation Value * number_of_participations)
                            // This is now pre-calculated in App.jsx as 'totalInvested'
                            const bnTotalInvested = bnData ? bnData.totalInvested : 0;

                            // 3. Average Cost USD = Total Participations / Transaction Count
                            const bnAvgCost = bnData && bnData.txCount > 0 ? (bnData.sumParticipationValues / bnData.txCount) : 0;

                            // 4. Current Price USD = Last value for "number of participations" (latestQty)
                            const bnCurrentPrice = bnData ? bnData.latestValue : 0;

                            // 5. Current Value USD = Total Participations * Latest Value
                            const bnCurrentValue = bnData ? (bnData.totalParticipations * bnData.latestValue) : 0;

                            // 6. Unrealized Gains USD
                            // Not specified, but standard formula is Current Value - Total Invested
                            const bnUnrealized = bnCurrentValue - bnTotalInvested;

                            return (
                                <React.Fragment key={item.asset}>
                                    <tr className={isExpanded ? 'expanded-row-parent' : ''}>
                                        <td>
                                            <span className={`asset-badge ${item.asset.toLowerCase()}`}>
                                                {item.asset === 'SP500' ? '📈 S&P 500' : '₿ Bitcoin'}
                                            </span>
                                        </td>
                                        <td>{formatNumber(item.totalQuantity)}</td>
                                        <td>{formatCurrency(item.totalInvested)}</td>
                                        <td>{formatCurrency(item.averageCost)}</td>
                                        <td>{formatCurrency(item.currentPrice)}</td>
                                        <td>{formatCurrency(item.currentValue)}</td>
                                        <td className={item.unrealizedGains >= 0 ? 'profit-text' : 'loss-text'}>
                                            {item.unrealizedGains >= 0 ? '+' : ''}{formatCurrency(item.unrealizedGains)}
                                        </td>
                                        <td>
                                            {bnData && (
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => toggleRow(item.asset)}
                                                    title="Toggle Banco Nacional Details"
                                                >
                                                    {isExpanded ? 'Collapse' : 'Expand'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {isExpanded && bnData && (
                                        <tr className="expanded-row-content">
                                            {/* Render cells aligned with parent columns */}
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                    <span style={{ fontSize: '1.2rem' }}>🏦</span>
                                                    Banco Nacional
                                                </div>
                                            </td>
                                            <td>{formatNumber(bnData.totalParticipations)}</td>
                                            <td>{formatCurrency(bnTotalInvested)}</td>
                                            <td title="Participation Value">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(bnAvgCost)}</td>
                                            <td title="Participation Value">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(bnCurrentPrice)}</td>
                                            <td>{formatCurrency(bnCurrentValue)}</td>
                                            <td className={bnUnrealized >= 0 ? 'profit-text' : 'loss-text'}>
                                                {bnUnrealized >= 0 ? '+' : ''}{formatCurrency(bnUnrealized)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
