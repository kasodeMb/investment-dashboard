import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend
} from 'recharts';

export default function AssetChart({ transactions, asset }) {
    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Filter by asset and sort by date
        const filtered = transactions
            .filter(tx => tx.asset === asset && tx.price_at_purchase)
            .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

        let totalQty = 0;
        let totalCost = 0;

        return filtered.map(tx => {
            totalQty += parseFloat(tx.quantity);
            totalCost += parseFloat(tx.price_at_purchase) * parseFloat(tx.quantity);
            const avgCost = totalQty > 0 ? totalCost / totalQty : 0;

            return {
                date: new Date(tx.transaction_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit'
                }),
                price: parseFloat(tx.price_at_purchase),
                avgCost: parseFloat(avgCost.toFixed(2)),
                quantity: parseFloat(tx.quantity)
            };
        });
    }, [transactions, asset]);

    const currentAvgCost = chartData.length > 0 ? chartData[chartData.length - 1].avgCost : 0;

    if (chartData.length === 0) {
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px'
            }}>
                No transactions with price data for {asset}
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
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
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value, name) => [
                            `$${value.toLocaleString()}`,
                            name === 'price' ? 'Purchase Price' : 'Avg Cost'
                        ]}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                        name="Purchase Price"
                    />
                    <Line
                        type="monotone"
                        dataKey="avgCost"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Running Avg Cost"
                    />
                    <ReferenceLine
                        y={currentAvgCost}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        label={{
                            value: `Current Avg: $${currentAvgCost.toLocaleString()}`,
                            fill: '#f59e0b',
                            fontSize: 12,
                            position: 'right'
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
