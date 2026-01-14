import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';
import { getSpendingTrend } from '../../utils/analyticsHelpers';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-border p-3 rounded-lg shadow-xl">
                <p className="text-white font-bold mb-1">Día {label}</p>
                {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-mono" style={{ color: entry.color }}>
                        {entry.name}: ${entry.value ? entry.value.toLocaleString() : '0'}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const SpendingTrendChart = ({ transactions }) => {
    const data = useMemo(() => getSpendingTrend(transactions), [transactions]);

    return (
        <div className="bento-card h-[300px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 pl-2">Tendencia de Gasto (Acumulado)</h3>
            <div className="flex-1 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2e1a4f" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#a78bfa"
                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            interval={4}
                        />
                        <YAxis
                            stroke="#a78bfa"
                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124, 58, 237, 0.3)', strokeWidth: 2 }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />

                        <Line
                            type="monotone"
                            dataKey="thisMonth"
                            name="Este Mes"
                            stroke="#d8b4fe" // Neon
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#d8b4fe' }}
                            connectNulls={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="lastMonth"
                            name="Mes Pasado"
                            stroke="#525252" // Greyish
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SpendingTrendChart;
