import { useState } from 'react';

export default function InvestmentSummary({ grandTotal, commissionPercent, bancoNacionalTotal, bancoNacionalTotalInvested }) {
    const [activeTab, setActiveTab] = useState('main');

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

    const isProfit = grandTotal.unrealizedGains >= 0;
    const bnProfit = bancoNacionalTotal - bancoNacionalTotalInvested;
    const bnProfitPercent = bancoNacionalTotalInvested > 0 ? (bnProfit / bancoNacionalTotalInvested) * 100 : 0;
    const isBnProfitable = bnProfit >= 0;

    // BN Commission calculation
    const bnCommission = bancoNacionalTotalInvested * (commissionPercent / 100);
    const bnNetReturn = bnProfit - bnCommission;
    const isBnNetProfitable = bnNetReturn >= 0;

    const hasBancoNacional = bancoNacionalTotal > 0;

    const tabStyle = (isActive) => ({
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        border: 'none',
        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        color: isActive ? '#a5b4fc' : 'var(--text-muted)',
        cursor: 'pointer',
        borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
        transition: 'all 0.2s ease'
    });

    return (
        <div className="card fade-in" style={{
            padding: 0,
            overflow: 'hidden',
            background: 'rgba(20, 20, 35, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
            {/* Header with Tabs */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 1.5rem',
                background: 'rgba(0,0,0,0.15)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
                <div style={{ display: 'flex', gap: '0' }}>
                    <button
                        style={tabStyle(activeTab === 'main')}
                        onClick={() => setActiveTab('main')}
                    >
                        📊 Main Portfolio
                    </button>
                    {hasBancoNacional && (
                        <button
                            style={tabStyle(activeTab === 'banco')}
                            onClick={() => setActiveTab('banco')}
                        >
                            🏦 Banco Nacional
                        </button>
                    )}
                </div>
                <span style={{
                    fontSize: '0.75rem',
                    padding: '0.375rem 0.875rem',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    borderRadius: '20px',
                    fontWeight: 500,
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                    Annual Fee: {commissionPercent}%
                </span>
            </div>

            {/* Main Portfolio Tab Content */}
            {activeTab === 'main' && (
                <>
                    {/* Hero Section - Current Value */}
                    <div style={{
                        padding: '2rem 1.5rem 1.5rem',
                        background: 'linear-gradient(180deg, rgba(30, 30, 50, 0.5) 0%, transparent 100%)'
                    }}>
                        <div style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem'
                        }}>
                            Current Value
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{
                                fontSize: '2.75rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.02em'
                            }}>
                                {formatCurrency(grandTotal.currentValue)}
                            </div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '6px',
                                background: isProfit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isProfit ? 'var(--success)' : 'var(--danger)',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}>
                                <span style={{ fontSize: '0.75rem' }}>{isProfit ? '↗' : '↘'}</span>
                                {isProfit ? '+' : ''}{formatCurrency(grandTotal.unrealizedGains)}
                                <span style={{ opacity: 0.75, marginLeft: '0.25rem' }}>
                                    ({isProfit ? '+' : ''}{formatPercent(grandTotal.unrealizedGainsPercent)})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.75rem',
                        padding: '0 1.5rem 1.5rem'
                    }}>
                        {/* Total Invested Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1rem' }}>💰</span>
                                Total Invested
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {formatCurrency(grandTotal.totalInvested)}
                            </div>
                        </div>

                        {/* Commission Fees Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1rem' }}>💸</span>
                                Commission Fees
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                -{formatCurrency(grandTotal.commissionCost)}
                            </div>
                        </div>

                        {/* Gross Return Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: isProfit ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: `1px solid ${isProfit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1rem' }}>�</span>
                                Gross Return
                            </div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: isProfit ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {isProfit ? '+' : ''}{formatCurrency(grandTotal.unrealizedGains)}
                            </div>
                        </div>

                        {/* Net Return Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: grandTotal.gainsAfterCommission >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: `1px solid ${grandTotal.gainsAfterCommission >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1rem' }}>📊</span>
                                Net Return
                            </div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: grandTotal.gainsAfterCommission >= 0 ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {grandTotal.gainsAfterCommission >= 0 ? '+' : ''}{formatCurrency(grandTotal.gainsAfterCommission)}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Banco Nacional Tab Content */}
            {activeTab === 'banco' && hasBancoNacional && (
                <>
                    {/* Hero Section - Current Value */}
                    <div style={{
                        padding: '2rem 1.5rem 1.5rem',
                        background: 'linear-gradient(180deg, rgba(30, 30, 50, 0.5) 0%, transparent 100%)'
                    }}>
                        <div style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem'
                        }}>
                            Current Value
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{
                                fontSize: '2.75rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.02em'
                            }}>
                                {formatCurrency(bancoNacionalTotal)}
                            </div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '6px',
                                background: isBnProfitable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isBnProfitable ? 'var(--success)' : 'var(--danger)',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}>
                                <span style={{ fontSize: '0.75rem' }}>{isBnProfitable ? '↗' : '↘'}</span>
                                {isBnProfitable ? '+' : ''}{formatCurrency(bnProfit)}
                                <span style={{ opacity: 0.75, marginLeft: '0.25rem' }}>
                                    ({isBnProfitable ? '+' : ''}{bnProfitPercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.75rem',
                        padding: '0 1.5rem 1.5rem'
                    }}>
                        {/* Total Invested Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1rem' }}>💰</span>
                                Total Invested
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {formatCurrency(bancoNacionalTotalInvested)}
                            </div>
                        </div>

                        {/* Commission Fees Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1rem' }}>💸</span>
                                Commission Fees
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                -{formatCurrency(bnCommission)}
                            </div>
                        </div>

                        {/* Gross Return Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: isBnProfitable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: `1px solid ${isBnProfitable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1rem' }}>📈</span>
                                Gross Return
                            </div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: isBnProfitable ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {isBnProfitable ? '+' : ''}{formatCurrency(bnProfit)}
                            </div>
                        </div>

                        {/* Net Return Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: isBnNetProfitable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: `1px solid ${isBnNetProfitable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1rem' }}>�</span>
                                Net Return
                            </div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: isBnNetProfitable ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {isBnNetProfitable ? '+' : ''}{formatCurrency(bnNetReturn)}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
