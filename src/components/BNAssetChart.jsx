import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

export default function BNAssetChart({ transactions, asset }) {
    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Filter by asset and BN data, sort by date
        const filtered = transactions
            .filter(tx => tx.asset === asset && tx.participation_value && tx.number_of_participations)
            .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

        let totalParticipations = 0;
        let totalInvested = 0;

        return filtered.map(tx => {
            const participations = parseFloat(tx.number_of_participations);
            const value = parseFloat(tx.participation_value);

            totalParticipations += participations;
            totalInvested += value * participations;
            const avgCost = totalParticipations > 0 ? totalInvested / totalParticipations : 0;

            return {
                date: new Date(tx.transaction_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit'
                }),
                participationValue: value,
                avgCost: parseFloat(avgCost.toFixed(2)),
                participations: participations
            };
        });
    }, [transactions, asset]);


    if (chartData.length === 0) {
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px'
            }}>
                No Banco Nacional data for {asset}
            </div>
        );
    }

    // Calculate Y-axis domain with 0.25 padding
    const values = chartData.map(d => d.participationValue);
    const avgCosts = chartData.map(d => d.avgCost);
    const allValues = [...values, ...avgCosts];
    const minValue = Math.min(...allValues) - 0.25;
    const maxValue = Math.max(...allValues) + 0.25;

    return (
        <div style={{ width: '100%', height: 350, minHeight: 350 }}>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <YAxis
                        stroke="var(--text-muted)"
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        tickFormatter={(value) => value.toLocaleString()}
                        domain={[minValue, maxValue]}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value, name) => [
                            value.toLocaleString(),
                            name
                        ]}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="participationValue"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                        name="Participation Value"
                    />
                    <Line
                        type="monotone"
                        dataKey="avgCost"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Running Avg Participation Value"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
