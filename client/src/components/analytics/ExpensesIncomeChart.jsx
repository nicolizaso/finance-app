import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';
import { getExpensesVsIncomeLast6Months } from '../../utils/analyticsHelpers';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                <p className="text-white font-bold mb-1">{label}</p>
                <p className="text-teal-400 text-sm">
                    Ingresos: ${payload[0].value.toLocaleString()}
                </p>
                <p className="text-rose-400 text-sm">
                    Gastos: ${payload[1].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const ExpensesIncomeChart = ({ transactions }) => {
    const data = useMemo(() => getExpensesVsIncomeLast6Months(transactions), [transactions]);

    return (
        <div className="bento-card h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 pl-2">Ingresos vs Gastos (6 Meses)</h3>
            <div className="flex-1 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#6366f1"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#6366f1"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="Income" name="Ingresos" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="Expense" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExpensesIncomeChart;
