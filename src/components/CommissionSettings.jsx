import { useState, useEffect } from 'react';
import { settingsApi } from '../services/api';

export default function CommissionSettings({ value, onChange }) {
    const [commission, setCommission] = useState(value || 0);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setCommission(value || 0);
    }, [value]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsApi.update(commission);
            onChange(commission);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card fade-in">
            <h2>Commission Settings</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Set the annual commission percentage charged by your broker/bank.
                This will be deducted from your portfolio value calculations.
            </p>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 1, maxWidth: '200px' }}>
                    <label htmlFor="commission">Annual Commission (%)</label>
                    <input
                        type="number"
                        id="commission"
                        value={commission}
                        onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0.00"
                    />
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ height: '46px' }}
                >
                    {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save'}
                </button>
            </div>

            {commission > 0 && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: 'var(--warning)'
                }}>
                    💡 A {commission}% annual commission will be applied to your portfolio value
                </div>
            )}
        </div>
    );
}
