import { useState, useEffect, useCallback, useRef } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import PortfolioSummary from '../components/PortfolioSummary';
import InvestmentSummary from '../components/InvestmentSummary';
import CommissionSettings from '../components/CommissionSettings';

import { transactionsApi, portfolioApi, settingsApi } from '../services/api';

export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [portfolioData, setPortfolioData] = useState(null);
    const [commissionPercent, setCommissionPercent] = useState(0);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const formRef = useRef(null);

    // Handle edit with scroll
    const handleEdit = (tx) => {
        setEditingTransaction(tx);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // Load initial data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [txData, settingsData, portfolioSummary] = await Promise.all([
                transactionsApi.getAll(),
                settingsApi.get(),
                portfolioApi.getSummary(),
            ]);

            setTransactions(txData);
            setCommissionPercent(parseFloat(settingsData.annual_commission_percent) || 0);
            setPortfolioData(portfolioSummary);
            setError('');
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to connect to server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Refresh portfolio after changes
    const refreshPortfolio = async () => {
        try {
            const portfolioSummary = await portfolioApi.getSummary();
            setPortfolioData(portfolioSummary);
        } catch (err) {
            console.error('Failed to refresh portfolio:', err);
        }
    };

    // Handle new transaction
    const handleAddTransaction = async (transaction) => {
        try {
            const newTx = await transactionsApi.create(transaction);
            setTransactions(prev => [newTx, ...prev]);
            await refreshPortfolio();
        } catch (err) {
            console.error('Failed to add transaction:', err);
            setError('Failed to add transaction');
        }
    };

    // Handle edit transaction
    const handleEditTransaction = async (transaction) => {
        try {
            const updated = await transactionsApi.update(editingTransaction.id, transaction);
            setTransactions(prev => prev.map(tx => tx.id === editingTransaction.id ? updated : tx));
            setEditingTransaction(null);
            await refreshPortfolio();
        } catch (err) {
            console.error('Failed to update transaction:', err);
            setError('Failed to update transaction');
        }
    };

    // Handle delete transaction
    const handleDeleteTransaction = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        try {
            await transactionsApi.delete(id);
            setTransactions(prev => prev.filter(tx => tx.id !== id));
            await refreshPortfolio();
        } catch (err) {
            console.error('Failed to delete transaction:', err);
            setError('Failed to delete transaction');
        }
    };

    // Handle commission change
    const handleCommissionChange = async (newPercent) => {
        setCommissionPercent(newPercent);
        await refreshPortfolio();
    };

    // Calculate Banco Nacional Data per Asset and Grand Total
    const { bancoNacionalData, bancoNacionalTotal, bancoNacionalTotalInvested } = (() => {
        const data = {};
        const assetLatestPrices = {}; // Store latest price per asset first
        let netGrandTotal = 0;
        let grandTotalInvested = 0;
        const now = new Date();
        const rate = commissionPercent / 100;

        if (transactions && transactions.length > 0) {
            // Pass 1: Find latest participation value (Price) for each asset
            transactions.forEach(tx => {
                if (tx.participation_value && tx.number_of_participations) {
                    const txDate = new Date(tx.transaction_date);
                    if (!assetLatestPrices[tx.asset] || txDate > assetLatestPrices[tx.asset].date) {
                        assetLatestPrices[tx.asset] = {
                            date: txDate,
                            price: parseFloat(tx.participation_value)
                        };
                    }
                }
            });

            // Pass 2: Calculate totals and apply time-based commission
            transactions.forEach(tx => {
                if (tx.participation_value && tx.number_of_participations) {
                    const asset = tx.asset;
                    const latestPrice = assetLatestPrices[asset]?.price || 0;
                    const participations = parseFloat(tx.number_of_participations);

                    // Initialize asset data if needed
                    if (!data[asset]) {
                        data[asset] = {
                            totalParticipations: 0,
                            latestValue: latestPrice, // This is latest participation_value
                            // Raw value (no commission) for table display
                            grossCurrentValue: 0,
                            // New metrics for custom formulas
                            sumParticipationValues: 0,
                            totalInvested: 0, // NEW: Sum of (Participation Value * Quantity) per tx
                            txCount: 0,
                            latestQty: 0, // Will be set after pass 1 (finding latest date) or during pass 2 if we track it
                            latestDate: assetLatestPrices[asset]?.date // Keep track of date to find latestQty
                        };
                    }

                    // Aggregate asset totals
                    data[asset].totalParticipations += participations;
                    const txGrossValue = participations * latestPrice;
                    data[asset].grossCurrentValue += txGrossValue;

                    data[asset].grossCurrentValue += txGrossValue;

                    data[asset].sumParticipationValues += parseFloat(tx.participation_value);
                    const txInvested = parseFloat(tx.participation_value) * participations;
                    data[asset].totalInvested += txInvested; // Accumulate actual invested amount
                    grandTotalInvested += txInvested; // Accumulate grand total invested for BN
                    data[asset].txCount += 1;

                    // Check if this tx is the latest to grab its quantity
                    const txDate = new Date(tx.transaction_date);
                    if (txDate.getTime() === data[asset].latestDate.getTime()) {
                        data[asset].latestQty = participations;
                    }

                    // Calculate Net Value (after commission) for Grand Total
                    // Formula: Value * (1 - rate)^YearsHeld
                    const yearsHeld = (now - txDate) / (1000 * 60 * 60 * 24 * 365);
                    const commissionMultiplier = Math.pow(1 - rate, yearsHeld);
                    const txNetValue = txGrossValue * commissionMultiplier;

                    netGrandTotal += txNetValue;
                }
            });
        }

        return { bancoNacionalData: data, bancoNacionalTotal: netGrandTotal, bancoNacionalTotalInvested: grandTotalInvested };
    })();

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
                <h1>Investment Dashboard</h1>
                <p>Track your S&P 500 and Bitcoin investments</p>
            </header>

            {error && (
                <div className="message error" style={{ marginBottom: '1.5rem' }}>
                    {error}
                    <button
                        onClick={() => setError('')}
                        style={{
                            marginLeft: '1rem',
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontSize: '1.25rem'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Summary Section */}
            {portfolioData && portfolioData.grandTotal && portfolioData.grandTotal.totalInvested > 0 && (
                <section className="section">
                    <InvestmentSummary
                        grandTotal={portfolioData.grandTotal}
                        commissionPercent={portfolioData.commissionPercent}
                        bancoNacionalTotal={bancoNacionalTotal}
                        bancoNacionalTotalInvested={bancoNacionalTotalInvested}
                    />
                </section>
            )}

            {/* Portfolio by Asset */}
            {portfolioData && portfolioData.portfolio && portfolioData.portfolio.length > 0 && (
                <section className="section">
                    <PortfolioSummary
                        portfolio={portfolioData.portfolio}
                        bancoNacionalData={bancoNacionalData}
                    />
                </section>
            )}



            {/* Transaction Form */}
            <section className="section" ref={formRef}>
                <TransactionForm
                    onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                    initialData={editingTransaction}
                    onCancel={editingTransaction ? () => setEditingTransaction(null) : null}
                />
            </section>

            {/* Transaction List */}
            <section className="section">
                <TransactionList
                    transactions={transactions}
                    onEdit={handleEdit}
                    onDelete={handleDeleteTransaction}
                    onRefresh={loadData}
                />
            </section>

            {/* Commission Settings */}
            <section className="section">
                <CommissionSettings
                    value={commissionPercent}
                    onChange={handleCommissionChange}
                />
            </section>
        </div>
    );
}
