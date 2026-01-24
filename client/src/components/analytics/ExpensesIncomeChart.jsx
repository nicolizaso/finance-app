import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-border p-3 rounded-lg shadow-xl">
                <p className="text-white font-bold mb-1">{label}</p>
                <p className="text-emerald-400 text-sm">
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

const ExpensesIncomeChart = ({ data }) => {
    return (
        <div className="bento-card h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 pl-2">Ingresos vs Gastos (6 Meses)</h3>
            <div className="flex-1 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2e1a4f" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#a78bfa"
                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#a78bfa"
                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="Income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="Expense" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExpensesIncomeChart;
