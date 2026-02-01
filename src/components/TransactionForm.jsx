import { useState, useEffect } from 'react';
import { pricesApi } from '../services/api';

export default function TransactionForm({ onSubmit, initialData, onCancel }) {
    const [formData, setFormData] = useState({
        asset: 'SP500',
        transaction_date: new Date().toISOString().slice(0, 11) + '13:00', // Default to 1PM
        amount_usd: '',
        participation_value: '',
        number_of_participations: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (initialData) {
            let dateValue = initialData.transaction_date;

            // Convert the date to local timezone for datetime-local input
            if (dateValue) {
                const date = new Date(dateValue);
                // Format as YYYY-MM-DDTHH:MM for datetime-local input
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                dateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
            }

            setFormData({
                asset: initialData.asset,
                transaction_date: dateValue,
                amount_usd: initialData.amount_usd,
                participation_value: initialData.participation_value || '',
                number_of_participations: initialData.number_of_participations || '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount_usd || parseFloat(formData.amount_usd) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Fetch price at save time
            const priceData = await pricesApi.getHistorical(formData.asset, formData.transaction_date);
            const fetchedPrice = priceData.price;
            const isFallback = priceData.isFallback || false;
            const calculatedQuantity = parseFloat(formData.amount_usd) / fetchedPrice;

            // Submit the transaction
            await onSubmit({
                asset: formData.asset,
                transaction_date: formData.transaction_date,
                amount_usd: parseFloat(formData.amount_usd),
                price_at_purchase: fetchedPrice,
                quantity: calculatedQuantity,
                is_fallback_price: isFallback,
                participation_value: formData.participation_value ? parseFloat(formData.participation_value) : null,
                number_of_participations: formData.number_of_participations ? parseFloat(formData.number_of_participations) : null,
            });

            // Show success and reset form (no page refresh)
            if (!initialData) {
                setSuccess(`Added ${formData.asset === 'BITCOIN' ? 'Bitcoin' : 'S&P 500'} transaction: $${formData.amount_usd} at $${fetchedPrice.toFixed(2)}`);
                setFormData({
                    asset: 'SP500',
                    transaction_date: new Date().toISOString().slice(0, 11) + '13:00',
                    amount_usd: '',
                    participation_value: '',
                    number_of_participations: '',
                });
            } else {
                setSuccess('Transaction updated successfully');
            }
        } catch (err) {
            console.error('Error saving transaction:', err);
            setError('Could not fetch price for this date. Please try a different date.');
        } finally {
            setLoading(false);
        }
    };

    // Get current datetime in local format for max attribute
    const now = new Date().toISOString().slice(0, 16);

    return (
        <div className="card fade-in">
            <h2>{initialData ? 'Edit Transaction' : 'Add Transaction'}</h2>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-3">
                    <div className="form-group">
                        <label htmlFor="asset">Asset</label>
                        <select
                            id="asset"
                            name="asset"
                            value={formData.asset}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="SP500">S&P 500 (SPY)</option>
                            <option value="BITCOIN">Bitcoin (BTC)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="transaction_date">Date & Time</label>
                        <input
                            type="datetime-local"
                            id="transaction_date"
                            name="transaction_date"
                            value={formData.transaction_date}
                            onChange={handleChange}
                            max={now}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount_usd">Amount (USD)</label>
                        <input
                            type="number"
                            id="amount_usd"
                            name="amount_usd"
                            value={formData.amount_usd}
                            onChange={handleChange}
                            placeholder="Enter amount"
                            min="0.01"
                            step="0.01"
                            disabled={loading}
                            required
                        />
                    </div>
                </div>

                {/* Banco Nacional Section */}
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(99, 102, 241, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                    <h3 style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        marginBottom: '1rem',
                        fontWeight: 600
                    }}>
                        🏦 Banco Nacional (optional)
                    </h3>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label htmlFor="participation_value">Participation Value</label>
                            <input
                                type="number"
                                id="participation_value"
                                name="participation_value"
                                value={formData.participation_value}
                                onChange={handleChange}
                                placeholder="e.g., 15234.56"
                                step="0.01"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="number_of_participations">Number of Participations</label>
                            <input
                                type="number"
                                id="number_of_participations"
                                name="number_of_participations"
                                value={formData.number_of_participations}
                                onChange={handleChange}
                                placeholder="e.g., 3.24"
                                step="0.0000000001"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="spinner"></span> Saving...
                            </span>
                        ) : (
                            initialData ? 'Update Transaction' : 'Add Transaction'
                        )}
                    </button>
                    {onCancel && (
                        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
